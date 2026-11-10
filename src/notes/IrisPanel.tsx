import { useEffect, useRef, useState } from 'react'
import { reflect } from './api'
import { Icon } from './Icon'
import type { ChatMessage } from './model'

export function IrisPanel({ cloud, close }: { cloud: boolean; close: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [useMemory, setUseMemory] = useState(false)
  const [sessionId, setSessionId] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  const scroll = useRef<HTMLDivElement>(null)
  useEffect(() => { scroll.current?.scrollTo(0, scroll.current.scrollHeight) }, [messages, busy])
  const send = async () => {
    if (!cloud || pending.current || !input.trim()) return
    const content = input.trim()
    pending.current = true; setBusy(true); setError('')
    const transcript: ChatMessage[] = [...messages, { role: 'user', content }]
    try {
      const response = await reflect(transcript, useMemory, sessionId)
      if (!response.content) throw new Error('No response was returned. Your draft is still here.')
      setSessionId(response.sessionId)
      setMessages([...transcript, { role: 'assistant', content: response.content }]); setInput('')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'IRIS could not respond. Your draft is still here.') }
    finally { pending.current = false; setBusy(false) }
  }
  return <div className="modal-overlay"><section className="modal-body iris-dialog" role="dialog" aria-modal="true" aria-labelledby="iris-title"><header className="modal-header"><div className="iris-mini" /><div><h2 id="iris-title">IRIS</h2><span className="label">{cloud ? 'ENGRAM INTELLIGENCE' : 'CONNECTION PENDING'}</span></div><button className="icon-button" aria-label="Close IRIS" onClick={close} disabled={busy}><Icon name="close" /></button></header><div ref={scroll} className="iris-messages">
    {!messages.length && <div className="iris-welcome"><div className="iris-orb" aria-hidden="true"><span /></div><h2>A little space<br /><em>to hear yourself.</em></h2><p>{cloud ? 'Bring a thought, a question, or a moment you want to understand.' : 'Your private notebook and Self Mirror work here. AI conversation needs a connected Engram server; ChatGPT account integration is pending.'}</p>{!cloud && <button className="secondary" onClick={close}>Return to my notebook</button>}</div>}
    {messages.map((message, index) => <div key={index} className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>{message.content}</div>)}
    {busy && <p className="label accent" role="status">IRIS is reflecting…</p>}
  </div><footer className="iris-composer">{error && <p className="error-message" role="alert">{error}</p>}<label className="memory-toggle"><input type="checkbox" checked={useMemory} disabled={!cloud || busy} onChange={event => setUseMemory(event.target.checked)} />Use saved Engram memory in this conversation</label><form onSubmit={event => { event.preventDefault(); void send() }}><input aria-label="Message IRIS" placeholder={cloud ? 'Tell IRIS what’s on your mind…' : 'Connect Engram Cloud to chat'} value={input} disabled={!cloud || busy} maxLength={6000} onChange={event => setInput(event.target.value)} /><button className="icon-button accent" aria-label="Send to IRIS" disabled={!cloud || busy || !input.trim()}><Icon name="arrow" /></button></form><p className="fine-print">{cloud ? 'Sent messages are processed by the configured AI provider and stored in your Engram account.' : 'No message is sent while disconnected.'}</p></footer></section></div>
}
