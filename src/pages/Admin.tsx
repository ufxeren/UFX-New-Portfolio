import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, Plus, Edit2, Trash2, Mail, Image as ImageIcon, Video, Layout, FileText, X } from 'lucide-react';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { getEmbedUrl, isVideoUrl } from '../utils';
import VideoPlayer from '../components/VideoPlayer';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  alert('An error occurred. Check console for details.');
}

const ALLOWED_ADMIN_EMAILS = ['ufxeren@gmail.com', 'faizaniqbal610@gmail.com'];

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'inquiries'>('projects');
  
  const [projects, setProjects] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', category: 'Thumbnails', imageUrl: '', date: new Date().toISOString().split('T')[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAdminUser(user?.email ? ALLOWED_ADMIN_EMAILS.includes(user.email) : false);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !isAdminUser) return;

    const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    const inquiriesQuery = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribeInquiries = onSnapshot(inquiriesQuery, (snapshot) => {
      const inquiriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInquiries(inquiriesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inquiries');
    });

    return () => {
      unsubscribeProjects();
      unsubscribeInquiries();
    };
  }, [isAuthReady, isAuthenticated]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. You must use the authorized admin email.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        createdAt: serverTimestamp()
      });
      setIsAddingProject(false);
      setNewProject({ title: '', category: 'Thumbnails', imageUrl: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
      }
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await deleteDoc(doc(db, 'inquiries', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `inquiries/${id}`);
      }
    }
  };

  if (!isAuthReady) {
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-surface p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tighter mb-2">Admin Access</h1>
            <p className="text-text-secondary text-sm">Sign in with Google to access the dashboard.</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-surface p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl text-center"
        >
          <h1 className="text-3xl font-bold tracking-tighter mb-4 text-red-500">Access Denied</h1>
          <p className="text-text-secondary mb-8">
            You are logged in as <span className="text-white">{auth.currentUser?.email}</span>, which is not authorized to access the admin dashboard.
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Logout & Try Another Account
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">Dashboard</h1>
            <p className="text-text-secondary">Manage your portfolio and client inquiries.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-white/10 rounded-lg text-text-secondary hover:text-white hover:border-white/30 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'projects' ? 'bg-white text-black' : 'text-text-secondary hover:text-white'
            }`}
          >
            <Layout size={18} /> Projects
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'inquiries' ? 'bg-white text-black' : 'text-text-secondary hover:text-white'
            }`}
          >
            <Mail size={18} /> Inquiries
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{inquiries.length}</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'projects' ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Project Manager</h2>
              <button
                onClick={() => setIsAddingProject(!isAddingProject)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {isAddingProject ? <X size={18} /> : <Plus size={18} />}
                {isAddingProject ? 'Cancel' : 'Add Project'}
              </button>
            </div>

            {/* Add Project Form */}
            {isAddingProject && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-bg-surface p-6 rounded-2xl border border-white/10"
              >
                <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-text-secondary uppercase">Title</label>
                    <input
                      type="text"
                      required
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-text-secondary uppercase">Category</label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="Thumbnails">Thumbnails</option>
                      <option value="Posters">Posters</option>
                      <option value="UI/UX">UI/UX</option>
                      <option value="Video">Video</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-text-secondary uppercase">Media URL (Image or Video)</label>
                    <input
                      type="url"
                      required
                      value={newProject.imageUrl}
                      onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-70">
                      {isSubmitting ? 'Saving...' : 'Save Project'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-bg-surface rounded-2xl border border-white/10 overflow-hidden group">
                  <div className="relative aspect-video">
                    {(() => {
                      const embedUrl = getEmbedUrl(project.imageUrl);
                      if (embedUrl) {
                        return (
                          <iframe
                            src={embedUrl}
                            className="w-full h-full object-cover"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      } else if (isVideoUrl(project.imageUrl, project.category)) {
                        return (
                          <VideoPlayer src={project.imageUrl} className="w-full h-full" />
                        );
                      } else {
                        return (
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                        );
                      }
                    })()}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 pointer-events-none">
                      <button className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md transition-colors pointer-events-auto">
                        <Edit2 size={20} className="text-white" />
                      </button>
                      <button onClick={() => handleDeleteProject(project.id)} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full backdrop-blur-md transition-colors pointer-events-auto">
                        <Trash2 size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg truncate pr-4">{project.title}</h3>
                      <span className="text-xs font-mono text-text-secondary bg-bg-primary px-2 py-1 rounded-md">{project.category}</span>
                    </div>
                    <p className="text-xs text-text-secondary">Added: {project.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Inquiry Inbox</h2>
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="bg-bg-surface p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-bg-primary rounded-full flex items-center justify-center border border-white/5">
                  <FileText className="text-text-secondary" />
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-2">
                    <h3 className="text-xl font-bold">{inquiry.name}</h3>
                    <span className="text-xs text-text-secondary font-mono">{inquiry.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-text-secondary">
                    <span className="flex items-center gap-1"><Mail size={14} /> {inquiry.email}</span>
                    <span className="flex items-center gap-1 uppercase tracking-wider"><Layout size={14} /> {inquiry.category}</span>
                  </div>
                  <div className="bg-bg-primary p-4 rounded-xl border border-white/5 text-sm">
                    <p>{inquiry.description}</p>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
                      Reply via Email
                    </button>
                    <button onClick={() => handleDeleteInquiry(inquiry.id)} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

