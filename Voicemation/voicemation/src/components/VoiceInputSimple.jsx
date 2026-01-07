import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const VoiceInputSimple = ({ onResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [inDepthMode, setInDepthMode] = useState(false);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const textInputRef = useRef(null);

  // Expose focus method globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.focusVoiceInput = () => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.focusVoiceInput;
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setProcessingStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        setProcessingStatus('Processing audio...');
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        processAudio(audioBlob);
        
        // Stop all tracks to turn off microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setProcessingStatus('Recording...');
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setProcessingStatus('Microphone access denied');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const processAudio = async (audioBlob) => {
    try {
      setProcessingStatus('Generating animation...');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('inDepthMode', inDepthMode.toString());

      const response = await fetch(`${API_URL}/generate_audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);
      
      if (result.success && (result.video_url || result.videoUrl)) {
        setProcessingStatus('Animation ready!');
        
        // Clear status after delay
        setTimeout(() => {
          setProcessingStatus('');
          setRecordingDuration(0);
        }, 2000);
        
        if (onResult) {
          // For voice, pass result object so Dashboard knows not to make another API call
          onResult(result.prompt || result.text || 'Voice Input', inDepthMode, result);
        }
      } else {
        throw new Error(result.error || 'Failed to generate animation');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setProcessingStatus('Error occurred');
      setTimeout(() => {
        setProcessingStatus('');
        setRecordingDuration(0);
      }, 3000);
    }
  };

  const handleTextSubmit = async () => {
    if (!text.trim()) return;

    try {
      setIsSubmitting(true);
      setProcessingStatus('Generating animation...');

      if (onResult) {
        // Let Dashboard handle the API call with inDepthMode
        onResult(text.trim(), inDepthMode);
        setText('');
        
        // Reset status after a delay
        setTimeout(() => {
          setProcessingStatus('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting text:', error);
      setProcessingStatus('Error occurred');
      setTimeout(() => {
        setProcessingStatus('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="VoiceInputComponent space-y-4">
      {/* Status Indicator */}
      <AnimatePresence>
        {processingStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-400/40 rounded-full text-blue-200 text-sm backdrop-blur-sm font-medium" style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{
                boxShadow: '0 0 8px rgba(96, 165, 250, 0.6)'
              }}></div>
              <span>{processingStatus}</span>
              {isRecording && (
                <span className="text-blue-200 ml-2">
                  🔴 {formatTime(recordingDuration)}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recording Section */}
      <motion.div 
        className="backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: '#000000',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <h3 className="text-white font-semibold mb-4 text-center text-lg" style={{
          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #c084fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Record Your Voice</h3>
        
        {/* In Depth Mode Toggle */}
        <div className="flex items-center justify-center mb-5">
          <motion.button
            onClick={() => setInDepthMode(!inDepthMode)}
            className={`group relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 overflow-hidden ${
              inDepthMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl'
                : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 hover:from-gray-700 hover:to-gray-600'
            }`}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={inDepthMode ? {
              boxShadow: '0 10px 40px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            } : {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Background glow effect */}
            {inDepthMode && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-indigo-400/30 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            
            {/* Icon */}
            <motion.svg 
              className="w-5 h-5 relative z-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={inDepthMode ? { 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </motion.svg>
            
            {/* Text */}
            <span className="relative z-10 tracking-wide">
              {inDepthMode ? 'In-Depth Mode Active' : 'Enable In-Depth Mode'}
            </span>
            
            {/* Pulse indicator */}
            {inDepthMode && (
              <motion.div
                className="w-2.5 h-2.5 bg-white rounded-full relative z-10 shadow-lg"
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        </div>
        
        <div className="flex flex-col items-center space-y-4 relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              className="w-48 h-48 rounded-full blur-[100px]"
              style={{
                background: isRecording 
                  ? 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0) 70%)'
                  : 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0) 70%)'
              }}
              animate={{
                scale: isRecording ? [1, 1.2, 1] : [1, 1.1, 1],
                opacity: isRecording ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          {/* Main recording button */}
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSubmitting}
            className={`group relative w-20 h-20 rounded-full transition-all duration-300 flex items-center justify-center z-10 overflow-hidden ${
              isRecording
                ? 'bg-gradient-to-br from-red-600 to-pink-600 scale-110'
                : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'
            }`}
            whileHover={{ scale: isRecording ? 1.15 : 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={isRecording ? {
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.6), 0 0 80px rgba(239, 68, 68, 0.3), 0 10px 40px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            } : {
              boxShadow: '0 0 35px rgba(59, 130, 246, 0.5), 0 0 70px rgba(59, 130, 246, 0.25), 0 10px 40px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Ripple effect when recording */}
            {isRecording && (
              <>
                <motion.div
                  className="absolute inset-0 border-4 border-red-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1.5],
                    opacity: [0.8, 0, 0]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 border-4 border-red-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1.5],
                    opacity: [0.8, 0, 0]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.5
                  }}
                />
              </>
            )}
            
            {/* Shine effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Icon */}
            <motion.svg 
              className="w-8 h-8 text-white relative z-10 drop-shadow-lg" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              animate={isRecording ? {
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 0.5, repeat: isRecording ? Infinity : 0 }}
            >
              {isRecording ? (
                <path d="M6 6h12v12H6z" />
              ) : (
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0V9a1 1 0 0 1 2 0v2a5 5 0 0 0 10 0V9a1 1 0 0 1 2 0v2z" />
              )}
            </motion.svg>
          </motion.button>
          
          {/* Description text with better styling */}
          <motion.p 
            className="text-sm font-medium text-center"
            animate={{
              color: isRecording ? 'rgb(252, 165, 165)' : 'rgb(156, 163, 175)'
            }}
          >
            <span className="flex items-center gap-2 justify-center">
              {isRecording ? (
                <>
                  <motion.span
                    className="inline-block w-2 h-2 bg-red-500 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  Recording in progress...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Click to start voice recording
                </>
              )}
            </span>
          </motion.p>
        </div>
      </motion.div>

      {/* Text Input Section */}
      <motion.div 
        className="backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30 relative"
        style={{
          background: '#000000',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(79, 70, 229, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-white font-semibold mb-4 text-center text-lg" style={{
          background: 'linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #60a5fa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Or Type Your Message</h3>
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              ref={textInputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isSubmitting && handleTextSubmit()}
              placeholder="Enter your concept for animation..."
              className="w-full bg-gray-900/80 text-white px-5 py-4 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:bg-gray-900/90 transition-all backdrop-blur-sm border border-blue-500/30 placeholder-gray-400 font-medium text-base"
              disabled={isSubmitting || isRecording}
              style={{
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.1)'
              }}
            />
            {/* Character counter or icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
          <motion.button
            onClick={handleTextSubmit}
            disabled={!text.trim() || isSubmitting || isRecording}
            className="group relative px-8 py-4 rounded-xl transition-all font-bold text-white text-base overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: text.trim() && !isSubmitting && !isRecording ? 1.05 : 1, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={text.trim() && !isSubmitting && !isRecording ? {
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 10px 40px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            } : {
              background: 'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Animated shine effect on hover */}
            {text.trim() && !isSubmitting && !isRecording && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.6 }}
              />
            )}
            
            {/* Button content */}
            <span className="relative z-10 flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <motion.svg
                    className="w-5 h-5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </motion.svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Generate
                </>
              )}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceInputSimple;
