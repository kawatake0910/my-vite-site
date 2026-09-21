const githubAuthorizeUrl = 'https://github.com/login/oauth/authorize'
const githubTokenUrl = 'https://github.com/login/oauth/access_token'

const cookieValue = (request, name) => {
  const cookie = request.headers.get('Cookie') || ''
  const prefix = `${name}=`
  return cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix))?.slice(prefix.length)
}

const randomState = () => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const html = (body) => new Response(`<!doctype html><html lang="ja"><meta charset="utf-8"><title>CMS認証</title><body>${body}</body></html>`, {
  headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' },
})

const errorPage = (message) => html(`<p>${message}</p><script>if (window.opener) window.opener.postMessage('authorization:github:error:{}'.replace('{}', JSON.stringify({ error: ${JSON.stringify(message)} })), '*');</script>`)

const callbackPage = (token) => {
  const payload = JSON.stringify({ token })
  return html(`<p>認証が完了しました。このウィンドウを閉じてください。</p><script>window.opener?.postMessage('authorization:github:success:${payload}', '*');</script>`)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/') {
      return new Response('Decap CMS GitHub OAuth proxy is ready.', { headers: { 'Cache-Control': 'no-store' } })
    }

    if (url.pathname === '/auth') {
      if (url.searchParams.get('provider') !== 'github') return new Response('Invalid provider', { status: 400 })
      const state = randomState()
      const callbackUrl = `${url.origin}/callback?provider=github`
      const scope = env.GITHUB_REPO_PRIVATE === '1' ? 'repo,user' : 'public_repo,user'
      const authorizeUrl = new URL(githubAuthorizeUrl)
      authorizeUrl.search = new URLSearchParams({ client_id: env.GITHUB_OAUTH_ID, redirect_uri: callbackUrl, scope, state }).toString()
      return new Response(null, {
        status: 302,
        headers: {
          Location: authorizeUrl.toString(),
          'Set-Cookie': `decap_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/callback; Max-Age=600`,
          'Cache-Control': 'no-store',
        },
      })
    }

    if (url.pathname === '/callback') {
      if (url.searchParams.get('provider') !== 'github') return new Response('Invalid provider', { status: 400 })
      const state = url.searchParams.get('state')
      if (!state || state !== cookieValue(request, 'decap_oauth_state')) return errorPage('認証状態を確認できませんでした。管理画面からもう一度ログインしてください。')
      const code = url.searchParams.get('code')
      if (!code) return errorPage('GitHubから認証コードを受け取れませんでした。')

      const tokenResponse = await fetch(githubTokenUrl, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: env.GITHUB_OAUTH_ID, client_secret: env.GITHUB_OAUTH_SECRET, code, redirect_uri: `${url.origin}/callback?provider=github` }),
      })
      const tokenData = await tokenResponse.json()
      if (!tokenResponse.ok || !tokenData.access_token) return errorPage('GitHubとの認証に失敗しました。管理者へ連絡してください。')
      const response = callbackPage(tokenData.access_token)
      response.headers.set('Set-Cookie', 'decap_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/callback; Max-Age=0')
      return response
    }

    return new Response('Not found', { status: 404 })
  },
}
