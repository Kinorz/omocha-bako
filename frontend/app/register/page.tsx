"use client";

import { AuthResultPanel } from "@/components/auth/AuthResultPanel";
import { registerUser, type AuthResponse } from "@/lib/auth";
import { saveAuthSession } from "@/lib/tokenStorage";
import Link from "next/link";
import { useState } from "react";

type FormState = {
  email: string;
  userName: string;
  password: string;
};

const initialFormState: FormState = {
  email: "",
  userName: "",
  password: "",
};

export default function RegisterPage() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AuthResponse | null>(null);

  function updateField(field: keyof FormState, value: string) {
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
      const response = await registerUser(formState);
      setResult(response);
      saveAuthSession(response);
      setIsSubmitting(false);
    } catch (error) {
      const fallback = "ユーザー登録に失敗しました。入力内容とサーバーログを確認してください。";
      setErrorMessage(error instanceof Error ? error.message : fallback);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-wide text-emerald-500">Auth demo</p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            ユーザー登録
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Identity API の `/api/auth/register` に接続するフォームです。レスポンスで受け取ったトークンはローカルストレージに保存され、下部に表示されます。
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
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">ユーザー名</span>
              <input
                type="text"
                name="userName"
                required
                autoComplete="username"
                value={formState.userName}
                onChange={(event) => updateField("userName", event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">パスワード</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="new-password"
                value={formState.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                12文字以上・数字・記号・大文字を含む必要があります (バックエンドの Identity 設定に準拠)。
              </p>
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
            {isSubmitting ? "登録中..." : "ユーザー登録"}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          すでにアカウントをお持ちですか？
          <Link href="/login" className="ml-2 font-medium text-emerald-600 hover:underline">
            ログインはこちら
          </Link>
        </div>

        <AuthResultPanel
          response={result}
          helperText="取得したトークンはローカルストレージ (omocha-bako.auth) に保存されます。必要に応じて secure storage への移行を検討してください。"
        />
      </div>
    </div>
  );
}
