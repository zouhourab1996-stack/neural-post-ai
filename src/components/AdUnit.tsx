import { useEffect, useRef } from "react";

interface AdUnitProps {
  className?: string;
  slot?: string;
  format?: string;
  layoutKey?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdUnit({
  className = "",
  slot = "auto",
  format = "auto",
  layoutKey,
  responsive = true,
  style,
}: AdUnitProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    const tryPush = () => {
      try {
        if (typeof window === "undefined") return false;
        if (!window.adsbygoogle) {
          window.adsbygoogle = [];
        }
        (window.adsbygoogle as unknown[]).push({});
        pushed.current = true;
        return true;
      } catch (e) {
        console.warn("AdSense push failed", e);
        return false;
      }
    };
    // Wait a tick so the <ins> is in the DOM with width
    const t = setTimeout(tryPush, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-3898992716389443"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
