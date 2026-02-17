import { supabase, APP_NAME_DEFAULT, APP_VERSION } from '../supabaseClient'

const KEY_APP_NAME = 'app_name'
const KEY_FAVICON_URL = 'favicon_url'

export async function getBranding() {
  // We store small settings in public.kv (key text primary key, value text/json)
  // Some projects already have a `kv` table; if not, this will safely fall back.
  try {
    const { data, error } = await supabase
      .from('kv')
      .select('key,value')
      .in('key', [KEY_APP_NAME, KEY_FAVICON_URL])

    if (error) throw error

    const map = new Map((data || []).map((r) => [r.key, r.value]))
    return {
      appName: map.get(KEY_APP_NAME) || APP_NAME_DEFAULT,
      appVersion: APP_VERSION,
      faviconUrl: map.get(KEY_FAVICON_URL) || null,
    }
  } catch {
    return { appName: APP_NAME_DEFAULT, appVersion: APP_VERSION, faviconUrl: null }
  }
}

export async function setBranding({ appName, faviconUrl }) {
  const rows = []
  if (typeof appName === 'string') rows.push({ key: KEY_APP_NAME, value: appName })
  if (typeof faviconUrl === 'string') rows.push({ key: KEY_FAVICON_URL, value: faviconUrl })
  if (!rows.length) return

  // Upsert works if `key` is unique/primary. If not, it will error; admin can still change via table editor.
  await supabase.from('kv').upsert(rows, { onConflict: 'key' })
}

export function applyBrandingToDocument({ appName, appVersion, faviconUrl }) {
  document.title = `${appName} v${String(appVersion).replace(/^v/, '')}`

  if (faviconUrl) {
    let link = document.querySelector('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = faviconUrl
  }
}
