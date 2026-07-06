import React from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import './index.css';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <Chat />
    </div>
  );
}
