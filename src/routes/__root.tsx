import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { PageLoader } from "@/components/site/PageLoader";
import { ShellMark } from "@/components/site/ShellLogo";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <ShellMark className="mx-auto h-16 w-16 text-gold animate-float" />
        <h1 className="display-lg mt-6">Lost at sea</h1>
        <p className="mt-4 text-muted-foreground">The page you're looking for has drifted away.</p>
        <Link
          to="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary-foreground transition hover:bg-ocean"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-4xl">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">Something went wrong on our end. Please try again.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="inline-flex h-12 items-center justify-center rounded-full border border-primary/30 px-8 text-[0.7rem] font-semibold uppercase tracking-[0.24em]">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SAF SWIM BY SUMMER — Coastal Luxury Swim & Resort Wear" },
      { name: "description", content: "A little piece of summer, wherever you go. Coastal luxury swimwear and resort wear by Summer." },
      { name: "author", content: "SAF SWIM BY SUMMER" },
      { name: "theme-color", content: "#193C46" },
      { property: "og:site_name", content: "SAF SWIM BY SUMMER" },
      { property: "og:title", content: "SAF SWIM BY SUMMER" },
      { property: "og:description", content: "Coastal luxury swimwear and resort wear by Summer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      else queryClient.removeQueries({ queryKey: ["my-orders"] });
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useLocation({ select: (l) => l.pathname });
  const firstRender = useRef(true);

  useEffect(() => {
    void useCart.persist.rehydrate();
    void useWishlist.persist.rehydrate();
    firstRender.current = false;
  }, []);

  useEffect(() => {
    if (!firstRender.current) window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <PageLoader />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-primary-foreground">
        Skip to content
      </a>
      <Header />
      <motion.main
        id="main"
        key={pathname}
        initial={firstRender.current ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-[60vh]"
      >
        <Outlet />
      </motion.main>
      <Footer />
      <CartDrawer />
      <Toaster position="bottom-center" />
    </QueryClientProvider>
  );
}
