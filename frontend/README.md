# Frontend (Next.js)

The frontend is a Next.js App Router project that renders data coming from the ASP.NET Core backend.

## Prerequisites

- Node.js 18+
- Backend API running locally or in the cloud (see `/backend`)

## Environment variables

1. Copy the example file:

	```bash
	cp .env.example .env.local
	```

2. Update `NEXT_PUBLIC_API_BASE_URL` so it points to your backend (e.g. `http://localhost:5232` during development or the Azure App Service URL in production).

> **Important:** Any value prefixed with `NEXT_PUBLIC_` is exposed to the browser, so never store secrets here.

## Development

Install dependencies (only required once):

```bash
npm install
```

Start the dev server on [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

## 認証用ページ

- `http://localhost:3000/register` … `/api/auth/register` に POST するユーザー登録フォーム。成功するとレスポンス JSON を表示し、`localStorage` に保存します。
- `http://localhost:3000/login` … `/api/auth/login` に POST するログインフォーム。保存済みトークンの確認・コピー・削除ができます。

## Linting

```bash
npm run lint
```
