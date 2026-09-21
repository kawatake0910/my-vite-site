# Decap CMS 初期設定

CMS画面は `public/admin/` に追加済みです。公開環境でログインを有効にするには、GitHub OAuthプロキシが必要です。GitHub Pagesは静的ホスティングのため、この認証処理をPages内だけで安全に実行できません。

## 管理者が行う設定

1. GitHub OAuth Appを作成します。
2. OAuthのClient Secretを、Cloudflare WorkersまたはNetlify Functionsなどの認証プロキシのシークレットとして保存します。
3. プロキシに `/auth` と `/callback` を実装します。
4. `public/admin/config.yml` の `base_url` をプロキシのHTTPS URLへ設定します。
5. GitHub Pagesの公開元を **GitHub Actions** に設定します。
6. `master` に対するPull Requestのレビュー1名と、`Check site changes` の成功を必須にするブランチ保護を設定します。

## 重要な注意

- `base_url` には現在、Cloudflare WorkerのHTTPS URLを設定しています。WorkerのURLを変更した場合は、ここも必ず同時に変更します。
- OAuth Client Secret、アクセストークン、メールパスワードをリポジトリやCMS設定ファイルへ書かないでください。
- CMS編集者には必要最小限のGitHub権限だけを付与し、退任時は直ちに無効化します。
- `master` は公開ブランチです。別ブランチに変更する場合は、CMS設定と2本のGitHub Actionsを同時に更新します。
