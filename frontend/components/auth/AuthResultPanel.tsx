"use client";

import type { AuthResponse } from "@/lib/auth";
import { useState } from "react";

type AuthResultPanelProps = {
  response: AuthResponse | null;
  helperText?: string;
};

export function AuthResultPanel({ response, helperText }: AuthResultPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!response) {
    return null;
  }

  const jsonText = JSON.stringify(response, null, 2);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn("Failed to copy auth response", error);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-200">
            取得したトークン
          </p>
          {response.expiresIn && (
            <p className="text-xs text-emerald-700/80 dark:text-emerald-100/80">
              有効期限: 約 {Math.round(response.expiresIn / 60)} 分
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-500/60 dark:bg-emerald-500/20 dark:text-emerald-50"
        >
          {copied ? "コピー済" : "コピー"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-xl bg-zinc-950/90 p-4 text-xs text-lime-200">
        {jsonText}
      </pre>
      {helperText && <p className="text-xs text-emerald-700/80 dark:text-emerald-100/80">{helperText}</p>}
    </section>
  );
}
