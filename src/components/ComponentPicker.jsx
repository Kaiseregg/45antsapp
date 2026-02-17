import { useState } from 'react'

const GROUPS = [
  { title: 'Basics', items: [
    { key:'heading', label:'Überschrift + Text' },
    { key:'text', label:'Text' },
    { key:'button', label:'Taste' },
    { key:'links', label:'Links' },
    { key:'details', label:'Andere Details' },
  ]},
  { title: 'Media', items: [
    { key:'image', label:'Bild' },
    { key:'images', label:'Bilder' },
    { key:'video', label:'Video' },
    { key:'pdfgallery', label:'PDF‑Galerie' },
  ]},
  { title: 'Business', items: [
    { key:'hours', label:'Geschäftszeiten' },
    { key:'team', label:'Team' },
    { key:'testimonial', label:'Zeugnis' },
    { key:'products', label:'Produkte' },
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
