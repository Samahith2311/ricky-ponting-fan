"use client";

import { ShareNetworkIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * A WhatsApp share link that works with no JavaScript. Where the device has a share sheet,
 * the click opens that instead. `url` is the page's full address, built on the server.
 */
export function ShareButton({ title, url }: { title: string; url: string }) {
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  // Known only in the browser. Without a share sheet the link says where it goes.
  const [whatsappOnly, setWhatsappOnly] = useState(false);
  useEffect(() => setWhatsappOnly(!navigator.share), []);

  function share(event: React.MouseEvent) {
    if (!navigator.share) return;
    event.preventDefault();
    navigator.share({ title, url }).catch((error) => {
      // Closing the share sheet is not a failure; anything else falls back to the link.
      if (!(error instanceof DOMException && error.name === "AbortError")) window.open(whatsapp, "_blank", "noopener");
    });
  }

  return (
    <Button asChild variant="outline" className="h-10 px-4 font-heading text-lg font-bold tracking-wide uppercase">
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={share}>
        <ShareNetworkIcon aria-hidden weight="bold" />
        {whatsappOnly ? (
          <>
            Share on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
          </>
        ) : (
          "Share"
        )}
      </a>
    </Button>
  );
}
