/* eslint-disable react/prop-types */
// The one account window (mounted in App): sign in, create an account, or ask
// for a password link; signed in, who you are, Edit site for the site's own
// editors, and Sign out. Anything can open it with openAccount() from
// src/cms/account.js: the person icon, the newsletter's offer, a reset link.
import { useEffect, useState } from 'react'
import Modal from './Modal'
import PasswordField from './PasswordField'
import {
  ACCOUNT_EVENT, claimEditor, currentLogin, hasEditor, openEditor, requestReset, signIn, signOut, signUp,
} from '../cms/account'

const TITLES = { in: 'Welcome back', up: 'Create an account', reset: 'Can’t log in?' }

function Tabs({ mode, setMode }) {
  return (
    <div className="account__tabs" role="tablist">
      <button type="button" role="tab" aria-selected={mode === 'in'} className={mode === 'in' ? 'is-on' : ''} onClick={() => setMode('in')}>
        Sign in
      </button>
      <button type="button" role="tab" aria-selected={mode === 'up'} className={mode === 'up' ? 'is-on' : ''} onClick={() => setMode('up')}>
        Create account
      </button>
    </div>
  )
}

function AccountForm({ mode, setMode, email, notice, onSignedIn }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')

  async function submit(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setError('')
    if (mode === 'up' && f.get('password') !== f.get('confirm')) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'reset') {
        await requestReset(f.get('email'))
        setSent(f.get('email'))
        return
      }
      if (mode === 'in') await signIn(f.get('email'), f.get('password'))
      else await signUp(f.get('name'), f.get('email'), f.get('password'))
      await onSignedIn()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'reset' && sent) {
    return (
      <div className="account__form">
        <p className="modal__intro">If there is an account for <strong>{sent}</strong>, a link to choose a new password is on its way. Check your inbox.</p>
        <button type="button" className="link-button" onClick={() => { setSent(''); setMode('in') }}>Back to sign in</button>
      </div>
    )
  }

  return (
    // key: a new mode starts a fresh form, so a typed password does not carry over.
    <form key={mode} className="account__form" onSubmit={submit}>
      {mode === 'reset' ? (
        <p className="modal__intro">Enter your email and we will send a link to choose a new password.</p>
      ) : (
        <Tabs mode={mode} setMode={setMode} />
      )}
      {notice && <p className="modal__intro">{notice}</p>}
      {mode === 'up' && (
        <label className="account__field">
          <span>Name</span>
          <input className="newsletter__input" name="name" autoComplete="name" />
        </label>
      )}
      <label className="account__field">
        <span>Email</span>
        <input className="newsletter__input" type="email" name="email" required autoComplete="username" defaultValue={email} />
      </label>
      {mode === 'in' && <PasswordField label="Password" name="password" autoComplete="current-password" />}
      {mode === 'up' && (
        <>
          <PasswordField label="Password (8 or more characters)" name="password" autoComplete="new-password" />
          <PasswordField label="Confirm password" name="confirm" autoComplete="new-password" />
        </>
      )}
      {error && <p className="newsletter__note newsletter__note--error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'One moment…' : mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create account' : 'Send the link'}
      </button>
      {mode === 'in' && <button type="button" className="link-button" onClick={() => setMode('reset')}>Can’t log in?</button>}
      {mode === 'reset' && <button type="button" className="link-button" onClick={() => setMode('in')}>Back to sign in</button>}
    </form>
  )
}

export default function AccountModal() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('in')
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
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
  }

  useEffect(() => {
    const onAsk = (e) => {
      setMode(e.detail?.mode || 'in')
      setEmail(e.detail?.email || '')
      setNotice(e.detail?.notice || '')
      setLogin(undefined)
      setOpen(true)
      refresh()
    }
    window.addEventListener(ACCOUNT_EVENT, onAsk)
    return () => window.removeEventListener(ACCOUNT_EVENT, onAsk)
  }, [])

  async function afterSignIn() {
    await refresh()
    if (hasEditor()) {
      setOpen(false)
      openEditor()
    }
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} title={login ? 'Your account' : TITLES[mode]}>
      {login === undefined && <p className="modal__intro">One moment…</p>}
      {login === null && <AccountForm mode={mode} setMode={setMode} email={email} notice={notice} onSignedIn={afterSignIn} />}
      {login && (
        <div className="account__form">
          <p className="modal__intro">
            Signed in as <strong>{login.email}</strong>
          </p>
          <div className="modal__links">
            {editor && (
              <button type="button" className="btn" onClick={() => { setOpen(false); openEditor() }}>
                Edit site
              </button>
            )}
            <button type="button" className="btn" onClick={async () => { await signOut(); setLogin(null); setEditor(false); setMode('in') }}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
