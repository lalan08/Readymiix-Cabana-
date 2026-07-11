export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ReadyMiix Cabana"
    >
      <circle cx="32" cy="32" r="32" fill="#167a47" />
      <path
        d="M32 8c-1 4-3 7-6 9 3-1 5-1 7 0-2 3-6 4-10 3 2 3 6 4 9 3-3 3-8 3-12 0 3 5 9 6 14 3-2 4-6 6-11 5 4 3 10 2 13-2-1 5-5 8-10 8 5 1 10-1 13-5-2 4-6 6-10 5 5 1 10-2 12-6-1 4-4 7-8 8 4 0 8-2 10-5-1 4-3 7-7 8"
        fill="none"
      />
      <g>
        <path
          d="M32 10c0 6-2 10-5 13"
          stroke="#8fe3b0"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M32 12c-6-4-12-2-14 2 4 1 8 0 11-2"
          fill="#3fc47e"
        />
        <path
          d="M32 12c6-4 12-2 14 2-4 1-8 0-11-2"
          fill="#2fa869"
        />
        <path
          d="M32 10c-4-5-10-6-14-3 3 3 8 4 12 2"
          fill="#3fc47e"
        />
        <path
          d="M32 10c4-5 10-6 14-3-3 3-8 4-12 2"
          fill="#2fa869"
        />
        <path d="M32 11v6" stroke="#8fe3b0" strokeWidth="2" strokeLinecap="round" />
      </g>
      <path
        d="M23 30h18l-2.2 20.4a3 3 0 0 1-3 2.6H28.2a3 3 0 0 1-3-2.6L23 30Z"
        fill="#ffb703"
      />
      <path d="M21.5 30h21l-.6 3h-19.8l-.6-3Z" fill="#ff8a3d" />
      <path
        d="M27 34c1.5 4 1.5 9 0 14M32 34c1.5 4 1.5 9 0 14M37 34c-1.5 4-1.5 9 0 14"
        stroke="#fff4de"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="20" cy="24" r="2.4" fill="#ff6f47" />
      <circle cx="45" cy="22" r="2" fill="#ef4444" />
    </svg>
  );
}

export function Logo({
  size = 40,
  withText = true,
  textClassName = "",
}: {
  size?: number;
  withText?: boolean;
  textClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      {withText && (
        <span className={`leading-tight ${textClassName}`}>
          <span className="block font-extrabold tracking-tight text-[var(--color-palm-700)]">
            ReadyMiix
          </span>
          <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-coral-600)]">
            Cabana
          </span>
        </span>
      )}
    </div>
  );
}
