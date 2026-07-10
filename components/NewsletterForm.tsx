"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("done");
      setMessage(data.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
      <input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-[var(--accent-contrast)] hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {message && (
        <p className={`sm:col-span-2 text-xs mt-1 ${status === "error" ? "text-red-500" : "text-[var(--ink-muted)]"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
