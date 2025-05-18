import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import '../styles/userchat.scss';

export default function AdminChat() {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

   
    useEffect(() => {
        api.get('/users')
            .then(r => {
                // Add animation delay index to each user
                const usersWithIndex = r.data.map((user, index) => ({
                    ...user,
                    animationIndex: index
                }));
                setUsers(usersWithIndex);
            })
            .catch(console.error);
    }, []);

    
    // Scroll to bottom whenever messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    
    useEffect(() => {
        if (!selected) return;
        
        // Show typing indicator when changing users
        setIsTyping(true);
        
        api.get(`/messages/${selected.id}`)
            .then(r => {
                // Add a small delay before displaying messages to show the typing indicator
                setTimeout(() => {
                    setIsTyping(false);
                    setMessages(r.data);
                }, 1000);
            })
            .catch(error => {
                console.error(error);
                setIsTyping(false);
            });
    }, [selected]);

    const send = () => {
        if (!draft.trim() || !selected) return;
        
        // Optimistically add the message to UI
        const tempMessage = {
            id: 'temp-' + Date.now(),
            sender_id: null, // null sender_id means it's from the admin
            receiver_id: selected.id,
            content: draft,
            created_at: new Date().toISOString(),
            temp: true // flag to identify temporary messages
        };
        
        setMessages(m => [...m, tempMessage]);
        setDraft('');
        
        // Send to API
        api.post('/messages', { receiver_id: selected.id, content: draft })
            .then(r => {
                // Replace temp message with the real one from the server
                setMessages(messages => 
                    messages.map(m => 
                        m.id === tempMessage.id ? r.data : m
                    )
                );
            })
            .catch(error => {
                console.error(error);
                // Mark the temp message as failed
                setMessages(messages => 
                    messages.map(m => 
                        m.id === tempMessage.id ? {...m, failed: true} : m
                    )
                );
            });
    };
    
    // Handle Enter key to send message
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };
    
    // Filter users based on search term
    const filteredUsers = users.filter(user => {
        const searchVal = searchTerm.toLowerCase();
        const name = (user.first_name || user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        return name.includes(searchVal) || email.includes(searchVal);
    });

    // Format timestamp for messages
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return (
        <div className="user-chat-wrapper">
            {/* ─── Users List ─── */}
            <aside className="users-list">
                <h4>Users</h4>
                
                <div className="search-users">
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="users-container">
                    {filteredUsers.map((u, index) => (
                        <div
                            key={u.id}
                            onClick={() => setSelected(u)}
                            className={`user-item ${selected?.id === u.id ? 'active' : ''}`}
                            style={{ '--i': u.animationIndex || index }}
                        >
                            <div className="user-avatar">
                                {(u.first_name || u.name || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <div className="user-name">{u.first_name || u.name || u.email}</div>
                                <div className="user-status">
                                    <span className="status-indicator"></span>
                                    Online
                                </div>
                            </div>
                            {/* Uncomment to add unread badges */}
                            {/* {u.unread && <div className="unread-badge">{u.unread}</div>} */}
                        </div>
                    ))}
                </div>
            </aside>

            {/* ─── Chat Panel ─── */}
            <section className="chat-panel">
                <h4>
                    {selected
                        ? `Chat with ${selected.first_name || selected.name || selected.email}`
                        : 'Select a user to chat'}
                </h4>

                <div className="messages" ref={messagesContainerRef}>
                    {messages.map((m, index) => {
                        const isIncoming = m.sender_id === selected?.id;
                        const isOutgoing = !isIncoming;
                        const showAvatar = isIncoming && (!messages[index-1] || messages[index-1].sender_id !== m.sender_id);
                        
                        return (
                            <div
                                key={m.id}
                                className={`message ${isIncoming ? 'incoming' : 'outgoing'} ${m.failed ? 'failed' : ''}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {showAvatar && isIncoming && (
                                    <div className="avatar">
                                        {(selected.first_name || selected.name || selected.email).charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="bubble">{m.content}</span>
                                <span className="time">{formatMessageTime(m.created_at)}</span>
                            </div>
                        );
                    })}
                    
                    {isTyping && (
                        <div className="message incoming typing">
                            <div className="avatar">
                                {selected && (selected.first_name || selected.name || selected.email).charAt(0).toUpperCase()}
                            </div>
                            <span className="bubble">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </div>
                    )}
                    
                    {/* Empty div for scrolling to bottom */}
                    <div ref={messagesEndRef} />
                </div>

                {selected && (
                    <div className="composer">
                        <input
                            className="composer-input"
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message…"
                        />
                        <div className="composer-actions">
                            <button
                                className="composer-button"
                                onClick={send}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}