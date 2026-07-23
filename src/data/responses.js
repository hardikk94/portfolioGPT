/**
 * Offline keyword-scoring response engine.
 * Topics carry a bag of signal phrases/words. The question is scored against
 * every topic (multi-word phrases score more, single words less), and the
 * highest scorer wins. A secondary "soft fallback" layer catches anything
 * vaguely on-topic that doesn't clear a specific topic's bar, routing it to
 * the most useful general answer instead of a dead-end message.
 */

const TOPICS = [
  {
    id: 'greeting',
    signals: ['hi', 'hey', 'hello', 'hii', 'yo', 'sup', 'namaste', 'good morning', 'good evening', 'good afternoon', 'whats up', "what's up", 'howdy'],
    answer: `Namaste! 👋 I'm Ask Hardik. Ask me anything about his experience, projects, skills, or how to get in touch.<br/><br/>Try asking:<ul><li>What's your current role?</li><li>Tell me about Hopscotch</li><li>What's your tech stack?</li><li>How can I contact Hardik?</li></ul>`
  },
  {
    id: 'smalltalk',
    signals: ['thanks', 'thank you', 'thx', 'ok cool', 'okay cool', 'nice', 'cool', 'great', 'awesome', 'bye', 'goodbye', 'see ya', 'alright', 'got it', 'sounds good'],
    answer: `You're welcome! Feel free to ask anything else about Hardik — his work, projects, skills, or how to get in touch.`
  },
  {
    id: 'about',
    signals: ['who are you', 'tell me about yourself', 'tell me about hardik', 'introduce yourself', 'about hardik', 'summary', 'overview', 'who is hardik', 'describe hardik', 'tell me about him', 'tell me more', 'something interesting', 'what makes him different', 'why should i hire him', 'what makes him special', 'is he good', 'is he good fit', 'good fit for a startup'],
    answer: `Hardik Kothari is a <strong>Senior Software Engineer with 9+ years of experience</strong> building fintech, SaaS, desktop, and communication applications.<br/><br/>Currently <strong>SDE IV at Avalara</strong> (2024–Present), leading a fintech platform handling payments, banking integrations, and compliance. Before that, nearly 6 years at Simform as Technical Lead — scaling Hopscotch from MVP to a <strong>$10M+ funded enterprise product</strong>.<br/><br/>What sets him apart: he's taken a product from zero to $10M+ in funding, has deep fintech/compliance expertise most engineers never touch, and is equally comfortable writing code and leading a team.<br/><br/>Core strengths: <span class="tag">Fintech</span> <span class="tag">React</span> <span class="tag">Node.js</span> <span class="tag">TypeScript</span> <span class="tag">Java</span> <span class="tag">ElectronJS</span> <span class="tag">Microservices</span>`
  },
  {
    id: 'current_role',
    signals: ['current role', 'current job', 'current position', 'current company', 'where work', 'working now', 'working currently', 'job now', 'present role', 'doing now', 'doing currently', 'avalara', 'sde iv', 'sde 4', 'present company', 'what do you do', 'currently do', 'work now', 'where you work'],
    answer: `Hardik is currently a <strong>Senior Software Development Engineer IV at Avalara</strong>, working fully remote from Pune, India (2024–Present).<br/><br/>He leads engineering for a fintech platform handling:<ul><li>Secure payments and bank integrations</li><li>KYC/KYB verification and compliance workflows</li><li>Tokenized payment links and JWT-based auth</li><li>ACH workflows and Evervault encryption</li></ul>Stack: <span class="tag">React</span> <span class="tag">TypeScript</span> <span class="tag">Java</span> <span class="tag">Node.js</span> <span class="tag">Express</span>`
  },
  {
    id: 'years',
    signals: ['how many years', 'how long', 'how much experience', 'years of experience', 'since when', 'how experienced', 'total experience', 'experience do you have', 'years experience'],
    answer: `Hardik has <strong>9+ years of professional software engineering experience</strong> since 2016, across fintech, SaaS, IoT, desktop, and mobile platforms.`
  },
  {
    id: 'experience',
    signals: ['work history', 'work experience', 'career', 'previous job', 'previous company', 'previous companies', 'previous work', 'companies worked', 'where worked', 'past jobs', 'past companies', 'job history', 'employment history', 'companies he worked', 'companies have you worked', 'biggest project', 'experience by company', 'experience with company name', 'company wise experience', 'experience with each company'],
    answer: `Hardik has <strong>9+ years of experience</strong> across 3 companies:<br/><br/><strong>1. Avalara</strong> — SDE IV (2024–Present)<br/>Leading fintech engineering, remote from Pune.<br/><br/><strong>2. Simform</strong> — Technical Lead (2019–2024 · 5yr 11mo)<br/>Led Hopscotch from MVP to a $10M+ funded product — his biggest project to date. Built microservices, micro-frontend architecture, real-time systems.<br/><br/><strong>3. Biztech</strong> — Senior Software Engineer (2017–2019 · 2yr 7mo)<br/>Enterprise apps with Angular, Ionic, ElectronJS. Built Water Expert IoT platform (60% maintenance reduction).`
  },
  {
    id: 'hopscotch',
    signals: ['hopscotch'],
    weight: 3,
    answer: `<strong>Hopscotch</strong> is Hardik's flagship fintech product, built at Simform (2019–2024) from the ground up.<br/><br/>It scaled from MVP to <strong>enterprise with $10M+ in funding</strong>:<ul><li>Payments, bank integrations and compliance</li><li>KYC/KYB verification and fraud prevention</li><li>Real-time features via Socket.IO</li><li>Microservice and micro-frontend architecture</li></ul>Stack: <span class="tag">React</span> <span class="tag">TypeScript</span> <span class="tag">Node.js</span> <span class="tag">NestJS</span> <span class="tag">Java</span> <span class="tag">Socket.IO</span>`
  },
  {
    id: 'products',
    signals: ['products', 'projects', 'apps built', 'apps made', 'apps shipped', 'what built', 'what made', 'what have you built', 'what has he built', 'portfolio projects', 'things built', 'stuff built', 'shipped'],
    answer: `Hardik has shipped 5 major products:<br/><br/><strong>Avalara Capital</strong> — Business credit line platform<br/><span class="tag">React</span> <span class="tag">TypeScript</span> <span class="tag">Java</span> <span class="tag">Node.js</span><br/><br/><strong>Hopscotch</strong> — $10M+ funded fintech platform<br/><span class="tag">React</span> <span class="tag">NestJS</span> <span class="tag">Java</span><br/><br/><strong>YAC</strong> — Async voice collaboration with screen recording<br/><span class="tag">Electron</span> <span class="tag">Vue</span> <span class="tag">React</span><br/><br/><strong>Newton Mail</strong> — Cross-platform email client (Mac/Win/iOS/Android)<br/><span class="tag">Electron</span> <span class="tag">React</span> <span class="tag">TypeScript</span><br/><br/><strong>Water Expert</strong> — IoT industrial monitoring (60% maintenance reduction)<br/><span class="tag">AngularJS</span> <span class="tag">React Native</span>`
  },
  {
    id: 'tech_stack',
    signals: ['tech stack', 'technologies', 'technology', 'skill set', 'skills', 'tools used', 'tools you use', 'programming language', 'programming languages', 'frameworks', 'what tech', 'what tools', 'languages you know', 'stack', 'favorite language', 'strongest skill'],
    answer: `Hardik's full tech stack:<br/><br/><strong>Frontend</strong><br/><span class="tag">React</span> <span class="tag">TypeScript</span> <span class="tag">Angular</span> <span class="tag">Vue.js</span> <span class="tag">Redux</span> <span class="tag">MobX</span> <span class="tag">Micro Frontend</span><br/><br/><strong>Backend</strong><br/><span class="tag">Node.js</span> <span class="tag">Express</span> <span class="tag">Java</span> <span class="tag">NestJS</span> <span class="tag">GraphQL</span> <span class="tag">REST</span> <span class="tag">Socket.IO</span><br/><br/><strong>Cloud and DevOps</strong><br/><span class="tag">AWS</span> <span class="tag">Docker</span> <span class="tag">Kafka</span> <span class="tag">RabbitMQ</span> <span class="tag">CI/CD</span><br/><br/><strong>Databases</strong><br/><span class="tag">PostgreSQL</span> <span class="tag">MongoDB</span> <span class="tag">MySQL</span> <span class="tag">Redis</span> <span class="tag">DynamoDB</span><br/><br/><strong>Desktop and Mobile</strong><br/><span class="tag">ElectronJS</span> <span class="tag">React Native</span> <span class="tag">Ionic</span><br/><br/>His strongest areas are React, TypeScript, Node.js, and fintech system design.`
  },
  {
    id: 'react_skill',
    signals: ['know react', 'good at react', 'react experience', 'react native', 'mobile apps', 'build mobile', 'react native specifically'],
    answer: `Yes — React (and React Native) is one of Hardik's core strengths.<br/><br/>He's used <span class="tag">React</span> across nearly every product he's built: Hopscotch, Avalara Capital, Newton Mail, and YAC. For mobile, he's used <span class="tag">React Native</span> on the Water Expert IoT platform.<br/><br/>He's comfortable building production-grade web and mobile UIs end-to-end, paired with <span class="tag">TypeScript</span>, <span class="tag">Redux</span>, and <span class="tag">MobX</span> for state management.`
  },
  {
    id: 'typescript_skill',
    signals: ['typescript experience', 'know typescript', 'good at typescript', 'typescript'],
    answer: `Yes, <span class="tag">TypeScript</span> is part of Hardik's core stack — he's used it across virtually every major project, including Hopscotch, Avalara Capital, Newton Mail, YAC, and Water Expert.`
  },
  {
    id: 'fullstack',
    signals: ['full stack', 'fullstack', 'frontend or backend', 'frontend and backend'],
    answer: `Hardik is a true full-stack engineer. On the frontend he works with <span class="tag">React</span> <span class="tag">Angular</span> <span class="tag">Vue.js</span> <span class="tag">TypeScript</span>, and on the backend with <span class="tag">Node.js</span> <span class="tag">Java</span> <span class="tag">NestJS</span> <span class="tag">Express</span>. He's also designed system architecture, microservices, and cloud infrastructure — so he covers the full pipeline from UI to deployment.`
  },
  {
    id: 'vue',
    signals: ['vue or react', 'vue.js', 'vuejs', 'vue js'],
    answer: `Hardik has used both — <span class="tag">React</span> is his primary choice for most projects (Hopscotch, Avalara Capital, Newton Mail), while <span class="tag">Vue.js</span> was used on YAC. React is generally his go-to for new projects given his deeper experience with it.`
  },
  {
    id: 'fintech_apis',
    signals: ['fintech api', 'fintech integration', 'payment api', 'payment gateway', 'payment system', 'banking api', 'plaid', 'tabapay', 'sardine', 'socure', 'middesk', 'treasury prime', 'quickbooks', 'evervault', 'apis worked with', 'apis used', 'integrations worked'],
    answer: `Hardik has deep fintech integration experience. APIs and platforms he has worked with:<br/><br/><span class="tag">Plaid</span> <span class="tag">Tabapay</span> <span class="tag">Treasury Prime</span> <span class="tag">Sardine</span> <span class="tag">Socure</span> <span class="tag">Middesk</span> <span class="tag">QuickBooks</span> <span class="tag">Evervault</span><br/><br/>He has built tokenized payment links, UUID-based auth, short-lived JWT, ACH workflows, and delivered a zero-downtime bank migration at Avalara.`
  },
  {
    id: 'education',
    signals: ['education', 'educational', 'degree', 'college', 'university', 'qualification', 'where did he study', 'where did you study', 'academic background', 'educational background', 'msc', 'bsc', 'studied', 'study', 'graduate', 'graduation', 'school'],
    answer: `Hardik's educational background:<br/><br/><strong>B.Sc. CA and IT</strong><br/>K. S. School of Business Management and Information Technology, Gujarat University — 2011 to 2014<br/><br/><strong>M.Sc. CA and IT</strong><br/>K. S. School of Business Management and Information Technology, Gujarat University — 2014 to 2016<br/><br/><strong>Professional Certificate Course in Generative AI and Machine Learning (in progress)</strong><br/>IIT Kanpur — 2025 to 2026`
  },
  {
    id: 'certifications',
    signals: ['certification', 'certifications', 'certificate', 'certificates', 'credential', 'credentials', 'iim', 'udemy', 'iit kanpur', 'training program', 'courses done', 'courses completed'],
    answer: `Hardik holds 3 certifications:<br/><br/><strong>Professional Certificate Course in Generative AI and Machine Learning</strong><br/>IIT Kanpur — 2025 to 2026 (in progress)<br/><br/><strong>Leadership Skills</strong><br/>IIM Ahmedabad — 2025<br/><br/><strong>Master Electron: Desktop Apps</strong><br/>Udemy — 2021`
  },
  {
    id: 'domain',
    signals: ['domain', 'industry', 'sector', 'domain expertise', 'which domain', 'what domain', 'what industry', 'what sector', 'domain experience', 'which industry'],
    answer: `Hardik's primary domain is <strong>Fintech</strong> — most of his career has been building payment platforms, banking integrations, and compliance systems (KYC/KYB, ACH, fraud prevention) at Avalara and Simform.<br/><br/>He also has experience in <span class="tag">SaaS</span>, <span class="tag">IoT</span>, and <span class="tag">Enterprise/Desktop</span> applications from earlier roles at Biztech.`
  },
  {
    id: 'react_years',
    signals: ['relevant experience in react', 'years of experience in react', 'react years of experience', 'how many years of react', 'react experience in years'],
    weight: 2,
    answer: `Hardik has <strong>6 years</strong> of relevant hands-on experience with <span class="tag">React</span>, using it across nearly every major product he's built — Hopscotch, Avalara Capital, Newton Mail, and YAC.`
  },
  {
    id: 'frontend_years',
    signals: ['relevant experience in frontend', 'years of experience in frontend', 'frontend years of experience', 'how many years of frontend', 'frontend experience in years'],
    weight: 2,
    answer: `Hardik has <strong>9 years</strong> of relevant frontend experience, spanning <span class="tag">React</span>, <span class="tag">Angular</span>, <span class="tag">Vue.js</span>, and <span class="tag">TypeScript</span> across web, desktop (Electron), and mobile.`
  },
  {
    id: 'backend_years',
    signals: ['relevant experience in backend', 'years of experience in backend', 'backend years of experience', 'how many years of backend', 'backend experience in years'],
    weight: 2,
    answer: `Hardik has <strong>4 years</strong> of relevant backend experience, building APIs and services with <span class="tag">Node.js</span>, <span class="tag">NestJS</span>, <span class="tag">Java</span>, and <span class="tag">GraphQL</span> — largely in fintech systems handling payments and compliance.`
  },
  {
    id: 'node_mongo_postgres_years',
    signals: ['relevant experience in node.js mongo postgresql', 'years of experience in node mongo postgresql', 'node mongo postgresql experience', 'nodejs mongo postgresql years', 'experience with node mongo and postgresql'],
    weight: 2,
    answer: `Hardik has <strong>3 years</strong> of relevant experience specifically with the <span class="tag">Node.js</span> + <span class="tag">MongoDB</span> + <span class="tag">PostgreSQL</span> stack, building backend services and data layers for production systems.`
  },
  {
    id: 'java_years',
    signals: ['relevant experience in java', 'years of experience in java', 'java years of experience', 'how many years of java', 'java experience in years'],
    weight: 2,
    answer: `Hardik has <strong>1 year</strong> of relevant hands-on experience with <span class="tag">Java</span>, primarily used for secure backend and payment infrastructure in fintech systems at Avalara and Simform.`
  },
  {
    id: 'team_size',
    signals: ['team size managed', 'team size', 'size of team', 'how many people does he manage', 'team he manage', 'manage a team of', 'handle a team of', 'people he managed', 'engineers he managed', 'team he led'],
    weight: 2,
    answer: `Hardik has led and managed engineering teams of up to <strong>7 people</strong>, running sprint planning, architecture reviews, and mentoring across Avalara, Simform, and Biztech.`
  },
  {
    id: 'electron',
    signals: ['electronjs', 'electron js', 'electron', 'desktop app', 'desktop apps', 'newton mail', 'newton', 'cross platform desktop'],
    answer: `Hardik is an expert in <strong>ElectronJS</strong> and has shipped two major desktop apps:<br/><br/><strong>Newton Mail</strong> — A full-featured email client acquired from CloudMagic, running on Mac, Windows, iOS and Android.<br/><span class="tag">Electron</span> <span class="tag">React</span> <span class="tag">TypeScript</span><br/><br/><strong>YAC</strong> — Async voice messaging and screen recording for teams.<br/><span class="tag">Electron</span> <span class="tag">Vue</span> <span class="tag">React</span><br/><br/>He is also Udemy-certified in Electron development.`
  },
  {
    id: 'leadership',
    signals: ['leadership', 'leader', 'mentor', 'mentoring', 'manage', 'management', 'managing', 'team lead', 'architect', 'sprint planning', 'engineering team', 'mentored', 'led a team', 'led teams'],
    answer: `Hardik has strong engineering leadership experience:<ul><li>Led and mentored engineering teams at Avalara, Simform and Biztech</li><li>Ran sprint planning, architecture reviews and design discussions</li><li>Designed microservice and micro-frontend architectures</li><li>Built CI/CD pipelines and release automation</li><li>Scaled Hopscotch from MVP to $10M+ funded product</li><li>Certified in Leadership Skills at IIM Ahmedabad (2025)</li></ul>`
  },
  {
    id: 'iot',
    signals: ['iot', 'water expert', 'biztech', 'industrial monitoring', 'sensor', 'sensors'],
    answer: `At <strong>Biztech (2017–2019)</strong>, Hardik built the <strong>Water Expert IoT platform</strong> — an industrial equipment monitoring system that reduced manual maintenance effort by <strong>60%</strong>.<br/><br/>Stack: <span class="tag">AngularJS</span> <span class="tag">TypeScript</span> <span class="tag">React Native</span><br/><br/>He also established CI/CD pipelines and mentored the engineering team there.`
  },
  {
    id: 'cloud',
    signals: ['aws', 'cloud experience', 'cloud tools', 'cloud infra', 'docker', 'kafka', 'devops', 'ci/cd', 'cicd', 'infrastructure', 'lambda', 's3', 'deployment'],
    answer: `Hardik's cloud and DevOps experience:<br/><br/><span class="tag">AWS Lambda</span> <span class="tag">AWS S3</span> <span class="tag">Docker</span> <span class="tag">Kafka</span> <span class="tag">RabbitMQ</span> <span class="tag">CI/CD</span><br/><br/>He has built automated deployment workflows at scale and delivered a <strong>zero-downtime banking service migration</strong> at Avalara.`
  },
  {
    id: 'realtime',
    signals: ['socket.io', 'socketio', 'socket io', 'real time', 'realtime', 'websocket', 'live data', 'live sync'],
    answer: `Hardik built real-time systems using <span class="tag">Socket.IO</span> at Simform — implementing encrypted live data synchronization for Hopscotch and real-time collaboration features in YAC.`
  },
  {
    id: 'backend',
    signals: ['java', 'backend', 'back end', 'server side', 'node.js', 'nodejs', 'node js', 'nestjs', 'nest js', 'graphql', 'api development', 'rest api'],
    answer: `Hardik's backend expertise:<br/><br/><span class="tag">Node.js</span> <span class="tag">Express</span> <span class="tag">NestJS</span> <span class="tag">Java</span> <span class="tag">GraphQL</span> <span class="tag">REST APIs</span> <span class="tag">Socket.IO</span><br/><br/>Strong Java experience in fintech — building secure payment infrastructure, compliance systems, and ACH workflows at Avalara and Simform.`
  },
  {
    id: 'location',
    signals: ['where is he', 'where are you', 'where does he live', 'where is hardik', 'location', 'located', 'based in', 'city', 'pune', 'remote work', 'which city', 'lives in', 'can he relocate', 'relocate', 'work weekends'],
    answer: `Hardik is based in <strong>Pune, Maharashtra, India</strong>. He currently works fully remote as SDE IV at Avalara. He has worked both remotely and on-site across Pune, Ahmedabad, and Bengaluru.<br/><br/>For specifics on relocation or working hours, the best route is to reach out directly — hardikkothari46@gmail.com.`
  },
  {
    id: 'contact',
    signals: ['contact', 'reach him', 'reach hardik', 'reach out', 'email', 'hire', 'hire him', 'connect', 'get in touch', 'phone number', 'how to reach', 'how to contact', 'available for hire', 'is he available', 'looking for a job', 'freelance', 'notice period', 'salary expectation', 'linkedin', 'github', 'portfolio link'],
    answer: `You can reach Hardik through:<br/><br/><strong>Email</strong> — hardikkothari46@gmail.com<br/><strong>Phone</strong> — +91 70165 33746<br/><strong>Portfolio</strong> — hellohardik.framer.ai<br/><strong>LinkedIn</strong> — linkedin.com/in/dev-hardik-kothari<br/><br/>He's open to new opportunities — for specifics like availability, notice period, or rates, it's best to reach out directly.`
  },
  {
    id: 'resume',
    signals: ['resume', 'cv', 'download cv', 'download resume'],
    answer: `Download Hardik's resume using the <strong>Download Resume</strong> button in the left panel. It has his full work history, skills, education, and certifications.`
  },
  {
    id: 'personal',
    signals: ['age', 'married', 'favorite', 'personal life'],
    answer: `I'm focused on Hardik's professional background — his work, projects, skills, and experience. For anything more personal, the best way to ask is directly: hardikkothari46@gmail.com.`
  },
  {
    id: 'hobbies',
    signals: ['hobby', 'hobbies', 'free time', 'interests', 'extracurricular', 'extra curricular', 'pastime', 'what does he do for fun', 'outside of work', 'personal interests', 'yoga'],
    answer: `Outside of work, Hardik enjoys <strong>swimming</strong>, <strong>reading books</strong>, <strong>travelling</strong>, and <strong>cooking</strong>.<br/><br/>He's also a <strong>certified Yoga Instructor</strong>, certified by the Government of Gujarat.`
  },
];

