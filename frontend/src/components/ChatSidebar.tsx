import React from 'react';
import useChatStore from '../store/chatStore';
import { chatAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface ChatSidebarProps {
  onCreateSession: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onCreateSession }) => {
  const { sessions, currentSessionId, setCurrentSession, removeSession } = useChatStore();
  const navigate = useNavigate();

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    chatAPI.deleteSession(sessionId)
      .then(() => {
        removeSession(sessionId);
      })
  };

  const handleSessionClick = (sessionId: string) => {
    // Update the URL with session ID parameter
    navigate(`/?sessionId=${sessionId}`);
    // Set the current session in the store
    setCurrentSession(sessionId);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
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
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
            onClick={() => handleSessionClick(session.id)}
          >
            <div className="flex-1 truncate">
              <div className="font-medium text-sm">{session.title || 'New Chat'}</div>
              <div className="text-xs text-gray-500">
                {new Date(session.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={(e) => handleDeleteSession(e, session.id)}
              className="icon-button text-gray-500 hover:text-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            U
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium">User</div>
            <div className="text-xs text-gray-500">Free Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
