import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Send, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const category = (form.elements.namedItem('category') as HTMLSelectElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

    try {
      await addDoc(collection(db, 'inquiries'), {
        name,
        email,
        category,
        description,
        ...(fileName ? { fileName } : {}),
        date: new Date().toISOString().split('T')[0],
        status: 'unread',
        createdAt: serverTimestamp()
      });
      
      setIsSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFileName(null);
        form.reset();
      }, 3000);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("There was an error submitting your inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <section id="contact" className="py-24 bg-bg-primary relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Let's Work Together</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Ready to elevate your brand? Fill out the form below and I'll get back to you within 24 hours.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-bg-surface p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl"
        >
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <CheckCircle2 size={64} className="text-green-500 mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
              <p className="text-text-secondary">I'll be in touch with you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full bg-bg-primary border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full bg-bg-primary border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                  Project Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    required
                    defaultValue=""
                    className="w-full bg-bg-primary border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-white/30 transition-colors"
                  >
                    <option value="" disabled>Select a category...</option>
                    <option value="thumbnail">YouTube Thumbnail</option>
                    <option value="poster">Cinematic Poster</option>
                    <option value="uiux">UI/UX Design</option>
                    <option value="video">Video Editing</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                  Project Details
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  className="w-full bg-bg-primary border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
                  placeholder="Tell me about your vision, timeline, and budget..."
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                  Attachments (Optional)
                </label>
                <div className="relative border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-white/30 transition-colors text-center cursor-pointer group">
                  <input
                    type="file"
                    id="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload size={24} className="text-text-secondary group-hover:text-white transition-colors" />
                    <span className="text-sm text-text-secondary group-hover:text-white transition-colors">
                      {fileName ? fileName : 'Click or drag files to upload briefs/references'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black font-bold text-lg rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Send Request <Send size={20} />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
