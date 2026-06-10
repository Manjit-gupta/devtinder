import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

export default function Activity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get('/activity')
        setActivities(res.data.data)
      } catch (err) {
        addToast(err.displayMessage || "Failed to load activity", 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [addToast])

  if (loading) {
    return <div className="text-center p-10 text-secondary">Loading feed...</div>
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-primary dark:text-white">Activity Feed</h1>
        <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded-full font-bold">New</span>
      </div>

      {activities.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-primary dark:text-white font-medium">It's quiet here...</p>
          <p className="text-secondary dark:text-gray-400 text-sm mt-1">Make more connections to see what they are building.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map((project) => (
            <div key={project._id} className="card shadow-sm border border-border dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                {project.userId.photoUrl ? (
                  <img src={project.userId.photoUrl} alt="author" className="w-10 h-10 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold">
                    {project.userId.firstName?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-sm text-primary dark:text-white">{project.userId.firstName} {project.userId.lastName}</h3>
                  <p className="text-xs text-secondary dark:text-gray-400">Published a new project • {new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Body */}
              <h2 className="text-lg font-bold text-primary dark:text-white mb-2">{project.title}</h2>
              <p className="text-sm text-secondary dark:text-gray-300 mb-4">{project.description}</p>
              
              {project.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 text-[10px] font-medium border border-border dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 text-secondary">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-3 border-t border-border dark:border-gray-800 text-sm">
                {project.repoLink && (
                  <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1 font-medium">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path></svg> View Repository
                  </a>
                )}
                {project.liveLink && (
                  <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline flex items-center gap-1 font-medium">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