// Generic on-topic words that, if present, route to the most useful general
// answer (about / tech_stack) rather than the dead-end fallback message.
// This only fires when no specific topic scored anything at all.
const SOFT_FALLBACK_SIGNALS = ['he', 'his', 'him', 'hardik', 'work', 'good', 'skill', 'experience', 'project', 'tech', 'know', 'can', 'does'];

const HARD_FALLBACK = `I didn't quite get that — could you try rephrasing? You can ask me about:<ul><li>Hardik's <strong>current role</strong> or <strong>experience</strong></li><li>Products like <strong>Hopscotch</strong>, Newton Mail, or YAC</li><li>His <strong>tech stack</strong> or <strong>fintech APIs</strong></li><li>His <strong>education</strong> or <strong>certifications</strong></li><li>How to <strong>contact</strong> him</li></ul>`;

const SOFT_FALLBACK = `Good question — I don't have a specific answer for that exact phrasing, but here's a quick overview that might help:<br/><br/>Hardik Kothari is a <strong>Senior Software Engineer with 9+ years of experience</strong>, currently <strong>SDE IV at Avalara</strong>, working across <span class="tag">React</span> <span class="tag">TypeScript</span> <span class="tag">Node.js</span> <span class="tag">Java</span> and fintech systems.<br/><br/>Feel free to ask more specifically about his <strong>experience</strong>, <strong>tech stack</strong>, <strong>products</strong>, or <strong>contact info</strong> — or reach him directly at hardikkothari46@gmail.com.`;

