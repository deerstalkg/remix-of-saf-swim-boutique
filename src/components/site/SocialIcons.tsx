export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.6 3c.3 2.2 1.7 3.8 3.9 4v3a7.3 7.3 0 0 1-3.9-1.2v6.6A5.9 5.9 0 1 1 10.7 9.5v3.1a2.9 2.9 0 1 0 2.9 2.9V3h3z" />
    </svg>
  );
}
