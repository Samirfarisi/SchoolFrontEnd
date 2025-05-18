import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios-simple';
import './chat.css';
import Loader from '../components/Loader';

export default function Chat() {
    const [admin, setAdmin] = useState(null);
    const [msgs, setMsgs] = useState([]);
    const [newMsg, setNewMsg] = useState('');

    useEffect(() => {
        // 1) Who am I chatting with?
        api.get('/admin-info').then(r => setAdmin(r.data));
    }, []);

    useEffect(() => {
        if (!admin) return;
        // 2) Load existing conversation
        api.get(`/messages/${admin.id}`)
            .then(r => setMsgs(r.data))
            .catch(console.error);
    }, [admin]);

    const send = async () => {
        if (!newMsg.trim()) return;
        try {
            const r = await api.post('/messages', {
                receiver_id: admin.id,
                content: newMsg.trim(),
            });
            setMsgs(m => [...m, r.data]);
            setNewMsg('');
        } catch (err) {
            console.error('send:', err);
            alert(err.response?.data?.message || 'Failed to send');
        }
    };

    const messagesEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [msgs]);
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };
    
    if (!admin) return <Loader />;
    
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };
    
    return (
        <div className="chat-page">
            <h1>Chat with Admin</h1>
            
            <div className="chat-container">
                <div className="chat-header">
                    <div className="chat-header-avatar">
                        <ion-icon name="person"></ion-icon>
                    </div>
                    <div className="chat-header-info">
                        <h2>Admin Support</h2>
                        <p>{admin.email}</p>
                    </div>
                </div>
                
                <div className="chat-messages">
                    {msgs.length === 0 ? (
                        <div className="empty-chat">
                            <img src="/src/assets/chat-empty.svg" alt="Start a conversation" />
                            <h2>No messages yet</h2>
                            <p>Send a message to start the conversation with admin</p>
                        </div>
                    ) : (
                        msgs.map(m => (
                            <div key={m.id} className={`message ${m.sender_id === admin.id ? 'message-admin' : 'message-user'}`}>
                                {m.content}
                                <span className="message-time">{formatTime(m.created_at)}</span>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="chat-input-container">
                    <input
                        type="text"
                        className="chat-input"
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message here..."
                    />
                    <button className="send-button" onClick={send}>
                        <ion-icon name="paper-plane-outline"></ion-icon>
                    </button>
                </div>
            </div>
        </div>
    );
}