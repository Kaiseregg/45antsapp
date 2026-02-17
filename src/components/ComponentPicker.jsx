
const TYPES = ['heading','text','image','images','links','button','video','pdfgallery','details','hours','team','testimonial','products']
export default function ComponentPicker({ onAdd }){
  return (
    <div className='card'>
      <h3>+ Komponente hinzufügen</h3>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {TYPES.map(t => <button key={t} className='button ghost' type='button' onClick={()=>onAdd(t)}>{t}</button>)}
      </div>
    </div>
  )
}
