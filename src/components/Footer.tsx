import { Instagram, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h3 className="text-2xl font-bold tracking-tighter">
            UFX<span className="text-text-secondary">AMAN</span>
          </h3>
          <p className="text-sm text-text-secondary">
            Elevating brands through cinematic design.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={24} />
          </a>
          <a
            href="https://behance.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-white transition-colors"
            aria-label="Behance"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 7a1.5 1.5 0 0 1 1.5-1.5h5.5a4.5 4.5 0 0 1 0 9H4v5H2.5V7z" />
              <path d="M4 14.5h5.5a4.5 4.5 0 0 0 0-9H4v9z" />
              <path d="M14 10h7" />
              <path d="M14 14h7" />
              <path d="M14 18h7" />
            </svg>
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-white transition-colors"
            aria-label="X (Twitter)"
          >
            <Twitter size={24} />
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-white transition-colors"
            aria-label="Discord"
          >
            <MessageCircle size={24} />
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 text-center text-xs text-text-secondary">
        &copy; {new Date().getFullYear()} UFX AMAN. All rights reserved.
      </div>
    </footer>
  );
}
