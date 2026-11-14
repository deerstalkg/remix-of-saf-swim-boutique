import type * as React from "react";
import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site-config";
import { ShellMark } from "./ShellLogo";
import { InstagramIcon, TikTokIcon } from "./SocialIcons";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary text-primary-foreground grain">
      <div className="relative z-10 mx-auto max-w-[1500px] px-6 pb-10 pt-24 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <ShellMark className="h-14 w-14 text-gold" strokeWidth={1.8} />
            <p className="mt-6 max-w-sm font-serif text-3xl font-light leading-snug">{SITE.tagline}</p>
            <div className="mt-8 flex gap-3">
              <a href={SITE.instagram.url} target="_blank" rel="noreferrer" aria-label={`Instagram ${SITE.instagram.handle}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 transition hover:border-gold hover:bg-gold">
                <InstagramIcon />
              </a>
              <a href={SITE.tiktok.url} target="_blank" rel="noreferrer" aria-label={`TikTok ${SITE.tiktok.handle}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 transition hover:border-gold hover:bg-gold">
                <TikTokIcon />
              </a>
            </div>
          </div>
          <FooterCol title="Shop">
            <Link to="/shop" className="hover:text-gold">All pieces</Link>
            <Link to="/shop" search={{ category: "swimwear" }} className="hover:text-gold">Swimwear</Link>
            <Link to="/shop" search={{ category: "dresses" }} className="hover:text-gold">Dresses</Link>
            <Link to="/shop" search={{ category: "accessories" }} className="hover:text-gold">Accessories</Link>
            <Link to="/collections" className="hover:text-gold">Collections</Link>
          </FooterCol>
          <FooterCol title="The House">
            <Link to="/about" className="hover:text-gold">Our story</Link>
            <Link to="/contact" className="hover:text-gold">Contact</Link>
            <a href={SITE.instagram.url} target="_blank" rel="noreferrer" className="hover:text-gold">{SITE.instagram.handle}</a>
            <a href={SITE.tiktok.url} target="_blank" rel="noreferrer" className="hover:text-gold">{SITE.tiktok.handle}</a>
          </FooterCol>
          <FooterCol title="Client Care">
            <Link to="/account" className="hover:text-gold">My account</Link>
            <Link to="/wishlist" className="hover:text-gold">Wishlist</Link>
            <Link to="/cart" className="hover:text-gold">Shopping bag</Link>
            <Link to="/contact" hash="delivery" className="hover:text-gold">Delivery & returns</Link>
            <a href={`mailto:${SITE.email}`} className="hover:text-gold">{SITE.email}</a>
          </FooterCol>
        </div>
        <p className="mt-24 select-none text-center font-serif text-[18vw] font-light leading-none tracking-tight text-ivory/10 lg:text-[13rem]" aria-hidden="true">
          SAF SWIM
        </p>
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-ivory/15 pt-6 text-xs text-ivory/60 md:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Designed by the sea, with love.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow text-gold">{title}</p>
      <div className="mt-6 flex flex-col gap-3 text-sm text-ivory/80">{children}</div>
    </div>
  );
}
