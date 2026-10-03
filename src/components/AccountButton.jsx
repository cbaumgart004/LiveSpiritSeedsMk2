/* eslint-disable react/prop-types */
// The person icon beside the menu button: a window to sign in or create an
// account. A login the console lists as one of this site's editors also gets
// "Edit site", which opens the editor in place (src/cms/account.js).
import { useEffect, useState } from 'react'
import Modal from './Modal'
import { claimEditor, currentLogin, hasEditor, openEditor, signIn, signOut, signUp } from '../cms/account'

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  )
}

function SignInForm({ onDone }) {
  const [mode, setMode] = useState('in')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    setError('')
    try {
      if (mode === 'in') await signIn(f.get('email'), f.get('password'))
      else await signUp(f.get('name'), f.get('email'), f.get('password'))
      await onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="account__form" onSubmit={submit}>
      <div className="account__tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'in'} className={mode === 'in' ? 'is-on' : ''} onClick={() => setMode('in')}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={mode === 'up'} className={mode === 'up' ? 'is-on' : ''} onClick={() => setMode('up')}>
          Create account
        </button>
      </div>
      {mode === 'up' && (
        <label className="account__field">
          <span>Name</span>
          <input className="newsletter__input" name="name" autoComplete="name" />
        </label>
      )}
      <label className="account__field">
        <span>Email</span>
        <input className="newsletter__input" type="email" name="email" required autoComplete="username" />
      </label>
      <label className="account__field">
        <span>Password</span>
        <input className="newsletter__input" type="password" name="password" required minLength={8}
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />
      </label>
      {error && <p className="newsletter__note newsletter__note--error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'One moment…' : mode === 'in' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  )
}

export default function AccountButton({ className = '' }) {
  const [open, setOpen] = useState(false)
  // undefined while checking, null when signed out.
  const [login, setLogin] = useState(undefined)
  const [editor, setEditor] = useState(hasEditor())

  async function refresh() {
    const who = await currentLogin()
    setLogin(who)
    // A login that edits this site trades for an editor token once; the
    // console answers a visitor's with 403 and nothing changes.
    if (who && !hasEditor()) await claimEditor(who.jwt)
    setEditor(hasEditor())
    return who
  }

  useEffect(() => {
    if (open) refresh()
  }, [open])

  async function afterSignIn() {
    await refresh()
    if (hasEditor()) {
      setOpen(false)
      openEditor()
    }
  }

  const name = login?.name || login?.email

  return (
    <>
      <button type="button" className={`account-button ${className}`} aria-label={name ? `Account: ${name}` : 'Sign in'} onClick={() => setOpen(true)}>
        <PersonIcon />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={login ? 'Your account' : 'Welcome'}>
        {login === undefined && <p className="modal__intro">One moment…</p>}
        {login === null && <SignInForm onDone={afterSignIn} />}
        {login && (
          <div className="account__signed-in">
            <p className="modal__intro">
              Signed in as <strong>{login.email}</strong>
            </p>
            <div className="modal__links">
              {editor && (
                <button type="button" className="btn" onClick={() => { setOpen(false); openEditor() }}>
                  Edit site
                </button>
              )}
              <button type="button" className="btn" onClick={async () => { await signOut(); setLogin(null); setEditor(false) }}>
                Sign out
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
