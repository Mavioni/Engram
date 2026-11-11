import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import { type NotebookEntry, entryTitle, shortText, dateLabel } from './model'

type Point = { x: number; y: number; z: number; entry: NotebookEntry }
type Projected = { x: number; y: number; z: number; size: number; entry: NotebookEntry }
type Props = { entries: NotebookEntry[]; onOpen: (id: string) => void }

function hash(text: string): number {
  let value = 2166136261
  for (let i = 0; i < text.length; i++) { value ^= text.charCodeAt(i); value = Math.imul(value,16777619) }
  return value >>> 0
}
function pointCloud(entries: NotebookEntry[]): Point[] {
  return entries.map((entry, i) => {
    // Stable deterministic layout; positions are geometry, NOT psychological scores.
    const seed = hash(entry.id)
    const longitude = (seed % 100000) / 100000 * Math.PI * 2 + i * 2.399963
    const latitude = Math.acos(2 * (((seed >>> 7) % 10000) / 10000) - 1)
    const radius = 0.57 + (((seed >>> 13) % 3000) / 3000) * 0.42
    return { entry, x: Math.sin(latitude) * Math.cos(longitude) * radius, y: Math.cos(latitude) * radius, z: Math.sin(latitude) * Math.sin(longitude) * radius }
  })
}
const palette: Record<NotebookEntry['kind'],string> = { note: '#8ba8ff', journal: '#b5a2ed', task: '#f1bd87', mood: '#91d4c3' }

