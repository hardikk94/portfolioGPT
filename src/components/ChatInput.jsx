import React, { useRef, useEffect } from 'react';
import styles from './ChatInput.module.css';

export default function ChatInput({ onSend, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [disabled]);

  const handleInput = () => {
    const el = textareaRef.current;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 110) + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const val = textareaRef.current.value.trim();
    if (!val || disabled) return;
    onSend(val);
    textareaRef.current.value = '';
    textareaRef.current.style.height = 'auto';
  };

  return (
    <div className={styles.area}>
      <div className={styles.box}>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Ask anything about Hardik…"
          className={styles.input}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          className={styles.sendBtn}
          onClick={submit}
          disabled={disabled}
          aria-label="Send"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      <div className={styles.hint}>© {new Date().getFullYear()} Hardik Kothari</div>
    </div>
  );
}
