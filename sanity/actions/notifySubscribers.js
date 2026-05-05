import { useState } from 'react'
import { EnvelopeIcon } from '@sanity/icons'
import { useToast } from '@sanity/ui'

// Sanity Studio custom action: shows on `noticia` documents.
// Calls our Next.js endpoint /api/send-blog-notification with the doc id.
// Auth: relies on the editor being logged into NextAuth on the same domain
// — the cookie is sent automatically (no secret in browser bundle).

export function NotifySubscribersAction(props) {
  const { draft, published, onComplete } = props
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const doc = published || draft
  const isPublished = !!published
  const alreadySent = doc?.notificacaoEnviada === true
  const missingSection = !doc?.secao

  let disabled = false
  let tooltip = ''
  if (!isPublished) { disabled = true; tooltip = 'Publica primeiro' }
  else if (missingSection) { disabled = true; tooltip = 'Define a secção primeiro' }
  else if (alreadySent) { disabled = true; tooltip = 'Já notificado' }

  return {
    label: 'Notificar subscritores',
    icon: EnvelopeIcon,
    disabled: disabled || loading,
    title: tooltip || 'Envia email a todos os subscritores da secção',
    onHandle: async () => {
      setLoading(true)
      try {
        const id = (published?._id || draft?._id || '').replace(/^drafts\./, '')
        const res = await fetch('/api/send-blog-notification', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: id }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`)
        }
        if (data.alreadySent) {
          toast.push({ status: 'info', title: 'Já tinha sido enviado.' })
        } else {
          toast.push({
            status: data.failed > 0 ? 'warning' : 'success',
            title: `${data.sent} email(s) enviados`,
            description: data.failed
              ? `${data.failed} falharam (de ${data.total}).`
              : `Total: ${data.total} subscritores.`,
            duration: 6000,
          })
        }
      } catch (e) {
        toast.push({
          status: 'error',
          title: 'Erro a notificar',
          description: e?.message || 'Verifica que tens sessão admin no site.',
          duration: 8000,
        })
      } finally {
        setLoading(false)
        onComplete?.()
      }
    },
  }
}
