import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

// ═══════════════════════════════════════════════════════════════════════════════
// MODELS
// ═══════════════════════════════════════════════════════════════════════════════

class JobBudget {
  final int? min;
  final int? max;
  final int? amount;
  final String currency;
  const JobBudget({this.min, this.max, this.amount, this.currency = 'USD'});
}

class JobClient {
  final String name;
  final String location;
  final bool verified;
  final bool paymentVerified;
  final double rating;
  final String spent;
  final int jobs;
  const JobClient({
    required this.name,
    required this.location,
    this.verified = false,
    this.paymentVerified = false,
    this.rating = 0,
    this.spent = '',
    this.jobs = 0,
  });
}

class Job {
  final int id;
  final String title;
  final String type; // 'hourly' | 'fixed'
  final JobBudget budget;
  final String posted;
  final String description;
  final List<String> skills;
  final String duration;
  final String level;
  final int proposals;
  final JobClient client;
  final bool saved;
  final String category;
  const Job({
    required this.id,
    required this.title,
    required this.type,
    required this.budget,
    required this.posted,
    required this.description,
    required this.skills,
    required this.duration,
    required this.level,
    required this.proposals,
    required this.client,
    this.saved = false,
    required this.category,
  });
}

class Freelancer {
  final int id;
  final String name;
  final String title;
  final String initials;
  final LinearGradient gradient;
  final String location;
  final int jss;
  final int hourlyRate;
  final String currency;
  final String totalEarnings;
  final List<String> skills;
  final String bio;
  final int completedJobs;
  final double rating;
  final bool available;
  final bool topRated;
  const Freelancer({
    required this.id,
    required this.name,
    required this.title,
    required this.initials,
    required this.gradient,
    required this.location,
    required this.jss,
    required this.hourlyRate,
    this.currency = 'USD',
    required this.totalEarnings,
    required this.skills,
    required this.bio,
    required this.completedJobs,
    required this.rating,
    this.available = true,
    this.topRated = false,
  });
}

class ChatMessage {
  final int id;
  final String sender; // 'me' | 'them'
  final String text;
  final String time;
  const ChatMessage({
    required this.id,
    required this.sender,
    required this.text,
    required this.time,
  });
}

class Milestone {
  final int id;
  final String name;
  final int amount;
  final String status; // 'approved' | 'in_review' | 'funded' | 'pending'
  final String dueDate;
  const Milestone({
    required this.id,
    required this.name,
    required this.amount,
    required this.status,
    required this.dueDate,
  });
}

class Contract {
  final int id;
  final String title;
  final String client;
  final String freelancer;
  final int totalAmount;
  final String currency;
  final String status;
  final List<Milestone> milestones;
  const Contract({
    required this.id,
    required this.title,
    required this.client,
    required this.freelancer,
    required this.totalAmount,
    this.currency = 'USD',
    required this.status,
    required this.milestones,
  });
}

class ChatThread {
  final int id;
  final String contact;
  final String initials;
  final LinearGradient gradient;
  final String lastMessage;
  final String time;
  final int unread;
  final String type; // 'contract' | 'interview'
  final bool online;
  const ChatThread({
    required this.id,
    required this.contact,
    required this.initials,
    required this.gradient,
    required this.lastMessage,
    required this.time,
    this.unread = 0,
    required this.type,
    this.online = false,
  });
}

