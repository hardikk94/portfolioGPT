import React from 'react';
import styles from './Message.module.css';

export default function Message({ role, html, time }) {
  return (
    <div className={`${styles.group} ${role === 'user' ? styles.user : styles.ai}`}>
      <div className={styles.row}>
        <div className={styles.av}>{role === 'ai' ? 'HK' : '👤'}</div>
        <div
          className={styles.bubble}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <div className={styles.time}>{time}</div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className={`${styles.group} ${styles.ai}`}>
      <div className={styles.row}>
        <div className={styles.av}>HK</div>
        <div className={styles.typingBubble}>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
