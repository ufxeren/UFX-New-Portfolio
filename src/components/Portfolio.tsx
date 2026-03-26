import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ChevronDown, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';

type Category = 'All' | 'Thumbnails' | 'Posters' | 'UI/UX' | 'Video';

interface Project {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  videoUrl?: string;
  createdAt?: any;
}

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<Category>('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [displayLimit, setDisplayLimit] = useState(24);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Reset limit when category changes
    setDisplayLimit(24);
  }, [activeTab]);

  useEffect(() => {
    let q;
    if (activeTab === 'All') {
      q = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc'),
        limit(displayLimit + 1) // Fetch one extra to check if there's more
      );
    } else {
      q = query(
        collection(db, 'projects'),
        where('category', '==', activeTab),
        orderBy('createdAt', 'desc'),
        limit(displayLimit + 1)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      if (projectsData.length > displayLimit) {
        setHasMore(true);
        setProjects(projectsData.slice(0, displayLimit));
      } else {
        setHasMore(false);
        setProjects(projectsData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setIsLoading(false);
      // If index is missing, fallback to fetching all and filtering in memory
      if (error.code === 'failed-precondition') {
        console.warn("Firestore index required for this query. Falling back to client-side filtering.");
        const fallbackQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        onSnapshot(fallbackQuery, (fallbackSnapshot) => {
          const allData = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
          const filtered = activeTab === 'All' ? allData : allData.filter(p => p.category === activeTab);
          setProjects(filtered.slice(0, displayLimit));
          setHasMore(filtered.length > displayLimit);
        });
      }
    });

    return () => unsubscribe();
  }, [activeTab, displayLimit]);

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 24);
  };

  const categories: Category[] = ['All', 'Thumbnails', 'Posters', 'UI/UX', 'Video'];

  return (
    <section id="portfolio" className="py-24 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Selected Work</h2>
            <p className="text-text-secondary max-w-xl">
              A curated collection of high-impact visuals designed to capture attention and drive engagement.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === category
                    ? 'bg-white text-black'
                    : 'bg-bg-surface text-text-secondary hover:bg-white/10 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        {isLoading && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-white/20" size={40} />
            <p className="text-text-secondary animate-pulse">Loading gallery...</p>
          </div>
        ) : (
          <>
            <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              <AnimatePresence mode="popLayout">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer bg-bg-surface"
                    onMouseEnter={() => setHoveredId(project.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative w-full overflow-hidden">
                      {project.category === 'Video' || project.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={project.imageUrl}
                          className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                        />
                      ) : (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      
                      {/* Overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 transition-all duration-500 pointer-events-none ${
                          hoveredId === project.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-white/60 uppercase tracking-[0.2em] mb-2">
                          {project.category}
                        </span>
                        <h3 className="text-xl font-bold text-white leading-tight">{project.title}</h3>
                        
                        {project.category === 'Video' && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
                            <Play className="text-white fill-white ml-1" size={20} />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-20 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="group relative px-8 py-4 bg-bg-surface border border-white/10 rounded-full overflow-hidden transition-all hover:border-white/30 hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-3 text-sm font-bold tracking-widest uppercase">
                    Load More Work
                    <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
                  </span>
                </button>
              </div>
            )}

            {!hasMore && projects.length > 0 && (
              <div className="mt-20 text-center">
                <p className="text-text-secondary text-sm font-mono uppercase tracking-widest opacity-40">
                  End of Gallery
                </p>
              </div>
            )}
            
            {!isLoading && projects.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-text-secondary">No projects found in this category.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
