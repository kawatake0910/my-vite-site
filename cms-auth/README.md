# Cloudflare Worker: Decap CMS認証プロキシ

このWorkerは、GitHub Pages上のDecap CMSとGitHub OAuthの間で認証を中継します。サイト本体はGitHub Pagesのままです。

## デプロイ前に管理者が行うこと

1. Cloudflareへログインします。
2. GitHubの **Settings > Developer settings > OAuth Apps** でOAuth Appを作成します。
3. Workerを公開したURLを控えます。例: `https://my-vite-cms-auth.<account>.workers.dev`
4. OAuth Appの値を次のように設定します。
   - Homepage URL: サイトのURL（例: `https://kawatake0910.github.io/my-vite-site/`）
   - Authorization callback URL: `WorkerのURL/callback`
5. Cloudflare Workerに次の値を登録します。
   - `GITHUB_OAUTH_ID`: GitHub OAuth AppのClient ID（通常の環境変数。公開情報です）
   - `GITHUB_OAUTH_SECRET`: GitHub OAuth AppのClient Secret

## コマンドによるデプロイ

Cloudflareへログイン後、プロジェクトのルートから実行します。

```powershell
npx wrangler deploy --config cms-auth/wrangler.jsonc
npx wrangler secret put GITHUB_OAUTH_SECRET --config cms-auth/wrangler.jsonc
```

`GITHUB_REPO_PRIVATE` は、サイトのGitHubリポジトリが公開リポジトリなら `0`、非公開なら `1` のまま／変更します。

## CMS側の接続

公開URLが決まったら、`public/admin/config.yml` の `base_url` をそのURLへ置き換えます。`auth_endpoint` は `auth` のままです。

Client Secret、Cloudflare APIトークン、ローカル用の `.dev.vars` は絶対にGitへコミットしません。
