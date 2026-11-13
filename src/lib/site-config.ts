/**
 * Editable brand content. Change copy, links and contact details here —
 * every page reads from this file.
 */
export const SITE = {
  name: "SAF SWIM BY SUMMER",
  wordmark: "SAF SWIM",
  byline: "by Summer",
  tagline: "A Little Piece of Summer, Wherever You Go.",
  description:
    "SAF SWIM BY SUMMER is a coastal luxury label of swimwear, resort wear and summer essentials, inspired by the ocean, sunlight and effortless elegance.",
  // Placeholder — replace with the real inbox once it exists.
  email: "hello@safswimbysummer.com",
  instagram: { handle: "@summer_evax", url: "https://www.instagram.com/summer_evax/" },
  tiktok: { handle: "@sumdinningx", url: "https://www.tiktok.com/@sumdinningx" },
  currency: "GBP",
  /** Flip to true once a payment provider (e.g. Stripe) is connected. */
  paymentsEnabled: false,
} as const;

/**
 * Founder story — placeholder text written to be replaced by Summer.
 * Nothing here is a factual claim about her history.
 */
export const FOUNDER = {
  name: "Summer",
  role: "Founder & Creative Director",
  intro:
    "SAF SWIM was born from a simple feeling — the lightness of a summer morning by the sea. Summer founded the label to bottle that feeling into pieces you can carry with you, wherever you go.",
  paragraphs: [
    "[Founder story placeholder] This is where Summer tells you, in her own words, how the label began — the places, people and moments that shaped it.",
    "[Founder story placeholder] Share what inspires each collection: the colour of the water, the texture of sand, the shells collected along the shoreline.",
    "[Founder story placeholder] Close with the promise behind every piece — how it should feel to wear SAF SWIM, and what the brand hopes to become.",
  ],
  quote: "Every piece should feel like the first day of summer.",
};

export const DELIVERY_COPY = {
  delivery:
    "UK standard delivery in 3–5 working days, free on orders over £150. Express delivery in 1–2 working days. International delivery in 5–10 working days. (Placeholder rates — update before launch.)",
  returns:
    "Unworn pieces with original tags can be returned within 14 days of delivery. Swimwear must be returned with its hygiene liner intact. (Placeholder policy — update before launch.)",
};
