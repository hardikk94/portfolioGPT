import React from 'react';
import profilePhoto from '../assets/me.jpg';
import styles from './Message.module.css';

export default function Message({ role, content, time }) {
  return (
    <div className={`${styles.group} ${role === 'user' ? styles.user : styles.ai}`}>
      <div className={styles.row}>
        {role === 'ai' ? (
          <img className={styles.av} src={profilePhoto} alt="Hardik" />
        ) : (
          <div className={styles.av}>👤</div>
        )}
        {role === 'ai' ? (
          // AI replies always come from our own hardcoded topic answers/fallback
          // strings (never raw LLM-generated text), so this HTML is trusted.
          <div className={styles.bubble} dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div className={styles.bubble}>{content}</div>
        )}
      </div>
      <div className={styles.time}>{time}</div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className={`${styles.group} ${styles.ai}`}>
      <div className={styles.row}>
        <img className={styles.av} src={profilePhoto} alt="Hardik" />
        <div className={styles.typingBubble}>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
