import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/chatStore';
import { chatAPI, fileAPI } from '../services/api';
import { Message, FileInfo } from '../types';
import ChatSidebar from '../components/ChatSidebar';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import { useSearchParams } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    addMessage,
    setCurrentSession,
    addSession,
    setIsStreaming,
  } = useChatStore();
  const [searchParams] = useSearchParams();

  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for sessionId in URL params and set current session if needed
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (sessionId && sessions.length > 0 && !currentSessionId) {
      // Check if the session exists in our sessions list
      const sessionExists = sessions.some(session => session.id === sessionId);
      if (sessionExists) {
        setCurrentSession(sessionId);
      }
    }
  }, [searchParams, sessions, currentSessionId, setCurrentSession]);

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
      // Send message to backend (non-blocking)
      await chatAPI.sendMessage(currentSessionId, {
        role: 'user',
        content: inputValue,
        files: uploadedFileInfos,
      });

      // Create a temporary AI message with empty content
      const aiMessageId = Date.now().toString();
      const aiMessage: Message = {
        id: aiMessageId,
        sessionId: currentSessionId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      };

      addMessage(aiMessage);

      // Connect to SSE stream for AI response
      let eventSource: EventSource | null = null;
      let accumulatedContent = '';

      const handleStreamMessage = (data: any) => {
        if (data.error) {
          // Handle error from stream
          // Update AI message with error content
          useChatStore.getState().updateMessage(aiMessageId, 'Sorry, I encountered an error processing your request.');
          if (eventSource) {
            eventSource.close();
          }
          setIsStreaming(false);
          return;
        }

        let output = data.output || {};
        if (output.text) {
          // Append new text to accumulated content
          accumulatedContent = output.text;
          useChatStore.getState().updateMessage(aiMessageId, accumulatedContent);
        }
        
        if (data.end) {
          setIsStreaming(false);
          return;
        }
      };

      const handleStreamError = (error: any) => {
        console.error('Stream error:', error);
        // Update AI message with error content
        useChatStore.getState().updateMessage(aiMessageId, 'Sorry, I encountered an error processing your request.');
        setIsStreaming(false);
      };

      // Start streaming
      eventSource = chatAPI.streamMessages(
        currentSessionId,
        handleStreamMessage,
        handleStreamError
      );

      // Clean up when stream ends
      const cleanup = () => {
        if (eventSource) {
          eventSource.close();
        }
        setIsStreaming(false);
      };

      // Set a timeout to clean up if stream doesn't end properly
      const timeout = setTimeout(cleanup, 60000); // 60 seconds timeout

      // Listen for stream end
      eventSource.addEventListener('end', () => {
        clearTimeout(timeout);
        cleanup();
      });
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
