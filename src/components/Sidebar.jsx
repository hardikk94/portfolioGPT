import React from 'react';
import styles from './Sidebar.module.css';
import profilePhoto from '../assets/me.jpg';

const FACTS = [
  { label: 'Current',    value: 'Avalara · Remote' },
  { label: 'Location',   value: 'Pune, India' },
  { label: 'Experience', value: '9+ years' },
  { label: 'Education',  value: ['M.Sc. IT · Gujarat University', 'GenAI/ML Cert. · IIT Kanpur'] },
];

const STACK_HI  = ['React', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'ElectronJS'];
const STACK_LO  = ['AWS', 'Docker', 'Kafka', 'Redis', 'Java'];

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
        <img className={styles.avatar} src={profilePhoto} alt="Hardik Kothari" />
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
              {Array.isArray(f.value) ? (
                f.value.map(line => <span key={line} className={styles.factValue}>{line}</span>)
              ) : (
                <span className={styles.factValue}>{f.value}</span>
              )}
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

    </aside>
  );
}
