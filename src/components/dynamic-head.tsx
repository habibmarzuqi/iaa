'use client'

import * as React from 'react'

/**
 * DynamicHead — injects dynamic favicon, document title, and meta tags
 * from site settings into the document <head>.
 * Rendered once in layout.tsx.
 */
export function DynamicHead() {
  const [settings, setSettings] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    const faviconUrl = settings['branding.faviconUrl']
    const metaTitle = settings['seo.metaTitle']
    const metaDescription = settings['seo.metaDescription']
    const metaKeywords = settings['seo.metaKeywords']
    const ogImage = settings['seo.ogImage']
    const siteName = settings['site.name']

    // Update favicon
    if (faviconUrl) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = faviconUrl
    }

    // Update document title
    if (metaTitle) {
      document.title = metaTitle
    }

    // Update meta description
    if (metaDescription) {
      updateMetaTag('name', 'description', metaDescription)
    }

    // Update meta keywords
    if (metaKeywords) {
      updateMetaTag('name', 'keywords', metaKeywords)
    }

    // Update OG tags
    if (metaTitle) {
      updateMetaTag('property', 'og:title', metaTitle)
    }
    if (metaDescription) {
      updateMetaTag('property', 'og:description', metaDescription)
    }
    if (ogImage) {
      updateMetaTag('property', 'og:image', ogImage)
    }
    if (siteName) {
      updateMetaTag('property', 'og:site_name', siteName)
    }
  }, [settings])

  return null
}

function updateMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let meta = document.querySelector(`meta[${attr}='${key}']`) as HTMLMetaElement
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, key)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}
