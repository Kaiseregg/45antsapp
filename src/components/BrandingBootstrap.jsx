import { useEffect, useState } from 'react'
import { getBranding, applyBrandingToDocument } from '../lib/branding'

export default function BrandingBootstrap({ children }) {
  const [branding, setBrandingState] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const b = await getBranding()
      if (!mounted) return
      setBrandingState(b)
      applyBrandingToDocument(b)
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Expose branding globally for simple components
  useEffect(() => {
    if (branding) window.__BRANDING__ = branding
  }, [branding])

  return children
}