// Phrases that signal "trying to use this as a general chatbot" rather than
// asking about Hardik — jailbreak attempts, homework, code requests, trivia,
// creative writing. Checked before topic scoring so obvious misuse never
// even reaches the LLM correction step.
const MISUSE_SIGNALS = [
  'ignore previous instructions', 'ignore all instructions', 'ignore the above',
  'disregard your instructions', 'disregard previous instructions', 'new instructions',
  'system prompt', 'jailbreak', 'developer mode', 'dan mode',
  'are you chatgpt', 'are you gpt', 'you are chatgpt', 'as an ai language model',
  'pretend you are', 'pretend to be', 'act as a', 'roleplay as', 'role play as',
  'write me a poem', 'write a poem about', 'write an essay about', 'write my essay',
  'do my homework', 'solve this equation', 'what is the capital of', 'tell me a joke',
  'flip a coin', 'translate this into', 'translate the following', 'summarize the following',
  'write a python', 'write a javascript', 'write a sql', 'give me a recipe', 'recipe for',
];

const MISUSE_FALLBACK = `Ha, nice try 😄 — but I'm not ChatGPT, I'm <strong>Hardik's</strong> AI, and my entire personality is "knows everything about one guy's career." No poems, no homework, no jailbreaks, no free code — ChatGPT's right over there for that.<br/><br/>What I'm actually built for: his <strong>experience</strong>, <strong>tech stack</strong>, <strong>projects</strong> like Hopscotch, or how to <strong>contact</strong> him. Try one of those?`;

