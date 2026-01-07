import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function LandingPage({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      {/* Navigation Bar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-blue-500/20' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center"
              style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Edumation
            </span>
          </motion.div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-white transition-colors">About</button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-white transition-colors">Contact</button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Edumation
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-medium">
              Your Education, Our Animations
            </p>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into beautiful mathematical animations. Speak your concept or type it below to get started with AI-powered educational visualizations.
            </p>
          </motion.div>

          {/* Demo Window */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12 max-w-2xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 backdrop-blur-xl bg-gray-900/50"
              style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.2)' }}>
              {/* macOS Window Header */}
              <div className="bg-gray-800/80 border-b border-gray-700/50 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-red-500"
                    whileHover={{ scale: 1.2, boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)' }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-yellow-500"
                    whileHover={{ scale: 1.2, boxShadow: '0 0 10px rgba(234, 179, 8, 0.6)' }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-green-500"
                    whileHover={{ scale: 1.2, boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)' }}
                  />
                </div>
                <div className="flex-1 text-center text-sm text-gray-400 font-medium">
                  Edumation Demo
                </div>
              </div>
              
              {/* Animation Demo Area */}
              <div className="bg-black aspect-video flex items-center justify-center p-8 relative overflow-hidden">
                {/* Subtle grid background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }} />
                </div>

                {/* Animated Shape - Line to Circle */}
                <svg width="300" height="200" viewBox="0 0 300 200" className="relative z-10">
                  <defs>
                    <linearGradient id="shapeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  
                  {/* Morphing shape from line to circle */}
                  <motion.path
                    d="M 50 100 L 250 100"
                    stroke="url(#shapeGradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    animate={{
                      d: [
                        "M 50 100 L 250 100",
                        "M 50 100 Q 150 50, 250 100",
                        "M 50 100 Q 150 50, 250 100 Q 250 150, 150 150 Q 50 150, 50 100",
                        "M 50 100 Q 50 50, 150 50 Q 250 50, 250 100 Q 250 150, 150 150 Q 50 150, 50 100",
                        "M 150 50 A 50 50 0 1 1 150 150 A 50 50 0 1 1 150 50",
                      ],
                      strokeWidth: [4, 4, 3, 3, 3],
                      fill: ["none", "none", "rgba(59, 130, 246, 0.1)", "rgba(99, 102, 241, 0.2)", "rgba(139, 92, 246, 0.3)"]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeInOut"
                    }}
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))'
                    }}
                  />
                  
                  {/* Particles/dots that follow the animation */}
                  {[0, 1, 2].map((i) => (
                    <motion.circle
                      key={i}
                      r="3"
                      fill="#60a5fa"
                      animate={{
                        cx: [50 + i * 100, 150, 150, 150, 150 + Math.cos(i * 2) * 50],
                        cy: [100, 75, 100, 100, 100 + Math.sin(i * 2) * 50],
                        opacity: [1, 0.6, 0.8, 1, 1],
                        scale: [1, 1.5, 1, 1, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut",
                        delay: i * 0.2
                      }}
                      style={{
                        filter: 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.8))'
                      }}
                    />
                  ))}
                </svg>

                {/* Label */}
                <motion.div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-blue-400 text-sm font-medium px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30"
                  animate={{
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Line → Circle Transformation
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={onGetStarted}
              className="group relative px-10 py-5 rounded-2xl text-lg font-bold text-white overflow-hidden"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4), 0 0 80px rgba(99, 102, 241, 0.3)'
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center gap-3">
                Get Started
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </motion.button>

            <motion.button
              onClick={() => scrollToSection('features')}
              className="px-10 py-5 rounded-2xl text-lg font-semibold text-white border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 transition-all"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Animated Icons */}
          <motion.div
            className="mt-16 mb-12 flex justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center relative z-20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              style={{ boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)' }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </motion.div>
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center relative z-20"
              whileHover={{ scale: 1.1, rotate: -5 }}
              style={{ boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)' }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="mt-16 flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <button onClick={() => scrollToSection('features')} className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <span className="text-sm">Scroll to explore</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to create stunning educational animations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
                title: 'Voice Input',
                description: 'Simply speak your concept and watch it come to life with AI-powered animation generation.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'In-Depth Mode',
                description: 'Get comprehensive multi-scene animations with detailed explanations and visual examples.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
                title: 'Visual Diagrams',
                description: 'Rich mathematical visualizations with shapes, graphs, and animated diagrams instead of text.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: 'Conversation History',
                description: 'Keep track of all your animation projects with organized conversation management.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Instant Preview',
                description: 'Watch your animations render in real-time with fullscreen playback options.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: 'AI-Powered',
                description: 'Leveraging GPT-4o and Manim to create professional educational content automatically.'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-blue-500/20 backdrop-blur-sm"
                style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-6"
                  style={{ boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              About Edumation
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Edumation is an innovative platform that bridges the gap between ideas and visual representation. 
              Using cutting-edge AI technology and the power of Manim (Mathematical Animation Engine), we transform 
              your spoken or written concepts into stunning educational animations.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed mb-12">
              Whether you're a student trying to understand complex topics, an educator creating teaching materials, 
              or anyone curious about visualizing mathematical and scientific concepts, Edumation makes it simple 
              and accessible.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { number: '1000+', label: 'Animations Created' },
                { number: '500+', label: 'Active Users' },
                { number: '50+', label: 'Topics Covered' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Have questions or feedback? We'd love to hear from you!
            </p>
            
            <div className="flex justify-center gap-6 mb-16">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                style={{ boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)' }}
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </motion.a>
              
              <motion.a
                href="mailto:contact@edumation.com"
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                style={{ boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)' }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.a>

              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                style={{ boxShadow: '0 10px 40px rgba(168, 85, 247, 0.4)' }}
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </motion.a>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-500 text-sm"
            >
              <p className="mb-4">© 2026 Edumation. All rights reserved.</p>
              <p>Made with ❤️ using React, Framer Motion, and Manim</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
