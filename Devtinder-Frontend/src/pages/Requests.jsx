import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import Button from '../components/Button'

function RequestRow({ request, onAction }) {
  const [loading, setLoading] = useState(false)
  const user = request.fromUserId
  const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()

  const handle = async (status) => {
    setLoading(true)
    try {
      await onAction(request._id, status === 'accepted' ? 'Accepted' : 'Rejected')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        {user?.photoUrl ? (
          <img src={user.photoUrl} alt={name} className="w-10 h-10 rounded-full object-cover border border-border" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-border flex items-center justify-center text-sm font-semibold text-secondary">
            {user?.firstName?.[0] || '?'}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-primary">{name || 'Unknown'}</p>
          {user?.skills?.length > 0 && (
            <p className="text-xs text-secondary">{user.skills.slice(0, 3).join(', ')}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => handle('rejected')} disabled={loading} className="text-xs px-3 py-1.5">
          Reject
        </Button>
        <Button variant="primary" onClick={() => handle('accepted')} disabled={loading} className="text-xs px-3 py-1.5">
          Accept
        </Button>
      </div>
    </div>
  )
}

export default function Requests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/user/requests/received')
      setRequests(res.data?.connectionRequests || [])
    } catch (err) {
      addToast(err.displayMessage, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleAction = async (requestId, status) => {
    try {
      await api.post(`/request/respond/${status}/${requestId}`)
      setRequests((prev) => prev.filter((r) => r._id !== requestId))
      addToast(status === 'Accepted' ? 'Connection accepted!' : 'Request rejected', status === 'Accepted' ? 'success' : 'info')
    } catch (err) {
      addToast(err.displayMessage, 'error')
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Requests</h1>
        <span className="text-sm text-secondary">{requests.length} pending</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-secondary text-sm">No pending requests</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden divide-y-0">
          <div className="px-6 py-2">
            {requests.map((req) => (
              <RequestRow key={req._id} request={req} onAction={handleAction} />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
