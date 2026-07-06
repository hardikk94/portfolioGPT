import React, { useState, useRef, useEffect } from 'react';
import Message, { TypingIndicator } from './Message';
import ChatInput from './ChatInput';
import { getResponse, STARTER_CHIPS } from '../data/responses';
import styles from './Chat.module.css';

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const [messages, setMessages]   = useState([]);
  const [typing, setTyping]       = useState(false);
  const [chipsVisible, setChipsVisible] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = (text) => {
    setChipsVisible(false);
    setMessages(prev => [...prev, { role: 'user', html: text, time: getTime() }]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'ai', html: getResponse(text), time: getTime() },
      ]);
    }, 500 + Math.random() * 400);
  };

  return (
    <div className={styles.chat}>

      {/* Top bar */}
      <div className={styles.bar}>
        <div className={styles.barAv}>HK</div>
        <div>
          <div className={styles.barName}>Hardik's AI</div>
          <div className={styles.barSub}>
            <span className={styles.onlineDot} />
            Online · Ask me anything
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroAv}>HK</div>
          <div className={styles.heroName}>नमस्ते 👋</div>
          <div className={styles.heroSub}>I'm Hardik's AI — trained on his full background</div>
          <div className={styles.heroLine}>Ask me about his experience, projects, skills, education, or anything else.</div>
        </div>

        {/* Starter chips */}
        {chipsVisible && (
          <div className={styles.chips}>
            {STARTER_CHIPS.map(chip => (
              <button
                key={chip}
                className={styles.chip}
                onClick={() => handleSend(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Message list */}
        {messages.map((m, i) => (
          <Message key={i} role={m.role} html={m.html} time={m.time} />
        ))}

        {/* Typing indicator */}
        {typing && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={typing} />

    </div>
  );
}
