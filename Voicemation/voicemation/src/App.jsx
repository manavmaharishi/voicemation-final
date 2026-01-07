import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import { AnimationProvider } from './context/AnimationContext';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [conversations, setConversations] = useState([
    {
      id: 1,
      title: "New Conversation",
      timestamp: new Date(),
      messages: []
    }
  ]);
  const [activeConversation, setActiveConversation] = useState(1);

    const addNewConversation = () => {
    const newId = Math.max(...conversations.map(c => c.id)) + 1;
    const newConversation = {
      id: newId,
      title: "New Conversation",
      timestamp: new Date(),
      messages: []
    };
    setConversations(prev => [...prev, newConversation]);
    setActiveConversation(newId);
  };

  const updateConversationMessages = (conversationId, messages) => {
    setConversations(prev => {
      // Update messages and timestamp for the conversation
      const updated = prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, messages: [...messages], timestamp: new Date() }
          : conv
      );
      // Sort by most recent timestamp (most recent first)
      return updated.sort((a, b) => b.timestamp - a.timestamp);
    });
  };

  const updateConversationTitle = (conversationId, title) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, title }
          : conv
      )
    );
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  // Show landing page first
  if (showLanding) {
    return (
      <ErrorBoundary>
        <LandingPage onGetStarted={handleGetStarted} />
      </ErrorBoundary>
    );
  }

  // Show main app after "Get Started" is clicked
  return (
    <ErrorBoundary>
      <AnimationProvider>
        <motion.div 
          className="flex h-screen relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ backgroundColor: '#000000' }}
        >
          <div className="relative z-10 flex w-full h-full" style={{ backgroundColor: '#000000' }}>
          <AnimatePresence mode="wait">
            <Sidebar 
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={setActiveConversation}
              onNewConversation={addNewConversation}
              onRenameConversation={updateConversationTitle}
            />
          </AnimatePresence>
                    <Dashboard 
            activeConversation={activeConversation}
            conversations={conversations}
            onUpdateMessages={updateConversationMessages}
            onUpdateTitle={updateConversationTitle}
          />
          </div>
        </motion.div>
      </AnimationProvider>
    </ErrorBoundary>
  );
}

export default App;
