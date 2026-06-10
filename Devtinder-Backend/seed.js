/**
 * Seed script – inserts 55 mock Indian developer profiles
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const bcrypt    = require('bcrypt');
require('dotenv').config();

const connectDB = require('./src/config/database');
const User      = require('./src/models/user');

// ── Data ────────────────────────────────────────────────────────────────────

const maleFirstNames = [
  'Aarav','Arjun','Vivek','Rohan','Karan','Akash','Nikhil','Rahul',
  'Siddharth','Pranav','Aditya','Vikram','Rishi','Mohit','Gaurav',
  'Sanjeev','Deepak','Hardik','Yash','Tushar','Chirag','Kunal',
  'Amit','Suresh','Varun','Ankit','Dev','Ishan','Prateek','Shubham',
];

const femaleFirstNames = [
  'Priya','Ananya','Neha','Pooja','Sneha','Ritika','Deepika',
  'Kavya','Divya','Nisha','Meera','Aishwarya','Shreya','Swati',
  'Pallavi','Anjali','Riya','Simran','Tanvi','Lavanya','Aditi',
  'Bhavna','Mansi','Bhumi','Sonal',
];

const lastNames = [
  'Sharma','Verma','Patel','Kumar','Singh','Gupta','Joshi','Mehta',
  'Agarwal','Rao','Nair','Iyer','Reddy','Shah','Mishra','Bose',
  'Banerjee','Tiwari','Pandey','Kapoor','Malhotra','Sinha','Desai',
  'Chopra','Sethi',
];

const allSkillSets = [
  ['JavaScript','React','Node.js','MongoDB'],
  ['TypeScript','Next.js','PostgreSQL','Docker'],
  ['Python','Django','REST API','AWS'],
  ['Java','Spring Boot','MySQL','Kubernetes'],
  ['Go','gRPC','Redis','Linux'],
  ['React','Redux','Tailwind CSS','Firebase'],
  ['Node.js','Express','GraphQL','MongoDB'],
  ['Python','FastAPI','PostgreSQL','Docker'],
  ['DevOps','CI/CD','Terraform','AWS'],
  ['Flutter','Dart','Firebase','Android'],
  ['React Native','JavaScript','Expo','REST API'],
  ['Vue.js','Nuxt.js','Node.js','MySQL'],
  ['Angular','TypeScript','Spring Boot','MySQL'],
  ['Machine Learning','Python','TensorFlow','Pandas'],
  ['Data Science','Python','Scikit-learn','SQL'],
  ['Blockchain','Solidity','Web3.js','Ethereum'],
  ['Rust','WebAssembly','C++','Linux'],
  ['iOS','Swift','Xcode','Objective-C'],
  ['Android','Kotlin','Jetpack Compose','Firebase'],
  ['Full Stack','React','Node.js','PostgreSQL'],
];

const bios = [
  'Passionate developer who loves building scalable web apps.',
  'Open source contributor. Coffee-driven developer ☕.',
  'Building products that matter. 3 years of industry experience.',
  'Love clean code, great UX, and strong chai.',
  'Backend wizard who occasionally ventures into the frontend.',
  'CS grad from IIT. Currently working at a Bangalore startup.',
  'Remote developer. Loves mountains and side projects.',
  'Full-stack dev by day, gamer by night.',
  'Code, cricket, and chai – in that order.',
  'Senior engineer at a fintech company. Building the future of payments.',
  'Indie hacker. Launched 3 products. Still searching for PMF.',
  'Ex-Flipkart engineer. Now building my own SaaS.',
  '5× hackathon winner. Loves rapid prototyping.',
  'DevOps engineer passionate about automating everything.',
  'Frontend perfectionist. Pixel-perfect UIs only.',
  'Data engineer at a Pune startup. SQL enthusiast.',
  'Machine learning nerd. Published 2 papers.',
  'Obsessed with performance optimisation and system design.',
  'Teaching 10k+ students on YouTube while coding at work.',
  'NIT alumnus. Loves DSA and competitive programming.',
];

// Portrait CDN – randomuser.me (stable URLs, no API call needed)
// /men/1-99, /women/1-99
const malePortraits  = Array.from({ length: 30 }, (_, i) => `https://randomuser.me/api/portraits/men/${i + 1}.jpg`);
const femalePortraits = Array.from({ length: 25 }, (_, i) => `https://randomuser.me/api/portraits/women/${i + 1}.jpg`);

// ── Helpers ──────────────────────────────────────────────────────────────────

const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const range = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function buildUser(firstName, lastName, gender, photoUrl, index) {
  return {
    firstName,
    lastName,
    emailId: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@devtinder.in`,
    password: 'PLACEHOLDER',   // will be replaced with hash below
    age: range(21, 34),
    gender,
    skills: pick(allSkillSets),
    bio: pick(bios),
    photoUrl,
  };
}

// ── Build raw list ────────────────────────────────────────────────────────────

const rawUsers = [];

maleFirstNames.forEach((fn, i) => {
  rawUsers.push(buildUser(fn, pick(lastNames), 'Male', malePortraits[i % malePortraits.length], i));
});

femaleFirstNames.forEach((fn, i) => {
  rawUsers.push(buildUser(fn, pick(lastNames), 'Female', femalePortraits[i % femalePortraits.length], i));
});

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Hash password once – reuse for all seed users
    const hashedPassword = await bcrypt.hash('Seed@1234', 10);
    const docs = rawUsers.map((u) => ({ ...u, password: hashedPassword }));

    // Remove previous seed users (identified by @devtinder.in domain)
    const deleted = await User.deleteMany({ emailId: /@devtinder\.in$/ });
    console.log(`🗑  Removed ${deleted.deletedCount} existing seed users`);

    const inserted = await User.insertMany(docs, { ordered: false });
    console.log(`🌱 Inserted ${inserted.length} mock users successfully!`);
    console.log('   Login with any of these accounts using password: Seed@1234');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
