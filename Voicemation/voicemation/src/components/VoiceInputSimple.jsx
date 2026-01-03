import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="flex items-center justify-center mb-4">
          <motion.button
            onClick={() => setInDepthMode(!inDepthMode)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              inDepthMode
                ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/40 border-2 border-purple-400/60 text-purple-100'
                : 'bg-gray-700/60 border border-gray-500/50 text-gray-300 hover:bg-gray-600/60 hover:border-gray-400/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={inDepthMode ? {
              boxShadow: '0 0 25px rgba(168, 85, 247, 0.3), 0 0 50px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            } : {}}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {inDepthMode ? 'In Depth Mode ON' : 'In Depth Mode'}
            {inDepthMode && (
              <motion.div
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        </div>
        
        <div className="flex flex-col items-center space-y-3 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 bg-blue-500/20 rounded-full blur-[80px]" style={{
              animation: 'pulse 3s ease-in-out infinite'
            }}></div>
          </div>
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSubmitting}
            className={`w-16 h-16 rounded-full border-4 transition-all duration-200 flex items-center justify-center relative z-10 ${
              isRecording
                ? 'bg-gradient-to-br from-red-500/30 to-pink-500/30 border-red-400 text-red-300 scale-110'
                : 'bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border-blue-500 text-blue-300 hover:scale-105'
            }`}
            whileHover={{ scale: isRecording ? 1.1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={isRecording ? {
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.5), 0 0 60px rgba(239, 68, 68, 0.25)'
            } : {
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.4), 0 0 50px rgba(59, 130, 246, 0.2)'
            }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              {isRecording ? (
                <path d="M6 6h12v12H6z" />
              ) : (
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0V9a1 1 0 0 1 2 0v2a5 5 0 0 0 10 0V9a1 1 0 0 1 2 0v2z" />
              )}
            </svg>
          </motion.button>
          <p className="text-sm text-gray-400 text-center">
            {isRecording ? 'Click to stop recording' : 'Click to start recording'}
          </p>
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
          <input
            ref={textInputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSubmitting && handleTextSubmit()}
            placeholder="Enter text to generate animation..."
            className="flex-1 bg-gray-900/70 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:bg-gray-900/90 transition-all backdrop-blur-sm border border-blue-500/30 placeholder-gray-400 font-medium"
            disabled={isSubmitting || isRecording}
            style={{
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.1)'
            }}
          />
          <motion.button
            onClick={handleTextSubmit}
            disabled={!text.trim() || isSubmitting || isRecording}
            className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition-all font-semibold text-white"
            whileHover={{ scale: text.trim() && !isSubmitting && !isRecording ? 1.05 : 1 }}
            whileTap={{ scale: 0.98 }}
            style={text.trim() && !isSubmitting && !isRecording ? {
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.4), 0 4px 20px rgba(59, 130, 246, 0.3)'
            } : {}}
          >
            {isSubmitting ? 'Generating...' : 'Generate'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceInputSimple;
