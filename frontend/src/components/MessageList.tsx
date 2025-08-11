import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { Message, FileInfo } from '../types';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const renderFilePreview = (file: FileInfo) => {
    const isImage = file.type.startsWith('image/');
    
    return (
      <div className="file-preview">
        {isImage ? (
          <img 
            src={file.url} 
            alt={file.name} 
            className="w-16 h-16 object-cover rounded mr-2" 
          />
        ) : (
          <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{file.name}</div>
          <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-3xl ${message.role === 'user' ? 'message-user' : 'message-ai'}`}>
            {message.files && message.files.length > 0 && (
              <div className="mb-2">
                {message.files.map((file, index) => (
                  <div key={index} className="mb-1">
                    {renderFilePreview(file)}
                  </div>
                ))}
              </div>
            )}
            
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return !inline ? (
                      <pre className={className}>
                        <code>{children}</code>
                      </pre>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            
            <div className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
