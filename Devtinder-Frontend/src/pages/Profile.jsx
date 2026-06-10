import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Input from '../components/Input'
import Button from '../components/Button'

const SKILLS_OPTIONS = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Go', 'Rust', 'Java', 'CSS', 'Docker', 'GraphQL', 'MongoDB']

export default function Profile() {
  const { user, fetchMe } = useAuth()
  const { addToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [repos, setRepos] = useState(null)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [projectForm, setProjectForm] = useState({ title: '', description: '', repoLink: '', liveLink: '', techStack: '' })
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: user?.age || '',
    gender: user?.gender || '',
    about: user?.about || user?.bio || '',
    skills: user?.skills || [],
    photoUrl: user?.photoUrl || '',
    githubUrl: user?.githubUrl || '',
    experienceYears: user?.experienceYears || '',
    location: user?.location || '',
    openToWork: user?.openToWork || false,
  })

  useEffect(() => {
    const fetchRepos = async () => {
      if (!user?.githubUrl || editing) return;
      const username = user.githubUrl.split('/').filter(Boolean).pop();
      if (!username) return;
      
      setLoadingRepos(true)
      try {
        const res = await api.get(`/user/github/${username}`)
        setRepos(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingRepos(false)
      }
    }
    fetchRepos()
  }, [user?.githubUrl, editing])

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true)
      try {
        const res = await api.get('/project/me')
        setProjects(res.data.data)
      } catch (err) {
        console.error("Failed to fetch projects", err)
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProjects()
  }, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleAddProject = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...projectForm,
        techStack: projectForm.techStack.split(',').map(s => s.trim()).filter(Boolean)
      }
      const res = await api.post('/project', payload)
      setProjects([res.data.data, ...projects])
      setProjectForm({ title: '', description: '', repoLink: '', liveLink: '', techStack: '' })
      setShowAddProject(false)
      addToast('Project added!', 'success')
    } catch (err) {
      addToast(err.displayMessage || 'Error adding project', 'error')
    }
  }

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/project/${id}`)
      setProjects(projects.filter(p => p._id !== id))
      addToast('Project deleted', 'success')
    } catch (err) {
      addToast(err.displayMessage, 'error')
    }
  }

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch('/profile/edit', {
        firstName: form.firstName,
        lastName: form.lastName,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        // Backend currently stores this field as `bio`.
        bio: form.about || undefined,
        skills: form.skills,
        photoUrl: form.photoUrl || undefined,
        githubUrl: form.githubUrl || undefined,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        location: form.location || undefined,
        openToWork: form.openToWork,
      })
      await fetchMe()
      addToast('Profile updated!', 'success')
      setEditing(false)
    } catch (err) {
      addToast(err.displayMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const name = `${user?.firstName} ${user?.lastName}`
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Profile</h1>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {!editing ? (
        /* View mode */
        <div className="card space-y-5">
          {/* Completeness Score */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wide">Profile Completeness</span>
              <span className="text-sm font-bold text-accent">{user?.profileCompleteness || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${user?.profileCompleteness || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt={name} className="w-16 h-16 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 border border-border flex items-center justify-center text-xl font-bold text-secondary">
                {initials}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-primary">{name}</p>
              <p className="text-sm text-secondary">{user?.emailId}</p>
              {user?.age && user?.gender && (
                <p className="text-xs text-secondary mt-0.5">{user.age} · {user.gender}</p>
              )}
              {user?.location && (
                <p className="text-xs text-secondary mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">📍 {user.location}</p>
              )}
              {user?.openToWork && (
                <p className="text-xs text-accent mt-0.5 font-medium whitespace-nowrap overflow-hidden text-ellipsis">💼 Open to work</p>
              )}
            </div>
          </div>

          {(user?.about || user?.bio) && (
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-1">About</p>
              <p className="text-sm text-primary">{user?.about || user?.bio}</p>
            </div>
          )}

          {user?.skills?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 text-xs border border-border rounded-full text-secondary dark:text-gray-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border dark:border-gray-800">
            {user?.githubUrl && (
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-1">GitHub</p>
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline break-all">
                  {user.githubUrl.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {user?.experienceYears > 0 && (
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-1">Experience</p>
                <p className="text-sm text-primary dark:text-white">{user.experienceYears} Years</p>
              </div>
            )}
          </div>
          
          {user?.githubUrl && repos && (
            <div className="pt-2 border-t border-border dark:border-gray-800">
              <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path></svg>
                Top Repositories
              </p>
              
              {loadingRepos ? (
                <p className="text-sm text-secondary">Loading repos...</p>
              ) : repos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {repos.map(repo => (
                    <a 
                      key={repo.id} 
                      href={repo.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] hover:border-accent dark:hover:border-accent transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-primary dark:text-white truncate">{repo.name}</h3>
                      <p className="text-xs text-secondary mt-1 line-clamp-2 h-8">{repo.description || 'No description provided.'}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-secondary font-medium">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-accent"></span>
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">⭐ {repo.stargazers_count}</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-secondary">No public repositories found.</p>
              )}
            </div>
          )}

          {/* Projects Showcase */}
          <div className="pt-4 border-t border-border dark:border-gray-800">
             <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-medium text-secondary uppercase tracking-wide flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                 Projects Showcase
              </p>
              <Button variant="outline" className="text-xs py-1 px-2" onClick={() => setShowAddProject(!showAddProject)}>
                 {showAddProject ? 'Cancel' : '+ Add Project'}
              </Button>
             </div>

             {showAddProject && (
               <form onSubmit={handleAddProject} className="mb-4 p-3 border border-border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] space-y-3">
                 <Input label="Title" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} required />
                 <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-secondary uppercase tracking-wide">Description</label>
                    <textarea required className="input-field resize-none bg-white dark:bg-[#1f1f1f]" rows={2} value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                 </div>
                 <Input label="Tech Stack (comma separated)" value={projectForm.techStack} onChange={e => setProjectForm({...projectForm, techStack: e.target.value})} placeholder="React, Node, Express" />
                 <div className="grid grid-cols-2 gap-2">
                   <Input label="Repo Link" value={projectForm.repoLink} onChange={e => setProjectForm({...projectForm, repoLink: e.target.value})} />
                   <Input label="Live Link" value={projectForm.liveLink} onChange={e => setProjectForm({...projectForm, liveLink: e.target.value})} />
                 </div>
                 <Button type="submit" className="w-full">Save Project</Button>
               </form>
             )}

             {loadingProjects ? (
               <p className="text-sm text-secondary">Loading projects...</p>
             ) : projects.length > 0 ? (
               <div className="space-y-3">
                 {projects.map(project => (
                   <div key={project._id} className="p-4 border border-border dark:border-gray-700 rounded-xl bg-white dark:bg-[#1f1f1f] shadow-sm relative group">
                     <button onClick={() => handleDeleteProject(project._id)} className="absolute top-3 right-3 text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                     </button>
                     <h3 className="text-base font-bold text-primary dark:text-white mb-1">{project.title}</h3>
                     <p className="text-sm text-secondary dark:text-gray-400 mb-3">{project.description}</p>
                     
                     {project.techStack?.length > 0 && (
                       <div className="flex flex-wrap gap-1 mb-3">
                         {project.techStack.map(tech => (
                           <span key={tech} className="px-2 py-0.5 text-[10px] font-medium border border-border dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 text-secondary">
                             {tech}
                           </span>
                         ))}
                       </div>
                     )}
                     
                     <div className="flex gap-4 text-sm mt-2">
                       {project.repoLink && <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path></svg> Code</a>}
                       {project.liveLink && <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Live Demo</a>}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
                <p className="text-sm text-secondary italic">No projects added yet.</p>
             )}
          </div>

        </div>
      ) : (
        /* Edit mode */
        <form onSubmit={handleSave} className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.firstName} onChange={set('firstName')} />
            <Input label="Last Name" value={form.lastName} onChange={set('lastName')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Age" type="number" value={form.age} onChange={set('age')} placeholder="25" min="18" max="99" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-secondary uppercase tracking-wide">Gender</label>
              <select className="input-field" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">About</label>
            <textarea
              className="input-field resize-none bg-white dark:bg-[#1f1f1f]"
              rows={3}
              value={form.about}
              onChange={set('about')}
              placeholder="Tell other developers about yourself..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <Input label="Location" value={form.location} onChange={set('location')} placeholder="City, Country" />
             <Input label="Experience (Years)" type="number" value={form.experienceYears} onChange={set('experienceYears')} placeholder="0" min="0" />
          </div>

          <Input label="Photo URL" value={form.photoUrl} onChange={set('photoUrl')} placeholder="https://..." />
          <Input label="GitHub URL" value={form.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/username" />
          
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="openToWork" 
              checked={form.openToWork} 
              onChange={(e) => setForm(f => ({ ...f, openToWork: e.target.checked }))}
              className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
            />
            <label htmlFor="openToWork" className="text-sm text-primary dark:text-gray-300 font-medium">Open to work</label>
          </div>

          <div>
            <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    form.skills.includes(s)
                      ? 'bg-accent text-white border-accent'
                      : 'border-border text-secondary hover:border-accent hover:text-accent'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 justify-center">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(false)}
              className="flex-1 justify-center"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </main>
  )
}
