import { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import App from './App.jsx'
import useThemeStore from './store/useThemeStore.js'
import useProjectStore from './store/useProjectStore.js'
import { themeById } from './theme/themes.js'
import { applyThemeToDocument, clearThemeFromDocument } from './theme/applyTheme.js'
// '?inline' hands back each stylesheet as a string instead of adding it to the page for good.
// The CAD's stylesheet restyles html/body/#root and Bootstrap's own classes, which is right for
// a full-screen app and wrong for the rest of the portfolio, so it is only attached while the CAD
// is on screen.
import bootstrapCss from 'bootstrap/dist/css/bootstrap.min.css?inline'
import customCss from './styles/custom.css?inline'

// The portfolio has global rules that are not scoped to its own pages: Home.css and
// BidExtractionDashboard.css restyle every `.btn` (gray border, extra padding), App.css gives
// every `.card` 2em of padding, and index.css styles every bare <button>. Bootstrap is therefore
// attached again, after those, so that its `.btn` wins the tie, and the rest is undone below.
// :where() keeps these at the lowest specificity so Bootstrap's and the CAD's own classes win.
const RESET_CSS = `
:where(.kumiko-embed) button {
  border: revert; border-radius: 0; padding: revert; background-color: revert;
  font-size: inherit; font-weight: revert; transition: none;
}
:where(.kumiko-embed) button:hover { border-color: revert; }
:where(.kumiko-embed) a { color: revert; font-weight: revert; }
:where(.kumiko-embed) .card { padding: 0; }
.kumiko-embed .app-layout { height: 100%; }
`

// Mounts the Kumiko CAD inside another page. The standalone app owns the whole document
// (main.jsx); here it is a fixed full-screen layer with a "back" link in its toolbar, and it
// puts the document back when it unmounts.
export default function KumikoEmbed() {
  const dirty = useProjectStore((s) => s.dirty)

  useLayoutEffect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-kumiko-embed', '')
    style.textContent = bootstrapCss + RESET_CSS + customCss
    document.head.appendChild(style)
    const previousTitle = document.title
    // The theme was applied once when its store first loaded; apply it again on every visit.
    applyThemeToDocument(themeById(useThemeStore.getState().themeId))
    return () => {
      style.remove()
      clearThemeFromDocument()
      document.title = previousTitle
    }
  }, [])

  const confirmLeave = (e) => {
    if (dirty && !window.confirm('This panel has unsaved changes. Leave the CAD anyway?')) e.preventDefault()
  }

  const back = (
    <>
      <Link to="/" onClick={confirmLeave} style={{ color: 'var(--kumiko-accent)', textDecoration: 'none', fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
        ← Portfolio
      </Link>
      <div className="vr" style={{ height: '1.5rem' }} />
    </>
  )

  return (
    <div className="kumiko-embed" style={{ position: 'fixed', inset: 0, textAlign: 'left' }}>
      <App toolbarLeading={back} />
    </div>
  )
}
