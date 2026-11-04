// Where the password email lands (/reset-password?token=…): choose a new
// password, then the sign-in window opens. Neon Auth issued the token, and it
// checks it on the way back.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import ActionBar from '../components/ActionBar'
import PasswordField from '../components/PasswordField'
import { openAccount, resetPassword } from '../cms/account'

export default function ResetPassword() {
  const token = new URLSearchParams(location.search).get('token')
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (f.get('password') !== f.get('confirm')) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await resetPassword(token, f.get('password'))
      navigate('/', { replace: true })
      openAccount({ mode: 'in', notice: 'Your password is changed. Sign in with the new one.' })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Nav />
      <ActionBar />
      <section className="section section--stack first-section">
        <div className="panel reset-password">
          <h2>Choose a new password</h2>
          {token ? (
            <form className="account__form" onSubmit={submit}>
              <PasswordField label="New password (8 or more characters)" name="password" autoComplete="new-password" />
              <PasswordField label="Confirm new password" name="confirm" autoComplete="new-password" />
              {error && <p className="newsletter__note newsletter__note--error" role="alert">{error}</p>}
              <button className="btn" type="submit" disabled={busy}>{busy ? 'One moment…' : 'Save password'}</button>
            </form>
          ) : (
            <p>This link is missing its code. Ask for a new one from the sign-in window.</p>
          )}
        </div>
      </section>
    </>
  )
}
