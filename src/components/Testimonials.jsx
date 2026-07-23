import React, { useEffect, useState } from 'react';
import billtrimImg from '../assets/billtrim.jpeg';
import asambhavImg from '../assets/asambhav.jpeg';
import hopscotchImg from '../assets/hopscotch.jpeg';
import accubitsImg from '../assets/accubits.jpeg';
import styles from './Testimonials.module.css';

const AUTO_ADVANCE_MS = 7000;

const TESTIMONIALS = [
  {
    name: 'Dipesh Desai',
    title: 'Founder of AirBills & BillTrim',
    context: 'May 3, 2022 · worked with Hardik on the same team',
    quote: `Hardik is an absolute pleasure to work with. Super smart full stack engineer with lot of patient to work with decision makers. He shows up, day in, day out. I highly recommend him to anyone who wants to work a professional product developer.`,
    image: billtrimImg,
  },
  {
    name: 'Shreyan Mehta',
    title: 'Founder @ Asambhav.in · Fractional CTO for SMEs',
    context: 'December 5, 2020 · worked with Hardik on the same team',
    quote: `Hardik is a great developer, his knowledge in angular, react and overall js is paramount. He is a hard working guy anyone should have in the team, must recommend.`,
    image: asambhavImg,
  },
  {
    name: 'Harika Reddy Challa',
    title: 'Engineering Leader, Amazon',
    context: 'January 1, 2024 · managed Hardik directly',
    quote: `Hardik, an exemplary tech lead, skillfully managed a team of 10-15+ engineers at Hopscotch, playing a pivotal role in successfully delivering numerous business-critical initiatives. He tackles ambiguous tasks head-on, swiftly clarifying and paving the way for his team to consistently achieve exceptional results.\n\nWhat sets Hardik apart is his unwavering dedication to delivering business-critical features within deadlines. His genuine concern for the product, coupled with his consistent advocacy for prioritizing users, is a valuable addition to any team. I wholeheartedly recommend him to any organization.`,
    image: hopscotchImg,
  },
  {
    name: 'Liz Merin George',
    title: 'Blockchain Developer, Accubits',
    context: 'October 14, 2022 · worked with Hardik on the same team',
    quote: `Hardik and I worked together for an innovation project related to Blockchain. He had a great command over the features and use cases of blockchain technology even though he was pretty much new to the space. He is an inspiring technology leader and team player at the same time.\n\nIt was a real pleasure to work with you.`,
    image: accubitsImg,
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  // Depends only on `paused` (not `index`) and uses the functional setState
  // form, so the timer keeps ticking every AUTO_ADVANCE_MS without ever being
  // torn down and rebuilt on each advance.
  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => {
      setDirection(1);
      setIndex(i => (i + 1) % TESTIMONIALS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const goTo = (newIndex, dir) => {
    setDirection(dir);
    setIndex(((newIndex % TESTIMONIALS.length) + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const next = () => goTo(index + 1, 1);
  const prev = () => goTo(index - 1, -1);
  const active = TESTIMONIALS[index];

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.label}>What people say</div>

      <div className={styles.carousel}>
        <button className={styles.navBtn} onClick={prev} aria-label="Previous recommendation">‹</button>

        <div className={styles.cardViewport}>
          <div
            className={`${styles.card} ${direction === 1 ? styles.slideNext : styles.slidePrev}`}
            key={index}
          >
            <img className={styles.photo} src={active.image} alt={active.name} />
            <p className={styles.quote}>{active.quote}</p>
            <div className={styles.name}>{active.name}</div>
            <div className={styles.meta}>{active.title}</div>
            <div className={styles.context}>{active.context}</div>
          </div>
        </div>

        <button className={styles.navBtn} onClick={next} aria-label="Next recommendation">›</button>
      </div>

      <div className={styles.dots}>
        {TESTIMONIALS.map((t, i) => (
          <button
            key={t.name}
            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            onClick={() => goTo(i, i > index ? 1 : -1)}
            aria-label={`Show recommendation from ${t.name}`}
          />
        ))}
      </div>
    </div>
  );
}
