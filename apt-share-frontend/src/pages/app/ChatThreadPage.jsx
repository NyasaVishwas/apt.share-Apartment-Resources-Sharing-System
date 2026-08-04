import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMessages, sendMessage } from '../../features/chat/api';
import { useAuth } from '../../app/providers/AuthProvider';
import { useSocket } from '../../app/providers/SocketProvider';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, Send } from 'lucide-react';

export const ChatThreadPage = () => {
  const { threadId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [threadId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('thread:join', threadId);

    const handleNewMessage = (newMsg) => {
      if (newMsg.threadId === threadId) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
    };

    const handleUserStartTyping = ({ userId }) => {
      if (userId !== user?._id) setIsTyping(true);
    };

    const handleUserStopTyping = ({ userId }) => {
      if (userId !== user?._id) setIsTyping(false);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:user_start', handleUserStartTyping);
    socket.on('typing:user_stop', handleUserStopTyping);

    return () => {
      socket.emit('thread:leave', threadId);
      socket.off('message:new', handleNewMessage);
      socket.off('typing:user_start', handleUserStartTyping);
      socket.off('typing:user_stop', handleUserStopTyping);
    };
  }, [socket, threadId, user]);

  const loadMessages = async () => {
    try {
      const data = await fetchMessages(threadId);
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const msgBody = inputMessage;
    setInputMessage('');

    if (socket) {
      socket.emit('typing:stop', { threadId });
    }

    try {
      const sentMsg = await sendMessage(threadId, msgBody);
      setMessages((prev) => [...prev, sentMsg]);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (socket) {
      socket.emit('typing:start', { threadId });
      setTimeout(() => {
        socket.emit('typing:stop', { threadId });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/chat" className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Threads</span>
          </Link>
          <span className="font-bold text-base">Direct Neighbor Chat</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 flex-1 w-full flex flex-col">
        {/* Messages Body Scroll Area */}
        <div className="flex-1 bg-surface border border-border rounded-lg p-6 overflow-y-auto max-h-[65vh] space-y-4 shadow-sm">
          {loading ? (
            <div className="text-center text-text-secondary text-sm py-8">Loading message history...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-text-secondary text-sm py-8">No messages yet. Send a greeting to connect!</div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId?._id?.toString() === user?._id?.toString() || m.senderId === user?._id;
              return (
                <div key={m._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-text-secondary mb-1">
                    {isMine ? 'You' : m.senderId?.name || 'Neighbor'}
                  </span>
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-lg text-sm ${
                      isMine
                        ? 'bg-accent text-white rounded-br-none'
                        : 'bg-bg-elevated text-text-primary border border-border rounded-bl-none'
                    }`}
                  >
                    {m.body}
                  </div>
                  <span className="text-[9px] text-text-secondary mt-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="text-xs text-text-secondary italic animate-pulse">Neighbor is typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={handleInputChange}
            className="flex-1 px-4 py-3 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" size="md" className="px-6 py-3">
            <Send className="w-4 h-4 mr-1" />
            <span>Send</span>
          </Button>
        </form>
      </main>
    </div>
  );
};
