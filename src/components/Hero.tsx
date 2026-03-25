import { motion } from 'motion/react';

export default function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-500 rounded-full mix-blend-overlay filter blur-[128px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="glitch-wrapper text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase">
            <h1 className="glitch" data-text="UFX AMAN">UFX AMAN</h1>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto mb-10 font-medium"
        >
          High-Click-Rate Thumbnails. Cinematic Posters. Intuitive UI/UX.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={scrollToContact}
            className="px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
          >
            Request a Quote
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('portfolio');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-transparent border border-white/20 text-white text-lg font-bold rounded-full hover:bg-white/5 transition-all"
          >
            View Work
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-text-secondary uppercase tracking-widest font-mono">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-text-secondary to-transparent"></div>
      </motion.div>
    </section>
  );
}
