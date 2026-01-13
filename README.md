## Omocha Bako Monorepo

複数サーフェス（Web / Mobile）対応予定の練習用プロジェクトです。現在は以下の 3 つのアプリが同じリポジトリで管理されています。

- **frontend/**: Next.js 14 (App Router)
- **backend/**: ASP.NET Core 9 + Identity API + PostgreSQL
- **mobile/**: Expo (React Native)

この README では、ローカル開発環境の立ち上げ方、認証 API の使い方、HTTPS でアクセスできない場合の対処をまとめています。

---

## 必要なツール

- Docker Desktop 4.0 以上（PostgreSQL 用）
- .NET 9 SDK
- Node.js 18 以上（Next.js / Expo 用）
- npm または pnpm（このリポジトリでは npm を使用）

---

## ディレクトリ構成と役割

| ディレクトリ | 役割 |
| --- | --- |
| `backend/` | ASP.NET Core Web API。Identity API を `/api/auth` で公開し、`WeatherForecast` などのサンプル API を提供。 |
| `frontend/` | Next.js (App Router)。`lib/api.ts` からバックエンドの REST API を呼び出す。 |
| `mobile/` | Expo アプリ。将来的にモバイルフロントを実装予定。 |

---

## PostgreSQL（Docker Compose）

1. **環境変数ファイルを作成**

	```bash
	cp .env.docker.example .env.docker
	# POSTGRES_PASSWORD やポートを必要に応じて変更
	```

2. **コンテナを起動**

	```bash
	docker compose up -d
	```

	- コンテナ名: `omo-postgres`
	- 既定ポート: `5432`
	- データはボリューム `postgres-data` に永続化

3. **停止 / 削除**

	```bash
	docker compose down
	```

4. **ローカル接続文字列例**

	```text
	Host=localhost;Port=5432;Database=omocha_bako;Username=omocha_user;Password=change-me
	```

`backend/appsettings.Development.json` の `ConnectionStrings:Default` に設定し、`Program.cs` の `AddDbContext` から参照します。マイグレーションは `dotnet ef database update` で適用できます。

---

## Backend API の起動手順

1. 依存関係を復元し、開発用 DB に接続できることを確認します。
2. HTTP で起動する場合:

	```bash
	dotnet run --project backend/BackendApi.csproj
	```

3. HTTPS で起動する場合（推奨）:

	```bash
	dotnet dev-certs https --trust   # 初回のみ。証明書を OS に信頼させる
	dotnet run --project backend/BackendApi.csproj --launch-profile https
	```

   - HTTP: `http://localhost:5232`
   - HTTPS: `https://localhost:7254`

4. `[Authorize]` が付いた API (例: `GET /WeatherForecast`) にアクセスする際は、後述のログインで得た Bearer トークンを `Authorization` ヘッダーに付与してください。

### HTTPS にアクセスできない場合

- `dotnet dev-certs https --clean` → `dotnet dev-certs https --trust` を実行し直す。
- ブラウザや REST クライアントで `https://localhost:7254` を開き、証明書の警告が出た場合は許可する。
- フロントエンドや Postman からアクセスするときは、URL が `https://localhost:7254` になっているか確認する。

上記を行っても解決しない場合は、一旦 `http://localhost:5232` を使用し、通信路の保護が必要な操作は VPN やローカルネットワーク内でのみ行ってください。

---

## Frontend (Next.js) の起動手順

1. `.env` を準備

	```bash
	cp frontend/.env.example frontend/.env.local
	```

2. `NEXT_PUBLIC_API_BASE_URL` をバックエンドの URL に合わせて設定（例: `http://localhost:5232` または `https://localhost:7254`）。
3. 依存関係のインストールと起動

	```bash
	cd frontend
	npm install
	npm run dev
	```

4. ブラウザで `http://localhost:3000` を開き、API との疎通を確認します。

---

## Mobile (Expo) の起動メモ

- `mobile/` ディレクトリで `npm install` → `npx expo start`。
- `.env` や `app.json` にバックエンドの URL を設定する想定です（現時点ではテンプレート状態）。

---

## 認証 API（Identity + Bearer Token）

`Program.cs` で `AddIdentityCore` を設定し、Microsoft 提供の Identity API を `/api/auth` にマッピングしています。すべて JSON リクエスト／レスポンスで、SPA やモバイルから直接呼び出せます。

| エンドポイント | メソッド | Body | 説明 |
| --- | --- | --- | --- |
| `/api/auth/register` | POST | `{ "email", "password", "userName" }` | ユーザー登録と同時にトークンを返す。 |
| `/api/auth/login` | POST | `{ "email", "password" }` | 資格情報からアクセストークン／リフレッシュトークンを取得。 |
| `/api/auth/refresh` | POST | `{ "refreshToken" }` または Cookie | リフレッシュトークンを使い、新しいアクセストークンを発行。 |
| `/api/auth/logout` | POST | なし | リフレッシュトークンを失効させる。 |

### ログインレスポンスの意味

```json
{
  "tokenType": "Bearer",
  "accessToken": "...",
  "expiresIn": 3600,
  "refreshToken": "..."
}
```

- `tokenType`: API を叩く際のスキーム。`Authorization: Bearer <accessToken>` の形で送ります。
- `accessToken`: 短時間だけ有効な JWT。`expiresIn` 秒後に無効になるため、期限切れ前に再ログインまたはリフレッシュが必要です。
- `expiresIn`: アクセストークンの寿命（秒）。デフォルトで 3600 秒 = 1 時間。
- `refreshToken`: 長寿命トークン。失効前に `/api/auth/refresh` に送ることでトークンを更新できます。安全なストレージ（HttpOnly Cookie など）に保存してください。


### Postman / curl サンプル

```bash
# ユーザー登録
curl -X POST http://localhost:5232/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","userName":"user","password":"Str0ng!Passw0rd"}'

# ログイン
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5232/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Str0ng!Passw0rd"}')

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
# 認証必須 API の呼び出し
curl http://localhost:5232/WeatherForecast \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

# トークン更新
curl -X POST http://localhost:5232/api/auth/refresh \
	-H "Content-Type: application/json" \
	-d '{"refreshToken":"<refresh token>"}'

### Frontend から `[Authorize]` API を試す（`/protected` ページ）

- Next.js 側でログイン／登録すると、アクセストークンとリフレッシュトークンがブラウザの `localStorage` に保存されます。
- ヘッダーの **Protected** リンク（`/protected`）を開くと、保存済みトークンの状態を確認しつつ `GET /weatherforecast` を呼び出す UI が表示されます。
- 「API を呼び出す」を押すと `Authorization: Bearer <accessToken>` 付きでバックエンドにリクエストし、成功すれば天気予報のレスポンスがカード表示されます。
- トークンが期限切れ／未保存の場合はエラーメッセージが表示されるので、再ログインまたは「ローカルのトークンを削除」で状態をリセットしてください。
- `.env.local` の `NEXT_PUBLIC_API_BASE_URL` とバックエンドの URL が一致している必要があります（HTTPS 推奨）。