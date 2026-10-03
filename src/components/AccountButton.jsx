/* eslint-disable react/prop-types */
// The person icon beside the menu button. It opens the one account window
// (AccountModal.jsx, mounted in App), so the icon can appear in more than one
// place in the nav without two windows.
import { openAccount } from '../cms/account'

export default function AccountButton({ className = '' }) {
  return (
    <button type="button" className={`account-button ${className}`} aria-label="Account and sign in" onClick={() => openAccount()}>
      <svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    </button>
  )
}
