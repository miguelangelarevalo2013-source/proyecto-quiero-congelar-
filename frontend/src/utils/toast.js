export function showToast(message, type = 'success', duration = 4000) {
  if (typeof window === 'undefined') return
  let container = document.querySelector('.toast-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
  }

  const el = document.createElement('div')
  el.className = `toast toast--${type}`
  el.textContent = message
  container.appendChild(el)

  setTimeout(() => {
    el.style.transition = 'opacity 300ms ease, transform 300ms ease'
    el.style.opacity = '0'
    el.style.transform = 'translateY(-8px)'
    setTimeout(() => el.remove(), 350)
  }, duration)
}

export default showToast