export function EngramGraph({ entries, onOpen }: Props) {
  const visible = useMemo(() => entries.filter(e => e.title.trim() || e.body.trim() || e.mood), [entries])
  const points = useMemo(() => pointCloud(visible), [visible])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotation = useRef({ x: 0.18, y: -0.4, zoom: 1 })
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const rendered = useRef<Projected[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const chosen = visible.find(e => e.id === selected) ?? null
  const links = useMemo(() => {
    const result: Array<[number,number]> = []
    // A line represents an explicit tag shared by two saved entries. No inferred connections.
    const tags = points.map(p => new Set(p.entry.tags.map(t => t.toLowerCase().trim()).filter(Boolean)))
    for(let i=0;i<points.length;i++) {
      let drawn = 0
      for(let j=i+1;j<points.length && drawn<4;j++) {
        if ([...tags[i]].some(t => tags[j].has(t))) { result.push([i,j]); drawn++ }
      }
    }
    return result
  }, [points])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let running = true
    const render = () => {
      if (!running) return
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1,rect.width), height = Math.max(1,rect.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas.width !== Math.floor(width*dpr) || canvas.height !== Math.floor(height*dpr)) {
        canvas.width = Math.floor(width*dpr); canvas.height = Math.floor(height*dpr)
      }
      ctx.setTransform(dpr,0,0,dpr,0,0)
      ctx.clearRect(0,0,width,height)
      const centerX = width/2, centerY = height/2
      const scale = Math.min(width,height) * 0.39 * rotation.current.zoom
      // Orientation is controlled by touch/mouse; motion pauses for reduced motion users.
      if (!reduced && !drag.current) rotation.current.y += 0.0014
      const cy=Math.cos(rotation.current.y), sy=Math.sin(rotation.current.y)
      const cx=Math.cos(rotation.current.x), sx=Math.sin(rotation.current.x)
      const project = (p: Point): Projected => {
        const x=p.x*cy+p.z*sy, z=-p.x*sy+p.z*cy
        const y=p.y*cx-z*sx, z2=p.y*sx+z*cx
        const perspective=3.6/(3.6-z2)
        return { x:centerX+x*scale*perspective, y:centerY+y*scale*perspective, z:z2, size:Math.max(3, Math.min(9,5.1*perspective)), entry:p.entry }
      }
      const projected=points.map(project)
      rendered.current=projected
      const r=Math.min(width,height)*0.39*rotation.current.zoom
      ctx.strokeStyle='rgba(145,162,200,.10)'
      ctx.lineWidth=1
      for (const size of [0.57,0.80,1]) {
        ctx.beginPath();ctx.ellipse(centerX,centerY,r*size,r*size*.53,-.28,0,Math.PI*2);ctx.stroke()
      }
      for(const [a,b] of links){
        const p=projected[a], q=projected[b]
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)
        ctx.strokeStyle='rgba(148,172,218,.28)';ctx.lineWidth=1.05;ctx.stroke()
      }
      for(const p of [...projected].sort((a,b)=>a.z-b.z)){
        const active=p.entry.id===selected
        ctx.beginPath();ctx.arc(p.x,p.y,active?p.size*1.6:p.size,0,Math.PI*2)
        ctx.fillStyle=palette[p.entry.kind];ctx.globalAlpha=active?1:Math.max(.42,.8+p.z*.2)
        ctx.shadowColor=palette[p.entry.kind];ctx.shadowBlur=active?24:8;ctx.fill()
        ctx.shadowBlur=0;ctx.globalAlpha=1
        if(active){ctx.strokeStyle='#f8fafc';ctx.lineWidth=1.5;ctx.stroke()}
      }
      frame=requestAnimationFrame(render)
    }
    render()
    return () => { running=false;cancelAnimationFrame(frame) }
  }, [points, links, selected])

  const pointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    drag.current={x:e.clientX,y:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId)
  }
  const pointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if(!drag.current) return
    const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y
    if(Math.abs(dx)+Math.abs(dy)>2) drag.current.moved=true
    rotation.current.y+=dx*.008
    rotation.current.x=Math.max(-1.3,Math.min(1.3,rotation.current.x+dy*.008))
    drag.current.x=e.clientX;drag.current.y=e.clientY
  }
  const pointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    if(!drag.current) return
    const moved=drag.current.moved;drag.current=null
    if (moved) return
    const rect=e.currentTarget.getBoundingClientRect()
    const x=e.clientX-rect.left,y=e.clientY-rect.top
    const target=[...rendered.current].reverse().find(p=>Math.hypot(p.x-x,p.y-y)<Math.max(17,p.size*2))
    setSelected(target?.entry.id ?? null)
  }
  const wheel = (e: WheelEvent<HTMLCanvasElement>) => {
    rotation.current.zoom=Math.max(.55,Math.min(1.55,rotation.current.zoom-e.deltaY*.001))
  }

  return <section className="graph-layout" aria-label="Your Engram visualization">
    <div className="graph-stage">
      <div className="graph-stage-top"><span className="overline">PERSONAL KNOWLEDGE / 3D SPACE</span><span className="graph-live"><span/>LIVE FROM YOUR NOTEBOOK</span></div>
      {visible.length ? <>
        <canvas ref={canvasRef} aria-label={`Interactive 3D graph of ${visible.length} saved notebook entries and ${links.length} explicit shared-tag connections`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onWheel={wheel} className="graph-canvas" />
        <span className="graph-tip">Drag to rotate · Scroll to zoom · Select a point</span>
      </> : <div className="graph-empty"><span className="graph-empty-orbit" aria-hidden="true"><i/><i/><i/></span><h3>A shape only you can make.</h3><p>Write your first page in the Notebook. Each saved thought becomes a point in your Engram.</p></div>}
    </div>
    <aside className="graph-detail">
      <div className="overline">WHAT YOU'RE SEEING</div>
      <h2>{visible.length ? 'Your thoughts, connected.' : 'An empty canvas.'}</h2>
      <p>Every point is a page you wrote. Lines appear only when two pages share a tag. Engram does not invent memories, personality traits, or relationships.</p>
      <div className="graph-metrics"><div><b>{visible.length}</b><span>Saved pages</span></div><div><b>{links.length}</b><span>Shared-tag links</span></div><div><b>{new Set(visible.flatMap(e=>e.tags.map(t=>t.toLowerCase()))).size}</b><span>Unique tags</span></div></div>
      {chosen && <div className="graph-selected"><span className="overline">SELECTED MEMORY</span><h3>{entryTitle(chosen)}</h3><p>{shortText(chosen.body,210) || 'No additional text.'}</p><small>{dateLabel(chosen.createdAt)}</small><button className="button subtle" onClick={()=>onOpen(chosen.id)}>Open in Notebook ↗</button></div>}
      <div className="legend"><span><i style={{background:palette.note}}/>Notes</span><span><i style={{background:palette.journal}}/>Journal</span><span><i style={{background:palette.task}}/>Tasks</span><span><i style={{background:palette.mood}}/>Mood</span></div>
      {visible.length>0 && <div className="graph-access"><h3>All visible memories</h3><div className="graph-access-list">{visible.slice(0,40).map(e=><button key={e.id} onClick={()=>{setSelected(e.id);onOpen(e.id)}}>{entryTitle(e)}</button>)}</div></div>}
    </aside>
  </section>
}
