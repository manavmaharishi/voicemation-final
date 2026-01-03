import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceInputSimple from '../components/VoiceInputSimple';
import AnimationPlayer from '../components/AnimationPlayer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Dashboard({ activeConversation, conversations, onUpdateMessages, onUpdateTitle }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAnimationModal, setShowAnimationModal] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const modalRef = useRef(null);

  // Get current conversation and its messages
  const currentConversation = conversations.find(conv => conv.id === activeConversation);
  const messages = currentConversation?.messages || [];
  
  // Add CSS for highlight animation effect
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes highlight-pulse {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        30% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        70% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3); }
        100% { box-shadow: 0 0 0 5px rgba(59, 130, 246, 0); }
      }
      
      @keyframes subtle-glow {
        0% { background-color: rgba(59, 130, 246, 0); }
        50% { background-color: rgba(59, 130, 246, 0.1); }
        100% { background-color: rgba(59, 130, 246, 0); }
      }
      
      .highlight-animation {
        animation: highlight-pulse 1.5s ease-out 1;
        border-color: rgba(59, 130, 246, 0.8) !important;
        border-width: 2px !important;
        position: relative;
        z-index: 1;
      }
      
      .pulse-effect {
        animation: subtle-glow 1.5s ease-out 1;
        pointer-events: none;
        z-index: -1;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleVoiceResult = async (text, inDepthMode = false, apiResult = null) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    const updatedMessages = [...messages, userMessage];
    onUpdateMessages(activeConversation, updatedMessages);
    
    // Update conversation title if it's the first message
    if (messages.length === 0) {
      const title = text.length > 30 ? text.substring(0, 30) + '...' : text;
      onUpdateTitle(activeConversation, title);
    }
    
    // If apiResult is provided, the API was already called (voice recording case)
    if (apiResult) {
      try {
        if (apiResult.success && (apiResult.video_url || apiResult.videoUrl)) {
          const videoUrl = apiResult.video_url || apiResult.videoUrl;
          const animationData = {
            id: Date.now() + 1,
            text,
            videoUrl: `${API_URL}${videoUrl}`,
            timestamp: new Date()
          };
          
          const assistantMessage = {
            id: animationData.id,
            type: 'assistant',
            content: `I've created an educational animation based on your concept: "${text}"`,
            animationId: animationData.id,
            videoUrl: animationData.videoUrl,
            timestamp: animationData.timestamp
          };
          
          const finalMessages = [...updatedMessages, assistantMessage];
          onUpdateMessages(activeConversation, finalMessages);
          setCurrentAnimation(animationData);
          
          // Store animation in a lookup for inline display
          if (typeof window !== 'undefined') {
            if (!window.animationsLookup) window.animationsLookup = {};
            window.animationsLookup[animationData.id] = animationData;
          }
        }
      } catch (error) {
        console.error('Error processing voice result:', error);
      }
      setIsGenerating(false);
      return;
    }
    
    setIsGenerating(true);

    try {
      // Call the real Flask backend (text input case)
      const response = await fetch(`${API_URL}/generate_audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text, inDepthMode: inDepthMode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Dashboard API Response:", result);
      
      if (result.success && (result.video_url || result.videoUrl)) {
        const videoUrl = result.video_url || result.videoUrl;
        const animationData = {
          id: Date.now() + 1,
          text,
          videoUrl: `${API_URL}${videoUrl}`,
          timestamp: new Date()
        };
        
        const assistantMessage = {
          id: animationData.id,
          type: 'assistant',
          content: `I've created an educational animation based on your concept: "${text}"`,
          animationId: animationData.id,
          videoUrl: animationData.videoUrl,
          timestamp: animationData.timestamp
        };
        
        const finalMessages = [...updatedMessages, assistantMessage];
        onUpdateMessages(activeConversation, finalMessages);
        setCurrentAnimation(animationData);
        
        // Store animation in a lookup for inline display
        if (typeof window !== 'undefined') {
          if (!window.animationsLookup) window.animationsLookup = {};
          window.animationsLookup[animationData.id] = animationData;
        }
      } else {
        // Handle error case
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `I couldn't create that animation. Error: ${result.error || 'Unknown error'}`,
          timestamp: new Date()
        };
        const finalMessages = [...updatedMessages, errorMessage];
        onUpdateMessages(activeConversation, finalMessages);
      }
      setIsGenerating(false);
    } catch (error) {
      console.error('Error calling backend:', error);
      // Add error message for unexpected errors
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `I couldn't create that animation. Network error: ${error.message}`,
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      onUpdateMessages(activeConversation, finalMessages);
      setIsGenerating(false);
    }
  };

  // Handler to highlight animation in chat after returning from fullscreen
  const highlightAnimation = (animationId) => {
    if (!animationId) return;
    
    // Find the message container with this animation ID
    setTimeout(() => {
      const messageElement = document.querySelector(`[data-animation-id="${animationId}"]`);
      if (messageElement) {
        // Scroll to the message
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight class for animation effect
        messageElement.classList.add('highlight-animation');
        
        // Create and add a pulse element
        const pulseElement = document.createElement('div');
        pulseElement.className = 'absolute inset-0 rounded-2xl pulse-effect';
        messageElement.appendChild(pulseElement);
        
        // Remove highlight and pulse after animation
        setTimeout(() => {
          messageElement.classList.remove('highlight-animation');
          if (messageElement.contains(pulseElement)) {
            messageElement.removeChild(pulseElement);
          }
        }, 2000);
      }
    }, 300);
  };

  const closeModal = () => {
    // When closing the modal, highlight the associated chat message
    if (currentAnimation) {
      highlightAnimation(currentAnimation.id);
    }
    setShowAnimationModal(false);
  };
  
  // Handler to clear the current animation
  const handleClearAnimation = () => {
    setCurrentAnimation(null);
  };

  const handleReturnToChat = () => {
    // Return to chat from either fullscreen or inline animation player
    // Clear the current animation state
    setCurrentAnimation(null);
    
    // Close the modal if it's open
    if (showAnimationModal) {
      closeModal();
    }
    
    // Focus the input field
    if (typeof window !== 'undefined' && window.focusVoiceInput) {
      window.focusVoiceInput();
    }
  };

  const handleAnimationError = () => {
    // If an error occurs in fullscreen mode, we should provide a way back to chat
    // This is handled by the "Return to Chat" button in the AnimationPlayer's fullscreen error UI
    // We don't need to close the modal here as that's handled by the button itself
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && showAnimationModal) {
        closeModal();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAnimationModal]);

  const handleDownloadAnimation = () => {
    if (!currentAnimation || !currentAnimation.videoUrl) return;
    
    const a = document.createElement('a');
    a.href = currentAnimation.videoUrl;
    a.download = `animation-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Handle animation sharing
  const handleShareAnimation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this animation',
        text: `Animation: "${currentAnimation?.text}"`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
        navigator.clipboard.writeText(window.location.href)
          .then(() => {
            alert('Link copied to clipboard!');
          });
      });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Link copied to clipboard!');
        });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.9,
      transition: { 
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  // Expose a window method to open animation fullscreen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openAnimationFullscreen = (animation) => {
        setCurrentAnimation(animation);
        setShowAnimationModal(true);
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.openAnimationFullscreen;
      }
    };
  }, []);

  return (
    <motion.div 
      className="flex-1 flex flex-col h-full text-gray-100"
      style={{ backgroundColor: '#000000' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header removed */}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            // Empty state - minimal welcome
            <motion.div 
              className="h-full flex flex-col items-center justify-center p-6 text-center"
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-2xl relative">
                {/* Large radial glow behind title */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] -z-10"></div>
                
                {/* Main Welcome Title */}
                <motion.h1 
                  className="text-5xl md:text-6xl font-bold mb-4 relative"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 30%, #a855f7 60%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.2))'
                  }}
                >
                  Welcome to Voicemation
                </motion.h1>
                
                {/* Motto with background glow */}
                <div className="relative mb-8">
                  {/* Purple radial glow on background behind tagline - subtle spotlight effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] pointer-events-none" style={{
                    background: 'radial-gradient(ellipse, rgba(168, 85, 247, 0.25) 0%, rgba(139, 92, 246, 0.15) 40%, rgba(124, 58, 237, 0.08) 60%, transparent 80%)',
                    filter: 'blur(60px)'
                  }}></div>
                  
                  <motion.p 
                    className="text-xl md:text-2xl text-gray-300 font-medium relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
                  >
                    Your Voice, Our Animations
                  </motion.p>
                </div>
                
                {/* Decorative Icons */}
                <motion.div 
                  className="flex items-center justify-center gap-6 mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                >
                  {/* Voice Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center relative" style={{
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.25)'
                  }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  
                  {/* Arrow */}
                  <motion.svg 
                    className="w-8 h-8 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                  
                  {/* Animation Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center relative" style={{
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(168, 85, 247, 0.25)'
                  }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v10a2 2 0 002 2h6a2 2 0 002-2V7M7 7h10M9 12h6m-6 4h6" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </div>
                </motion.div>
                
                {/* Description */}
                <motion.p 
                  className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  Transform your ideas into beautiful mathematical animations. 
                  Speak your concept or type it below to get started.
                </motion.p>
                
                {/* Get Started Hint */}
                <motion.div 
                  className="flex items-center justify-center gap-2 text-blue-300/80 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                  </svg>
                  Start by using the voice or text input below
                </motion.div>
              </div>
            </motion.div>
          ) : (
            // Chat Messages
            <motion.div 
              className="p-4 space-y-6"
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div 
                    key={message.id} 
                    className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : ''}`}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    {message.type === 'assistant' && (
                      <motion.div 
                        className="w-8 h-8 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                        style={{
                          boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
                        }}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </motion.div>
                    )}
                    <div className={`max-w-2xl ${message.type === 'user' ? 'order-first' : ''}`}>
                      <motion.div 
                        className={`rounded-2xl p-4 relative ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white ml-auto' 
                            : 'bg-gradient-to-br from-gray-800/70 to-gray-900/80 text-gray-100 backdrop-blur-xl border border-blue-500/20'
                        } ${message.animationId ? 'animation-message' : ''}`}
                        data-animation-id={message.animationId || null}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 30, 
                          delay: 0.1 
                        }}
                        whileHover={{ 
                          scale: 1.01
                        }}
                        style={message.type === 'user' ? {
                          boxShadow: '0 0 25px rgba(37, 99, 235, 0.3), 0 4px 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        } : {
                          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        {message.animationId && (
                          <motion.div 
                            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          />
                        )}
                          
                        <motion.p 
                          className="whitespace-pre-wrap text-sm md:text-base"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {message.content}
                        </motion.p>
                        
                        {message.type === 'assistant' && message.animationId && (
                          <motion.div
                            className="mt-3"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            {/* Static Video Thumbnail */}
                            <div className="bg-black rounded-lg overflow-hidden mb-3 relative cursor-pointer group"
                                 onClick={() => {
                                   const animation = {
                                     id: message.animationId,
                                     text: message.content.replace(/I've created an educational animation based on your concept: "/, '').replace(/"$/, ''),
                                     videoUrl: message.videoUrl,
                                     timestamp: message.timestamp
                                   };
                                   setCurrentAnimation(animation);
                                   setShowAnimationModal(true);
                                 }}>
                              <video 
                                className="w-full h-32 object-contain"
                                controls={false}
                                muted
                                playsInline
                                preload="metadata"
                                src={(() => {
                                  const animation = window.animationsLookup && window.animationsLookup[message.animationId];
                                  console.log('Looking for animation:', message.animationId, 'found:', animation);
                                  return animation ? animation.videoUrl : undefined;
                                })()}
                                onError={(e) => console.error('Video error:', e)}
                                onLoadStart={() => console.log('Video loading started')}
                                onLoadedData={() => console.log('Video loaded successfully')}
                              />
                              {/* Play button overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            
                            {/* Play Fullscreen Button */}
                            <div className="flex justify-end">
                              <motion.button
                                className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-200 text-sm flex items-center gap-2 backdrop-blur-sm border border-blue-500/20"
                                onClick={() => {
                                  const animation = {
                                    id: message.animationId,
                                    text: message.content.replace(/I've created an educational animation based on your concept: "/, '').replace(/"$/, ''),
                                    videoUrl: message.videoUrl,
                                    timestamp: message.timestamp
                                  };
                                  console.log('Setting animation for fullscreen:', animation);
                                  console.log('Message videoUrl:', message.videoUrl);
                                  console.log('Animation videoUrl:', animation.videoUrl);
                                  setCurrentAnimation(animation);
                                  setShowAnimationModal(true);
                                }}
                                whileHover={{ 
                                  scale: 1.05, 
                                  y: -3,
                                  boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.3)"
                                }}
                                whileTap={{ 
                                  scale: 0.95,
                                  y: 0,
                                  boxShadow: "0 5px 15px -3px rgba(0, 0, 0, 0.2)"
                                }}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                </svg>
                                Play Fullscreen
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                      
                      <motion.div 
                        className={`text-xs text-blue-300/60 mt-1.5 flex items-center ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </motion.div>
                    </div>
                    {message.type === 'user' && (
                      <motion.div 
                        className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <AnimatePresence>
                {isGenerating && (
                  <motion.div 
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >                      
                    <motion.div 
                      className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </motion.div>
                    <div className="max-w-2xl">
                      <motion.div 
                        className="bg-gray-800 rounded-2xl p-2"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >                          
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <motion.div 
                              className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div 
                              className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                            />
                            <motion.div 
                              className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                          </div>
                          <span className="text-gray-300 text-xs">Creating animation...</span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Minimal Voice Input Area */}
      <motion.div 
        className="py-3 px-4 sm:px-6"
        style={{
          background: "#000000",
          borderTop: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow: "0 -4px 16px rgba(15, 23, 42, 0.3)"
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="max-w-2xl mx-auto">
          <VoiceInputSimple 
            onResult={handleVoiceResult} 
          />
        </div>
      </motion.div>

      {/* True Fullscreen Animation Modal */}
      <AnimatePresence>
        {showAnimationModal && currentAnimation && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.98) 100%)'
            }}
          >
            <motion.div
              ref={modalRef}
              className="w-full h-full flex flex-col overflow-hidden animation-container"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* We now use the enhanced AnimationPlayer with fullscreen controls */}
              <div className="flex-1 animation-content">
                {console.log('Rendering AnimationPlayer with videoUrl:', currentAnimation?.videoUrl)}
                <AnimationPlayer 
                  videoUrl={currentAnimation.videoUrl} 
                  isFullscreenMode={true}
                  onToggleFullscreen={closeModal}
                  onDownload={handleDownloadAnimation}
                  onShare={handleShareAnimation}
                  onReturnToChat={handleReturnToChat}
                />
              </div>

              {/* Minimal close button at top right */}
              <motion.button
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-gradient-to-r hover:from-red-600/80 hover:to-red-500/80 text-gray-300 hover:text-white z-[60] border border-white/10 backdrop-blur-sm"
                onClick={closeModal}
                whileHover={{ 
                  scale: 1.1
                }}
                whileTap={{ 
                  scale: 0.9
                }}
                title="Return to Chat"
                style={{
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              
              {/* Animation title overlay with back button */}
              <div className="absolute top-0 left-0 right-0 py-4 px-5 bg-gradient-to-b from-black/70 to-transparent z-50 flex items-center">
                <motion.button 
                  className="mr-4 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white/100 flex items-center justify-center border border-white/10 backdrop-blur-sm shadow-lg"
                  onClick={closeModal}
                  whileHover={{ 
                    scale: 1.1, 
                    x: -3,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)"
                  }}
                  whileTap={{ 
                    scale: 0.9, 
                    x: 0,
                    boxShadow: "0 5px 15px -3px rgba(0, 0, 0, 0.3)"
                  }}
                  title="Return to Chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <h3 className="text-base font-medium text-white/90 truncate max-w-lg">"{currentAnimation.text}"</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
