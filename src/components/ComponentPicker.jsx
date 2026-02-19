import { useState } from 'react'

// Clean/curated list: only components that are implemented and useful.
// We keep the UI professional and avoid “dead” components.
const GROUPS = [
  { title: 'Basics', items: [
    { key:'heading', label:'Überschrift' },
    { key:'text', label:'Text' },
    { key:'links', label:'Links' },
    { key:'testimonial', label:'Hinweis / Info' },
  ]},
  { title: 'Media', items: [
    { key:'image', label:'Bild' },
    { key:'images', label:'Bilder‑Galerie' },
    { key:'video', label:'Video (YouTube)' },
    { key:'pdfgallery', label:'PDF‑Galerie' },
  ]},
]

export default function ComponentPicker({ onAdd }){
  const [open,setOpen]=useState(false)
  return (
    <div className='chimp-add'>
      <button className='chimp-add-btn' type='button' onClick={()=>setOpen(v=>!v)}>
        + Komponente hinzufügen
      </button>
      {open && (
        <div className='chimp-menu' role='menu'>
          {GROUPS.map(g=>(
            <div key={g.title} className='chimp-menu-group'>
              <div className='chimp-menu-title'>{g.title}</div>
              {g.items.map(it=>(
                <button
                  key={it.key}
                  className='chimp-menu-item'
                  type='button'
                  onClick={()=>{ onAdd(it.key); setOpen(false) }}
                >
                  {it.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
