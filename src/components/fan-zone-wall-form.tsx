"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { fieldInput, fieldLabel, Honeypot, panel, primaryButton } from "@/components/fan-zone-ui";
import { postJson } from "@/lib/fan-zone/client";
import { MESSAGE_MAX, MESSAGE_MIN, NICKNAME } from "@/lib/fan-zone/rules";
import { site } from "@/lib/site";

const copy = site.pages.fanZone.wall;
const nickCopy = site.pages.fanZone.quiz;

export function FanZoneWallForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [nickError, setNickError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const nickRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const sentRef = useRef<HTMLParagraphElement>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = nickname.trim();
    const text = message.replace(/\r\n?/g, "\n").trim();
    const length = [...text].length;
    const nickBad = !NICKNAME.test(name);
    const messageBad = length < MESSAGE_MIN || length > MESSAGE_MAX || text.split("\n").length > 4;
    setNickError(nickBad ? nickCopy.nicknameError : "");
    setMessageError(messageBad ? copy.messageError : "");
    setFormError("");
    if (nickBad || messageBad) {
      (nickBad ? nickRef : messageRef).current?.focus();
      return;
    }

    setBusy(true);
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    const res = await postJson("/api/fan-zone/wall", { nickname: name, message: text, website });
    setBusy(false);
    if (res.ok) {
      setSent(true);
      setNickname("");
      setMessage("");
      router.refresh();
      requestAnimationFrame(() => sentRef.current?.focus());
    } else {
      setFormError(res.message);
    }
  }

  return (
    <div className={panel}>
      <h3 className="font-heading text-2xl leading-none font-extrabold uppercase">{copy.formHeading}</h3>
      <p ref={sentRef} role="status" tabIndex={-1} className="mt-3 empty:hidden">
        {sent ? copy.success : ""}
      </p>
      <form onSubmit={submit} noValidate className="relative mt-4 grid max-w-xl gap-4">
        <div>
          <label htmlFor="wall-nickname" className={fieldLabel}>
            {copy.nickname}
          </label>
          <input
            ref={nickRef}
            id="wall-nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            autoComplete="off"
            required
            aria-invalid={nickError ? true : undefined}
            aria-describedby={nickError ? "wall-nickname-hint wall-nickname-error" : "wall-nickname-hint"}
            className={fieldInput}
          />
          <p id="wall-nickname-hint" className="mt-1 text-sm text-muted-foreground">
            {nickCopy.nicknameHint}
          </p>
          <p id="wall-nickname-error" role="alert" className="mt-1 text-sm text-destructive empty:hidden">
            {nickError}
          </p>
        </div>
        <div>
          <label htmlFor="wall-message" className={fieldLabel}>
            {copy.message}
          </label>
          <textarea
            ref={messageRef}
            id="wall-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={MESSAGE_MAX}
            required
            aria-invalid={messageError ? true : undefined}
            aria-describedby={messageError ? "wall-message-hint wall-message-error" : "wall-message-hint"}
            className={`${fieldInput} h-auto py-2`}
          />
          <p id="wall-message-hint" className="mt-1 text-sm text-muted-foreground">
            {copy.messageHint}
          </p>
          <p id="wall-message-error" role="alert" className="mt-1 text-sm text-destructive empty:hidden">
            {messageError}
          </p>
        </div>
        <Honeypot id="wall-website" />
        <div>
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? copy.sending : copy.submit}
          </button>
          <p role="alert" className="mt-2 text-sm text-destructive empty:hidden">
            {formError}
          </p>
        </div>
      </form>
    </div>
  );
}