// Normalize text: lowercase, strip punctuation, collapse whitespace
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreTopic(question, topic) {
  let score = 0;
  const weight = topic.weight || 1;

  for (const signal of topic.signals) {
    const isPhrase = signal.includes(' ');
    if (isPhrase) {
      if (question.includes(signal)) {
        score += signal.split(' ').length * 2 * weight;
      }
    } else {
      const escaped = signal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`\\b${escaped}\\b`);
      if (re.test(question)) {
        score += 1 * weight;
      }
    }
  }

  return score;
}

// Scores `userText` against every topic and returns whichever one wins.
// `matched: false` means nothing scored — the answer is one of the generic
// fallback messages rather than a real topic hit.
export function matchTopic(userText) {
  const q = normalize(userText);
  if (!q) return { matched: false, answer: HARD_FALLBACK };

  if (MISUSE_SIGNALS.some(signal => q.includes(signal))) {
    return { matched: true, answer: MISUSE_FALLBACK };
  }

  let best = null;
  let bestScore = 0;

  for (const topic of TOPICS) {
    const score = scoreTopic(q, topic);
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  if (best && bestScore >= 1) {
    return { matched: true, answer: best.answer };
  }

  // Nothing scored at all — check if the question is at least vaguely
  // on-topic before giving up entirely.
  const isVaguelyOnTopic = SOFT_FALLBACK_SIGNALS.some(word => {
    const re = new RegExp(`\\b${word}\\b`);
    return re.test(q);
  });

  return { matched: false, answer: isVaguelyOnTopic ? SOFT_FALLBACK : HARD_FALLBACK };
}

export function getResponse(userText) {
  return matchTopic(userText).answer;
}

export { TOPICS };

export const STARTER_CHIPS = [
  'Current role?',
  'Tech stack?',
  'Experience by company?',
  'Education?',
  'Domain?',
  'How to contact?',
  'Relevant experience in React?',
  'Relevant experience in Frontend?',
  'Relevant experience in Backend?',
  'Relevant experience in Node.js, Mongo & PostgreSQL?',
  'Relevant experience in Java?',
  'Team size managed?',
];
