export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="13.25" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="16" cy="16" r="3.2" fill="currentColor" />
      <path
        d="M16 6.5v4.2M16 21.3v4.2M6.5 16h4.2M21.3 16h4.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
