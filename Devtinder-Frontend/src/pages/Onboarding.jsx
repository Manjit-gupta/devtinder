import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import Input from '../components/Input'
import Button from '../components/Button'

const SKILLS_OPTIONS = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Go', 'Rust', 'Java', 'CSS', 'Docker', 'GraphQL', 'MongoDB']

export default function Onboarding() {
  const { user, fetchMe } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    photoUrl: user?.photoUrl === '👦' ? '' : user?.photoUrl || '',
    bio: user?.bio === ' Hey there! I\'m using DevTinder.' ? '' : user?.bio || user?.about || '',
    location: user?.location || '',
    experienceYears: user?.experienceYears || '',
    githubUrl: user?.githubUrl || '',
    skills: user?.skills || [],
    openToWork: user?.openToWork || false
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }))
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      await handleComplete()
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await api.patch('/profile/edit', {
        photoUrl: form.photoUrl || undefined,
        bio: form.bio || undefined,
        location: form.location || undefined,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        githubUrl: form.githubUrl || undefined,
        skills: form.skills,
        openToWork: form.openToWork
      })
      await fetchMe()
      addToast('Profile setup complete!', 'success')
      navigate('/feed')
    } catch (err) {
      addToast(err.displayMessage || 'Error saving profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const skip = async () => {
    navigate('/feed')
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-10 px-4 bg-gray-50 dark:bg-primary">
      <div className="w-full max-w-lg card shadow-sm">
        {/* Stepper Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`w-1/3 h-2 mx-1 rounded-full ${step >= i ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>
          <h1 className="text-2xl font-bold font-primary dark:text-white text-center mt-4">
            {step === 1 && "Complete your profile"}
            {step === 2 && "What are your skills?"}
            {step === 3 && "Professional Details"}
          </h1>
          <p className="text-secondary dark:text-gray-400 text-center text-sm mt-1">
            {step === 1 && "Add a photo and a brief bio so people know it's you."}
            {step === 2 && "Select your technical stack to find better matches."}
            {step === 3 && "Link your GitHub and set your experience level."}
          </p>
        </div>

        {/* Form Body */}
        <div className="min-h-[250px]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-800" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">👦</div>
                )}
              </div>
              <Input label="Photo URL" value={form.photoUrl} onChange={set('photoUrl')} placeholder="https://..." />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wide">Bio</label>
                <textarea
                  className="input-field resize-none bg-white dark:bg-[#1f1f1f]"
                  rows={3}
                  value={form.bio}
                  onChange={set('bio')}
                  placeholder="I am a passionate developer building..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
               <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-3">Select your stack</p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        form.skills.includes(s)
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'border-border dark:border-gray-700 text-secondary dark:text-gray-400 hover:border-accent hover:text-accent'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Input label="GitHub URL" value={form.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/username" />
              <Input label="Location" value={form.location} onChange={set('location')} placeholder="Remote, New York, etc." />
              <Input label="Experience (Years)" type="number" value={form.experienceYears} onChange={set('experienceYears')} placeholder="0" min="0" />
              
              <div className="flex items-center gap-2 mt-4 p-3 border border-border dark:border-gray-700 rounded-lg">
                <input 
                  type="checkbox" 
                  id="openToWork" 
                  checked={form.openToWork} 
                  onChange={(e) => setForm(f => ({ ...f, openToWork: e.target.checked }))}
                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                />
                <label htmlFor="openToWork" className="text-sm font-medium dark:text-gray-200">I am open to new opportunities</label>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border dark:border-gray-800">
          <button 
            onClick={skip}
            className="text-sm font-medium text-secondary hover:text-primary dark:hover:text-white"
          >
            Skip for now
          </button>
          
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={loading}>
              {loading ? 'Saving...' : (step === 3 ? 'Complete Setup' : 'Continue')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
