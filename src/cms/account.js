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

// keep: "Keep me signed in". Better Auth's rememberMe: true keeps the session
// cookie for the auth server's session length (7 days by Better Auth's default;
// UNVERIFIED what Neon Auth sets), false ends it when the browser closes.
export async function signIn(email, password, keep = true) {
  const r = await post('/sign-in/email', { email, password, rememberMe: keep })
  keepHint(keep)
  return r
}
export async function signUp(name, email, password, keep = true) {
  const r = await post('/sign-up/email', { name: name || email.split('@')[0], email, password, rememberMe: keep })
  keepHint(keep)
  return r
}

export async function signOut() {
  forgetEditor()
  setLogin(null)
  await post('/sign-out', {}).catch(() => {})
}

// Who is signed in, for the navbar's Welcome and the live address's Edit site
// button: { name, editor } or null. A hint in storage (localStorage when kept,
// else this tab's sessionStorage) says a session may exist, so a visitor who
// never signed in costs no request to the auth server on page load.
const HINT = 'ss:login'
export const LOGIN_EVENT = 'ss:login'
let login = null
function keepHint(keep) {
  try {
    localStorage.removeItem(HINT)
    sessionStorage.removeItem(HINT)
    ;(keep ? localStorage : sessionStorage).setItem(HINT, '1')
  } catch { /* private mode */ }
}
function hinted() {
  try { return localStorage.getItem(HINT) === '1' || sessionStorage.getItem(HINT) === '1' } catch { return false }
}
export function getLogin() { return login }
export function setLogin(next) {
  login = next
  if (!next) {
    try { localStorage.removeItem(HINT); sessionStorage.removeItem(HINT) } catch { /* private mode */ }
  }
  window.dispatchEvent(new CustomEvent(LOGIN_EVENT, { detail: next }))
}
export const firstName = (who) => {
  const name = String(who?.name ?? '').trim()
  // A name made from the email (sign-up without one) is not a name.
  if (!name || (who.email && name === who.email.split('@')[0])) return ''
  return name.split(/\s+/)[0]
}

// Whether this login edits the site, without keeping a token (the live
// address keeps none; its Edit site button asks claimEditor for the hand-off).
async function edits(jwt) {
  if (!jwt) return false
  const res = await fetch(`${CONSOLE_API}/handoff`, { method: 'POST', headers: { authorization: `Bearer ${jwt}` } }).catch(() => null)
  await noteRefusal(res)
  return Boolean(res?.ok)
}

// Why the console refused an owner's login, for the account window to say:
// a member whose password must be changed first, an expired sign-in, the
// console unreachable. A visitor's refusal ("cannot edit this site") is not one.
let refusal = ''
export const editorRefusal = () => refusal
async function noteRefusal(res) {
  refusal = ''
  if (res?.ok) return
  if (!res) { refusal = 'The editor could not be reached. Please try again.'; return }
  const msg = (await res.clone().json().catch(() => null))?.message ?? ''
  if (!/cannot edit this site/i.test(msg)) refusal = msg || `The editor answered ${res.status}.`
}

// On every page load with a hint: the session is checked once. On the preview
// address an owner's expired editor token is traded for a new one, so the
// loader's Edit site button stays while she is signed in (the token lasts 8
// hours, the session up to 7 days). On the live address she gets the site's
// own Edit site button, which hands her to the preview address.
export async function restoreLogin() {
  if (!hinted()) return
  const who = await currentLogin()
  if (!who) return setLogin(null)
  let editor = false
  if (isLive()) editor = await edits(who.jwt)
  else editor = hasEditor() || (await claimEditor(who.jwt))
  setLogin({ ...who, editor })
}
export const openEditor = () => (login?.jwt ? claimEditor(login.jwt) : Promise.resolve(false))

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
  await noteRefusal(res)
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
