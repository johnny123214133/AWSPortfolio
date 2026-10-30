import { lazy, Suspense } from 'react'

// Lazy so the CAD (Konva, Three, the pattern library) is only downloaded when this page is opened,
// not with the portfolio's home page.
const KumikoEmbed = lazy(() => import('../KumikoCAD/Embed.jsx'))

export default function KumikoCADPage() {
  return (
    <Suspense fallback={<p className="m-4">Loading Kumiko CAD…</p>}>
      <KumikoEmbed />
    </Suspense>
  )
}
