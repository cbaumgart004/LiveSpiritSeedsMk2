/* eslint-disable react/prop-types */
// A themed window over the page: a native <dialog>, so Escape, focus trapping
// and the backdrop come from the browser. It takes the site's panel look, so it
// follows the season and UI style like every section.
import { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, title, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className="panel modal"
      aria-label={title}
      onClose={onClose}
      // A click on the backdrop lands on the dialog itself, not its contents.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
        ×
      </button>
      {title && <h2 className="modal__title">{title}</h2>}
      {open && children}
    </dialog>
  )
}
