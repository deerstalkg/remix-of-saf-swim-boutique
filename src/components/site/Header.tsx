import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { categoriesQuery, collectionsQuery } from "@/lib/catalog.queries";
import { SITE } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { ShellLogo, ShellMark } from "./ShellLogo";
import { SearchOverlay } from "./SearchOverlay";
import { InstagramIcon, TikTokIcon } from "./SocialIcons";

const OVERLAY_PATHS = ["/", "/about"];

export function Header() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const overlayPage = OVERLAY_PATHS.includes(pathname) || pathname.startsWith("/collections/");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lines = useCart((s) => s.lines);
  const bump = useCart((s) => s.bump);
  const openCart = useCart((s) => s.setOpen);
  const wishCount = useWishlist((s) => s.items.length);
  const count = cartCount(lines);
  const { data: collections } = useQuery(collectionsQuery());
  const { data: categories } = useQuery(categoriesQuery());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const light = overlayPage && !scrolled && !menuOpen;
  const iconBtn = cn(
    "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition duration-500 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    light ? "hover:bg-ivory/15" : "hover:bg-secondary",
  );
  const navLink = "link-luxe eyebrow py-2";

  return (
    <>
      <div className="relative z-40 overflow-hidden bg-primary py-2 text-primary-foreground">
        <div className="flex w-max animate-marquee gap-16 whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.35em]">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-16" aria-hidden={k === 1}>
              <span>Complimentary UK delivery over £150</span>
              <span className="text-gold">✦</span>
              <span>A little piece of summer, wherever you go</span>
              <span className="text-gold">✦</span>
              <span>Sample collection preview — the full catalogue arrives soon</span>
              <span className="text-gold">✦</span>
              <span>Follow {SITE.instagram.handle}</span>
              <span className="text-gold">✦</span>
            </div>
          ))}
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-700 ease-luxe",
          overlayPage && "-mb-[88px]",
          light ? "bg-transparent text-ivory" : "border-b border-border/70 bg-background/90 text-primary shadow-soft backdrop-blur-xl",
        )}
      >
        <div className="mx-auto grid h-[88px] max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center px-5 md:px-10">
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
            <Link to="/" className={navLink} activeOptions={{ exact: true }}>Home</Link>
            <Link to="/shop" className={navLink}>Shop</Link>
            <div className="relative" onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)}>
              <button
                type="button"
                className={cn(navLink, "inline-flex items-center gap-1.5")}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                onClick={() => setMenuOpen((o) => !o)}
                onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
              >
                Collections <ChevronDown className={cn("h-3 w-3 transition duration-500", menuOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-0 top-full w-[760px] pt-5"
                  >
                    <div className="grid grid-cols-[1fr_2fr] gap-8 rounded-[2rem] border border-border bg-background p-8 text-primary shadow-lift">
                      <div>
                        <p className="eyebrow text-muted-foreground">Shop by category</p>
                        <ul className="mt-4 space-y-2.5">
                          {(categories ?? []).map((c) => (
                            <li key={c.slug}>
                              <Link to="/shop" search={{ category: c.slug }} className="font-serif text-xl transition hover:text-gold">
                                {c.name}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link to="/collections" className="link-luxe eyebrow mt-3 inline-block text-gold">All collections</Link>
                          </li>
                        </ul>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {(collections ?? []).map((c) => (
                          <Link key={c.id} to="/collections/$slug" params={{ slug: c.slug }} className="group block">
                            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                              <img src={c.imageUrl} alt="" className="zoom-img h-full w-full object-cover" loading="lazy" />
                            </div>
                            <p className="mt-3 font-serif text-lg leading-tight group-hover:text-gold">{c.name}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/about" className={navLink}>Our Story</Link>
            <Link to="/contact" className={navLink}>Contact</Link>
          </nav>

          <button type="button" className={cn(iconBtn, "lg:hidden")} onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" aria-label={`${SITE.name} — home`} className="justify-self-center">
            <ShellLogo light={light} />
          </Link>

          <div className="flex items-center justify-end gap-0.5 md:gap-1.5">
            <button type="button" className={iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link to="/account" className={cn(iconBtn, "hidden sm:inline-flex")} aria-label="Account">
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link to="/wishlist" className={cn(iconBtn, "hidden sm:inline-flex")} aria-label={`Wishlist, ${wishCount} items`}>
              <Heart className="h-[18px] w-[18px]" />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-pearl">{wishCount}</span>
              )}
            </Link>
            <button type="button" className={iconBtn} onClick={() => openCart(true)} aria-label={`Shopping bag, ${count} items`}>
              <span key={bump} className={bump > 0 ? "animate-bag-bump" : undefined}>
                <ShoppingBag className="h-[18px] w-[18px]" />
              </span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-pearl"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-primary text-primary-foreground"
            initial={{ clipPath: "circle(0% at 32px 32px)" }}
            animate={{ clipPath: "circle(150% at 32px 32px)" }}
            exit={{ clipPath: "circle(0% at 32px 32px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex h-[88px] items-center justify-between px-5">
              <ShellLogo light />
              <button type="button" onClick={() => setMobileOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <motion.nav
              className="flex flex-1 flex-col justify-center gap-3 px-8"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } }}
              aria-label="Mobile"
            >
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/collections", label: "Collections" },
                { to: "/about", label: "Our Story" },
                { to: "/contact", label: "Contact" },
                { to: "/wishlist", label: "Wishlist" },
                { to: "/account", label: "Account" },
              ].map((l) => (
                <motion.div key={l.to} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.7 }}>
                  <Link to={l.to} className="font-serif text-5xl font-light transition hover:text-gold">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
            <div className="flex items-center justify-between border-t border-ivory/15 px-8 py-6">
              <div className="flex gap-3">
                <a href={SITE.instagram.url} target="_blank" rel="noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30" aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a href={SITE.tiktok.url} target="_blank" rel="noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30" aria-label="TikTok">
                  <TikTokIcon />
                </a>
              </div>
              <ShellMark className="h-10 w-10 text-gold animate-float" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
