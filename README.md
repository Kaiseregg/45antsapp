
# 45ANTS – V7.3 FULL FINAL

## Start (lokal)
1. `npm install`
2. `npm run dev`
3. `/login` → Passwort in `env.runtime.js`
4. `/dashboard` → `+ Neue Landingpage`
5. `/editor?id=<UUID>` → Komponenten hinzufügen, speichern
6. `/p/<UUID>` → Public Renderer
7. `/analytics` → scan/click events
8. `/system-check` → ENV & DB Reachability

## Deploy (Netlify)
- Build: `npm run build`
- Publish: `dist`
- Keine Netlify‑ENV nötig (nur `env.runtime.js`).
