import React, { useState, useRef, useEffect } from 'react';
import Message, { TypingIndicator } from './Message';
import ChatInput from './ChatInput';
import Testimonials from './Testimonials';
import { getResponse, STARTER_CHIPS } from '../data/responses';
import { fetchLlmReply } from '../utils/llm';
import profilePhoto from '../assets/me.jpg';
import resumePdf from '../assets/Hardik-Kothari-Resume.pdf';
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
        <a
          className={styles.scheduleBtn}
          href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Chat+with+Hardik+Kothari&details=Scheduled+via+the+portfolio+chat.&add=hardikkothari46@gmail.com"
          target="_blank"
          rel="noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={styles.scheduleBtnText}>Schedule a call</span>
        </a>
        <a className={styles.downloadBtn} href={resumePdf} download="Hardik-Kothari-Resume.pdf">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15V3" /><path d="M7 10l5 5 5-5" /><path d="M3 19h18" />
          </svg>
          <span className={styles.scheduleBtnText}>Resume</span>
        </a>
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

        {/* Client recommendations */}
        <Testimonials />

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
