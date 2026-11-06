/* eslint-disable react/prop-types */
// Facebook, Instagram and email as round icons, on the Connect page. Facebook
// and Instagram each need their switch on and an address (Site settings), so
// the owner can fill one in before showing it; email shows whenever there is one.

const ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="currentColor">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
}

export function socialItems(settings) {
  return [
    settings.showFacebook === true && settings.facebookUrl && { key: 'facebook', label: 'Facebook', href: settings.facebookUrl },
    settings.showInstagram === true && settings.instagramUrl && { key: 'instagram', label: 'Instagram', href: settings.instagramUrl },
    settings.contactEmail && { key: 'mail', label: 'Email', href: `mailto:${settings.contactEmail}` },
  ].filter(Boolean)
}

export default function SocialIcons({ settings }) {
  const items = socialItems(settings)
  if (!items.length) return null
  return (
    <ul className="social-icons">
      {items.map((i) => (
        <li key={i.key}>
          <a className="social-icons__link" href={i.href} aria-label={i.label} title={i.label}
            target={i.key === 'mail' ? undefined : '_blank'} rel="noreferrer">
            {ICONS[i.key]}
            <span>{i.label}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
