/* eslint-disable react/prop-types */
// The Kit signup in the site's own look, used by the newsletter section and the
// Connect window. Kit's JS embed ships Kit's own stylesheet, so it can only ever
// match ONE season, and the season is owner-switchable from the console, so that
// form would drift out of brand the moment Melissa moves to fall. Same call as
// the teaching schedule (DESIGN.md §6): render our own markup and post to Kit.
//
// This is the unauthenticated endpoint Kit's own HTML embed submits to, so
// there is NO api key here and nothing secret to leak from a static site.
// Field names (`email_address`, `fields[first_name]`) are Kit's, not ours.
import { useState } from 'react'
import { currentLogin, openAccount } from '../cms/account'

const kitEndpoint = (formId) => `https://app.kit.com/forms/${formId}/subscriptions`

const GENERIC_ERROR = 'That didn’t go through. Please try again in a moment.'

// Kit answers 200 even when it refuses the signup, so the HTTP status alone
// tells us nothing: `status` in the body is the real verdict. On failure it
// returns {errors: {fields: [...], messages: [...]}}.
//
// Only a complaint about the ADDRESS is worth repeating to the visitor ("Email
// address is invalid"): that is something they can fix. A form-level error
// means the form id is wrong or the form was deleted, which reads as gibberish
// to a visitor and is Melissa's to fix, so it gets the generic wording instead.
function kitErrorMessage(data) {
  const fields = data?.errors?.fields
  const message = data?.errors?.messages?.[0]
  if (message && Array.isArray(fields) && fields.includes('email_address')) return message
  return GENERIC_ERROR
}

export default function NewsletterForm({
  formId,
  intro,
  askName,
  placeholder,
  namePlaceholder,
  buttonLabel,
  success,
  finePrint,
}) {
  const id = String(formId || '').trim()
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(GENERIC_ERROR)
  // After a signup with no account signed in: the address, to offer one.
  const [offer, setOffer] = useState('')
  // Kit's spam guard: a page where the visitor proves they are a person.
  const [guard, setGuard] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (status === 'sending') return
    // Grab the node before the first await: React nulls currentTarget out as
    // soon as the event is done being dispatched.
    const form = e.currentTarget
    const body = new FormData(form)
    const email = String(body.get('email_address') || '')
    setStatus('sending')
    try {
      const res = await fetch(kitEndpoint(id), { method: 'POST', headers: { Accept: 'application/json' }, body })
      const data = await res.json().catch(() => null)
      // Kit answers "quarantined" with a guard page when its spam check wants a
      // person to confirm; the signup completes there. Treating that as a
      // failure lost the subscriber, so send them to it instead.
      if (res.ok && data?.status === 'quarantined' && /^https:\/\/app\.kit\.com\//.test(data.url ?? '')) {
        setGuard(data.url)
        setStatus('idle')
        return
      }
      // A silent no-op that still looks like it worked is the one outcome worse
      // than an error: she'd never know she lost the subscriber.
      if (!res.ok || data?.status !== 'success') {
        setError(kitErrorMessage(data))
        setStatus('error')
        return
      }
      form.reset()
      setStatus('success')
      if (!(await currentLogin())) setOffer(email)
    } catch {
      setError(GENERIC_ERROR)
      setStatus('error')
    }
  }

  if (!id) {
    return (
      <div className="newsletter embed-placeholder">
        <p>
          Add your Kit <strong>form ID</strong> in the editor to turn this into a signup form.
        </p>
      </div>
    )
  }

  return (
    <div className="newsletter">
      {intro && <p className="newsletter__intro">{intro}</p>}

      {status === 'success' ? (
        <p className="newsletter__note newsletter__note--ok" role="status">
          {success || 'Thank you! Check your inbox to confirm.'}
        </p>
      ) : null}
      {status === 'success' && offer ? (
        <div className="newsletter__offer">
          <p>Would you like an account too? It keeps your details for booking and sign-ups.</p>
          <button type="button" className="btn" onClick={() => openAccount({ mode: 'up', email: offer })}>Create an account</button>
          <button type="button" className="link-button" onClick={() => setOffer('')}>No, thanks</button>
        </div>
      ) : null}
      {status === 'success' ? null : (
        <form className="newsletter__form" onSubmit={handleSubmit} action={kitEndpoint(id)} method="post">
          {askName && (
            <label className="newsletter__field">
              <span className="newsletter__label">First name</span>
              <input className="newsletter__input" type="text" name="fields[first_name]" autoComplete="given-name"
                placeholder={namePlaceholder || 'First name'} />
            </label>
          )}
          <label className="newsletter__field">
            <span className="newsletter__label">Email address</span>
            <input className="newsletter__input" type="email" name="email_address" required autoComplete="email"
              placeholder={placeholder || 'your@email.com'} />
          </label>
          <button className="btn" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : buttonLabel || 'Subscribe'}
          </button>
        </form>
      )}

      {guard && (
        <p className="newsletter__note" role="status">
          One more step: Kit wants to check you are a person.{' '}
          <a href={guard} target="_blank" rel="noreferrer">Finish signing up</a>
        </p>
      )}

      {status === 'error' && (
        <p className="newsletter__note newsletter__note--error" role="alert">
          {error}
        </p>
      )}

      {finePrint && <p className="newsletter__fine">{finePrint}</p>}
    </div>
  )
}
