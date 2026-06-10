import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

function ConnectionCard({ userProfile, currentUserId, handleEndorse }) {
  const navigate = useNavigate()
  const name = `${userProfile.firstName} ${userProfile.lastName}`
  const initials = `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`

  return (
    <div className="flex items-center justify-between py-4 border-b border-border dark:border-gray-800 last:border-0 border-opacity-50">
      <div className="flex items-center gap-3 w-full">
        {userProfile.photoUrl ? (
          <img src={userProfile.photoUrl} alt={name} className="w-12 h-12 rounded-full object-cover border border-border dark:border-gray-700" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-border dark:border-gray-700 flex items-center justify-center text-sm font-semibold text-secondary">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary dark:text-white truncate">{name}</p>
          {userProfile.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {userProfile.skills.map(skill => {
                const endorsementData = userProfile.endorsements?.find(e => e.skill.toLowerCase() === skill.toLowerCase());
                const count = endorsementData?.endorsers?.length || 0;
                const iEndorsed = endorsementData?.endorsers?.includes(currentUserId) || false;
                
                return (
                  <button 
                    key={skill}
                    onClick={() => handleEndorse(userProfile._id, skill)}
                    className={`px-2 py-0.5 text-[10px] sm:text-xs font-medium border rounded-md transition-colors flex items-center gap-1 ${
                      iEndorsed 
                        ? 'bg-accent/10 border-accent text-accent shadow-sm' 
                        : 'border-border dark:border-gray-700 text-secondary hover:border-accent hover:text-accent shadow-sm bg-white dark:bg-[#1a1a1a]'
                    }`}
                    title={iEndorsed ? "Remove endorsement" : "Endorse this skill"}
                  >
                    {skill} {count > 0 && <span className="font-bold opacity-80">· {count}</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">
        <Button 
          variant="outline"
          onClick={() => navigate(`/chat/${userProfile._id}`)}
          className="text-xs px-3 py-1.5 whitespace-nowrap"
        >
          Message
        </Button>
      </div>
    </div>
  )
}

export default function Connections() {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { addToast } = useToast()

  const fetchConnections = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/user/connections')
      setConnections(res.data?.data || res.data || [])
    } catch (err) {
      addToast(err.displayMessage, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const handleEndorse = async (userId, skill) => {
    try {
      await api.post(`/endorse/${userId}`, { skill })
      addToast(`Endorsement updated!`, 'success')
      // Refresh without full loading state to prevent flash
      const res = await api.get('/user/connections')
      setConnections(res.data?.data || res.data || [])
    } catch (err) {
      addToast(err.displayMessage, 'error')
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold font-primary dark:text-white">Your Network</h1>
        <span className="text-sm font-semibold bg-gray-100 dark:bg-[#1f1f1f] text-secondary px-3 py-1 rounded-full">{connections.length} connections</span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-[#1f1f1f] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : connections.length === 0 ? (
        <div className="card text-center py-16 shadow-none border border-dashed border-border dark:border-gray-800 bg-transparent">
          <p className="text-4xl mb-4">🤝</p>
          <p className="text-primary dark:text-white font-medium text-lg">No connections yet</p>
          <p className="text-secondary dark:text-gray-400 text-sm mt-1">Start matching on the Feed to build your network!</p>
        </div>
      ) : (
        <div className="card px-6 py-2 shadow-sm">
          {connections.map((conn) => (
            <ConnectionCard 
              key={conn._id} 
              userProfile={conn} 
              currentUserId={user?._id}
              handleEndorse={handleEndorse}
            />
          ))}
        </div>
      )}
    </main>
  )
}
