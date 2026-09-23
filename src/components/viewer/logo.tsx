export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo-silla.png"
      alt=""
      className={className ?? "h-10 w-auto"}
    />
  );
}
