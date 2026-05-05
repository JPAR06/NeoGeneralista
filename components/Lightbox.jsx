import { useEffect } from "react"

// Fullscreen photo viewer. Keyboard: Esc closes, ←/→ navigate.
// Click on backdrop closes too. Stateless wrt to which photo is shown —
// caller passes `index` and `onNav(delta)` updates it.

export default function Lightbox({ photos, index, onClose, onNav }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft") onNav(-1)
      else if (e.key === "ArrowRight") onNav(1)
    }
    window.addEventListener("keydown", onKey)
    // Lock body scroll while open
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, onNav])

  if (index == null || !photos?.length) return null
  const url = photos[index]
  const hasPrev = index > 0
  const hasNext = index < photos.length - 1

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <button
        type="button"
        className="lightbox-close"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        aria-label="Fechar"
      >×</button>

      {hasPrev && (
        <button
          type="button"
          className="lightbox-arrow lightbox-arrow--left"
          onClick={(e) => { e.stopPropagation(); onNav(-1) }}
          aria-label="Foto anterior"
        >‹</button>
      )}
      {hasNext && (
        <button
          type="button"
          className="lightbox-arrow lightbox-arrow--right"
          onClick={(e) => { e.stopPropagation(); onNav(1) }}
          aria-label="Foto seguinte"
        >›</button>
      )}

      <img
        src={url}
        alt={`Foto ${index + 1} de ${photos.length}`}
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />

      {photos.length > 1 && (
        <div className="lightbox-counter">{index + 1} / {photos.length}</div>
      )}
    </div>
  )
}
