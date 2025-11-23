"use client";

import { AuthResultPanel } from "@/components/auth/AuthResultPanel";
import { loginUser, type AuthResponse } from "@/lib/auth";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "@/lib/tokenStorage";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

type LoginFormState = {
  email: string;
  password: string;
};

const initialLoginForm: LoginFormState = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [formState, setFormState] = useState<LoginFormState>(initialLoginForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AuthResponse | null>(null);

  useEffect(() => {
    startTransition(() => {
      const stored = loadAuthSession();
      if (stored) {
        setResult(stored);
      }
    });
  }, []);

  function updateField(field: keyof LoginFormState, value: string) {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await loginUser(formState);
      setResult(response);
      saveAuthSession(response);
      setIsSubmitting(false);
    } catch (error) {
      const fallback = "ログインに失敗しました。メールアドレスとパスワードを確認してください。";
      setErrorMessage(error instanceof Error ? error.message : fallback);
      setIsSubmitting(false);
    }
  }

  function handleSignOut() {
    clearAuthSession();
    setResult(null);
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-wide text-emerald-500">Auth demo</p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            ログイン
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            `/api/auth/login` のレスポンスをそのまま表示します。`Authorization: Bearer ...` ヘッダーに設定して保護 API を呼び出してください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5">
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">メールアドレス</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">パスワード</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={formState.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-100">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            アカウントが必要ですか？
            <Link href="/register" className="ml-2 font-medium text-emerald-600 hover:underline">
              ユーザー登録へ
            </Link>
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-medium text-emerald-600 transition hover:text-emerald-500"
          >
            ローカルのトークンを削除
          </button>
        </div>

        <AuthResultPanel
          response={result}
          helperText="この JSON を Bearer トークンとして利用してください。ログアウトボタンでローカルストレージをクリーンアップできます。"
        />
      </div>
    </div>
  );
}