class JobCategory {
  final IconData icon;
  final String label;
  final String count;
  final LinearGradient gradient;
  const JobCategory({
    required this.icon,
    required this.label,
    required this.count,
    required this.gradient,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const kJobs = <Job>[
  Job(
    id: 1,
    title: 'Full-Stack React / Node.js Developer for FinTech Dashboard',
    type: 'hourly',
    budget: JobBudget(min: 25, max: 45, currency: 'USD'),
    posted: '2 hours ago',
    description:
        'We are building a mobile money aggregation platform for the CEMAC region. We need an experienced React developer with Node.js backend skills to build our analytics dashboard with real-time transaction tracking.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST API'],
    duration: '3–6 months',
    level: 'Expert',
    proposals: 12,
    client: JobClient(
      name: 'MTN FinTech Lab',
      location: 'Douala, Cameroon',
      verified: true,
      paymentVerified: true,
      rating: 4.9,
      spent: '\$12,400',
      jobs: 8,
    ),
    saved: false,
    category: 'Web Development',
  ),
  Job(
    id: 2,
    title: 'Brand Identity & Logo Design for Pan-African E-Commerce Startup',
    type: 'fixed',
    budget: JobBudget(amount: 850, currency: 'USD'),
    posted: '5 hours ago',
    description:
        'Looking for a talented designer to create a compelling brand identity for our cross-border e-commerce platform targeting 5 African markets. Must deliver logo, color system, and brand guidelines.',
    skills: ['Logo Design', 'Brand Identity', 'Adobe Illustrator', 'Figma'],
    duration: '1–2 weeks',
    level: 'Intermediate',
    proposals: 7,
    client: JobClient(
      name: 'Afrikart Commerce',
      location: 'Nairobi, Kenya',
      verified: true,
      paymentVerified: true,
      rating: 4.7,
      spent: '\$3,200',
      jobs: 3,
    ),
    saved: true,
    category: 'Design & Creative',
  ),
  Job(
    id: 3,
    title: 'Bilingual Content Writer — French & English Tech Articles',
    type: 'fixed',
    budget: JobBudget(amount: 150000, currency: 'XAF'),
    posted: '1 day ago',
    description:
        'We publish a weekly newsletter on African tech startups and need a bilingual writer producing in-depth articles in both French and English. SEO and audience-first writing a must.',
    skills: ['Content Writing', 'French', 'English', 'Tech Journalism', 'SEO'],
    duration: 'Ongoing',
    level: 'Intermediate',
    proposals: 19,
    client: JobClient(
      name: 'TechAfrique Media',
      location: 'Yaoundé, Cameroon',
      verified: true,
      paymentVerified: false,
      rating: 4.5,
      spent: 'XAF 680,000',
      jobs: 14,
    ),
    saved: false,
    category: 'Writing & Translation',
  ),
  Job(
    id: 4,
    title: 'Flutter Developer — Cross-Platform AgriTech Mobile App',
    type: 'hourly',
    budget: JobBudget(min: 20, max: 35, currency: 'USD'),
    posted: '2 days ago',
    description:
        'Building a crop monitoring and market price app for smallholder farmers across West Africa. Offline-first architecture is a critical requirement — users often work in low-connectivity rural environments.',
    skills: ['Flutter', 'Dart', 'Firebase', 'REST API', 'UI/UX'],
    duration: '4–6 months',
    level: 'Expert',
    proposals: 5,
    client: JobClient(
      name: 'GreenField AgriTech',
      location: 'Lagos, Nigeria',
      verified: true,
      paymentVerified: true,
      rating: 5.0,
      spent: '\$28,100',
      jobs: 12,
    ),
    saved: false,
    category: 'Mobile Development',
  ),
  Job(
    id: 5,
    title: 'Virtual Assistant — Customer Support for SaaS Platform',
    type: 'hourly',
    budget: JobBudget(min: 5, max: 10, currency: 'USD'),
    posted: '3 days ago',
    description:
        'Seeking a detail-oriented VA to handle customer support tickets, onboarding emails, and basic administrative tasks for our growing B2B SaaS platform. Must be fluent in French and English.',
    skills: ['Customer Support', 'Zendesk', 'Email Management', 'French', 'Excel'],
    duration: 'Long-term',
    level: 'Entry',
    proposals: 34,
    client: JobClient(
      name: 'CloudOps Cameroon',
      location: 'Bafoussam, Cameroon',
      verified: true,
      paymentVerified: true,
      rating: 4.6,
      spent: '\$5,900',
      jobs: 21,
    ),
    saved: true,
    category: 'Admin Support',
  ),
];

final kFreelancers = <Freelancer>[
  Freelancer(
    id: 1,
    name: 'Diane Ngono',
    title: 'Senior React & TypeScript Developer',
    initials: 'DN',
    gradient: AppColors.gradientBlue,
    location: 'Douala, Cameroon',
    jss: 97,
    hourlyRate: 35,
    totalEarnings: '\$48,200+',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    bio: '5+ years building scalable web applications for African startups and international clients. Specializing in financial technology and e-commerce.',
    completedJobs: 84,
    rating: 4.97,
    available: true,
    topRated: true,
  ),
  Freelancer(
    id: 2,
    name: 'Kwame Asante',
    title: 'UI/UX Designer & Brand Strategist',
    initials: 'KA',
    gradient: AppColors.gradientPurple,
    location: 'Accra, Ghana',
    jss: 94,
    hourlyRate: 28,
    totalEarnings: '\$31,500+',
    skills: ['Figma', 'Adobe XD', 'Brand Identity', 'Motion Design', 'Webflow'],
    bio: 'Award-winning designer crafting digital experiences for pan-African brands. I blend modern design with local cultural context.',
    completedJobs: 56,
    rating: 4.95,
    available: true,
    topRated: true,
  ),
  Freelancer(
    id: 3,
    name: 'Amina Hassan',
    title: 'Full-Stack Python & Django Developer',
    initials: 'AH',
    gradient: AppColors.gradientGreen,
    location: 'Nairobi, Kenya',
    jss: 91,
    hourlyRate: 30,
    totalEarnings: '\$22,100+',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Vue.js'],
    bio: 'Backend specialist with deep expertise in fintech and healthcare data systems. Building robust APIs that power mission-critical applications.',
    completedJobs: 41,
    rating: 4.92,
    available: false,
    topRated: false,
  ),
  Freelancer(
    id: 4,
    name: 'Jean-Pierre Mvondo',
    title: 'Mobile Developer & Flutter Expert',
    initials: 'JM',
    gradient: AppColors.gradientAmber,
    location: 'Yaoundé, Cameroon',
    jss: 96,
    hourlyRate: 25,
    totalEarnings: '\$19,800+',
    skills: ['Flutter', 'React Native', 'Firebase', 'Swift', 'Kotlin'],
    bio: 'Cross-platform mobile specialist delivering pixel-perfect apps for African and global markets. 4 apps with 100k+ downloads.',
    completedJobs: 38,
    rating: 4.94,
    available: true,
    topRated: true,
  ),
  Freelancer(
    id: 5,
    name: 'Fatima Diallo',
    title: 'Content Strategist & SEO Copywriter',
    initials: 'FD',
    gradient: AppColors.gradientPink,
    location: 'Dakar, Senegal',
    jss: 89,
    hourlyRate: 18,
    totalEarnings: '\$11,400+',
    skills: ['SEO', 'Content Strategy', 'Copywriting', 'French', 'WordPress'],
    bio: 'Trilingual content creator (French/English/Wolof) crafting compelling narratives for African businesses going global.',
    completedJobs: 67,
    rating: 4.88,
    available: true,
    topRated: false,
  ),
  Freelancer(
    id: 6,
    name: 'Chukwuemeka Obi',
    title: 'Data Analyst & Business Intelligence',
    initials: 'CO',
    gradient: AppColors.gradientTeal,
    location: 'Lagos, Nigeria',
    jss: 93,
    hourlyRate: 32,
    totalEarnings: '\$27,600+',
    skills: ['Python', 'Tableau', 'Power BI', 'SQL', 'Machine Learning'],
    bio: 'Transforming raw data into actionable insights for FMCG, fintech, and agritech companies across sub-Saharan Africa.',
    completedJobs: 52,
    rating: 4.91,
    available: true,
    topRated: false,
  ),
];

const kChatMessages = <ChatMessage>[
  ChatMessage(id: 1, sender: 'them', text: 'Hello! I saw your Flutter profile and I think you would be a great fit for our AgriTech app project.', time: '9:45 AM'),
  ChatMessage(id: 2, sender: 'me', text: 'Thank you! Your project looks very interesting. I have experience building offline-first Flutter apps which sounds perfect for rural areas.', time: '9:52 AM'),
  ChatMessage(id: 3, sender: 'them', text: 'Exactly! That offline capability is crucial. Our users often have limited connectivity in the field.', time: '9:55 AM'),
  ChatMessage(id: 4, sender: 'me', text: 'Understood. I used Hive for local storage with a background sync service in my last similar project — achieved ~95% data integrity even with spotty 2G connections.', time: '10:01 AM'),
  ChatMessage(id: 5, sender: 'them', text: 'That sounds perfect! Can we schedule a call to discuss the milestone deliverables and your proposed timeline?', time: '10:32 AM'),
];

const kContracts = <Contract>[
  Contract(
    id: 1,
    title: 'Full-Stack React / Node.js — FinTech Dashboard',
    client: 'MTN FinTech Lab',
    freelancer: 'Diane Ngono',
    totalAmount: 4500,
    currency: 'USD',
    status: 'active',
    milestones: [
      Milestone(id: 1, name: 'UI/UX Mockups & Design System', amount: 800, status: 'approved', dueDate: 'June 15, 2025'),
      Milestone(id: 2, name: 'Frontend Dashboard — Phase 1', amount: 1200, status: 'in_review', dueDate: 'July 5, 2025'),
      Milestone(id: 3, name: 'Backend API Integration', amount: 1500, status: 'funded', dueDate: 'July 28, 2025'),
      Milestone(id: 4, name: 'Testing & Deployment', amount: 1000, status: 'pending', dueDate: 'Aug 15, 2025'),
    ],
  ),
  Contract(
    id: 2,
    title: 'Brand Identity & Logo Design — Afrikart',
    client: 'Afrikart Commerce',
    freelancer: 'Kwame Asante',
    totalAmount: 850,
    currency: 'USD',
    status: 'completed',
    milestones: [
      Milestone(id: 1, name: 'Initial Concepts (3 directions)', amount: 250, status: 'approved', dueDate: 'June 2, 2025'),
      Milestone(id: 2, name: 'Final Design Package & Brand Book', amount: 600, status: 'approved', dueDate: 'June 10, 2025'),
    ],
  ),
];

final kThreadList = <ChatThread>[
  ChatThread(id: 1, contact: 'GreenField AgriTech', initials: 'GA', gradient: AppColors.gradientGreen, lastMessage: 'Can we schedule a video call to discuss the milestones?', time: '10:32 AM', unread: 3, type: 'contract', online: true),
  ChatThread(id: 2, contact: 'MTN FinTech Lab', initials: 'MF', gradient: AppColors.gradientBlue, lastMessage: 'The proposal looks great. We have a few questions about the timeline.', time: 'Yesterday', unread: 0, type: 'interview', online: false),
  ChatThread(id: 3, contact: 'TechAfrique Media', initials: 'TM', gradient: AppColors.gradientAmber, lastMessage: 'Please submit the first draft by Friday.', time: 'Mon', unread: 0, type: 'contract', online: false),
  ChatThread(id: 4, contact: 'Kwame Asante', initials: 'KA', gradient: AppColors.gradientPurple, lastMessage: 'I have reviewed your job post and am very interested.', time: 'Sun', unread: 1, type: 'interview', online: true),
];

const kCategories = <JobCategory>[
  JobCategory(icon: Icons.code, label: 'Development & IT', count: '2,340 jobs', gradient: AppColors.gradientBlue),
  JobCategory(icon: Icons.brush, label: 'Design & Creative', count: '1,180 jobs', gradient: AppColors.gradientPurple),
  JobCategory(icon: Icons.description, label: 'Writing & Translation', count: '890 jobs', gradient: AppColors.gradientAmber),
  JobCategory(icon: Icons.bar_chart, label: 'Data & Analytics', count: '640 jobs', gradient: AppColors.gradientTeal),
  JobCategory(icon: Icons.headphones, label: 'Admin & Support', count: '760 jobs', gradient: AppColors.gradientGreen),
  JobCategory(icon: Icons.trending_up, label: 'Sales & Marketing', count: '520 jobs', gradient: AppColors.gradientPink),
  JobCategory(icon: Icons.memory, label: 'Engineering', count: '310 jobs', gradient: AppColors.gradientIndigo),
  JobCategory(icon: Icons.language, label: 'Consulting', count: '280 jobs', gradient: AppColors.gradientGreen),
];

const kWizardSkills = <String>[
  'React', 'Node.js', 'TypeScript', 'Python', 'Flutter', 'Figma',
  'Adobe XD', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'GraphQL',
  'Vue.js', 'Django', 'Next.js', 'Swift', 'Kotlin', 'Firebase',
  'SEO', 'Content Writing', 'French', 'English', 'Excel', 'Zendesk',
];
