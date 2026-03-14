import { useState } from 'react'
import './Chatbot.css'

const API = 'http://127.0.0.1:8000'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { text: "Hi! How can I help you today?", isBot: true }
  ])
  const [input, setInput] = useState('')

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { text: input, isBot: false }
    setMessages([...messages, userMsg])
    setInput('')

    try {
      const res = await fetch(`${API}/chatbot/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { text: data.response, isBot: true }])
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the server.", isBot: true }])
    }
  }

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="chatbot-icon" onClick={() => setIsOpen(true)}>
          <span role="img" aria-label="chat">💬</span>
        </button>
      )}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Milkman Support</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <form className="chatbot-input" onSubmit={handleSend}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type your message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  )
}
