"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

import { fetchFromApi } from "@/lib/api";
import { clearAuthSession, loadAuthSession } from "@/lib/tokenStorage";

type WeatherForecast = {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string | null;
};

type RequestState = "idle" | "loading" | "success" | "error";

type StoredSession = ReturnType<typeof loadAuthSession>;

export default function ProtectedPage() {
  const [session, setSession] = useState<StoredSession>(null);
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    startTransition(() => {
      setSession(loadAuthSession());
    });
  }, []);

  async function handleFetchForecast() {
    if (!session) {
      setErrorMessage("トークンが見つかりません。先にユーザー登録またはログインで取得してください。");
      setRequestState("error");
      return;
    }

    setRequestState("loading");
    setErrorMessage(null);

    try {
      const tokenType = session.tokenType ?? "Bearer";
      const authHeader = `${tokenType} ${session.accessToken}`;
      const data = await fetchFromApi<WeatherForecast[]>("/weatherforecast", {
        headers: {
          Authorization: authHeader,
        },
      });

      setForecasts(data);
      setRequestState("success");
    } catch (error) {
      const fallback = "天気予報 API の呼び出しに失敗しました。バックエンドのログを確認してください。";
      setErrorMessage(error instanceof Error ? error.message : fallback);
      setRequestState("error");
    }
  }

  function handleClearSession() {
    clearAuthSession();
    setSession(null);
    setForecasts([]);
    setRequestState("idle");
    setErrorMessage(null);
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-4xl space-y-8 rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-emerald-500">Protected API</p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">[Authorize] API 呼び出し</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            `/weatherforecast` エンドポイントは `[Authorize]` で保護されています。事前に
            <Link href="/register" className="mx-1 font-medium text-emerald-600 hover:underline">
              ユーザー登録
            </Link>
            または
            <Link href="/login" className="mx-1 font-medium text-emerald-600 hover:underline">
              ログイン
            </Link>
            し、トークンを取得してから「API を呼び出す」を押してください。
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">現在のトークン状態</span>
            {session ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">
                保存済 ({new Date(session.storedAt).toLocaleString("ja-JP")})
              </span>
            ) : (
              <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                未取得
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleFetchForecast}
              className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-600"
            >
              API を呼び出す
            </button>
            <button
              type="button"
              onClick={handleClearSession}
              className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200"
            >
              ローカルのトークンを削除
            </button>
          </div>
          {requestState === "loading" && (
            <p className="text-xs text-zinc-500">呼び出し中です...</p>
          )}
          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-100">
              {errorMessage}
            </div>
          )}
        </div>

        {forecasts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">レスポンス例</h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {forecasts.map((forecast) => (
                <li
                  key={forecast.date}
                  className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                >
                  <p className="text-sm uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                    {new Intl.DateTimeFormat("ja-JP", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }).format(new Date(forecast.date))}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {forecast.temperatureC}°C
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{forecast.temperatureF}°F</p>
                  <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">{forecast.summary ?? "No summary"}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
