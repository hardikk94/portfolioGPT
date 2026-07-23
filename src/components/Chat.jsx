import React, { useState, useRef, useEffect } from 'react';
import Message, { TypingIndicator } from './Message';
import ChatInput from './ChatInput';
import { getResponse, STARTER_CHIPS } from '../data/responses';
import { fetchLlmReply } from '../utils/llm';
import profilePhoto from '../assets/me.jpg';
import styles from './Chat.module.css';

const REQUEST_TIMEOUT_MS = 15000;

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const [messages, setMessages]   = useState([]);
  const [typing, setTyping]       = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text, time: getTime() }]);
    setTyping(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const reply = await fetchLlmReply(text, { signal: controller.signal });
      setMessages(prev => [...prev, { role: 'ai', content: reply, time: getTime() }]);
    } catch (err) {
      // API unreachable, rate-limited, or timed out — fall back to the offline
      // bot so the chat still always answers something useful.
      setMessages(prev => [...prev, { role: 'ai', content: getResponse(text), time: getTime() }]);
    } finally {
      clearTimeout(timeoutId);
      setTyping(false);
    }
  };

  return (
    <div className={styles.chat}>
      <div className={styles.aurora} aria-hidden="true" />

      {/* Top bar */}
      <div className={styles.bar}>
        <img className={styles.barAv} src={profilePhoto} alt="Hardik Kothari" />
        <div>
          <div className={styles.barName}>Ask Hardik</div>
          <div className={styles.barSub}>
            <span className={styles.onlineDot} />
            Online · Ask me anything
          </div>
        </div>
      </div>

      {/* Sticky quick-question bar — always visible, never scrolls away */}
      <div className={styles.stickyChips}>
        {STARTER_CHIPS.map((chip, i) => (
          <button
            key={chip}
            className={styles.chip}
            style={{ '--i': i }}
            onClick={() => handleSend(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className={styles.messages}>

        {/* Hero */}
        <div className={styles.hero}>
          <img className={styles.heroAv} src={profilePhoto} alt="Hardik Kothari" />
          <div className={styles.heroName}>नमस्ते <span className={styles.wave}>👋</span></div>
          <div className={styles.heroSub}>I'm Hardik's bot — trained on his full background</div>
          <div className={styles.heroLine}>Ask me about his experience, projects, skills, education, or anything else.</div>
        </div>

        {/* Message list */}
        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} time={m.time} />
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
