import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calculateTotals, shippingMethodsFor, type ShippingMethodId } from "./shipping";

const orderSchema = z.object({
  email: z.string().trim().email().max(320),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  address1: z.string().trim().min(3).max(200),
  address2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  postcode: z.string().trim().min(2).max(20),
  country: z.string().trim().length(2),
  shippingMethod: z.enum(["uk-standard", "uk-express", "international"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        size: z.string().max(40).nullable(),
        colour: z.string().max(60).nullable(),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(30),
});

export type CreateOrderInput = z.infer<typeof orderSchema>;
export type CreateOrderResult =
  | { ok: true; orderNumber: string; totalPence: number; status: "pending_payment" }
  | { ok: false; error: string };

/**
 * Creates an order in "pending_payment" state. Prices, stock and shipping are
 * recalculated on the server — client totals are never trusted. No payment is
 * taken here; a payment provider will attach to this order once connected.
 */
export const createOrder = createServerFn({ method: "POST" })
  .validator((input: CreateOrderInput) => orderSchema.parse(input))
  .handler(async ({ data }): Promise<CreateOrderResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!shippingMethodsFor(data.country).some((m) => m.id === data.shippingMethod)) {
      return { ok: false, error: "Please choose a delivery option available for your country." };
    }

    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const [{ data: products, error: pErr }, { data: variants, error: vErr }] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("id, name, price_pence, sale_price_pence, is_published")
        .in("id", productIds),
      supabaseAdmin.from("product_variants").select("id, product_id, size, colour, stock").in("product_id", productIds),
    ]);
    if (pErr || vErr) {
      console.error("createOrder lookup failed", pErr ?? vErr);
      return { ok: false, error: "We couldn't check your bag right now. Please try again." };
    }

    const lines: {
      product_id: string;
      variant_id: string | null;
      product_name: string;
      colour: string | null;
      size: string | null;
      unit_price_pence: number;
      quantity: number;
      line_total_pence: number;
    }[] = [];

    for (const item of data.items) {
      const product = products?.find((p) => p.id === item.productId && p.is_published);
      if (!product) return { ok: false, error: "One of the pieces in your bag is no longer available." };
      const productVariants = (variants ?? []).filter((v) => v.product_id === product.id);
      const variant = productVariants.find((v) => v.size === item.size && v.colour === item.colour) ?? null;
      if (productVariants.length > 0 && !variant) {
        return { ok: false, error: `Please reselect the size and colour for ${product.name}.` };
      }
      if (variant && variant.stock < item.quantity) {
        return {
          ok: false,
          error:
            variant.stock === 0
              ? `${product.name} (${item.colour}, ${item.size}) has just sold out.`
              : `Only ${variant.stock} left of ${product.name} (${item.colour}, ${item.size}).`,
        };
      }
      const unit = product.sale_price_pence ?? product.price_pence;
      lines.push({
        product_id: product.id,
        variant_id: variant?.id ?? null,
        product_name: product.name,
        colour: item.colour,
        size: item.size,
        unit_price_pence: unit,
        quantity: item.quantity,
        line_total_pence: unit * item.quantity,
      });
    }

    const totals = calculateTotals(
      lines.map((l) => ({ unitPricePence: l.unit_price_pence, quantity: l.quantity })),
      data.shippingMethod as ShippingMethodId,
      data.country,
    );

    // Link the order to a signed-in customer when a valid session is present.
    let userId: string | null = null;
    const auth = getRequestHeader("authorization");
    if (auth?.startsWith("Bearer ")) {
      const { data: u } = await supabaseAdmin.auth.getUser(auth.slice(7));
      userId = u.user?.id ?? null;
    }

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        email: data.email,
        full_name: data.fullName,
        phone: data.phone || null,
        address_line1: data.address1,
        address_line2: data.address2 || null,
        city: data.city,
        postcode: data.postcode,
        country: data.country,
        shipping_method: data.shippingMethod,
        subtotal_pence: totals.subtotalPence,
        shipping_pence: totals.shippingPence,
        total_pence: totals.totalPence,
        notes: data.notes || null,
      })
      .select("id, order_number")
      .single();
    if (oErr || !order) {
      console.error("createOrder insert failed", oErr);
      return { ok: false, error: "We couldn't save your order. Please try again." };
    }

    const { error: iErr } = await supabaseAdmin
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: order.id })));
    if (iErr) {
      console.error("createOrder items failed", iErr);
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return { ok: false, error: "We couldn't save your order. Please try again." };
    }

    return { ok: true, orderNumber: order.order_number, totalPence: totals.totalPence, status: "pending_payment" };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, status, total_pence, currency, created_at, order_items(product_name, colour, size, quantity, line_total_pence)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load your orders");
    return data ?? [];
  });
