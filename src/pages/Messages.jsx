import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/common/Avatar';
import { Search, Send, MessageCircle } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
    // Poll for new messages every 5 seconds (simple real-time fallback)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUserId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, msgsRes] = await Promise.all([
        fetch('/api/users'),
        fetch(`/api/messages/${user?.id || 'none'}`)
      ]);
      const usersData = await usersRes.json();
      const msgsData = await msgsRes.json();

      if (usersData.success) {
        // Filter out current user from contacts list
        setUsers(usersData.users.filter(u => u.id !== user?.id));
      }
      if (msgsData.success) {
        setMessages(msgsData.messages);
      }
    } catch (err) {
      console.error("Error fetching chat data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/messages/${user.id}`);
      const data = await res.json();
      if (data.success) {
        // Only update if there's a change to prevent re-renders wiping input
        setMessages(prev => {
          if (prev.length !== data.messages.length) return data.messages;
          return prev;
        });
      }
    } catch (err) {
      // silent fail on polling
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUserId || !user) return;

    const newMsg = {
      senderId: user.id,
      receiverId: selectedUserId,
      content: inputMessage.trim()
    };

    // Optimistic UI update
    const tempMsg = { ...newMsg, id: 'temp-' + Date.now(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setInputMessage('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
      const data = await res.json();
      if (!data.success) {
        console.error("Failed to send message");
      } else {
        // Update temp message with real ID from server
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? data.message : m));
      }
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  // Derived state
  const selectedUser = users.find(u => u.id === selectedUserId);
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.major.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort users so those with existing messages appear first
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aHasMsgs = messages.some(m => m.senderId === a.id || m.receiverId === a.id);
    const bHasMsgs = messages.some(m => m.senderId === b.id || m.receiverId === b.id);
    if (aHasMsgs && !bHasMsgs) return -1;
    if (!aHasMsgs && bHasMsgs) return 1;
    return a.fullName.localeCompare(b.fullName);
  });

  const activeThread = messages.filter(m => 
    (m.senderId === user?.id && m.receiverId === selectedUserId) ||
    (m.receiverId === user?.id && m.senderId === selectedUserId)
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Please log in to view your messages.</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ height: 'calc(100vh - 120px)', minHeight: '600px', display: 'flex', gap: '1.5rem' }}>
      
      {/* Left Sidebar: Contact List */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel"
        style={{ width: '350px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageCircle className="text-primary" /> Messages
          </h2>
          <div className="search-container" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search peers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', borderRadius: '30px' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {loading && users.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Loading contacts...</div>
          ) : sortedUsers.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No users found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sortedUsers.map(u => {
                const isSelected = selectedUserId === u.id;
                // Count unread messages (basic implementation)
                const hasUnread = messages.some(m => m.senderId === u.id && m.receiverId === user.id && !m.read);
                
                return (
                  <div 
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--primary-glow)' : 'transparent',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <Avatar src={u.avatar} size="2.5rem" />
                      {hasUnread && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '12px',
                          height: '12px',
                          backgroundColor: 'var(--danger)',
                          borderRadius: '50%',
                          border: '2px solid var(--bg-secondary)'
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: isSelected ? '700' : '600', color: isSelected ? 'var(--primary)' : 'var(--text-main)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.fullName}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.major}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Right Pane: Chat Window */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Avatar src={selectedUser.avatar} size="3rem" />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{selectedUser.fullName}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  {selectedUser.major} • Class of {selectedUser.gradYear}
                </p>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              {activeThread.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No messages yet. Say hello to {selectedUser.fullName.split(' ')[0]}!</p>
                </div>
              ) : (
                activeThread.map(msg => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '20px',
                        borderBottomRightRadius: isMine ? '4px' : '20px',
                        borderBottomLeftRadius: !isMine ? '4px' : '20px',
                        backgroundColor: isMine ? 'var(--primary)' : 'var(--bg-tertiary)',
                        color: isMine ? 'white' : 'var(--text-main)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{msg.content}</p>
                        <span style={{ display: 'block', fontSize: '0.65rem', marginTop: '0.25rem', opacity: 0.7, textAlign: isMine ? 'right' : 'left' }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={`Message ${selectedUser.fullName.split(' ')[0]}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  style={{ borderRadius: '30px', padding: '0.75rem 1.25rem' }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!inputMessage.trim()}
                  style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <Send size={18} style={{ marginLeft: '4px' }} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              backgroundColor: 'var(--bg-tertiary)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' 
            }}>
              <MessageCircle size={36} className="text-primary" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Your Messages</h2>
            <p>Select a peer from the sidebar to start a conversation.</p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
