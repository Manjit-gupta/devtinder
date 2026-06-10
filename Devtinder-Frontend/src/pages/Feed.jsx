import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import Button from '../components/Button'
import SkeletonCard from '../components/SkeletonCard'

export default function Feed() {
  const [users, setUsers] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ skills: '', location: '', openToWork: false })

  const { addToast } = useToast()

  const fetchFeed = useCallback(async (p = 1, currentFilters = filters) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: p,
        limit: 10,
        ...(currentFilters.skills && { skills: currentFilters.skills }),
        ...(currentFilters.location && { location: currentFilters.location }),
        ...(currentFilters.openToWork && { openToWork: currentFilters.openToWork })
      }).toString();

      const res = await api.get(`/feed?${queryParams}`)
      const data = res.data?.data || res.data || []
      if (data.length === 0) {
        setHasMore(false)
      } else {
        setUsers((prev) => (p === 1 ? data : [...prev, ...data]))
      }
    } catch (err) {
      addToast(err.displayMessage, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast]) // Removed filters dependency from useCallback to avoid infinite loops when not intended

  useEffect(() => {
    fetchFeed(1, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    setIndex(0);
    setPage(1);
    setHasMore(true);
    setUsers([]);
    fetchFeed(1, filters);
  };

  const handleAction = async (status) => {
    if (actionLoading) return;
    const current = users[index]
    if (!current) return
    setActionLoading(true)
    try {
      await api.post(`/request/send/${status}/${current._id}`)
      addToast(status === 'Interested' ? 'Request sent!' : 'Skipped', status === 'Interested' ? 'success' : 'info')
      // load next page if near the end
      if (index + 1 >= users.length - 2 && hasMore) {
        await fetchFeed(page + 1)
        setPage((p) => p + 1)
      }
      setIndex((i) => i + 1)
    } catch (err) {
      addToast(err.displayMessage, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      handleAction('Interested');
    } else if (info.offset.x < -swipeThreshold) {
      handleAction('Ignore');
    }
  };

  const current = users[index]
  const nextUser = users[index + 1]

  if (loading && users.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        <SkeletonCard />
      </main>
    )
  }

  if (!current) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 text-center flex items-center justify-center min-h-[60vh]">
        <div className="card max-w-sm w-full mx-auto shadow-sm">
          <p className="text-5xl mb-4">👋</p>
          <p className="text-primary dark:text-white font-medium text-lg">No more profiles</p>
          <p className="text-secondary dark:text-gray-400 text-sm mt-1 mb-6">Check back later for new developers</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => { setIndex(0); setPage(1); setHasMore(true); fetchFeed(1) }}
          >
            Refresh Feed
          </Button>
        </div>
      </main>
    )
  }

  const renderCard = (userProfile, isTop) => {
    const name = `${userProfile.firstName} ${userProfile.lastName}`
    const initials = `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`
    
    return (
      <div className="card max-w-lg mx-auto space-y-6 h-[650px] shadow-2xl flex flex-col justify-between bg-white dark:bg-[#1f1f1f] border border-border dark:border-gray-800">
        <div>
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 mt-4">
            {userProfile.photoUrl ? (
              <img
                src={userProfile.photoUrl}
                alt={name}
                className="w-48 h-48 rounded-full object-cover border-[6px] border-gray-100 dark:border-gray-800 shadow-md"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-gray-100 dark:bg-gray-800 border-[6px] border-white dark:border-[#1f1f1f] shadow-md flex items-center justify-center text-6xl font-bold text-secondary">
                {initials}
              </div>
            )}
            <div className="text-center mt-3">
              <h2 className="text-4xl font-black text-primary dark:text-white capitalize tracking-tight">{name}</h2>
              {userProfile.age && userProfile.gender && (
                <p className="text-sm text-secondary dark:text-gray-400">{userProfile.age} · {userProfile.gender}</p>
              )}
            </div>
          </div>

          {/* Skills */}
          {userProfile.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2.5 justify-center mt-8 px-6">
              {userProfile.skills.slice(0, 5).map((s) => (
                <span key={s} className="px-4 py-2 text-base font-semibold border border-border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-secondary dark:text-gray-300 shadow-sm">
                  {s}
                </span>
              ))}
              {userProfile.skills.length > 5 && (
                <span className="px-2.5 py-1 text-xs font-medium border border-border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-secondary dark:text-gray-300">
                  +{userProfile.skills.length - 5}
                </span>
              )}
            </div>
          )}

          {/* About */}
          {(userProfile.about || userProfile.bio) && (
            <p className="text-lg text-secondary dark:text-gray-400 text-center leading-relaxed mt-8 px-6 line-clamp-4">
              {userProfile.about || userProfile.bio}
            </p>
          )}
        </div>

        {/* Actions (Only on top card) */}
        {isTop && (
          <div className="flex gap-4 justify-center items-center pb-4 pt-4 border-t border-border dark:border-gray-800">
            <button
              onClick={() => handleAction('Ignore')}
              disabled={actionLoading}
              className="w-20 h-20 rounded-full border-2 border-danger text-danger flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
              aria-label="Pass"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <button
              onClick={() => handleAction('Interested')}
              disabled={actionLoading}
              className="w-20 h-20 rounded-full border-2 border-emerald-500 text-emerald-500 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-50"
              aria-label="Interested"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 relative h-[850px] flex items-center justify-center overflow-hidden touch-none">
      
      {/* Visual background instructions */}
      <div className="absolute top-8 w-full flex justify-between text-xl font-bold text-gray-300 dark:text-gray-700 px-12 uppercase tracking-widest pointer-events-none">
        <span>Pass</span>
        <span>Swipe</span>
        <span>Match</span>
      </div>

      <div className="relative w-full max-w-lg h-[650px]">
        <AnimatePresence>
          {/* Card beneath the active one */}
          {nextUser && (
            <motion.div
              key={nextUser._id}
              initial={{ scale: 0.95, opacity: 0.5, y: 10 }}
              animate={{ scale: 0.95, opacity: 0.5, y: 10 }}
              className="absolute w-full h-full pointer-events-none"
            >
              {renderCard(nextUser, false)}
            </motion.div>
          )}
          
          {/* Active Card */}
          {current && (
            <motion.div
              key={current._id + index}
              initial={{ scale: 1, y: 0, opacity: 1 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
              className="absolute w-full h-full z-10 cursor-grab"
            >
              {renderCard(current, true)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters Toggle Button (Bottom fixed) */}
      <div className="fixed bottom-6 w-full max-w-2xl mx-auto px-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="bg-primary text-white dark:bg-white dark:text-primary px-6 py-2.5 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 pointer-events-auto hover:scale-105 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          {showFilters ? 'Hide Filters' : 'Filters'}
        </button>
      </div>

      {/* Filters Modal / Overlay */}
      {showFilters && (
        <div className="absolute inset-0 bg-white/90 dark:bg-[#1a1a1a]/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-4 touch-auto">
           <form onSubmit={applyFilters} className="w-full max-w-sm card shadow-2xl relative">
             <button type="button" onClick={() => setShowFilters(false)} className="absolute top-4 right-4 text-secondary hover:text-primary dark:hover:text-white">
                ✕
             </button>
             <h2 className="text-xl font-bold text-primary dark:text-white mb-6">Filter Developers</h2>
             
             <div className="space-y-4">
               <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-secondary uppercase tracking-wide">Skills (comma separated)</label>
                  <input className="input-field bg-white dark:bg-[#1f1f1f]" placeholder="React, Python..." value={filters.skills} onChange={e => setFilters({...filters, skills: e.target.value})} />
               </div>
               
               <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-secondary uppercase tracking-wide">Location</label>
                  <input className="input-field bg-white dark:bg-[#1f1f1f]" placeholder="Remote, India, NY..." value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} />
               </div>

               <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border dark:border-gray-700">
                  <input 
                    type="checkbox" 
                    id="filterOpenToWork" 
                    checked={filters.openToWork} 
                    onChange={e => setFilters({...filters, openToWork: e.target.checked})}
                    className="w-4 h-4 text-accent"
                  />
                  <label htmlFor="filterOpenToWork" className="text-sm font-medium dark:text-gray-200 text-primary">Only Open to Work</label>
               </div>
               
               <Button type="submit" className="w-full mt-4">Apply Filters</Button>
               
               <button 
                 type="button" 
                 onClick={() => {
                   setFilters({ skills: '', location: '', openToWork: false });
                   setTimeout(() => applyFilters(), 0);
                 }}
                 className="w-full text-center text-sm text-secondary hover:text-primary dark:hover:text-white mt-2"
               >
                 Clear Filters
               </button>
             </div>
           </form>
        </div>
      )}

    </main>
  )
}
