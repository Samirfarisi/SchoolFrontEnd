import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';

const Chat = () => {
  // States for chat functionality
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Mock user data with different types for filtering
  const mockUsers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: null,
      status: 'online',
      type: 'student',
      lastMessage: 'When will the next physics course be available?',
      lastMessageTime: '10:30 AM',
      unread: 2,
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: 'https://i.pravatar.cc/150?img=11',
      status: 'offline',
      type: 'student',
      lastMessage: 'Thanks for your help with the math problem.',
      lastMessageTime: 'Yesterday',
      unread: 0,
    },
    {
      id: 3,
      name: 'Emma Davis',
      avatar: 'https://i.pravatar.cc/150?img=5',
      status: 'online',
      type: 'teacher',
      lastMessage: 'I need access to update the biology course materials.',
      lastMessageTime: '9:15 AM',
      unread: 3,
    },
    {
      id: 4,
      name: 'Ahmed Hassan',
      avatar: null,
      status: 'offline',
      type: 'student',
      lastMessage: 'Will there be a review session before the exam?',
      lastMessageTime: '2 days ago',
      unread: 0,
    },
    {
      id: 5,
      name: 'Sophia Martinez',
      avatar: 'https://i.pravatar.cc/150?img=20',
      status: 'away',
      type: 'teacher',
      lastMessage: 'The new curriculum looks great!',
      lastMessageTime: '08:45 AM',
      unread: 1,
    },
    {
      id: 6,
      name: 'James Wilson',
      avatar: 'https://i.pravatar.cc/150?img=12',
      status: 'online',
      type: 'student',
      lastMessage: 'Do we need the textbook for next class?',
      lastMessageTime: 'Yesterday',
      unread: 0,
    },
    {
      id: 7,
      name: 'Leila Khoury',
      avatar: null,
      status: 'offline',
      type: 'parent',
      lastMessage: "I'm concerned about my child's progress.",
      lastMessageTime: '3 days ago',
      unread: 0,
    },
  ];
  
  // Mock conversation data
  const mockConversations = {
    1: [
      {
        id: 1,
        sender: 'user',
        content: 'Hello, I have a question about the physics course.',
        timestamp: '10:00 AM',
        read: true,
      },
      {
        id: 2,
        sender: 'admin',
        content: 'Hi Sarah, how can I help you with the physics course?',
        timestamp: '10:05 AM',
        read: true,
      },
      {
        id: 3,
        sender: 'user',
        content: 'When will the next physics course be available? I completed the current one.',
        timestamp: '10:15 AM',
        read: true,
      },
      {
        id: 4,
        sender: 'user',
        content: 'Also, will there be any advanced topics covered?',
        timestamp: '10:30 AM',
        read: false,
      },
    ],
    3: [
      {
        id: 1,
        sender: 'user',
        content: 'Hi, I need access to update the biology course materials.',
        timestamp: '9:00 AM',
        read: true,
      },
      {
        id: 2,
        sender: 'admin',
        content: 'Good morning Emma, I can help with that. What specific materials do you need to update?',
        timestamp: '9:05 AM',
        read: true,
      },
      {
        id: 3,
        sender: 'user',
        content: 'I need to update the cell structure diagrams and add some new quiz questions.',
        timestamp: '9:10 AM',
        read: true,
      },
      {
        id: 4,
        sender: 'user',
        content: 'The current diagrams are a bit outdated.',
        timestamp: '9:15 AM',
        read: false,
      },
    ],
    5: [
      {
        id: 1,
        sender: 'admin',
        content: 'Hi Sophia, have you had a chance to review the new curriculum?',
        timestamp: '08:30 AM',
        read: true,
      },
      {
        id: 2,
        sender: 'user',
        content: 'Yes, I just finished going through it. The new curriculum looks great!',
        timestamp: '08:45 AM',
        read: false,
      },
    ],
  };
  
  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        
        // Simulate API request
        setTimeout(() => {
          setUsers(mockUsers);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error loading users:', error);
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);
  
  // Load messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      setChatLoading(true);
      
      // Simulate API request
      setTimeout(() => {
        // Get conversation for selected user or empty array if none exists
        const userMessages = mockConversations[selectedUser.id] || [];
        setMessages(userMessages);
        setChatLoading(false);
        
        // Mark messages as read (in a real app, this would update the database)
        const updatedUsers = users.map(user => {
          if (user.id === selectedUser.id) {
            return { ...user, unread: 0 };
          }
          return user;
        });
        setUsers(updatedUsers);
      }, 500);
    }
  }, [selectedUser]);
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Filter users based on search term and user type
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.type === userFilter;
    return matchesSearch && matchesFilter;
  });
  
  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedUser) return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: 'admin',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    
    // Update messages state
    setMessages([...messages, newMsg]);
    
    // Update users state with latest message
    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          lastMessage: newMessage,
          lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    
    // Clear input
    setNewMessage('');
  };
  
  // Handle file upload button click
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    // In a real application, you would upload the file to a server
    // For now, just simulate attaching a file by sending its name
    if (e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setNewMessage(`Attached file: ${fileName}`);
    }
  };
  
  // Get initials for avatar placeholder
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Status indicator color
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'var(--admin-success)';
      case 'away': return 'var(--admin-warning)';
      case 'offline': return 'var(--admin-text-muted)';
      default: return 'var(--admin-text-muted)';
    }
  };

  return (
    <AdminLayout>
      <div className="admin-chat-container">
        {/* Users List */}
        <div className="chat-users-panel">
          <div className="chat-users-header">
            <h3 className="chat-panel-title">Conversations</h3>
            <div className="chat-filter-actions">
              <div className="chat-search">
                <ion-icon name="search-outline" className="chat-search-icon"></ion-icon>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="chat-search-input"
                />
              </div>
              <select
                className="chat-user-filter"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="parent">Parents</option>
              </select>
            </div>
          </div>
          
          <div className="chat-users-list">
            {loading ? (
              <div className="chat-loading">
                <div className="spinner"></div>
                <p>Loading conversations...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="users-list">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`chat-user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                    onClick={() => setSelectedUser(user)}
                    style={{'--i': index + 1}}
                  >
                    <div className="chat-user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <div className="avatar-placeholder">{getInitials(user.name)}</div>
                      )}
                      <span
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor(user.status) }}
                      ></span>
                    </div>
                    <div className="chat-user-info">
                      <div className="chat-user-name-row">
                        <h4 className="chat-user-name">{user.name}</h4>
                        <span className="chat-time">{user.lastMessageTime}</span>
                      </div>
                      <p className="chat-last-message">{user.lastMessage}</p>
                      <div className="chat-user-meta">
                        <span className="chat-user-type">{user.type}</span>
                        {user.unread > 0 && (
                          <span className="chat-unread-badge">{user.unread}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-users-found">
                <ion-icon name="search" size="large"></ion-icon>
                <p>No users found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="chat-main-panel">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-user-avatar">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.name} />
                    ) : (
                      <div className="avatar-placeholder">{getInitials(selectedUser.name)}</div>
                    )}
                    <span
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(selectedUser.status) }}
                    ></span>
                  </div>
                  <div className="chat-user-details">
                    <h3 className="chat-user-name">{selectedUser.name}</h3>
                    <p className="chat-user-status">
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)} · {selectedUser.type}
                    </p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="chat-action-btn">
                    <ion-icon name="call-outline"></ion-icon>
                  </button>
                  <button className="chat-action-btn">
                    <ion-icon name="videocam-outline"></ion-icon>
                  </button>
                  <button className="chat-action-btn">
                    <ion-icon name="ellipsis-vertical-outline"></ion-icon>
                  </button>
                </div>
              </div>
              
              <div className="chat-messages">
                {chatLoading ? (
                  <div className="chat-loading">
                    <div className="spinner"></div>
                    <p>Loading conversation...</p>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="messages-container">
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`message ${message.sender === 'admin' ? 'sent' : 'received'}`}
                        style={{'--i': index + 1}}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">{message.timestamp}</span>
                          {message.sender === 'admin' && (
                            <span className="message-status">
                              {message.read ? (
                                <ion-icon name="checkmark-done-outline"></ion-icon>
                              ) : (
                                <ion-icon name="checkmark-outline"></ion-icon>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="empty-conversation">
                    <div className="empty-chat-icon">
                      <ion-icon name="chatbubbles-outline"></ion-icon>
                    </div>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>
              
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <button
                  type="button"
                  className="chat-attach-btn"
                  onClick={handleFileButtonClick}
                >
                  <ion-icon name="attach-outline"></ion-icon>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="chat-input"
                />
                <button
                  type="button"
                  className="chat-emoji-btn"
                >
                  <ion-icon name="happy-outline"></ion-icon>
                </button>
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!newMessage.trim()}
                >
                  <ion-icon name="send"></ion-icon>
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">
                <ion-icon name="chatbubbles-outline"></ion-icon>
              </div>
              <h3>Select a conversation</h3>
              <p>Choose a user from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Chat;
