import React from 'react';
import styles from './Sidebar.module.css';

const FACTS = [
  { label: 'Current',    value: 'Avalara · Remote' },
  { label: 'Location',   value: 'Pune, India' },
  { label: 'Experience', value: '9+ years' },
  { label: 'Education',  value: 'IIT Kanpur · M.Sc. IT' },
];

const STACK_HI  = ['React', 'TypeScript', 'Node.js', 'Java'];
const STACK_LO  = ['ElectronJS', 'AWS', 'PostgreSQL', 'Docker', 'Kafka', 'Redis'];

const LINKS = [
  { icon: '🔗', label: 'hellohardik.framer.ai', href: 'https://hellohardik.framer.ai' },
  { icon: '💼', label: 'LinkedIn',               href: 'https://linkedin.com/in/dev-hardik-kothari' },
  { icon: '✉️', label: 'hardikkothari46@gmail.com', href: 'mailto:hardikkothari46@gmail.com' },
];

export default function Sidebar() {
  return (
    <aside className={styles.panel}>

      {/* Profile */}
      <div className={styles.profile}>
        <div className={styles.avatar}>HK</div>
        <div className={styles.name}>Hardik Kothari</div>
        <div className={styles.role}>Senior SDE IV · Fintech &amp; Full-Stack</div>
        <span className={styles.status}>Available for opportunities</span>
      </div>

      <div className={styles.divider} />

      {/* Facts */}
      <div>
        <div className={styles.label}>About</div>
        <div className={styles.facts}>
          {FACTS.map(f => (
            <div key={f.label} className={styles.fact}>
              <span className={styles.factLabel}>{f.label}</span>
              <span className={styles.factValue}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Stack */}
      <div>
        <div className={styles.label}>Stack</div>
        <div className={styles.tags}>
          {STACK_HI.map(t => (
            <span key={t} className={`${styles.tag} ${styles.tagHi}`}>{t}</span>
          ))}
          {STACK_LO.map(t => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Links */}
      <div>
        <div className={styles.label}>Links</div>
        <div className={styles.links}>
          {LINKS.map(l => (
            <a key={l.label} className={styles.link} href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer">
              <span className={styles.linkIcon}>{l.icon}</span>
              {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* Download */}
      <a className={styles.download} href="/Hardik-Kothari-Resume.pdf" download>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15V3"/><path d="M7 10l5 5 5-5"/><path d="M3 19h18"/>
        </svg>
        Download Resume
      </a>

    </aside>
  );
}
