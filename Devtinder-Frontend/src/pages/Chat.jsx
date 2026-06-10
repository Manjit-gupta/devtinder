import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

export default function Chat() {
  const { targetUserId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [targetUser, setTargetUser] = useState(null)
  
  const socketRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    // Scroll to bottom whenever messages change
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${targetUserId}`)
        setMessages(res.data.data)
        
        // Find target user details from connections to show header
        const connRes = await api.get('/user/connections')
        const target = connRes.data.data.find(c => c._id === targetUserId)
        if (target) setTargetUser(target)
      } catch (err) {
        console.error("Failed to load chat history:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [targetUserId])

  useEffect(() => {
    // Determine backend URL cleanly, assuming it's on 3000 if frontend is 5173
    const backendUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
      : 'http://localhost:3000'

    // We pass the token inside auth. Look it up from cookies or localStorage. 
    // In our app, JWT is stored in cookies, which are sent via HTTP, but ws handshake might not carry them easily if cross-origin.
    // Assuming backend will read the standard cookie if we set withCredentials.
    socketRef.current = io(backendUrl, {
      withCredentials: true,
      // fallback auth approach: get token from document.cookie
      auth: {
        token: document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
      }
    })

    socketRef.current.on("receiveMessage", (newMessage) => {
       // Only append if it belongs to exactly this conversation thread
       if (newMessage.senderId._id === targetUserId || newMessage.senderId === targetUserId) {
         setMessages(prev => [...prev, newMessage])
       }
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [targetUserId])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const tempMessage = {
      _id: Date.now().toString(),
      senderId: user,
      receiverId: targetUserId,
      text: inputText,
      createdAt: new Date().toISOString()
    }

    // Optimistic UI update
    setMessages(prev => [...prev, tempMessage])
    setInputText('')

    socketRef.current.emit("sendMessage", { receiverId: targetUserId, text: tempMessage.text }, (response) => {
      if (response.status === "error") {
        console.error("Failed to send message:", response.error)
        // Optionally remove temp message or show error icon
      } else {
        // Replace temp msg with real message from server
        setMessages(prev => prev.map(m => m._id === tempMessage._id ? response.data : m))
      }
    })
  }

  if (loading) return <div className="text-center p-10">Loading chat...</div>

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-border dark:border-gray-800 rounded-t-xl p-4 flex items-center gap-3">
        <button onClick={() => navigate('/connections')} className="text-secondary hover:text-primary dark:hover:text-white mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        {targetUser?.photoUrl ? (
          <img src={targetUser.photoUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold">
             {targetUser?.firstName?.[0] || '?'}
          </div>
        )}
        <h2 className="font-semibold text-primary dark:text-white">{targetUser?.firstName} {targetUser?.lastName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-gray-50 dark:bg-[#121212] border-x border-border dark:border-gray-800 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg) => {
          const isSender = msg.senderId._id === user._id || msg.senderId === user._id
          return (
            <div key={msg._id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isSender ? 'bg-accent text-white rounded-br-none' : 'bg-white dark:bg-[#202020] text-primary dark:text-white border border-border dark:border-gray-800 rounded-bl-none shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="bg-white dark:bg-[#1a1a1a] border border-border dark:border-gray-800 rounded-b-xl p-3 flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 dark:bg-[#202020] border-none rounded-full px-4 text-sm text-primary dark:text-white focus:ring-1 focus:ring-accent outline-none"
        />
        <Button type="submit" disabled={!inputText.trim()} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </Button>
      </form>
    </div>
  )
}
