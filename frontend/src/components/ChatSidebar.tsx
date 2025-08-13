import React, { useState, useEffect } from 'react';
import useChatStore from '../store/chatStore';
import { chatAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

interface ChatSidebarProps {
  onCreateSession: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onCreateSession }) => {
  const { sessions, currentSessionId, setCurrentSession, removeSession, updateSessionTitle } = useChatStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    // Get current user info when component mounts
    const fetchCurrentUser = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    
    // Check if we're deleting the current session
    const isCurrentSession = currentSessionId === sessionId;
    let nextSessionId: string | null = null;
    
    // If we're deleting the current session, find the next most recent session
    if (isCurrentSession) {
      const otherSessions = sessions.filter(s => s.id !== sessionId);
      if (otherSessions.length > 0) {
        // Find the most recently updated session
        const mostRecentSession = otherSessions.reduce((mostRecent, session) => {
          return new Date(session.updatedAt) > new Date(mostRecent.updatedAt) ? session : mostRecent;
        }, otherSessions[0]);
        nextSessionId = mostRecentSession.id;
      }
    }
    
    try {
      // Delete session from backend
      await chatAPI.deleteSession(sessionId);
      
      // Remove session from store
      removeSession(sessionId);
      
      // If we deleted the current session, switch to the next session or create a new one
      if (isCurrentSession) {
        if (nextSessionId) {
          // Switch to the next most recent session
          handleSessionClick(nextSessionId);
        } else {
          // No other sessions, create a new one
          onCreateSession();
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    // Update the URL with session ID parameter
    navigate(`/?sessionId=${sessionId}`);
    // Set the current session in the store
    setCurrentSession(sessionId);
  };

  const handleLogout = async () => {
    try {
      // Call logout API if needed
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      // Navigate to login page
      navigate('/login');
    }
  };

  // Get user initials for avatar
  const getUserInitials = (userName: string = ''): string => {
    if (!userName) return 'U';
    return userName.charAt(0).toUpperCase();
  };

  // Sort sessions by updatedAt time (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });

  // Select the most recently updated session as default
  useEffect(() => {
    // Only set default session if we don't already have one and there are sessions
    if (!currentSessionId && sessions.length > 0) {
      // Get the most recently updated session
      const sorted = [...sessions].sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      if (sorted.length > 0) {
        setCurrentSession(sorted[0].id);
      }
    }
  }, [sessions, currentSessionId, setCurrentSession]);

  // Start editing a session title
  const startEditing = (sessionId: string, title: string) => {
    setEditingSessionId(sessionId);
    setEditTitle(title);
  };

  // Save the edited session title
  const saveEdit = async (sessionId: string) => {
    if (!editTitle.trim()) return;
    
    try {
      // Update the session title on the backend
      await chatAPI.updateSessionTitle(sessionId, editTitle);
      // Update the session title in the store
      updateSessionTitle(sessionId, editTitle);
    } catch (error) {
      console.error('Failed to update session title:', error);
    }
    finally {
      setEditingSessionId(null);
      setEditTitle('');
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateSession}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedSessions.map((session) => (
          <div
            key={session.id}
            className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
            onClick={() => handleSessionClick(session.id)}
          >
            <div className="flex-1 truncate">
              {editingSessionId === session.id ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => saveEdit(session.id)}
                    className="flex-1 text-xs border rounded px-2 py-0.5"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(session.id)}
                    className="text-xs bg-green-500 text-white p-1 rounded hover:bg-green-600"
                    title="Save"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs bg-gray-500 text-white p-1 rounded hover:bg-gray-600"
                    title="Cancel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div 
                  className="font-medium text-sm cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(session.id, session.title || 'New Chat');
                  }}
                >
                  {session.title || 'New Chat'}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {new Date(session.updatedAt).toLocaleDateString()}
              </div>
            </div>
            {editingSessionId != session.id &&
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(e, session.id);
                }}
                className="icon-button text-gray-500 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            }
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200 relative">
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {user ? getUserInitials(user.name) : 'U'}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium">{user ? user.name : 'User'}</div>
            <div className="text-xs text-gray-500">Free Plan</div>
          </div>
        </div>
        
        {showDropdown && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
