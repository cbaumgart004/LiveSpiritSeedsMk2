// Visitor accounts on the site's own address, and the owner's way into the
// editor from them.
//
// Sign-in and sign-up go to Neon Auth through the site's /_edit/auth rewrite
// (the console's auth proxy), so the session cookie is the site's own. The
// console then says whether that login edits this site: a member gets an
// editor token, kept where the console's loader looks for it, and the editor
// can open; anyone else stays a signed-in visitor.

import { CONSOLE_API } from './site'

const AUTH = '/_edit/auth'
export const SITE = 'spiritseeds'
const TOKEN_KEY = `eotm:token:${SITE}`

// Editing happens on the preview address, never on the live one. An owner who
// signs in on the live address is sent there with the editor token in the
// address's #fragment (never sent to a server; the console's loader keeps it
// and takes it out of the address bar), the same hand-off the console's admin
// page uses. The live address keeps no token, so it never shows Edit site.
const EDIT_ORIGIN = 'https://preview.spiritseedswellness.com'
export const isLive = () => /^(www\.)?spiritseedswellness\.com$/.test(location.hostname)
if (typeof location !== 'undefined' && isLive()) {
  try {
    if (localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
    }
  } catch { /* private mode */ }
}

async function post(path, body) {
  const res = await fetch(`${AUTH}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'That did not work. Please try again.')
  return data
}

// The signed-in login, with the JWT the console accepts, or null. Where Neon
// Auth puts the JWT is tried in the same order as the console's auth.js.
export async function currentLogin() {
  try {
    const res = await fetch(`${AUTH}/get-session`, { credentials: 'include' })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.user) return null
    let jwt = res.headers.get('set-auth-jwt') ?? data.session?.access_token ?? null
    if (!jwt) {
      const t = await fetch(`${AUTH}/token`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
      jwt = t?.token ?? null
    }
    return { email: data.user.email, name: data.user.name, jwt }
  } catch {
    return null
  }
}

export const signIn = (email, password) => post('/sign-in/email', { email, password })
export const signUp = (name, email, password) => post('/sign-up/email', { name: name || email.split('@')[0], email, password })

export async function signOut() {
  forgetEditor()
  await post('/sign-out', {}).catch(() => {})
}

// The loader shows its Edit site button while this browser holds an editor
// token; it rereads on a storage event, which another tab's write fires and
// this tab's does not, so this tab announces its own.
function tokenChanged() {
  try { window.dispatchEvent(new StorageEvent('storage', { key: TOKEN_KEY })) } catch { /* old browser: the loader rechecks within a minute */ }
}

// Asks the console whether this login edits the site. True when it does (and
// the editor token is now kept), false for a visitor.
export async function claimEditor(jwt) {
  if (!jwt) return false
  const res = await fetch(`${CONSOLE_API}/handoff`, { method: 'POST', headers: { authorization: `Bearer ${jwt}` } }).catch(() => null)
  if (!res?.ok) return false
  const { token } = await res.json()
  if (isLive()) {
    location.assign(`${EDIT_ORIGIN}${location.pathname}#eotm-token=${token}`)
    return true
  }
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    sessionStorage.setItem(TOKEN_KEY, token)
  }
  tokenChanged()
  return true
}

// An unexpired editor token for this site in this browser, as the loader reads it.
export function hasEditor() {
  try {
    const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
    const p = token && JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return Boolean(p && p.site === SITE && p.exp * 1000 > Date.now())
  } catch {
    return false
  }
}

function forgetEditor() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  } catch { /* private mode */ }
  window.EOTM?.close?.()
  tokenChanged()
}

// The password link: Neon Auth emails a link back to this site's
// /reset-password with ?token=. Better Auth renamed the endpoint; try the
// current name, then the older one (as the console's auth.js does).
export async function requestReset(email) {
  const body = { email, redirectTo: `${location.origin}/reset-password` }
  try {
    return await post('/request-password-reset', body)
  } catch {
    return post('/forget-password', body)
  }
}

export const resetPassword = (token, newPassword) => post('/reset-password', { token, newPassword })

// One account window serves every way in (the person icon, the newsletter's
// offer, a finished password reset): they ask for it by this event, and
// AccountModal, mounted once in App, answers. mode: 'in' | 'up' | 'reset'.
export const ACCOUNT_EVENT = 'ss:account'
export function openAccount(detail = {}) {
  window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT, { detail }))
}
