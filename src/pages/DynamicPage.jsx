/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTina } from 'tinacms/dist/react'
import { client } from '../../tina/__generated__/client'
import Nav from '../components/Nav'
import Blocks from '../components/cms/Blocks'

// Loads a Page content file by slug and renders its blocks.
// `/` maps to home.json; `/:slug` maps to <slug>.json.
export default function DynamicPage() {
  const { slug } = useParams()
  const relativePath = `${slug || 'home'}.json`
  const [res, setRes] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    setRes(null)
    setNotFound(false)
    client.queries
      .page({ relativePath })
      .then((r) => active && setRes(r))
      .catch(() => active && setNotFound(true))
    return () => {
      active = false
    }
  }, [relativePath])

  if (notFound) {
    return (
      <>
        <Nav />
        <section className="section section--stack first-section">
          <div className="panel">
            <h2>Page not found</h2>
          </div>
        </section>
      </>
    )
  }

  if (!res) {
    return (
      <>
        <Nav />
        <div className="page-wrapper first-section" style={{ padding: '2rem' }}>
          Loading…
        </div>
      </>
    )
  }

  return <PageView data={res.data} query={res.query} variables={res.variables} />
}

// Separate component so useTina (a hook) is called unconditionally.
function PageView({ data, query, variables }) {
  const tina = useTina({ query, variables, data })
  return (
    <>
      <Nav />
      <Blocks blocks={tina.data?.page?.blocks} />
    </>
  )
}
