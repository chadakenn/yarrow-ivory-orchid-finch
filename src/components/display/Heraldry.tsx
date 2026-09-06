type MarkProps = {
  fill?: string;
  className?: string;
};

export function PigGlyph({ fill = "currentColor" }: { fill?: string }) {
  return (
    <g fill={fill}>
      <path d="M12.5 33c-3.4-1.8-6.2-.6-7.4 2.2 2.2.8 4.6.6 7.6-.4z" />
      <ellipse cx="30" cy="38" rx="16.5" ry="13.5" />
      <circle cx="46.5" cy="33.5" r="11.2" />
      <ellipse cx="56.4" cy="35.8" rx="6.2" ry="5.1" />
      <path d="M40.2 25.4 L46.2 11.6 L53.4 26.2 Z" />
      <rect x="20.2" y="48.4" width="6.2" height="9.2" rx="2.1" />
      <rect x="32.4" y="48.6" width="6.2" height="9" rx="2.1" />
      <rect x="43" y="46.4" width="5.6" height="8.4" rx="2" />
      <circle cx="49.2" cy="31.4" r="1.7" fill="#1a140c" />
      <ellipse cx="58.4" cy="35.2" rx="1.15" ry="1.55" fill="#1a140c" />
      <ellipse cx="55.6" cy="35.4" rx="1.05" ry="1.45" fill="#1a140c" />
    </g>
  );
}

export function PigMark({ fill = "currentColor", className }: MarkProps) {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" className={className} aria-hidden="true">
      <PigGlyph fill={fill} />
    </svg>
  );
}

export function MillCrest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 112" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="crest-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4e2b0" />
          <stop offset="45%" stopColor="#d7b56a" />
          <stop offset="100%" stopColor="#8d6a32" />
        </linearGradient>
        <linearGradient id="crest-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a241c" />
          <stop offset="100%" stopColor="#0d0b09" />
        </linearGradient>
      </defs>
      <path
        d="M16 78 C16 92 32 102 48 108 C64 102 80 92 80 78 L80 34 C68 38 56 28 48 22 C40 28 28 38 16 34 Z"
        fill="url(#crest-metal)"
        stroke="url(#crest-gold)"
        strokeWidth="2.4"
      />
      <path
        d="M22 72 C22 84 34 93 48 98 C62 93 74 84 74 72 L74 40 C64 43 55 35 48 30 C41 35 32 43 22 40 Z"
        fill="#16120e"
        stroke="url(#crest-gold)"
        strokeWidth="1.1"
        opacity="0.95"
      />
      <g transform="translate(16 34)">
        <PigGlyph fill="#f3efe4" />
      </g>
      <path
        d="M30 18 L48 8 L66 18 L60 22 L48 14 L36 22 Z"
        fill="url(#crest-gold)"
      />
      <path d="M44 8 L48 2 L52 8 Z" fill="url(#crest-gold)" />
      <path
        d="M14 44 C8 56 10 78 22 92"
        fill="none"
        stroke="url(#crest-gold)"
        strokeWidth="2"
      />
      <path
        d="M82 44 C88 56 86 78 74 92"
        fill="none"
        stroke="url(#crest-gold)"
        strokeWidth="2"
      />
      <path
        d="M18 50 C12 60 14 74 24 84"
        fill="none"
        stroke="url(#crest-gold)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path
        d="M78 50 C84 60 82 74 72 84"
        fill="none"
        stroke="url(#crest-gold)"
        strokeWidth="1.2"
        opacity="0.7"
      />
    </svg>
  );
}

export function SwordsGlyph() {
  return (
    <g>
      <g
        fill="none"
        stroke="#d7c389"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 50 L44 16" />
        <path d="M48 50 L20 16" />
        <path d="M12 46 L20 54" />
        <path d="M52 46 L44 54" />
        <path d="M14 42 L22 50" />
        <path d="M50 42 L42 50" />
      </g>
      <path d="M42 12 L48 14 L46 20 Z" fill="#e6d7a2" />
      <path d="M22 12 L16 14 L18 20 Z" fill="#e6d7a2" />
    </g>
  );
}

export function CrossedSwords({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" className={className} aria-hidden="true">
      <SwordsGlyph />
    </svg>
  );
}

export function TargetMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="32" r="20" />
        <circle cx="32" cy="32" r="10" />
        <path d="M32 6 V16 M32 48 V58 M6 32 H16 M48 32 H58" />
      </g>
    </svg>
  );
}

export function TrophyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" className={className} aria-hidden="true">
      <path
        d="M18 14 H46 V24 C46 34 40 40 32 40 C24 40 18 34 18 24 Z"
        fill="currentColor"
      />
      <path d="M46 16 H54 C56 16 58 18 58 22 C58 30 50 34 46 34" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M18 16 H10 C8 16 6 18 6 22 C6 30 14 34 18 34" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M28 40 H36 L38 52 H26 Z" fill="currentColor" />
      <rect x="20" y="52" width="24" height="5" rx="1.5" fill="currentColor" />
    </svg>
  );
}
