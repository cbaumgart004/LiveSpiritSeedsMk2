// utils/buttonFlashHandler.js
export function setupButtonClickFlash(delay = 600) {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn')
    if (!btn || !btn.matches('a')) return

    e.preventDefault()
    btn.classList.add('flash')

    setTimeout(() => {
      window.location.href = btn.getAttribute('href')
    }, delay)
  })
}
