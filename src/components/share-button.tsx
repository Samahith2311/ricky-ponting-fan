"use client";

import { ShareNetworkIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Opens the device share sheet where there is one; otherwise, or if it fails, copies the page link. */
export function ShareButton({ title }: { title: string }) {
  const [message, setMessage] = useState("");

  async function share() {
    // Cleared first so the same message is announced again on a repeat click.
    setMessage("");
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // Closing the share sheet is not a failure.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
    } catch {
      setMessage("Could not copy the link");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span role="status" className="text-sm text-muted-foreground">
        {message}
      </span>
      <Button
        variant="outline"
        onClick={share}
        className="h-10 px-4 font-heading text-lg font-bold tracking-wide uppercase"
      >
        <ShareNetworkIcon aria-hidden weight="bold" />
        Share
      </Button>
    </div>
  );
}
