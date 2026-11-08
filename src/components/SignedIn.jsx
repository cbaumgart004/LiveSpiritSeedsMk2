/* eslint-disable react/prop-types */
// The signed-in login for any component (useLogin), the navbar's Welcome line
// (Welcome, in Nav.jsx), and on the live address, for the site's owner, an
// Edit site button that hands her to the preview address (the loader shows
// its own there).
import { useEffect, useState } from 'react'
import { LOGIN_EVENT, firstName, getLogin, isLive, openEditor, restoreLogin } from '../cms/account'

export function useLogin() {
  const [who, setWho] = useState(getLogin)
  useEffect(() => {
    const on = (e) => setWho(e.detail)
    window.addEventListener(LOGIN_EVENT, on)
    return () => window.removeEventListener(LOGIN_EVENT, on)
  }, [])
  return who
}

export default function SignedIn() {
  const who = useLogin()
  const [busy, setBusy] = useState(false)
  useEffect(() => { restoreLogin() }, [])
  if (!who) return null
  return (
    <>
      {isLive() && who.editor && (
        <button type="button" className="edit-site" disabled={busy}
          onClick={async () => { setBusy(true); if (!(await openEditor())) setBusy(false) }}>
          {busy ? 'Opening…' : 'Edit site'}
        </button>
      )}
    </>
  )
}

export function Welcome({ className = '' }) {
  const who = useLogin()
  const first = who ? firstName(who) : ''
  // No one signed in, or no name to greet: nothing, not a bare "Welcome".
  if (!first) return null
  return <p className={`welcome ${className}`} aria-live="polite">{`Welcome, ${first}`}</p>
}
