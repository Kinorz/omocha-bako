import { fetchFromApi } from "@/lib/api";

type WeatherForecast = {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string | null;
};

async function getWeatherForecast(): Promise<WeatherForecast[]> {
  return fetchFromApi<WeatherForecast[]>("/weatherforecast");
}

export default async function Home() {
  let forecasts: WeatherForecast[] | null = null;
  let errorMessage: string | null = null;

  try {
    forecasts = await getWeatherForecast();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unexpected error while contacting the API.";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 font-sans dark:bg-black">
      <main className="w-full max-w-4xl space-y-8 rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-emerald-500">
            Backend health check
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
            Latest weather forecast (from ASP.NET Core API)
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            このカードは Next.js フロントエンドから .NET Web API の
            <code className="mx-1 rounded bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800">
              /weatherforecast
            </code>
            エンドポイントへ直接フェッチした結果を表示します。
          </p>
        </header>

        {errorMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
            <p className="font-medium">API 呼び出しに失敗しました</p>
            <p className="text-sm text-rose-700 dark:text-rose-200">
              {errorMessage}
            </p>
            <p className="text-sm text-rose-700 dark:text-rose-200">
              ① バックエンド API を起動 ②
              <code className="mx-1 rounded bg-rose-100 px-1 py-0.5 text-xs text-rose-800 dark:bg-rose-500/20 dark:text-rose-50">
                NEXT_PUBLIC_API_BASE_URL
              </code>
              を正しく設定しているか確認してください。
            </p>
          </div>
        )}

        {forecasts && forecasts.length > 0 && (
          <ul className="grid gap-4 md:grid-cols-2">
            {forecasts.map((forecast) => (
              <li
                key={forecast.date}
                className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-emerald-950/30"
              >
                <p className="text-sm uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                  {new Intl.DateTimeFormat("ja-JP", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }).format(new Date(forecast.date))}
                </p>
                <p className="mt-2 text-4xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {forecast.temperatureC}°C
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {forecast.temperatureF}°F
                </p>
                <p className="mt-4 text-base font-medium text-zinc-700 dark:text-zinc-200">
                  {forecast.summary ?? "No summary"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
