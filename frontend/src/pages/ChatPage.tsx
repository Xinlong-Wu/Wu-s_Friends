import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../store/chatStore';
import { chatAPI, fileAPI } from '../services/api';
import { Message, FileInfo } from '../types';
import ChatSidebar from '../components/ChatSidebar';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    addMessage,
    updateMessage,
    setCurrentSession,
    addSession,
    setIsStreaming,
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create a new session on mount if none exists
  useEffect(() => {
    if (sessions.length === 0 && !currentSessionId) {
      createNewSession();
    }
  }, [sessions, currentSessionId]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = async () => {
    try {
      const session = await chatAPI.createSession();
      addSession(session);
      setCurrentSession(session.id);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && selectedFiles.length === 0) || !currentSessionId || isStreaming) {
      return;
    }

    // Upload files first if any
    let uploadedFileInfos: FileInfo[] = [];
    if (selectedFiles.length > 0) {
      try {
        const uploadPromises = selectedFiles.map(file => fileAPI.uploadFile(file));
        uploadedFileInfos = await Promise.all(uploadPromises);
        setUploadedFiles(prev => [...prev, ...uploadedFileInfos]);
      } catch (error) {
        console.error('Failed to upload files:', error);
        // Continue sending message even if file upload fails
      }
    }

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      sessionId: currentSessionId,
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      files: uploadedFileInfos,
    };

    addMessage(userMessage);
    setInputValue('');
    setSelectedFiles([]);
    setIsStreaming(true);

    try {
      // For streaming, we would use EventSource or WebSocket
      // This is a simplified version that waits for the full response
      const response = await chatAPI.sendMessage(currentSessionId, {
        role: 'user',
        content: inputValue,
        files: uploadedFileInfos,
      });

      // Add AI response to UI
      const aiMessage: Message = {
        id: response.id,
        sessionId: currentSessionId,
        content: response.content,
        role: 'assistant',
        timestamp: response.timestamp,
      };

      addMessage(aiMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message to UI
      const errorMessage: Message = {
        id: Date.now().toString(),
        sessionId: currentSessionId,
        content: 'Sorry, I encountered an error processing your request.',
        role: 'assistant',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearContext = async () => {
    if (!currentSessionId) return;

    try {
      await chatAPI.clearSession(currentSessionId);
      // Clear messages in store
      useChatStore.getState().clearMessages();
    } catch (error) {
      console.error('Failed to clear context:', error);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-full">
      <ChatSidebar onCreateSession={createNewSession} />
      
      <div className="flex-1 flex flex-col">
        <ChatHeader onClearContext={handleClearContext} />
        
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>
        
        <MessageInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onRemoveFile={removeSelectedFile}
        />
      </div>
    </div>
  );
};

export default ChatPage;
