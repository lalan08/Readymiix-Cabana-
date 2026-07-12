import Image from "next/image";

const WORDMARK_RATIO = 900 / 320;

export function Logo({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const height = size;
  const width = Math.round(size * WORDMARK_RATIO);
  return (
    <Image
      src="/brand/wordmark.jpg"
      alt="ReadyMiix Cabana"
      width={width}
      height={height}
      priority
      className={`rounded-md object-contain ${className}`}
      style={{ height, width: "auto" }}
    />
  );
}
