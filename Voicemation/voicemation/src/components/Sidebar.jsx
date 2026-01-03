import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  onNewConversation,
  onRenameConversation 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const sidebarVariants = {
    expanded: { 
      width: 256,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    collapsed: { 
      width: 48,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  if (isCollapsed) {
    return (
      <motion.div 
        className="flex flex-col items-center py-4"
        style={{ backgroundColor: '#000000' }}
        variants={sidebarVariants}
        animate="collapsed"
        initial="expanded"
      >
        <motion.button 
          onClick={() => setIsCollapsed(false)}
          className="text-white hover:bg-gray-800 p-2 rounded mb-4"
          title="Expand sidebar"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
        <motion.button 
          onClick={onNewConversation}
          className="text-white hover:bg-gray-800 p-2 rounded"
          title="New conversation"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="text-white flex flex-col h-full border-r border-blue-500/20 relative"
      variants={sidebarVariants}
      animate="expanded"
      initial="collapsed"
      style={{
        background: '#000000',
        backdropFilter: 'blur(24px)',
        boxShadow: '2px 0 20px rgba(59, 130, 246, 0.08), inset -1px 0 0 rgba(59, 130, 246, 0.05)'
      }}
    >
      {/* Header with logo only */}
      <motion.div 
        className="flex items-center justify-between p-3 border-b border-gray-800"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="w-8 h-8 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center relative"
          whileHover={{ scale: 1.05 }}
          style={{
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)'
          }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </motion.div>
        <motion.button 
          onClick={() => setIsCollapsed(true)}
          className="hover:bg-gray-800 p-1 rounded"
          title="Collapse sidebar"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      </motion.div>

      {/* New Chat Button */}
      <motion.div 
        className="p-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button 
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-3 p-3 rounded-lg border border-blue-500/40 bg-gradient-to-r from-blue-600/25 to-indigo-600/25 hover:from-blue-600/35 hover:to-indigo-600/35 transition-all font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </motion.button>
      </motion.div>

      {/* Conversations List - Now with hidden scrollbar and fade gradient effect */}
      <div className="flex-1 overflow-y-auto scrollbar-hide scroll-smooth px-3 relative">
        {/* Gradient fades for top and bottom of scroll area */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent z-10 pointer-events-none"></div>
        
        <motion.div 
          className="space-y-1 pb-8" /* Added bottom padding for better scrolling experience */
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="popLayout">
            {conversations.map((conversation, index) => (
              <motion.button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full text-left p-3 rounded-lg transition-all group relative ${
                  activeConversation === conversation.id 
                    ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-400/40' 
                    : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                }`}
                style={activeConversation === conversation.id ? {
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                } : {}}
                layout
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ 
                  layout: { type: "spring", stiffness: 350, damping: 30 },
                  opacity: { duration: 0.2 },
                  x: { duration: 0.3 }
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    {renamingId === conversation.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => {
                          if (renameValue.trim()) {
                            onRenameConversation(conversation.id, renameValue.trim());
                          }
                          setRenamingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (renameValue.trim()) {
                              onRenameConversation(conversation.id, renameValue.trim());
                            }
                            setRenamingId(null);
                          } else if (e.key === 'Escape') {
                            setRenamingId(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full bg-gray-700 text-white text-sm px-2 py-1 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <>
                        <div className="text-sm font-medium truncate flex items-center gap-2">
                          {conversation.title}
                          {conversation.messages?.length > 0 && (
                            <span className="text-xs text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded-full">
                              {conversation.messages.length}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(conversation.timestamp)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* More options button */}
                <div className="relative">
                  <motion.div 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded cursor-pointer"
                    whileHover={{ scale: 1.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === conversation.id ? null : conversation.id);
                    }}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </motion.div>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {menuOpenId === conversation.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-8 z-50 bg-gray-700 rounded-lg shadow-xl border border-gray-600 py-1 min-w-[120px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameValue(conversation.title);
                            setRenamingId(conversation.id);
                            setMenuOpenId(null);
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Rename
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}