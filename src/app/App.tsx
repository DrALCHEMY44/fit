"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search, Bell, MessageSquare, ChevronDown, Star, ShieldCheck,
  Clock, TrendingUp, Briefcase, Code, PenTool, FileText,
  Headphones, ArrowRight, Check, Send, Paperclip, Filter,
  Bookmark, BookmarkCheck, Award, Zap, Globe, MapPin, ChevronRight,
  Plus, MoreHorizontal, X, Upload, CheckCircle2, DollarSign,
  Users, BarChart2, Menu, Settings, LogOut, Video, Smile,
  ChevronLeft, Database, Layers, Cpu, Camera, Wallet, Eye,
  ThumbsUp, AlertCircle, Circle, RotateCcw, Hash, Pencil,
  Building2, LayoutDashboard, FileCheck, ChevronUp, Lock, Info,
  CreditCard, Loader2, Sparkles, CalendarDays, GraduationCap,
  GitBranch, Languages, Smartphone, Shield, Brain, Calendar,
} from "lucide-react";

type View =
  | "landing"
  | "freelancer"
  | "proposal"
  | "client"
  | "talent"
  | "wizard"
  | "messages"
  | "contracts"
  | "login"
  | "signup"
  | "account"
  | "buy-connects"
  | "internships"
  | "admin";
type Lang = "en" | "fr";
type Role = "guest" | "freelancer" | "client" | "admin";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const JOBS = [
  {
    id: 1,
    title: "Full-Stack React / Node.js Developer for FinTech Dashboard",
    type: "hourly",
    budget: { min: 25, max: 45, currency: "USD" },
    posted: "2 hours ago",
    description:
      "We are building a mobile money aggregation platform for the CEMAC region. We need an experienced React developer with Node.js backend skills to build our analytics dashboard with real-time transaction tracking.",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "REST API"],
    duration: "3–6 months",
    level: "Expert",
    proposals: 12,
    client: {
      name: "MTN FinTech Lab",
      location: "Douala, Cameroon",
      verified: true,
      paymentVerified: true,
      rating: 4.9,
      spent: "$12,400",
      jobs: 8,
    },
    saved: false,
    category: "Web Development",
  },
  {
    id: 2,
    title: "Brand Identity & Logo Design for Pan-African E-Commerce Startup",
    type: "fixed",
    budget: { amount: 850, currency: "USD" },
    posted: "5 hours ago",
    description:
      "Looking for a talented designer to create a compelling brand identity for our cross-border e-commerce platform targeting 5 African markets. Must deliver logo, color system, and brand guidelines.",
    skills: ["Logo Design", "Brand Identity", "Adobe Illustrator", "Figma"],
    duration: "1–2 weeks",
    level: "Intermediate",
    proposals: 7,
    client: {
      name: "Afrikart Commerce",
      location: "Nairobi, Kenya",
      verified: true,
      paymentVerified: true,
      rating: 4.7,
      spent: "$3,200",
      jobs: 3,
    },
    saved: true,
    category: "Design & Creative",
  },
  {
    id: 3,
    title: "Bilingual Content Writer — French & English Tech Articles",
    type: "fixed",
    budget: { amount: 150000, currency: "XAF" },
    posted: "1 day ago",
    description:
      "We publish a weekly newsletter on African tech startups and need a bilingual writer producing in-depth articles in both French and English. SEO and audience-first writing a must.",
    skills: ["Content Writing", "French", "English", "Tech Journalism", "SEO"],
    duration: "Ongoing",
    level: "Intermediate",
    proposals: 19,
    client: {
      name: "TechAfrique Media",
      location: "Yaoundé, Cameroon",
      verified: true,
      paymentVerified: false,
      rating: 4.5,
      spent: "XAF 680,000",
      jobs: 14,
    },
    saved: false,
    category: "Writing & Translation",
  },
  {
    id: 4,
    title: "Flutter Developer — Cross-Platform AgriTech Mobile App",
    type: "hourly",
    budget: { min: 20, max: 35, currency: "USD" },
    posted: "2 days ago",
    description:
      "Building a crop monitoring and market price app for smallholder farmers across West Africa. Offline-first architecture is a critical requirement — users often work in low-connectivity rural environments.",
    skills: ["Flutter", "Dart", "Firebase", "REST API", "UI/UX"],
    duration: "4–6 months",
    level: "Expert",
    proposals: 5,
    client: {
      name: "GreenField AgriTech",
      location: "Lagos, Nigeria",
      verified: true,
      paymentVerified: true,
      rating: 5.0,
      spent: "$28,100",
      jobs: 12,
    },
    saved: false,
    category: "Mobile Development",
  },
  {
    id: 5,
    title: "Virtual Assistant — Customer Support for SaaS Platform",
    type: "hourly",
    budget: { min: 5, max: 10, currency: "USD" },
    posted: "3 days ago",
    description:
      "Seeking a detail-oriented VA to handle customer support tickets, onboarding emails, and basic administrative tasks for our growing B2B SaaS platform. Must be fluent in French and English.",
    skills: ["Customer Support", "Zendesk", "Email Management", "French", "Excel"],
    duration: "Long-term",
    level: "Entry",
    proposals: 34,
    client: {
      name: "CloudOps Cameroon",
      location: "Bafoussam, Cameroon",
      verified: true,
      paymentVerified: true,
      rating: 4.6,
      spent: "$5,900",
      jobs: 21,
    },
    saved: true,
    category: "Admin Support",
  },
];

const FREELANCERS = [
  {
    id: 1,
    name: "Diane Ngono",
    title: "Senior React & TypeScript Developer",
    initials: "DN",
    color: "from-[#0284C7] to-[#06B6D4]",
    location: "Douala, Cameroon",
    jss: 97,
    hourlyRate: 35,
    currency: "USD",
    totalEarnings: "$48,200+",
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
    bio: "5+ years building scalable web applications for African startups and international clients. Specializing in financial technology and e-commerce.",
    completedJobs: 84,
    rating: 4.97,
    available: true,
    topRated: true,
  },
  {
    id: 2,
    name: "Kwame Asante",
    title: "UI/UX Designer & Brand Strategist",
    initials: "KA",
    color: "from-[#7C3AED] to-[#A78BFA]",
    location: "Accra, Ghana",
    jss: 94,
    hourlyRate: 28,
    currency: "USD",
    totalEarnings: "$31,500+",
    skills: ["Figma", "Adobe XD", "Brand Identity", "Motion Design", "Webflow"],
    bio: "Award-winning designer crafting digital experiences for pan-African brands. I blend modern design with local cultural context.",
    completedJobs: 56,
    rating: 4.95,
    available: true,
    topRated: true,
  },
  {
    id: 3,
    name: "Amina Hassan",
    title: "Full-Stack Python & Django Developer",
    initials: "AH",
    color: "from-[#16A34A] to-[#34D399]",
    location: "Nairobi, Kenya",
    jss: 91,
    hourlyRate: 30,
    currency: "USD",
    totalEarnings: "$22,100+",
    skills: ["Python", "Django", "PostgreSQL", "Docker", "Vue.js"],
    bio: "Backend specialist with deep expertise in fintech and healthcare data systems. Building robust APIs that power mission-critical applications.",
    completedJobs: 41,
    rating: 4.92,
    available: false,
    topRated: false,
  },
  {
    id: 4,
    name: "Jean-Pierre Mvondo",
    title: "Mobile Developer & Flutter Expert",
    initials: "JM",
    color: "from-[#D97706] to-[#FBBF24]",
    location: "Yaoundé, Cameroon",
    jss: 96,
    hourlyRate: 25,
    currency: "USD",
    totalEarnings: "$19,800+",
    skills: ["Flutter", "React Native", "Firebase", "Swift", "Kotlin"],
    bio: "Cross-platform mobile specialist delivering pixel-perfect apps for African and global markets. 4 apps with 100k+ downloads.",
    completedJobs: 38,
    rating: 4.94,
    available: true,
    topRated: true,
  },
  {
    id: 5,
    name: "Fatima Diallo",
    title: "Content Strategist & SEO Copywriter",
    initials: "FD",
    color: "from-[#DB2777] to-[#F472B6]",
    location: "Dakar, Senegal",
    jss: 89,
    hourlyRate: 18,
    currency: "USD",
    totalEarnings: "$11,400+",
    skills: ["SEO", "Content Strategy", "Copywriting", "French", "WordPress"],
    bio: "Trilingual content creator (French/English/Wolof) crafting compelling narratives for African businesses going global.",
    completedJobs: 67,
    rating: 4.88,
    available: true,
    topRated: false,
  },
  {
    id: 6,
    name: "Chukwuemeka Obi",
    title: "Data Analyst & Business Intelligence",
    initials: "CO",
    color: "from-[#0891B2] to-[#22D3EE]",
    location: "Lagos, Nigeria",
    jss: 93,
    hourlyRate: 32,
    currency: "USD",
    totalEarnings: "$27,600+",
    skills: ["Python", "Tableau", "Power BI", "SQL", "Machine Learning"],
    bio: "Transforming raw data into actionable insights for FMCG, fintech, and agritech companies across sub-Saharan Africa.",
    completedJobs: 52,
    rating: 4.91,
    available: true,
    topRated: false,
  },
];

const CHAT_MESSAGES = [
  { id: 1, sender: "them", text: "Hello! I saw your Flutter profile and I think you would be a great fit for our AgriTech app project.", time: "9:45 AM" },
  { id: 2, sender: "me", text: "Thank you! Your project looks very interesting. I have experience building offline-first Flutter apps which sounds perfect for rural areas.", time: "9:52 AM" },
  { id: 3, sender: "them", text: "Exactly! That offline capability is crucial. Our users often have limited connectivity in the field.", time: "9:55 AM" },
  { id: 4, sender: "me", text: "Understood. I used Hive for local storage with a background sync service in my last similar project — achieved ~95% data integrity even with spotty 2G connections.", time: "10:01 AM" },
  { id: 5, sender: "them", text: "That sounds perfect! Can we schedule a call to discuss the milestone deliverables and your proposed timeline?", time: "10:32 AM" },
];

const CONTRACTS = [
  {
    id: 1,
    title: "Full-Stack React / Node.js — FinTech Dashboard",
    client: "MTN FinTech Lab",
    freelancer: "Diane Ngono",
    totalAmount: 4500,
    currency: "USD",
    status: "active",
    milestones: [
      { id: 1, name: "UI/UX Mockups & Design System", amount: 800, status: "approved", dueDate: "June 15, 2025" },
      { id: 2, name: "Frontend Dashboard — Phase 1", amount: 1200, status: "in_review", dueDate: "July 5, 2025" },
      { id: 3, name: "Backend API Integration", amount: 1500, status: "funded", dueDate: "July 28, 2025" },
      { id: 4, name: "Testing & Deployment", amount: 1000, status: "pending", dueDate: "Aug 15, 2025" },
    ],
  },
  {
    id: 2,
    title: "Brand Identity & Logo Design — Afrikart",
    client: "Afrikart Commerce",
    freelancer: "Kwame Asante",
    totalAmount: 850,
    currency: "USD",
    status: "completed",
    milestones: [
      { id: 1, name: "Initial Concepts (3 directions)", amount: 250, status: "approved", dueDate: "June 2, 2025" },
      { id: 2, name: "Final Design Package & Brand Book", amount: 600, status: "approved", dueDate: "June 10, 2025" },
    ],
  },
];

// ─── SHARED COMPONENTS ──────────────────────────────────────────────────────

function FITLogo({ theme = "dark", size = "md" }: { theme?: "dark" | "light"; size?: "sm" | "md" | "lg" }) {
  const logoSrc = theme === "dark" ? "/logo-light.png" : "/logo-dark.png";
  const logoHeight = size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";
  
  return (
    <img 
      src={logoSrc} 
      alt="Freelance Interconnect Logo" 
      className={`${logoHeight} w-auto object-contain flex-shrink-0`}
    />
  );
}

function Avatar({ initials, gradient, size = "md" }: { initials: string; gradient: string; size?: "xs" | "sm" | "md" | "lg" | "xl" }) {
  const sz = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" }[size];
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function Badge({ children, variant = "default" }: { children?: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "blue" | "cyan" }) {
  const styles = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-600 border border-red-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    cyan: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  }[variant];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>{children}</span>;
}

function JSSBar({ score }: { score: number }) {
  const color = score >= 90 ? "#16A34A" : score >= 75 ? "#D97706" : "#DC2626";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold font-mono" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{score}%</span>
    </div>
  );
}

function SkillTag({ label }: { label: string }) {
  return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default">{label}</span>;
}

function MilestoneStatus({ status }: { status: string }) {
  const config = {
    approved: { label: "Approved", color: "success", icon: <CheckCircle2 size={12} /> },
    in_review: { label: "In Review", color: "warning", icon: <Eye size={12} /> },
    funded: { label: "Escrow Funded", color: "blue", icon: <Wallet size={12} /> },
    pending: { label: "Pending", color: "default", icon: <Circle size={12} /> },
  }[status] ?? { label: status, color: "default", icon: null };
  return (
    <Badge variant={config.color as any}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

// ─── ADMIN MOCK DATA ──────────────────────────────────────────────────────────

const ADMIN_USERS_LIST = [
  { id: 1, name: "Diane Ngono", email: "diane.ngono@gmail.com", phone: "+237 677 889 900", country: "Cameroon", role: "freelancer", status: "active", verified: "verified", dateJoined: "Jan 12, 2025", photo: "DN" },
  { id: 2, name: "Kwame Asante", email: "kwame.asante@yahoo.com", phone: "+233 24 555 6677", country: "Ghana", role: "freelancer", status: "active", verified: "verified", dateJoined: "Feb 18, 2025", photo: "KA" },
  { id: 3, name: "Afrikart Commerce", email: "contact@afrikart.com", phone: "+237 699 112 233", country: "Cameroon", role: "client", status: "active", verified: "verified", dateJoined: "Mar 02, 2025", photo: "AC" },
  { id: 4, name: "GreenField AgriTech", email: "info@greenfield.io", phone: "+234 803 444 5555", country: "Nigeria", role: "client", status: "active", verified: "pending", dateJoined: "Apr 22, 2025", photo: "GA" },
  { id: 5, name: "Marc Ndjock", email: "m.ndjock@outlook.fr", phone: "+237 655 443 322", country: "Cameroon", role: "freelancer", status: "suspended", verified: "unverified", dateJoined: "May 10, 2025", photo: "MN" },
  { id: 6, name: "Sylvie Eko", email: "sylvie.eko@gmail.com", phone: "+237 671 223 344", country: "Cameroon", role: "freelancer", status: "active", verified: "pending", dateJoined: "Jun 14, 2025", photo: "SE" },
];

const ADMIN_PROJECTS_LIST = [
  { id: 101, name: "CEMAC FinTech Dashboard", client: "MTN FinTech Lab", freelancer: "Diane Ngono", budget: "XAF 850,000", deadline: "July 10, 2025", status: "In Progress" },
  { id: 102, name: "AgriTrack Mobile App", client: "GreenField AgriTech", freelancer: "Kwame Asante", budget: "USD 2,400", deadline: "Aug 15, 2025", status: "Open" },
  { id: 103, name: "Afrikart E-Commerce Platform", client: "Afrikart Commerce", freelancer: "Diane Ngono", budget: "USD 4,200", deadline: "June 20, 2025", status: "Completed" },
  { id: 104, name: "Legal Document Translation", client: "TechAfrique Media", freelancer: "Sylvie Eko", budget: "XAF 120,000", deadline: "July 01, 2025", status: "Cancelled" },
];

const ADMIN_TRANSACTIONS_LIST = [
  { id: "TXN-88291", client: "MTN FinTech Lab", freelancer: "Diane Ngono", amount: "XAF 850,000", method: "MTN Mobile Money", status: "Escrow Funded", date: "June 25, 2025" },
  { id: "TXN-88292", client: "Afrikart Commerce", freelancer: "Diane Ngono", amount: "USD 4,200", method: "Visa Card", status: "Released", date: "June 20, 2025" },
  { id: "TXN-88293", client: "GreenField AgriTech", freelancer: "Kwame Asante", amount: "USD 600", method: "PayPal", status: "Refunded", date: "June 18, 2025" },
  { id: "TXN-88294", client: "TechAfrique Media", freelancer: "Sylvie Eko", amount: "XAF 120,000", method: "Orange Money", status: "Released", date: "June 12, 2025" },
];

const ADMIN_WITHDRAWALS_LIST = [
  { id: 1, freelancer: "Diane Ngono", amount: "XAF 450,000", method: "MTN MoMo", date: "June 28, 2025", status: "Pending" },
  { id: 2, freelancer: "Kwame Asante", amount: "USD 1,200", method: "PayPal", date: "June 27, 2025", status: "Approved" },
  { id: 3, freelancer: "Sylvie Eko", amount: "XAF 75,000", method: "Orange Money", date: "June 26, 2025", status: "Rejected" },
];

const ADMIN_DISPUTES_LIST = [
  { id: "DSP-302", client: "GreenField AgriTech", freelancer: "Kwame Asante", project: "AgriTrack Mobile App", date: "June 24, 2025", status: "Open" },
  { id: "DSP-303", client: "TechAfrique Media", freelancer: "Sylvie Eko", project: "Legal Document Translation", date: "June 22, 2025", status: "Resolved" },
  { id: "DSP-304", client: "MTN FinTech Lab", freelancer: "Diane Ngono", project: "CEMAC FinTech Dashboard", date: "June 15, 2025", status: "Pending" },
];

const ADMIN_REVIEWS_LIST = [
  { id: 1, reviewer: "MTN FinTech Lab", user: "Diane Ngono", rating: 5, comment: "Diane did an incredible job building our CEMAC mobile money integration! Very professional.", date: "June 26, 2025", hidden: false },
  { id: 2, reviewer: "Sylvie Eko", user: "TechAfrique Media", rating: 2, comment: "Client kept changing project requirements without adjusting the milestone budget.", date: "June 24, 2025", hidden: false },
  { id: 3, reviewer: "Afrikart Commerce", user: "Diane Ngono", rating: 5, comment: "Exceptional UI coding and robust backend integration. Will hire again.", date: "June 20, 2025", hidden: false },
];

const ADMIN_CATEGORIES_LIST = [
  { id: 1, name: "Software Development", icon: "Code", count: 148 },
  { id: 2, name: "Design & Creative", icon: "PenTool", count: 96 },
  { id: 3, name: "Writing & Translation", icon: "FileText", count: 54 },
  { id: 4, name: "Marketing & Sales", icon: "TrendingUp", count: 42 },
];

const ADMIN_SKILLS_LIST = [
  { id: 1, skill: "React", category: "Software Development", count: 85 },
  { id: 2, skill: "TypeScript", category: "Software Development", count: 64 },
  { id: 3, skill: "Figma", category: "Design & Creative", count: 72 },
  { id: 4, skill: "Flutter", category: "Software Development", count: 34 },
];

const ADMIN_NOTIFICATIONS_LIST = [
  { id: 1, title: "Scheduled Maintenance", message: "FIT platform will be down for 2 hours on Sunday, July 6th.", audience: "All Users", date: "June 28, 2025" },
  { id: 2, title: "New Connects Rules", message: "Connects prices updated in XAF. Please check packages.", audience: "Freelancers", date: "June 25, 2025" },
];

const ADMIN_COUPONS_LIST = [
  { id: 1, code: "WELCOME237", discount: "15%", expiryDate: "Dec 31, 2025", status: "Active" },
  { id: 2, code: "MOMO5", discount: "5%", expiryDate: "Aug 30, 2025", status: "Active" },
  { id: 3, code: "EXPIRED50", discount: "50%", expiryDate: "May 01, 2025", status: "Expired" },
];

const ADMIN_COUNTRIES_LIST = [
  { id: 1, country: "Cameroon", currency: "XAF", status: "Active" },
  { id: 2, country: "Ivory Coast", currency: "XOF", status: "Active" },
  { id: 3, country: "Nigeria", currency: "NGN", status: "Active" },
  { id: 4, country: "Ghana", currency: "GHS", status: "Active" },
];

const ADMIN_BLOGS_LIST = [
  { id: 1, title: "How Mobile Money is Transforming African Freelancing", category: "FinTech", status: "Published", date: "June 26, 2025" },
  { id: 2, title: "Top 10 High-Income Tech Skills to Learn in Cameroon in 2025", category: "Education", status: "Draft", date: "June 24, 2025" },
];

const ADMIN_PLANS_LIST = [
  { id: 1, name: "Free Tier", price: "XAF 0", billing: "forever", subscribers: 1240 },
  { id: 2, name: "Pro Plan", price: "XAF 5,000", billing: "month", subscribers: 420 },
  { id: 3, name: "Business Plan", price: "XAF 15,000", billing: "month", subscribers: 110 },
  { id: 4, name: "Enterprise Plan", price: "XAF 45,000", billing: "year", subscribers: 15 },
];

// ─── TRANSLATIONS & i18n ────────────────────────────────────────────────────

const T: Record<string, Record<Lang, string>> = {
  adminView: { en: "Admin View", fr: "Vue Admin" },
  findWork: { en: "Find Work", fr: "Trouver du Travail" },
  findTalent: { en: "Find Talent", fr: "Trouver un Talent" },
  whyFit: { en: "Why FIT", fr: "Pourquoi FIT" },
  internships: { en: "Internships", fr: "Stages" },
  logIn: { en: "Log In", fr: "Connexion" },
  getStarted: { en: "Get Started", fr: "Commencer" },
  messages: { en: "Messages", fr: "Messages" },
  myJobs: { en: "My Jobs", fr: "Mes Projets" },
  clientView: { en: "Client View", fr: "Vue Client" },
  freelancerView: { en: "Freelancer View", fr: "Vue Freelance" },
  heroTag: { en: "Africa's Premier Freelance Marketplace", fr: "La Première Plateforme Freelance d'Afrique" },
  heroTitle1: { en: "Connecting Talents,", fr: "Connecter les Talents," },
  heroTitle2: { en: "Building Dreams.", fr: "Construire des Rêves." },
  heroDesc: { en: "FREELANCE INTERCONNECT (FIT) bridges the gap between exceptional African talent and the world's best opportunities. Post jobs in XAF or USD. Hire verified freelancers from Cameroon and across the continent.", fr: "FREELANCE INTERCONNECT (FIT) comble le fossé entre les talents exceptionnels d'Afrique et les meilleures opportunités mondiales. Publiez des offres en XAF ou USD. Recrutez des freelances vérifiés du Cameroun et du continent." },
  postJob: { en: "Post a Job — Free", fr: "Publier un Projet — Gratuit" },
  joinFreelancer: { en: "Join as a Freelancer", fr: "Rejoindre en tant que Freelance" },
  freeToJoin: { en: "Free to join", fr: "Inscription gratuite" },
  noSubscription: { en: "No subscription fees", fr: "Aucun abonnement" },
  xafUsdPayments: { en: "XAF & USD payments", fr: "Paiements XAF & USD" },
  browseByCategory: { en: "Browse by Category", fr: "Parcourir par Catégorie" },
  exploreOpportunities: { en: "Explore opportunities in your field of expertise", fr: "Découvrez les opportunités dans votre domaine" },
  viewAllCategories: { en: "View all categories", fr: "Voir toutes les catégories" },
  howFitWorks: { en: "How FIT Works", fr: "Comment FIT Fonctionne" },
  howFitWorksDesc: { en: "Go from idea to done — in four simple steps", fr: "De l'idée à la réalisation — en quatre étapes simples" },
  topTalent: { en: "Top Talent on FIT", fr: "Meilleurs Talents sur FIT" },
  topTalentDesc: { en: "Vetted professionals ready to work", fr: "Professionnels vérifiés prêts à travailler" },
  browseAllTalent: { en: "Browse all talent", fr: "Voir tous les talents" },
  readyToStart: { en: "Ready to get started?", fr: "Prêt à commencer ?" },
  readyToStartDesc: { en: "Join thousands of African freelancers and businesses already growing with FIT.", fr: "Rejoignez des milliers de freelances et d'entreprises africaines qui grandissent déjà avec FIT." },
  builtForCameroon: { en: "Built for Cameroon & Africa", fr: "Conçu pour le Cameroun & l'Afrique" },
  builtForCameroonDesc: { en: "Every feature is designed for the way Africa works", fr: "Chaque fonctionnalité est conçue pour la façon dont l'Afrique travaille" },
  aiMatching: { en: "AI-Powered Matching", fr: "Matching Propulsé par l'IA" },
  aiMatchingDesc: { en: "Tell us what you need — our AI finds your perfect freelancer", fr: "Dites-nous ce dont vous avez besoin — notre IA trouve le freelance parfait" },
  describeProject: { en: "Describe your project and required skills...", fr: "Décrivez votre projet et les compétences requises..." },
  findMyMatch: { en: "Find My Match", fr: "Trouver mon Match" },
  internshipHub: { en: "Internship Hub", fr: "Espace Stages" },
  internshipHubDesc: { en: "Launch your career with Africa's top companies", fr: "Lancez votre carrière avec les meilleures entreprises d'Afrique" },
  browseInternships: { en: "Browse Internships", fr: "Voir les Stages" },
  forStudents: { en: "For Students & Graduates", fr: "Pour Étudiants & Diplômés" },
  scheduleInterview: { en: "Schedule Interview", fr: "Planifier un Entretien" },
  footerTagline: { en: "Connecting Talents, Building Dreams — across Cameroon and the African continent.", fr: "Connecter les Talents, Construire des Rêves — à travers le Cameroun et le continent africain." },
  platform: { en: "Platform", fr: "Plateforme" },
  company: { en: "Company", fr: "Entreprise" },
  support: { en: "Support", fr: "Support" },
  english: { en: "English", fr: "Français" },
};

// ─── LANGUAGE CONTEXT ───────────────────────────────────────────────────────

const LangContext = (() => {
  let _lang: Lang = "en";
  let _listeners: Array<() => void> = [];
  return {
    get: () => _lang,
    set: (l: Lang) => { _lang = l; _listeners.forEach(fn => fn()); },
    subscribe: (fn: () => void) => { _listeners.push(fn); return () => { _listeners = _listeners.filter(f => f !== fn); }; },
  };
})();

function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(LangContext.get());
  useEffect(() => {
    const unsub = LangContext.subscribe(() => setLangState(LangContext.get()));
    return unsub;
  }, []);
  const setLang = (l: Lang) => { LangContext.set(l); };
  return [lang, setLang];
}

function t(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key;
}

// ─── INTERNSHIP MOCK DATA ───────────────────────────────────────────────────

const INTERNSHIPS = [
  { id: 1, title: "Frontend Engineering Intern", company: "MTN Innovation Lab", location: "Douala, Cameroon", duration: "3 months", stipend: "XAF 150,000/mo", skills: ["React", "TypeScript", "CSS"], type: "Hybrid", paid: true, description: "Work alongside senior engineers building the next generation of mobile money dashboards. Learn React, design systems, and agile development." },
  { id: 2, title: "UI/UX Design Intern", company: "Afrikart Commerce", location: "Yaoundé, Cameroon", duration: "4 months", stipend: "XAF 120,000/mo", skills: ["Figma", "Adobe XD", "Prototyping"], type: "Remote", paid: true, description: "Help redesign the Afrikart mobile app experience. Collaborate with product managers on user research and prototyping." },
  { id: 3, title: "Data Science Intern", company: "GreenField AgriTech", location: "Bamenda, Cameroon", duration: "6 months", stipend: "XAF 200,000/mo", skills: ["Python", "SQL", "Machine Learning"], type: "On-site", paid: true, description: "Analyze agricultural data from IoT sensors across 3 West African countries. Build predictive models for crop yield optimization." },
  { id: 4, title: "Backend Developer Intern", company: "CloudOps Cameroon", location: "Bafoussam, Cameroon", duration: "3 months", stipend: "XAF 100,000/mo", skills: ["Node.js", "PostgreSQL", "Docker"], type: "Remote", paid: true, description: "Contribute to our cloud infrastructure platform. Write APIs, optimize databases, and learn DevOps best practices." },
  { id: 5, title: "Content & Social Media Intern", company: "TechAfrique Media", location: "Douala, Cameroon", duration: "3 months", stipend: "Unpaid", skills: ["Content Writing", "French", "SEO"], type: "Remote", paid: false, description: "Create bilingual content about Africa's tech ecosystem. Manage social media accounts and track engagement analytics." },
];

// ─── AI MATCHING MOCK RESULTS ───────────────────────────────────────────────

const AI_MATCH_RESULTS = [
  { name: "Diane Ngono", initials: "DN", gradient: "from-[#0284C7] to-[#06B6D4]", title: "Full-Stack Developer", matchScore: 98, skills: ["React", "Node.js", "TypeScript"], reason: "5+ years in FinTech dashboards, XAF payment integrations" },
  { name: "Emmanuel Fru", initials: "EF", gradient: "from-[#16A34A] to-[#34D399]", title: "Mobile Developer", matchScore: 94, skills: ["Flutter", "Firebase", "Dart"], reason: "Built 3 mobile money apps, offline-first architecture expert" },
  { name: "Aminata Diallo", initials: "AD", gradient: "from-[#7C3AED] to-[#A78BFA]", title: "UI/UX Designer", matchScore: 91, skills: ["Figma", "React", "CSS"], reason: "Specialized in fintech UIs, bilingual FR/EN" },
];

// ─── BUILT FOR CAMEROON FEATURES ────────────────────────────────────────────

const PLATFORM_FEATURES = [
  { icon: Smartphone, title: { en: "MTN & Orange Money", fr: "MTN & Orange Money" }, desc: { en: "Pay and get paid via mobile money — instant XAF transactions", fr: "Payez et recevez via Mobile Money — transactions XAF instantanées" }, color: "from-[#FBBF24] to-[#F59E0B]" },
  { icon: DollarSign, title: { en: "FCFA & USD Pricing", fr: "Tarification FCFA & USD" }, desc: { en: "Set budgets in XAF or USD with live currency conversion", fr: "Définissez vos budgets en XAF ou USD avec conversion en direct" }, color: "from-[#16A34A] to-[#34D399]" },
  { icon: Languages, title: { en: "English & French", fr: "Anglais & Français" }, desc: { en: "Full bilingual interface — switch languages anytime", fr: "Interface entièrement bilingue — changez de langue à tout moment" }, color: "from-[#0284C7] to-[#06B6D4]" },
  { icon: ShieldCheck, title: { en: "Verified Freelancers", fr: "Freelances Vérifiés" }, desc: { en: "ID-verified profiles with skill assessments and ratings", fr: "Profils vérifiés avec évaluations et notes de compétences" }, color: "from-[#7C3AED] to-[#A78BFA]" },
  { icon: Wallet, title: { en: "Escrow Payments", fr: "Paiements Escrow" }, desc: { en: "Funds held securely until work is approved by both parties", fr: "Fonds sécurisés jusqu'à l'approbation du travail par les deux parties" }, color: "from-[#0891B2] to-[#22D3EE]" },
  { icon: Brain, title: { en: "AI Freelancer Matching", fr: "Matching IA" }, desc: { en: "Our AI analyzes your project to find the best-fit talent", fr: "Notre IA analyse votre projet pour trouver le talent idéal" }, color: "from-[#DB2777] to-[#F472B6]" },
  { icon: GitBranch, title: { en: "GitHub Integration", fr: "Intégration GitHub" }, desc: { en: "Link repos, showcase contributions on your profile", fr: "Liez vos dépôts, affichez vos contributions sur votre profil" }, color: "from-[#0D1117] to-[#334155]" },
  { icon: GraduationCap, title: { en: "Internship Hub", fr: "Espace Stages" }, desc: { en: "Students and graduates can find internships at top companies", fr: "Étudiants et diplômés trouvent des stages dans les meilleures entreprises" }, color: "from-[#6366F1] to-[#818CF8]" },
  { icon: Video, title: { en: "Video Interviews", fr: "Entretiens Vidéo" }, desc: { en: "Schedule and conduct interviews right on the platform", fr: "Planifiez et réalisez des entretiens directement sur la plateforme" }, color: "from-[#D97706] to-[#FBBF24]" },
  { icon: MessageSquare, title: { en: "Real-time Chat", fr: "Chat en Temps Réel" }, desc: { en: "Instant messaging with file sharing and offer tools", fr: "Messagerie instantanée avec partage de fichiers et outils d'offre" }, color: "from-[#0F766E] to-[#2DD4BF]" },
];

// ─── NAVBAR ─────────────────────────────────────────────────────────────────

function Navbar({ view, role, onNavigate, onRoleSwitch }: {
  view: View; role: Role;
  onNavigate: (v: View) => void;
  onRoleSwitch: (r: Role) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useLang();
  const isDark = view === "landing";

  const navBg = isDark ? "bg-[#0D1117]" : "bg-white border-b border-border";
  const textCls = isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900";
  const logoCls = isDark ? "dark" : "light";

  return (
    <header className={`sticky top-0 z-50 ${navBg}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button onClick={() => onNavigate("landing")} className="flex-shrink-0">
          <FITLogo theme={logoCls as any} size="md" />
        </button>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {role === "guest" && (
            <>
              <button onClick={() => { onRoleSwitch("freelancer"); onNavigate("freelancer"); }} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${textCls}`}>{t("findWork", lang)}</button>
              <button onClick={() => { onRoleSwitch("client"); onNavigate("talent"); }} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${textCls}`}>{t("findTalent", lang)}</button>
              <button onClick={() => onNavigate("internships")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "internships" ? "text-[#0284C7] bg-blue-50" : textCls}`}>{t("internships", lang)}</button>
              <a href="#" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${textCls}`}>{t("whyFit", lang)}</a>
            </>
          )}
          {role === "freelancer" && (
            <>
              <button onClick={() => onNavigate("freelancer")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "freelancer" ? "text-[#0284C7] bg-blue-50" : textCls}`}>{t("findWork", lang)}</button>
              <button onClick={() => onNavigate("contracts")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "contracts" ? "text-[#0284C7] bg-blue-50" : textCls}`}>{t("myJobs", lang)}</button>
              <button onClick={() => onNavigate("internships")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "internships" ? "text-[#0284C7] bg-blue-50" : textCls}`}>{t("internships", lang)}</button>
              <button onClick={() => onNavigate("messages")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "messages" ? "text-[#0284C7] bg-blue-50" : textCls}`}>{t("messages", lang)}</button>
            </>
          )}
          {role === "client" && (
            <>
              <button onClick={() => onNavigate("talent")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "talent" ? "text-[#0284C7] bg-blue-50" : textCls}`}>{t("findTalent", lang)}</button>
              <button onClick={() => onNavigate("client")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "client" ? "text-[#0284C7] bg-blue-50" : textCls}`}>{t("myJobs", lang)}</button>
              <button onClick={() => onNavigate("internships")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "internships" ? "text-[#0284C7] bg-blue-50" : textCls}`}>{t("internships", lang)}</button>
              <button onClick={() => onNavigate("messages")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "messages" ? "text-[#0284C7] bg-blue-50" : textCls}`}>{t("messages", lang)}</button>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${isDark ? "bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-border"}`}
            title={lang === "en" ? "Switch to French" : "Passer en anglais"}
          >
            <Globe size={12} />
            <span className={lang === "en" ? "text-[#0284C7] font-bold" : ""}>EN</span>
            <span className="opacity-40">|</span>
            <span className={lang === "fr" ? "text-[#0284C7] font-bold" : ""}>FR</span>
          </button>

          {role === "guest" ? (
            <>
              <button onClick={() => onNavigate("login")} className={`hidden md:block text-sm font-medium px-4 py-2 rounded-lg transition-colors ${isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}>{t("logIn", lang)}</button>
              <button onClick={() => onNavigate("signup")} className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white hover:opacity-90 transition-opacity">
                {t("getStarted", lang)}
              </button>
            </>
          ) : (
            <>
              <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell size={18} className={isDark ? "text-slate-400" : "text-slate-500"} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0284C7] rounded-full" />
              </button>
              <button onClick={() => onNavigate("messages")} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <MessageSquare size={18} className={isDark ? "text-slate-400" : "text-slate-500"} />
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <button
                  onClick={() => {
                    let nextRole: Role = "freelancer";
                    let nextView: View = "freelancer";
                    if (role === "freelancer") {
                      nextRole = "client";
                      nextView = "client";
                    } else if (role === "client") {
                      nextRole = "admin";
                      nextView = "admin";
                    } else {
                      nextRole = "freelancer";
                      nextView = "freelancer";
                    }
                    onRoleSwitch(nextRole);
                    onNavigate(nextView);
                  }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-medium text-slate-600"
                >
                  <RotateCcw size={11} />
                  {role === "freelancer" ? t("clientView", lang) : role === "client" ? t("adminView", lang) : t("freelancerView", lang)}
                </button>
                <button onClick={() => onNavigate("account")} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0284C7] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
                  {role === "freelancer" ? "DN" : "AF"}
                </button>
              </div>
            </>
          )}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu size={20} className={isDark ? "text-white" : "text-slate-700"} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={`md:hidden border-t ${isDark ? "border-white/10 bg-[#111827]" : "border-border bg-white"} px-4 py-3 flex flex-col gap-1`}>
          <button onClick={() => { onNavigate("freelancer"); setMobileOpen(false); }} className={`text-sm font-medium px-3 py-2 rounded-lg text-left ${textCls}`}>{t("findWork", lang)}</button>
          <button onClick={() => { onNavigate("talent"); setMobileOpen(false); }} className={`text-sm font-medium px-3 py-2 rounded-lg text-left ${textCls}`}>{t("findTalent", lang)}</button>
          <button onClick={() => { onNavigate("internships"); setMobileOpen(false); }} className={`text-sm font-medium px-3 py-2 rounded-lg text-left ${textCls}`}>{t("internships", lang)}</button>
          <button onClick={() => { onNavigate("messages"); setMobileOpen(false); }} className={`text-sm font-medium px-3 py-2 rounded-lg text-left ${textCls}`}>{t("messages", lang)}</button>
          <button onClick={() => { onNavigate("contracts"); setMobileOpen(false); }} className={`text-sm font-medium px-3 py-2 rounded-lg text-left ${textCls}`}>{lang === "en" ? "Contracts" : "Contrats"}</button>
          <div className="border-t border-border mt-2 pt-2">
            <button onClick={() => setLang(lang === "en" ? "fr" : "en")} className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg w-full text-left ${textCls}`}>
              <Globe size={14} /> {lang === "en" ? "🇫🇷 Français" : "🇬🇧 English"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── LANDING PAGE ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { icon: Code, label: "Development & IT", count: "2,340 jobs", color: "from-[#0284C7] to-[#0EA5E9]" },
  { icon: PenTool, label: "Design & Creative", count: "1,180 jobs", color: "from-[#7C3AED] to-[#A78BFA]" },
  { icon: FileText, label: "Writing & Translation", count: "890 jobs", color: "from-[#D97706] to-[#FBBF24]" },
  { icon: BarChart2, label: "Data & Analytics", count: "640 jobs", color: "from-[#0891B2] to-[#22D3EE]" },
  { icon: Headphones, label: "Admin & Support", count: "760 jobs", color: "from-[#16A34A] to-[#34D399]" },
  { icon: TrendingUp, label: "Sales & Marketing", count: "520 jobs", color: "from-[#DB2777] to-[#F472B6]" },
  { icon: Cpu, label: "Engineering", count: "310 jobs", color: "from-[#6366F1] to-[#818CF8]" },
  { icon: Globe, label: "Consulting", count: "280 jobs", color: "from-[#0F766E] to-[#2DD4BF]" },
];

const STATS = [
  { label: "Active Freelancers", value: "14,800+", icon: Users },
  { label: "Jobs Posted", value: "8,300+", icon: Briefcase },
  { label: "African Countries", value: "28", icon: Globe },
  { label: "Paid Out", value: "$4.2M+", icon: DollarSign },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Post Your Job", desc: "Describe your project, set your budget in XAF or USD, and go live in under 5 minutes." },
  { step: "02", title: "Review Proposals", desc: "Receive tailored proposals from vetted freelancers across Cameroon and the continent." },
  { step: "03", title: "Hire & Collaborate", desc: "Use our built-in workspace, milestone escrow, and messaging tools to manage your project." },
  { step: "04", title: "Pay Securely", desc: "Funds are held in escrow and released only when you approve the delivered work." },
];

function LandingPage({ onNavigate, onRoleSwitch }: { onNavigate: (v: View) => void; onRoleSwitch: (r: Role) => void }) {
  const [lang] = useLang();
  const [aiQuery, setAiQuery] = useState("");
  const [showAiResults, setShowAiResults] = useState(false);

  const handleAiMatch = () => {
    if (!aiQuery.trim()) return;
    setShowAiResults(true);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero */}
      <section className="bg-[#0D1117] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0284C7 0%, transparent 70%)", transform: "translate(200px, -200px)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-8" style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)", transform: "translate(-150px, 150px)" }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-medium mb-6">
              <Zap size={12} />
              {t("heroTag", lang)}
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              {t("heroTitle1", lang)}
              <br />
              <span className="bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] bg-clip-text text-transparent">
                {t("heroTitle2", lang)}
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-10">
              {t("heroDesc", lang)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => { onRoleSwitch("client"); onNavigate("wizard"); }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-semibold text-base hover:opacity-90 transition-opacity flex items-center gap-2 justify-center"
              >
                <Briefcase size={18} />
                {t("postJob", lang)}
              </button>
              <button
                onClick={() => { onRoleSwitch("freelancer"); onNavigate("freelancer"); }}
                className="px-6 py-3.5 rounded-xl bg-white/8 border border-white/15 text-white font-semibold text-base hover:bg-white/12 transition-colors flex items-center gap-2 justify-center"
              >
                {t("joinFreelancer", lang)}
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-8 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> {t("freeToJoin", lang)}</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> {t("noSubscription", lang)}</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> {t("xafUsdPayments", lang)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <s.icon size={18} className="text-[#0284C7]" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BUILT FOR CAMEROON — Feature Showcase ═══ */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-4">
              🇨🇲 {t("builtForCameroon", lang)}
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0D1117] tracking-tight">{t("builtForCameroon", lang)}</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">{t("builtForCameroonDesc", lang)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PLATFORM_FEATURES.map((feat, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl border border-border p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `linear-gradient(135deg, transparent 60%, rgba(2,132,199,0.05) 100%)` }} />
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <feat.icon size={20} className="text-white" />
                </div>
                <div className="font-bold text-sm text-[#0D1117] mb-1">{feat.title[lang]}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0D1117] tracking-tight">{t("browseByCategory", lang)}</h2>
            <p className="text-slate-500 mt-1">{t("exploreOpportunities", lang)}</p>
          </div>
          <button onClick={() => { onRoleSwitch("freelancer"); onNavigate("freelancer"); }} className="hidden md:flex items-center gap-1.5 text-[#0284C7] font-semibold text-sm hover:gap-2.5 transition-all">
            {t("viewAllCategories", lang)} <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => { onRoleSwitch("freelancer"); onNavigate("freelancer"); }}
              className="group p-5 bg-white rounded-2xl border border-border hover:border-[#0284C7]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <cat.icon size={22} className="text-white" />
              </div>
              <div className="font-semibold text-sm text-[#0D1117]">{cat.label}</div>
              <div className="text-xs text-slate-500 mt-1">{cat.count}</div>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#0D1117] py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{t("howFitWorks", lang)}</h2>
            <p className="text-slate-400 mt-3">{t("howFitWorksDesc", lang)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] right-0 h-px bg-gradient-to-r from-[#0284C7]/40 to-transparent" />
                )}
                <div className="text-4xl font-extrabold bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] bg-clip-text text-transparent mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{step.step}</div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AI-POWERED MATCHING SECTION ═══ */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-gradient-to-br from-[#0D1117] to-[#1E293B] rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#0284C7]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#06B6D4]/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DB2777] to-[#F472B6] flex items-center justify-center">
                  <Sparkles size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{t("aiMatching", lang)}</h2>
                  <p className="text-slate-400 text-sm">{t("aiMatchingDesc", lang)}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <textarea
                    value={aiQuery}
                    onChange={(e) => { setAiQuery(e.target.value); setShowAiResults(false); }}
                    placeholder={t("describeProject", lang)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-5 py-4 text-white text-sm placeholder:text-slate-500 outline-none focus:border-cyan-400/50 transition-colors resize-none h-24"
                  />
                  <button
                    onClick={handleAiMatch}
                    className="mt-3 px-6 py-3 rounded-xl bg-gradient-to-r from-[#DB2777] to-[#F472B6] text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Sparkles size={15} />
                    {t("findMyMatch", lang)}
                  </button>
                </div>

                {showAiResults && (
                  <div className="flex-1 space-y-3">
                    {AI_MATCH_RESULTS.map((match, idx) => (
                      <div
                        key={idx}
                        className="bg-white/10 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/15 transition-colors cursor-pointer"
                        style={{ animation: `fadeIn 0.4s ease-out ${idx * 0.15}s both` }}
                      >
                        <Avatar initials={match.initials} gradient={match.gradient} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{match.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">{match.matchScore}% match</span>
                          </div>
                          <div className="text-xs text-slate-400">{match.title}</div>
                          <div className="text-[10px] text-cyan-400/70 mt-1 truncate">{match.reason}</div>
                        </div>
                        <ArrowRight size={14} className="text-slate-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Talent Teaser */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0D1117] tracking-tight">{t("topTalent", lang)}</h2>
            <p className="text-slate-500 mt-1">{t("topTalentDesc", lang)}</p>
          </div>
          <button onClick={() => { onRoleSwitch("client"); onNavigate("talent"); }} className="hidden md:flex items-center gap-1.5 text-[#0284C7] font-semibold text-sm">
            {t("browseAllTalent", lang)} <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FREELANCERS.slice(0, 3).map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:border-[#0284C7]/20 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <Avatar initials={f.initials} gradient={f.color} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#0D1117] text-sm">{f.name}</span>
                    {f.topRated && <Award size={13} className="text-amber-500" />}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{f.title}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <MapPin size={10} />{f.location}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-extrabold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${f.hourlyRate}</div>
                  <div className="text-[10px] text-slate-400">/hr USD</div>
                </div>
              </div>
              <JSSBar score={f.jss} />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {f.skills.slice(0, 3).map((s) => <SkillTag key={s} label={s} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ INTERNSHIP HUB CTA ═══ */}
      <section className="bg-gradient-to-r from-[#6366F1] to-[#818CF8] py-16">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold mb-4">
              <GraduationCap size={13} /> {t("forStudents", lang)}
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3">{t("internshipHub", lang)}</h2>
            <p className="text-indigo-100 text-lg mb-6 max-w-lg">{t("internshipHubDesc", lang)}</p>
            <button
              onClick={() => onNavigate("internships")}
              className="px-7 py-3.5 bg-white text-[#6366F1] font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              {t("browseInternships", lang)}
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="flex-shrink-0 grid grid-cols-2 gap-3">
            {INTERNSHIPS.slice(0, 4).map((intern) => (
              <div key={intern.id} className="bg-white/10 border border-white/15 rounded-xl p-3.5 backdrop-blur-sm min-w-[160px]">
                <div className="text-xs font-bold text-white mb-1 truncate">{intern.title}</div>
                <div className="text-[10px] text-indigo-200 truncate">{intern.company}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-white/15 text-[9px] font-medium text-white">{intern.duration}</span>
                  {intern.paid && <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-[9px] font-medium text-emerald-300">Paid</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-[#0284C7] to-[#06B6D4] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">{t("readyToStart", lang)}</h2>
          <p className="text-blue-100 text-lg mb-8">{t("readyToStartDesc", lang)}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => { onRoleSwitch("client"); onNavigate("wizard"); }} className="px-7 py-3.5 bg-white text-[#0284C7] font-bold rounded-xl hover:bg-blue-50 transition-colors">
              {lang === "en" ? "Post a Job" : "Publier un Projet"}
            </button>
            <button onClick={() => { onRoleSwitch("freelancer"); onNavigate("freelancer"); }} className="px-7 py-3.5 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-colors">
              {t("findWork", lang)}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#080B10] py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <FITLogo theme="dark" size="md" />
              <p className="text-slate-500 text-sm mt-2 max-w-xs">{t("footerTagline", lang)}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              {[
                { title: t("platform", lang), links: [t("findWork", lang), t("findTalent", lang), t("internships", lang), lang === "en" ? "How It Works" : "Comment ça marche"] },
                { title: t("company", lang), links: [lang === "en" ? "About FIT" : "À propos de FIT", "Blog", lang === "en" ? "Careers" : "Carrières", lang === "en" ? "Press" : "Presse"] },
                { title: t("support", lang), links: [lang === "en" ? "Help Center" : "Centre d'aide", lang === "en" ? "Trust & Safety" : "Confiance & Sécurité", lang === "en" ? "Privacy Policy" : "Confidentialité", lang === "en" ? "Terms" : "Conditions"] },
              ].map((col) => (
                <div key={col.title}>
                  <div className="font-semibold text-white mb-3">{col.title}</div>
                  {col.links.map((l) => <div key={l} className="text-slate-500 hover:text-slate-300 cursor-pointer mb-2 transition-colors">{l}</div>)}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-slate-600 text-xs">© 2025 Freelance Interconnect. All rights reserved.</span>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="flex items-center gap-1"><Globe size={11} /> {t("english", lang)}</span>
              <span className="mx-2 text-slate-700">|</span>
              <span>XAF · USD · EUR</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Inline keyframes for AI results animation */}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── FREELANCER DASHBOARD ────────────────────────────────────────────────────

function FreelancerDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [activeTab, setActiveTab] = useState<"feed" | "matches" | "saved">("feed");
  const [savedJobs, setSavedJobs] = useState<number[]>(JOBS.filter((j) => j.saved).map((j) => j.id));

  const tabs = [
    { key: "feed", label: "My Feed" },
    { key: "matches", label: "Best Matches" },
    { key: "saved", label: `Saved (${savedJobs.length})` },
  ];

  const displayJobs = activeTab === "saved"
    ? JOBS.filter((j) => savedJobs.includes(j.id))
    : JOBS;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0 space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar initials="DN" gradient="from-[#0284C7] to-[#06B6D4]" size="lg" />
                <div>
                  <div className="font-bold text-sm text-[#0D1117]">Diane Ngono</div>
                  <div className="text-xs text-slate-500">Senior React Developer</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-600 font-medium">Available</span>
                  </div>
                </div>
              </div>
              {/* Profile completeness */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Profile completeness</span>
                  <span className="font-semibold text-[#0284C7]">87%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0284C7] to-[#06B6D4]" style={{ width: "87%" }} />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Add a portfolio item to reach 100%</p>
              </div>
              <div className="border-t border-border pt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Proposals", value: "6" },
                  { label: "Connects", value: "42" },
                  { label: "Active", value: "2" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-lg font-extrabold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                    <div className="text-[10px] text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connects Wallet */}
            <div className="bg-gradient-to-br from-[#0D1117] to-[#1E293B] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">Connects Balance</span>
                <Wallet size={16} className="text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>42</div>
              <div className="text-xs text-slate-500 mb-4">~7 proposals remaining</div>
              <button onClick={() => onNavigate("buy-connects")} className="w-full py-2 rounded-lg bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                Buy Connects
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {[
                { icon: LayoutDashboard, label: "Dashboard Overview", action: () => {} },
                { icon: FileCheck, label: "My Proposals", action: () => {} },
                { icon: Briefcase, label: "Active Contracts", action: () => onNavigate("contracts") },
                { icon: MessageSquare, label: "Messages", action: () => onNavigate("messages") },
                { icon: Settings, label: "Profile Settings", action: () => {} },
              ].map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0284C7] transition-colors text-left ${i !== 0 ? "border-t border-border" : ""}`}
                >
                  <item.icon size={15} className="flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Feed */}
          <main className="flex-1 min-w-0">
            {/* Search */}
            <div className="bg-white rounded-2xl border border-border p-4 mb-4 flex gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-border">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input placeholder="Search jobs, skills, keywords..." className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter size={14} />
                Filters
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-white rounded-xl border border-border p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {displayJobs.length === 0 && (
                <div className="bg-white rounded-2xl border border-border p-10 text-center">
                  <Bookmark size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No saved jobs yet. Bookmark jobs to see them here.</p>
                </div>
              )}
              {displayJobs.map((job) => {
                const isSaved = savedJobs.includes(job.id);
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-border p-5 hover:border-[#0284C7]/30 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <Badge variant={job.type === "hourly" ? "blue" : "cyan"}>
                            {job.type === "hourly" ? <Clock size={10} /> : <DollarSign size={10} />}
                            {job.type === "hourly" ? "Hourly" : "Fixed Price"}
                          </Badge>
                          <Badge variant="default">{job.category}</Badge>
                          {job.client.paymentVerified && (
                            <Badge variant="success"><ShieldCheck size={10} /> Payment Verified</Badge>
                          )}
                        </div>
                        <button
                          onClick={() => onNavigate("proposal")}
                          className="text-base font-bold text-[#0D1117] hover:text-[#0284C7] transition-colors text-left leading-snug"
                        >
                          {job.title}
                        </button>
                      </div>
                      <button
                        onClick={() => setSavedJobs((prev) => isSaved ? prev.filter((id) => id !== job.id) : [...prev, job.id])}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
                      >
                        {isSaved ? <BookmarkCheck size={16} className="text-[#0284C7]" /> : <Bookmark size={16} className="text-slate-400" />}
                      </button>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.skills.map((s) => <SkillTag key={s} label={s} />)}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="font-semibold text-[#0D1117] text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {job.type === "hourly"
                            ? `$${job.budget.min}–$${job.budget.max}/hr`
                            : `${job.budget.currency === "XAF" ? "XAF " : "$"}${job.budget.amount?.toLocaleString()}`}
                        </span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {job.duration}</span>
                        <span className="flex items-center gap-1"><Award size={11} /> {job.level}</span>
                        <span className="flex items-center gap-1"><Users size={11} /> {job.proposals} proposals</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin size={11} />
                          {job.client.location}
                        </div>
                        <span className="text-xs text-slate-400">{job.posted}</span>
                        <button
                          onClick={() => onNavigate("proposal")}
                          className="px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── PROPOSAL PAGE ───────────────────────────────────────────────────────────

function ProposalPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  const job = JOBS[0];
  const [bidRate, setBidRate] = useState("30");
  const [coverLetter, setCoverLetter] = useState("");
  const [milestones, setMilestones] = useState([
    { id: 1, name: "Design & Prototype", amount: "600", dueDate: "2 weeks" },
    { id: 2, name: "Frontend Development", amount: "900", dueDate: "5 weeks" },
    { id: 3, name: "Backend & Integration", amount: "700", dueDate: "4 weeks" },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const totalBid = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0D1117] mb-2">Proposal Sent!</h2>
          <p className="text-slate-500 text-sm mb-6">Your proposal has been submitted to {job.client.name}. You used 6 Connects.</p>
          <button onClick={() => onNavigate("freelancer")} className="px-6 py-3 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
            Back to Job Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <button onClick={() => onNavigate("freelancer")} className="flex items-center gap-2 text-slate-500 hover:text-[#0284C7] text-sm font-medium mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Job Feed
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Job Details */}
          <div className="lg:w-[420px] flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-border p-5 sticky top-24">
              <div className="flex gap-2 mb-3">
                <Badge variant={job.type === "hourly" ? "blue" : "cyan"}>{job.type === "hourly" ? "Hourly" : "Fixed Price"}</Badge>
                <Badge variant="success"><ShieldCheck size={10} /> Payment Verified</Badge>
              </div>
              <h2 className="text-base font-bold text-[#0D1117] mb-3 leading-snug">{job.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{job.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Budget", value: `$${job.budget.min}–$${job.budget.max}/hr` },
                  { label: "Duration", value: job.duration },
                  { label: "Experience", value: job.level },
                  { label: "Proposals", value: `${job.proposals} sent` },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
                    <div className="text-sm font-bold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.skills.map((s) => <SkillTag key={s} label={s} />)}
              </div>

              <div className="border-t border-border pt-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">About the Client</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0284C7] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold">
                    {job.client.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0D1117]">{job.client.name}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={10} />{job.client.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span><span className="font-bold text-[#0D1117]">{job.client.rating}</span> ★ rating</span>
                  <span><span className="font-bold text-[#0D1117]">{job.client.jobs}</span> jobs posted</span>
                  <span className="font-bold text-[#0D1117]">{job.client.spent} spent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Form */}
          <div className="flex-1 space-y-5">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-bold text-[#0D1117] mb-1">Your Bid Rate</h3>
              <p className="text-xs text-slate-500 mb-4">The client's budget is ${job.budget.min}–${job.budget.max}/hr</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Rate (USD/hr)</label>
                  <div className="flex items-center gap-2 mt-2 px-4 py-3 border border-border rounded-xl bg-slate-50 focus-within:border-[#0284C7] focus-within:bg-white transition-colors">
                    <span className="text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      value={bidRate}
                      onChange={(e) => setBidRate(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-lg font-bold text-[#0D1117]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <span className="text-slate-400 text-sm">/ hr</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">You'll Receive</label>
                  <div className="mt-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="text-lg font-bold text-emerald-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ${(parseFloat(bidRate) * 0.8).toFixed(2)}/hr
                    </div>
                    <div className="text-xs text-emerald-600">After 20% FIT service fee</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[#0D1117]">Project Milestones</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Break down your work into payable deliverables</p>
                </div>
                <button
                  onClick={() => setMilestones([...milestones, { id: Date.now(), name: "", amount: "", dueDate: "" }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0284C7] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus size={12} /> Add Milestone
                </button>
              </div>
              <div className="space-y-3">
                {milestones.map((ms, i) => (
                  <div key={ms.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-border">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0284C7] to-[#06B6D4] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{i + 1}</div>
                    <input
                      value={ms.name}
                      onChange={(e) => setMilestones(milestones.map((m) => m.id === ms.id ? { ...m, name: e.target.value } : m))}
                      placeholder="Milestone description"
                      className="flex-1 bg-transparent text-sm text-[#0D1117] placeholder:text-slate-400 outline-none font-medium"
                    />
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-white border border-border rounded-lg w-28 flex-shrink-0">
                      <span className="text-slate-400 text-sm">$</span>
                      <input
                        value={ms.amount}
                        onChange={(e) => setMilestones(milestones.map((m) => m.id === ms.id ? { ...m, amount: e.target.value } : m))}
                        placeholder="0"
                        className="w-full bg-transparent text-sm font-bold text-[#0D1117] outline-none"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </div>
                    {milestones.length > 1 && (
                      <button onClick={() => setMilestones(milestones.filter((m) => m.id !== ms.id))} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-sm font-semibold text-slate-600">Total Project Value</span>
                <span className="text-lg font-extrabold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${totalBid.toLocaleString()}</span>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-bold text-[#0D1117] mb-1">Cover Letter</h3>
              <p className="text-xs text-slate-500 mb-4">Describe your relevant experience, approach, and why you're the best fit.</p>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                placeholder={`Dear ${job.client.name},\n\nI am very excited to submit my proposal for this project. With 5+ years of experience in React and Node.js, I believe I can deliver exactly what you need...\n\nPlease feel free to view my portfolio at...`}
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none focus:border-[#0284C7] focus:bg-white transition-colors leading-relaxed"
              />
              <div className="flex items-center justify-between mt-3">
                <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0284C7] transition-colors">
                  <Paperclip size={14} />
                  Attach work samples
                </button>
                <span className="text-xs text-slate-400">{coverLetter.length} / 5000</span>
              </div>
            </div>

            {/* Submit */}
            <div className="bg-white rounded-2xl border border-border p-5 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Submitting this proposal will use <span className="font-bold text-[#0D1117]">6 Connects</span>. You have <span className="font-bold text-[#0284C7]">42 remaining</span>.
              </div>
              <button
                onClick={() => setSubmitted(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Send size={15} />
                Submit Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT DASHBOARD ────────────────────────────────────────────────────────

function ClientDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const clientStats = [
    { label: "Active Jobs", value: "3", icon: Briefcase, color: "text-[#0284C7]", bg: "bg-blue-50" },
    { label: "Open Contracts", value: "5", icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Spent", value: "$12.4K", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Freelancers Hired", value: "11", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  const activeJobs = [
    { id: 1, title: "Full-Stack React / Node.js Developer", proposals: 12, status: "active", budget: "$25–45/hr", posted: "June 18, 2025" },
    { id: 2, title: "Flutter Mobile App Developer", proposals: 5, status: "active", budget: "$20–35/hr", posted: "June 20, 2025" },
    { id: 3, title: "Brand Identity Designer", proposals: 7, status: "draft", budget: "$850 fixed", posted: "Draft" },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D1117] tracking-tight">Client Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Afrikart Commerce · Nairobi, Kenya</p>
          </div>
          <button
            onClick={() => onNavigate("wizard")}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            <Plus size={15} />
            Post a New Job
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {clientStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-bold text-[#0D1117]">Active & Draft Jobs</h2>
                <button onClick={() => onNavigate("wizard")} className="text-xs font-semibold text-[#0284C7] flex items-center gap-1">
                  <Plus size={12} /> New Post
                </button>
              </div>
              <div className="divide-y divide-border">
                {activeJobs.map((job) => (
                  <div key={job.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${job.status === "active" ? "bg-emerald-400" : "bg-amber-400"}`} />
                          <span className="font-semibold text-sm text-[#0D1117] truncate">{job.title}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="font-medium text-[#0D1117]">{job.budget}</span>
                          <span>{job.proposals} proposals</span>
                          <span>Posted {job.posted}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={job.status === "active" ? "success" : "warning"}>
                          {job.status === "active" ? "Live" : "Draft"}
                        </Badge>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreHorizontal size={14} className="text-slate-400" />
                        </button>
                      </div>
                    </div>
                    {job.status === "active" && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => onNavigate("talent")} className="px-3 py-1.5 bg-blue-50 text-[#0284C7] text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                          View {job.proposals} Proposals
                        </button>
                        <button onClick={() => onNavigate("talent")} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                          Find Talent
                        </button>
                      </div>
                    )}
                    {job.status === "draft" && (
                      <button onClick={() => onNavigate("wizard")} className="mt-3 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors">
                        Continue Editing
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contracts */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden mt-5">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-bold text-[#0D1117]">Open Contracts</h2>
                <button onClick={() => onNavigate("contracts")} className="text-xs text-[#0284C7] font-semibold flex items-center gap-1">View all <ChevronRight size={12} /></button>
              </div>
              {CONTRACTS.map((c) => (
                <div key={c.id} className="px-6 py-4 border-b border-border last:border-b-0 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-[#0D1117]">{c.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">with {c.freelancer}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.currency} {c.totalAmount.toLocaleString()}</div>
                      <Badge variant={c.status === "active" ? "success" : "default"}>{c.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-[#0D1117] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Post a New Job", icon: Plus, action: () => onNavigate("wizard"), primary: true },
                  { label: "Find Talent", icon: Search, action: () => onNavigate("talent"), primary: false },
                  { label: "View Messages", icon: MessageSquare, action: () => onNavigate("messages"), primary: false },
                  { label: "Manage Contracts", icon: FileCheck, action: () => onNavigate("contracts"), primary: false },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${item.primary ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white hover:opacity-90" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                  >
                    <item.icon size={15} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spending Overview */}
            <div className="bg-gradient-to-br from-[#0D1117] to-[#1E293B] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">This Month</h3>
                <BarChart2 size={16} className="text-cyan-400" />
              </div>
              {[
                { label: "Escrow Held", value: "$2,300", bar: 60 },
                { label: "Released", value: "$800", bar: 30 },
                { label: "Pending Review", value: "$1,200", bar: 40 },
              ].map((item) => (
                <div key={item.label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-mono font-semibold">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0284C7] to-[#06B6D4]" style={{ width: `${item.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TALENT SEARCH ───────────────────────────────────────────────────────────

function TalentSearch({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [inviteModal, setInviteModal] = useState<number | null>(null);
  const [rateMax, setRateMax] = useState(50);

  const categories = ["All", "Development", "Design", "Writing", "Data", "Marketing"];

  const filtered = FREELANCERS.filter((f) => {
    const matchSearch = search === "" || f.name.toLowerCase().includes(search.toLowerCase()) || f.title.toLowerCase().includes(search.toLowerCase()) || f.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchRate = f.hourlyRate <= rateMax;
    return matchSearch && matchRate;
  });

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#0D1117] tracking-tight">Find Talent</h1>
          <p className="text-slate-500 text-sm mt-1">Discover vetted African freelancers for your project</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-6 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-border focus-within:border-[#0284C7] transition-colors">
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skills, or title..."
              className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${selectedCategory === cat ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-border p-5 sticky top-24">
              <div className="font-bold text-[#0D1117] mb-4 flex items-center gap-2">
                <Filter size={15} /> Filters
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Max Rate (USD/hr)</label>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono font-bold text-[#0D1117]">${rateMax}</span>
                    <span className="text-xs text-slate-400">/ hour</span>
                  </div>
                  <input type="range" min={5} max={100} value={rateMax} onChange={(e) => setRateMax(Number(e.target.value))} className="w-full accent-[#0284C7]" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1"><span>$5</span><span>$100+</span></div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Availability</label>
                  {["Available Now", "Open to Offers", "Any"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input type="radio" name="availability" className="accent-[#0284C7]" defaultChecked={opt === "Any"} />
                      <span className="text-sm text-slate-600">{opt}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">JSS Score</label>
                  {["90%+", "80%+", "70%+", "Any"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input type="radio" name="jss" className="accent-[#0284C7]" defaultChecked={opt === "Any"} />
                      <span className="text-sm text-slate-600">{opt}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Location</label>
                  {["Cameroon", "Nigeria", "Kenya", "Ghana", "Africa", "Worldwide"].map((loc) => (
                    <label key={loc} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input type="checkbox" className="accent-[#0284C7]" defaultChecked={loc === "Africa"} />
                      <span className="text-sm text-slate-600">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Freelancer Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">{filtered.length} freelancers found</span>
              <select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-slate-600 outline-none">
                <option>Sort: Best Match</option>
                <option>Highest JSS</option>
                <option>Lowest Rate</option>
                <option>Most Reviews</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((f) => (
                <div key={f.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:border-[#0284C7]/30 transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative">
                      <Avatar initials={f.initials} gradient={f.color} size="lg" />
                      {f.available && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-[#0D1117]">{f.name}</span>
                        {f.topRated && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 rounded text-[10px] font-bold text-amber-600 border border-amber-200">
                            <Award size={9} /> Top Rated
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{f.title}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <MapPin size={10} className="flex-shrink-0" />{f.location}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-extrabold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${f.hourlyRate}</div>
                      <div className="text-[10px] text-slate-400">/hr USD</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Job Success Score</span>
                      <span className="font-semibold text-slate-700">{f.completedJobs} jobs · ⭐ {f.rating}</span>
                    </div>
                    <JSSBar score={f.jss} />
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{f.bio}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {f.skills.slice(0, 4).map((s) => <SkillTag key={s} label={s} />)}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-slate-400 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{f.totalEarnings} earned</span>
                    <div className="flex gap-2">
                      <button onClick={() => onNavigate("messages")} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1">
                        <MessageSquare size={11} /> Message
                      </button>
                      <button onClick={() => setInviteModal(f.id)} className="px-3 py-1.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
                        Invite to Job
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setInviteModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0D1117]">Invite to a Job</h3>
              <button onClick={() => setInviteModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Select which job to invite <strong>{FREELANCERS.find((f) => f.id === inviteModal)?.name}</strong> to:
            </p>
            <div className="space-y-2 mb-5">
              {["Full-Stack React / Node.js Developer", "Flutter Mobile App Developer"].map((j) => (
                <label key={j} className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:border-[#0284C7] transition-colors">
                  <input type="radio" name="inviteJob" className="accent-[#0284C7]" />
                  <span className="text-sm text-slate-700 font-medium">{j}</span>
                </label>
              ))}
            </div>
            <button onClick={() => setInviteModal(null)} className="w-full py-3 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm">
              Send Invitation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── JOB POST WIZARD ─────────────────────────────────────────────────────────

const WIZARD_SKILLS = ["React", "Node.js", "TypeScript", "Python", "Flutter", "Figma", "Adobe XD", "PostgreSQL", "MongoDB", "AWS", "Docker", "GraphQL", "Vue.js", "Django", "Next.js", "Swift", "Kotlin", "Firebase", "SEO", "Content Writing", "French", "English", "Excel", "Zendesk"];

function JobWizard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    skills: [] as string[],
    duration: "",
    level: "",
    budgetType: "fixed" as "fixed" | "hourly",
    fixedAmount: "",
    hourlyMin: "",
    hourlyMax: "",
    currency: "USD",
    milestones: [{ id: 1, name: "", amount: "" }],
  });
  const [published, setPublished] = useState(false);

  const steps = [
    { num: 1, label: "Title & Category" },
    { num: 2, label: "Skills Required" },
    { num: 3, label: "Scope & Level" },
    { num: 4, label: "Budget" },
  ];

  const canProceed = (s: number) => {
    if (s === 1) return form.title.length > 5 && form.category !== "";
    if (s === 2) return form.skills.length > 0;
    if (s === 3) return form.duration !== "" && form.level !== "";
    return true;
  };

  if (published) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0D1117] mb-2">Job Posted!</h2>
          <p className="text-slate-500 text-sm mb-6">Your job is live. Freelancers can now submit proposals. You'll be notified as they arrive.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => onNavigate("client")} className="px-5 py-3 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity">
              Go to Dashboard
            </button>
            <button onClick={() => onNavigate("talent")} className="px-5 py-3 bg-white border border-border text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors">
              Find Talent
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#0D1117] tracking-tight mb-1">Post a Job</h1>
          <p className="text-slate-500 text-sm">Tell us what you need — we'll connect you with the right talent</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > s.num ? "bg-gradient-to-br from-[#0284C7] to-[#06B6D4] text-white" : step === s.num ? "bg-gradient-to-br from-[#0284C7] to-[#06B6D4] text-white ring-4 ring-[#0284C7]/20" : "bg-slate-100 text-slate-400"}`}
                >
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <div className={`text-xs mt-1.5 font-medium whitespace-nowrap hidden sm:block ${step === s.num ? "text-[#0284C7]" : step > s.num ? "text-slate-500" : "text-slate-300"}`}>{s.label}</div>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-all ${step > s.num ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4]" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-border p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#0D1117] mb-2">Job Title <span className="text-red-500">*</span></label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Full-Stack Developer for FinTech Dashboard"
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-[#0284C7] outline-none transition-colors placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1.5">Be specific — better titles attract more relevant proposals</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0D1117] mb-2">Category <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {["Web Development", "Mobile Development", "Design & Creative", "Writing & Translation", "Data & Analytics", "Admin Support", "Sales & Marketing", "Engineering & IT"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${form.category === cat ? "border-[#0284C7] bg-blue-50 text-[#0284C7]" : "border-border text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0D1117] mb-2">Job Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  placeholder="Describe the project, deliverables, and any specific requirements..."
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-[#0284C7] outline-none transition-colors resize-none placeholder:text-slate-400 leading-relaxed"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#0D1117] mb-1">Required Skills <span className="text-red-500">*</span></label>
                <p className="text-xs text-slate-400 mb-4">Select all that apply — this helps match you with the right candidates</p>
                <div className="flex flex-wrap gap-2">
                  {WIZARD_SKILLS.map((skill) => {
                    const selected = form.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => setForm({ ...form, skills: selected ? form.skills.filter((s) => s !== skill) : [...form.skills, skill] })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selected ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      >
                        {selected && <span className="mr-1">✓</span>}{skill}
                      </button>
                    );
                  })}
                </div>
              </div>
              {form.skills.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-xs font-semibold text-[#0284C7] mb-2">Selected Skills ({form.skills.length})</div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 px-2 py-0.5 bg-white border border-blue-200 rounded-full text-xs font-medium text-[#0284C7]">
                        {s}
                        <button onClick={() => setForm({ ...form, skills: form.skills.filter((sk) => sk !== s) })}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#0D1117] mb-3">Project Duration <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {["Less than 1 week", "1–4 weeks", "1–3 months", "3–6 months", "6+ months", "Ongoing"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setForm({ ...form, duration: d })}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${form.duration === d ? "border-[#0284C7] bg-blue-50 text-[#0284C7]" : "border-border text-slate-600 hover:border-slate-300"}`}
                    >
                      {form.duration === d ? <CheckCircle2 size={14} className="text-[#0284C7]" /> : <Circle size={14} className="text-slate-300" />}
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0D1117] mb-3">Experience Level <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {[
                    { level: "Entry", desc: "New to the field, learning skills, lower rates" },
                    { level: "Intermediate", desc: "Substantial experience and established work history" },
                    { level: "Expert", desc: "Highly skilled with deep expertise, commands premium rates" },
                  ].map((l) => (
                    <button
                      key={l.level}
                      onClick={() => setForm({ ...form, level: l.level })}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${form.level === l.level ? "border-[#0284C7] bg-blue-50" : "border-border hover:border-slate-300"}`}
                    >
                      <div className="flex items-center gap-2">
                        {form.level === l.level ? <CheckCircle2 size={16} className="text-[#0284C7]" /> : <Circle size={16} className="text-slate-300" />}
                        <span className={`font-semibold text-sm ${form.level === l.level ? "text-[#0284C7]" : "text-[#0D1117]"}`}>{l.level}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-6">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#0D1117] mb-3">Payment Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: "fixed", label: "Fixed Price", desc: "Pay one rate for the full project", icon: DollarSign },
                    { type: "hourly", label: "Hourly Rate", desc: "Pay based on hours logged", icon: Clock },
                  ].map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => setForm({ ...form, budgetType: opt.type as any })}
                      className={`p-4 rounded-xl border text-left transition-all ${form.budgetType === opt.type ? "border-[#0284C7] bg-blue-50" : "border-border hover:border-slate-300"}`}
                    >
                      <opt.icon size={18} className={form.budgetType === opt.type ? "text-[#0284C7]" : "text-slate-400"} />
                      <div className={`font-semibold text-sm mt-2 ${form.budgetType === opt.type ? "text-[#0284C7]" : "text-[#0D1117]"}`}>{opt.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0D1117] mb-2">Currency</label>
                <div className="flex gap-2">
                  {["USD", "XAF", "EUR"].map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setForm({ ...form, currency: cur })}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${form.currency === cur ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white border-transparent" : "border-border text-slate-600 hover:bg-slate-50"}`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>

              {form.budgetType === "fixed" ? (
                <div>
                  <label className="block text-sm font-bold text-[#0D1117] mb-2">Fixed Budget ({form.currency})</label>
                  <div className="flex items-center gap-2 px-4 py-3 border border-border rounded-xl bg-slate-50 focus-within:border-[#0284C7] focus-within:bg-white transition-colors">
                    <span className="text-slate-400 font-mono text-sm">{form.currency === "XAF" ? "XAF" : "$"}</span>
                    <input
                      value={form.fixedAmount}
                      onChange={(e) => setForm({ ...form, fixedAmount: e.target.value })}
                      placeholder="0.00"
                      type="number"
                      className="flex-1 bg-transparent text-lg font-bold text-[#0D1117] outline-none"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-[#0D1117] mb-2">Hourly Rate Range ({form.currency}/hr)</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-border rounded-xl bg-slate-50 focus-within:border-[#0284C7] focus-within:bg-white transition-colors">
                      <span className="text-slate-400 text-sm">Min</span>
                      <input value={form.hourlyMin} onChange={(e) => setForm({ ...form, hourlyMin: e.target.value })} placeholder="5" type="number" className="flex-1 bg-transparent font-bold text-[#0D1117] outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                    </div>
                    <span className="text-slate-400">–</span>
                    <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-border rounded-xl bg-slate-50 focus-within:border-[#0284C7] focus-within:bg-white transition-colors">
                      <span className="text-slate-400 text-sm">Max</span>
                      <input value={form.hourlyMax} onChange={(e) => setForm({ ...form, hourlyMax: e.target.value })} placeholder="50" type="number" className="flex-1 bg-transparent font-bold text-[#0D1117] outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gradient-to-br from-[#0D1117] to-[#1E293B] rounded-xl p-5">
                <div className="text-sm font-semibold text-slate-300 mb-3">Job Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Title</span><span className="text-white font-medium truncate ml-4 max-w-[200px]">{form.title || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="text-white font-medium">{form.category || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Skills</span><span className="text-white font-medium">{form.skills.length} selected</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="text-white font-medium">{form.duration || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Level</span><span className="text-white font-medium">{form.level || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Budget</span>
                    <span className="text-cyan-400 font-bold font-mono">
                      {form.budgetType === "fixed" ? `${form.currency} ${form.fixedAmount || "0"}` : `${form.currency} ${form.hourlyMin || "0"}–${form.hourlyMax || "0"}/hr`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-5 py-3 border border-border rounded-xl text-sm font-semibold text-slate-600 hover:bg-white transition-colors">
              <ChevronLeft size={16} /> Previous
            </button>
          ) : <div />}
          {step < 4 ? (
            <button
              onClick={() => canProceed(step) && setStep(step + 1)}
              disabled={!canProceed(step)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${canProceed(step) ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white hover:opacity-90" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={() => setPublished(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm">
              <Zap size={15} /> Publish Job Post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MESSENGER ───────────────────────────────────────────────────────────────

const THREAD_LIST = [
  { id: 1, contact: "GreenField AgriTech", initials: "GA", gradient: "from-[#16A34A] to-[#34D399]", lastMessage: "Can we schedule a video call to discuss the milestones?", time: "10:32 AM", unread: 3, type: "contract", online: true },
  { id: 2, contact: "MTN FinTech Lab", initials: "MF", gradient: "from-[#0284C7] to-[#06B6D4]", lastMessage: "The proposal looks great. We have a few questions about the timeline.", time: "Yesterday", unread: 0, type: "interview", online: false },
  { id: 3, contact: "TechAfrique Media", initials: "TM", gradient: "from-[#D97706] to-[#FBBF24]", lastMessage: "Please submit the first draft by Friday.", time: "Mon", unread: 0, type: "contract", online: false },
  { id: 4, contact: "Kwame Asante", initials: "KA", gradient: "from-[#7C3AED] to-[#A78BFA]", lastMessage: "I have reviewed your job post and am very interested.", time: "Sun", unread: 1, type: "interview", online: true },
];

function MessengerPage() {
  const [activeThread, setActiveThread] = useState(THREAD_LIST[0]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [activeFilter, setActiveFilter] = useState<"all" | "contract" | "interview">("all");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [selectedDuration, setSelectedDuration] = useState("30 min");
  const [interviewNote, setInterviewNote] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "me", text: newMessage, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setNewMessage("");
  };

  const handleScheduleInterview = () => {
    setMessages([...messages, {
      id: Date.now(),
      sender: "me",
      text: `📅 Video Interview Scheduled\n\n📆 July ${selectedDate}, 2025 at ${selectedTime}\n⏱ Duration: ${selectedDuration}\n📹 Platform: FIT Video\n${interviewNote ? `\n📝 Note: ${interviewNote}` : ""}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setShowScheduleModal(false);
    setInterviewNote("");
  };

  const filtered = THREAD_LIST.filter((t) => activeFilter === "all" || t.type === activeFilter);

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Thread List */}
      <div className="w-full max-w-xs flex-shrink-0 border-r border-border flex flex-col bg-white">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-[#0D1117] mb-3">Messages</h2>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-border">
            <Search size={14} className="text-slate-400" />
            <input placeholder="Search conversations..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
          <div className="flex gap-1 mt-3">
            {(["all", "contract", "interview"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeFilter === f ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white" : "text-slate-500 hover:bg-slate-100"}`}
              >
                {f === "all" ? "All" : f === "contract" ? "Contracts" : "Interviews"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={`w-full flex items-start gap-3 p-4 border-b border-border hover:bg-slate-50 transition-colors text-left ${activeThread.id === thread.id ? "bg-blue-50/60 border-l-2 border-l-[#0284C7]" : ""}`}
            >
              <div className="relative flex-shrink-0">
                <Avatar initials={thread.initials} gradient={thread.gradient} size="sm" />
                {thread.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-sm text-[#0D1117] truncate">{thread.contact}</span>
                  <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">{thread.time}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{thread.lastMessage}</div>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant={thread.type === "contract" ? "success" : "blue"}>{thread.type}</Badge>
                  {thread.unread > 0 && <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0284C7] to-[#06B6D4] text-white text-[10px] font-bold flex items-center justify-center">{thread.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar initials={activeThread.initials} gradient={activeThread.gradient} size="md" />
              {activeThread.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />}
            </div>
            <div>
              <div className="font-bold text-sm text-[#0D1117]">{activeThread.contact}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {activeThread.online ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Online</> : "Last seen recently"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Video Call">
              <Video size={16} className="text-slate-500" />
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <CalendarDays size={12} /> Schedule Interview
            </button>
            <button className="px-3 py-1.5 bg-blue-50 text-[#0284C7] text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">
              Send Offer
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreHorizontal size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-background">
          <div className="text-center text-xs text-slate-400 font-medium">Today · June 27, 2025</div>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === "me" ? "flex-row-reverse" : ""}`}>
              {msg.sender !== "me" && (
                <Avatar initials={activeThread.initials} gradient={activeThread.gradient} size="xs" />
              )}
              <div className={`max-w-[70%] ${msg.sender === "me" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === "me" ? "bg-gradient-to-br from-[#0284C7] to-[#06B6D4] text-white rounded-br-sm" : "bg-white border border-border text-[#0D1117] rounded-bl-sm"}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-border bg-white">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
              <Paperclip size={16} className="text-slate-400" />
            </button>
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-border rounded-xl focus-within:border-[#0284C7] focus-within:bg-white transition-colors">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button className="flex-shrink-0">
                <Smile size={16} className="text-slate-400 hover:text-[#0284C7] transition-colors" />
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${newMessage.trim() ? "bg-gradient-to-br from-[#0284C7] to-[#06B6D4] text-white hover:opacity-90" : "bg-slate-100 text-slate-300"}`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ SCHEDULE INTERVIEW MODAL ═══ */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowScheduleModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center">
                  <CalendarDays size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0D1117]">Schedule Interview</h3>
                  <p className="text-xs text-slate-500">with {activeThread.contact}</p>
                </div>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Date Picker (simple calendar grid) */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Select Date — July 2025</label>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-[10px] font-bold text-slate-400 py-1">{d}</div>
                ))}
                {Array.from({ length: 2 }, (_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${day === selectedDate ? "bg-gradient-to-br from-[#6366F1] to-[#818CF8] text-white shadow-sm" : day < 3 ? "text-slate-300 cursor-not-allowed" : "text-slate-700 hover:bg-slate-100"}`}
                    disabled={day < 3}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Time Slot</label>
              <div className="flex flex-wrap gap-1.5">
                {["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"].map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedTime === time ? "bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Duration</label>
              <div className="flex gap-2">
                {["15 min", "30 min", "45 min", "1 hour"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDuration(d)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${selectedDuration === d ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-50 text-slate-600 border border-border hover:bg-slate-100"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Note for Candidate (optional)</label>
              <textarea
                value={interviewNote}
                onChange={(e) => setInterviewNote(e.target.value)}
                placeholder="Discuss project scope, technical skills, etc..."
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm outline-none focus:border-indigo-300 transition-colors resize-none h-16 placeholder:text-slate-400"
              />
            </div>

            {/* Platform indicator */}
            <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-slate-50 rounded-lg border border-border">
              <Video size={14} className="text-indigo-600" />
              <span className="text-xs font-semibold text-slate-600">FIT Video</span>
              <span className="text-xs text-slate-400 ml-auto">Built-in video conferencing</span>
            </div>

            <button
              onClick={handleScheduleInterview}
              className="w-full py-3.5 bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
            >
              <Send size={14} /> Send Interview Invite
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONTRACTS PAGE ──────────────────────────────────────────────────────────

function ContractsPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [activeContract, setActiveContract] = useState(CONTRACTS[0]);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D1117] tracking-tight">Contracts & Milestones</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage active work, escrow, and payments</p>
          </div>
          <button onClick={() => onNavigate("wizard")} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
            <Plus size={14} /> New Contract
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contract List */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">All Contracts</h2>
            {CONTRACTS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveContract(c)}
                className={`w-full text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-sm ${activeContract.id === c.id ? "border-[#0284C7] ring-1 ring-[#0284C7]/20" : "border-border"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-sm text-[#0D1117] leading-snug flex-1 pr-2">{c.title}</div>
                  <Badge variant={c.status === "active" ? "success" : "default"}>{c.status}</Badge>
                </div>
                <div className="text-xs text-slate-500 mb-2">with {c.freelancer}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.currency} {c.totalAmount.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">{c.milestones.length} milestones</span>
                </div>
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0284C7] to-[#06B6D4]"
                    style={{ width: `${(c.milestones.filter((m) => m.status === "approved").length / c.milestones.length) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {c.milestones.filter((m) => m.status === "approved").length} of {c.milestones.length} milestones approved
                </div>
              </button>
            ))}
          </div>

          {/* Contract Detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {/* Contract Header */}
              <div className="p-6 border-b border-border bg-gradient-to-r from-[#0D1117] to-[#1E293B]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-white leading-snug">{activeContract.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 text-sm">Client: {activeContract.client}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 text-sm">Freelancer: {activeContract.freelancer}</span>
                    </div>
                  </div>
                  <Badge variant={activeContract.status === "active" ? "success" : "default"}>{activeContract.status}</Badge>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-slate-500">Total Value</div>
                    <div className="text-xl font-extrabold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{activeContract.currency} {activeContract.totalAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Milestones</div>
                    <div className="text-xl font-extrabold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{activeContract.milestones.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Approved</div>
                    <div className="text-xl font-extrabold text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{activeContract.milestones.filter((m) => m.status === "approved").length}</div>
                  </div>
                </div>
              </div>

              {/* Milestones Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/70">
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-right px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeContract.milestones.map((ms) => (
                      <tr key={ms.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0284C7] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold">{ms.id}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-sm text-[#0D1117]">{ms.name}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">{ms.dueDate}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-extrabold text-sm text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {activeContract.currency} {ms.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <MilestoneStatus status={ms.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {ms.status === "in_review" && (
                              <>
                                <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
                                  <ThumbsUp size={11} /> Approve
                                </button>
                                <button className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1">
                                  <RotateCcw size={11} /> Revise
                                </button>
                              </>
                            )}
                            {ms.status === "funded" && (
                              <button className="px-3 py-1.5 bg-blue-50 text-[#0284C7] text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1">
                                <Eye size={11} /> View Work
                              </button>
                            )}
                            {ms.status === "approved" && (
                              <span className="text-xs text-slate-400 flex items-center gap-1"><Check size={11} className="text-emerald-500" /> Released</span>
                            )}
                            {ms.status === "pending" && (
                              <button className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1">
                                <Wallet size={11} /> Fund Escrow
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Contract Footer */}
              <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => onNavigate("messages")} className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <MessageSquare size={14} /> Message Freelancer
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <FileText size={14} /> View Contract
                  </button>
                </div>
                {activeContract.status === "active" && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                    <DollarSign size={14} /> Release Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({
  onNavigate,
  onRoleSwitch,
}: {
  onNavigate: (v: View) => void;
  onRoleSwitch: (r: Role) => void;
}) {
  const [userType, setUserType] = useState<"freelancer" | "client">("freelancer");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRoleSwitch(userType);
    onNavigate(userType === "freelancer" ? "freelancer" : "client");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10">
        
        {/* Title Block */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Sign in to your FIT account
          </p>
        </div>

        {/* Freelancer vs Client Toggle */}
        <div className="bg-[#F1F5F9] p-1.5 rounded-2xl flex items-center gap-1 mb-6">
          <button
            type="button"
            onClick={() => setUserType("freelancer")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 text-center ${
              userType === "freelancer"
                ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            I'm A Freelancer
          </button>
          <button
            type="button"
            onClick={() => setUserType("client")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 text-center ${
              userType === "client"
                ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            I'm A Client
          </button>
        </div>

        {/* Social Login */}
        <button
          type="button"
          className="w-full py-3.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 transition-colors rounded-2xl flex items-center justify-center gap-3 font-semibold text-slate-700 text-sm shadow-sm mb-6"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.829-6.357-6.314 0-3.485 2.847-6.314 6.357-6.314 1.582 0 3.018.577 4.13 1.533l3.074-3.047C19.262 2.378 16 1 12.24 1 5.922 1 1 5.88 1 12s4.922 11 11.24 11c6.544 0 11.393-4.524 11.393-11.286 0-.58-.063-1.135-.188-1.714H12.24Z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative bg-white px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            or sign in with email
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] rounded-2xl text-slate-900 placeholder-slate-400 text-sm transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-800" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-xs font-semibold text-[#0284C7] hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] rounded-2xl text-slate-900 placeholder-slate-400 text-sm transition-all shadow-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white hover:opacity-90 transition-opacity rounded-2xl flex items-center justify-center gap-2 font-bold text-base shadow-sm mt-8"
          >
            Sign In
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center mt-6">
          <p className="text-sm font-semibold text-slate-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate("signup")}
              className="text-[#0284C7] hover:underline focus:outline-none"
            >
              Sign up free
            </button>
          </p>
        </div>

        {/* Terms and Privacy policy */}
        <div className="text-center mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
            By signing in you agree to FIT's{" "}
            <a href="#" className="text-slate-500 hover:text-slate-800 underline transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-slate-500 hover:text-slate-800 underline transition-colors">
              Privacy Policy
            </a>.
          </p>
        </div>

      </div>
    </div>
  );
}

function SignupPage({
  onNavigate,
  onRoleSwitch,
}: {
  onNavigate: (v: View) => void;
  onRoleSwitch: (r: Role) => void;
}) {
  const [userType, setUserType] = useState<"freelancer" | "client">("freelancer");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRoleSwitch(userType);
    onNavigate(userType === "freelancer" ? "freelancer" : "client");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10">
        
        {/* Title Block */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Create an account
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Join the FIT marketplace today
          </p>
        </div>

        {/* Freelancer vs Client Toggle */}
        <div className="bg-[#F1F5F9] p-1.5 rounded-2xl flex items-center gap-1 mb-6">
          <button
            type="button"
            onClick={() => setUserType("freelancer")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 text-center ${
              userType === "freelancer"
                ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            I'm A Freelancer
          </button>
          <button
            type="button"
            onClick={() => setUserType("client")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 text-center ${
              userType === "client"
                ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            I'm A Client
          </button>
        </div>

        {/* Social Login */}
        <button
          type="button"
          className="w-full py-3.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 transition-colors rounded-2xl flex items-center justify-center gap-3 font-semibold text-slate-700 text-sm shadow-sm mb-6"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.829-6.357-6.314 0-3.485 2.847-6.314 6.357-6.314 1.582 0 3.018.577 4.13 1.533l3.074-3.047C19.262 2.378 16 1 12.24 1 5.922 1 1 5.88 1 12s4.922 11 11.24 11c6.544 0 11.393-4.524 11.393-11.286 0-.58-.063-1.135-.188-1.714H12.24Z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative bg-white px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            or sign up with email
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] rounded-2xl text-slate-900 placeholder-slate-400 text-sm transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] rounded-2xl text-slate-900 placeholder-slate-400 text-sm transition-all shadow-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white hover:opacity-90 transition-opacity rounded-2xl flex items-center justify-center gap-2 font-bold text-base shadow-sm mt-8"
          >
            Sign Up
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center mt-6">
          <p className="text-sm font-semibold text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="text-[#0284C7] hover:underline focus:outline-none"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Terms and Privacy policy */}
        <div className="text-center mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
            By signing in you agree to FIT's{" "}
            <a href="#" className="text-slate-500 hover:text-slate-800 underline transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-slate-500 hover:text-slate-800 underline transition-colors">
              Privacy Policy
            </a>.
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── ACCOUNT PAGE ─────────────────────────────────────────────────────────────

const ACCOUNT_SKILLS = ["React", "TypeScript", "Node.js", "GraphQL", "PostgreSQL", "AWS", "Docker", "Next.js"];
const PORTFOLIO_ITEMS = [
  { id: 1, title: "CEMAC FinTech Dashboard", desc: "Real-time transaction analytics built for mobile money platforms.", tags: ["React", "D3.js", "Node.js"], client: "MTN FinTech Lab", year: "2025" },
  { id: 2, title: "AgriTrack Mobile App", desc: "Offline-first Flutter app for crop monitoring across West Africa.", tags: ["Flutter", "Firebase", "Dart"], client: "GreenField AgriTech", year: "2024" },
  { id: 3, title: "Afrikart E-Commerce Platform", desc: "Full-stack cross-border e-commerce with XAF/USD dual currency support.", tags: ["Next.js", "Stripe", "PostgreSQL"], client: "Afrikart Commerce", year: "2024" },
];

function AccountPage({ onNavigate, role }: { onNavigate: (v: View) => void; role: Role }) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "billing" | "notifications">("profile");
  const [editMode, setEditMode] = useState(false);
  const [skills, setSkills] = useState(ACCOUNT_SKILLS);
  const [newSkill, setNewSkill] = useState("");
  const [profileForm, setProfileForm] = useState({
    firstName: "Diane",
    lastName: "Ngono",
    title: "Senior React & TypeScript Developer",
    email: "diane.ngono@example.com",
    phone: "+237 6XX XXX XXX",
    location: "Douala, Cameroon",
    bio: "5+ years building scalable web applications for African startups and international clients. Specializing in financial technology and e-commerce platforms. Passionate about building products that make a real difference on the African continent.",
    hourlyRate: "35",
    availability: "Available Now",
  });
  const [saved, setSaved] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [showGithubOnProfile, setShowGithubOnProfile] = useState(true);

  const tabs = [
    { key: "profile", label: "Profile", icon: Users },
    { key: "security", label: "Security", icon: ShieldCheck },
    { key: "billing", label: "Billing", icon: Wallet },
    { key: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleSave = () => {
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6">
          {/* Cover banner */}
          <div className="h-28 bg-gradient-to-r from-[#0D1117] via-[#0F2336] to-[#0D1117] relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(2,132,199,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(2,132,199,0.3) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)" }} />
            <button className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs font-medium transition-colors">
              <Camera size={11} /> Edit Cover
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-4">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#06B6D4] flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white shadow-lg">
                  DN
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#0284C7] rounded-full flex items-center justify-center border-2 border-white hover:bg-[#0369A1] transition-colors">
                  <Camera size={11} className="text-white" />
                </button>
              </div>
              <div className="flex-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h1 className="text-xl font-extrabold text-[#0D1117]">
                    {profileForm.firstName} {profileForm.lastName}
                  </h1>
                  <Badge variant="success"><ShieldCheck size={10} /> ID Verified</Badge>
                  <Badge variant="warning"><Award size={10} /> Top Rated</Badge>
                </div>
                <p className="text-slate-500 text-sm">{profileForm.title}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={10} />{profileForm.location}</span>
                  <span className="flex items-center gap-1"><Star size={10} className="text-amber-400" />4.97 rating</span>
                  <span className="flex items-center gap-1"><Briefcase size={10} />84 jobs completed</span>
                  <span className="flex items-center gap-1 text-emerald-500"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{profileForm.availability}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {editMode ? (
                  <>
                    <button onClick={() => setEditMode(false)} className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5">
                      <Check size={13} /> Save Changes
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Pencil size={13} /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {saved && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium mb-4">
                <CheckCircle2 size={14} /> Profile saved successfully!
              </div>
            )}

            {/* Quick stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
              {[
                { label: "Job Success Score", value: "97%", color: "text-emerald-600", sub: "Top 3% of freelancers" },
                { label: "Total Earned", value: "$48,200+", color: "text-[#0284C7]", sub: "Across 84 contracts" },
                { label: "Connects", value: "42", color: "text-[#0D1117]", sub: "~7 proposals left" },
                { label: "Response Rate", value: "98%", color: "text-[#0D1117]", sub: "Avg. reply: 2 hrs" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-xl font-extrabold ${s.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
                  <div className="text-xs font-semibold text-[#0D1117] mt-0.5">{s.label}</div>
                  <div className="text-[10px] text-slate-400">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs + Content */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Tab Sidebar */}
          <aside className="lg:w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {tabs.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all text-left ${i !== 0 ? "border-t border-border" : ""} ${activeTab === tab.key ? "text-[#0284C7] bg-blue-50/60 border-l-2 border-l-[#0284C7]" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <tab.icon size={15} className={activeTab === tab.key ? "text-[#0284C7]" : "text-slate-400"} />
                  {tab.label}
                </button>
              ))}
              <div className="border-t border-border p-3">
                <button
                  onClick={() => onNavigate("landing")}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Tab Content */}
          <div className="flex-1 space-y-5">
            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <>
                {/* Basic Info */}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-[#0D1117] mb-5 flex items-center gap-2">
                    <Users size={16} className="text-[#0284C7]" /> Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "First Name", key: "firstName", placeholder: "Diane" },
                      { label: "Last Name", key: "lastName", placeholder: "Ngono" },
                      { label: "Professional Title", key: "title", placeholder: "Senior React Developer", span: true },
                      { label: "Email", key: "email", placeholder: "diane@example.com" },
                      { label: "Phone Number", key: "phone", placeholder: "+237 6XX XXX XXX" },
                      { label: "Location", key: "location", placeholder: "City, Country" },
                    ].map((f) => (
                      <div key={f.key} className={f.span ? "md:col-span-2" : ""}>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                        <input
                          value={(profileForm as any)[f.key]}
                          onChange={(e) => setProfileForm({ ...profileForm, [f.key]: e.target.value })}
                          disabled={!editMode}
                          placeholder={f.placeholder}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#0D1117] outline-none transition-all ${editMode ? "border-border bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/10" : "border-transparent bg-slate-50 text-slate-700 cursor-default"}`}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Professional Bio</label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        disabled={!editMode}
                        rows={4}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#0D1117] outline-none transition-all resize-none leading-relaxed ${editMode ? "border-border bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/10" : "border-transparent bg-slate-50 text-slate-700 cursor-default"}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Rate & Availability */}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-[#0D1117] mb-5 flex items-center gap-2">
                    <DollarSign size={16} className="text-[#0284C7]" /> Rate & Availability
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hourly Rate (USD)</label>
                      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${editMode ? "border-border bg-white focus-within:border-[#0284C7]" : "border-transparent bg-slate-50"}`}>
                        <span className="text-slate-400 text-sm">$</span>
                        <input
                          value={profileForm.hourlyRate}
                          onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: e.target.value })}
                          disabled={!editMode}
                          className="flex-1 bg-transparent text-sm font-bold text-[#0D1117] outline-none"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        />
                        <span className="text-slate-400 text-sm">/ hr</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Availability</label>
                      <select
                        value={profileForm.availability}
                        onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                        disabled={!editMode}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#0D1117] outline-none transition-all ${editMode ? "border-border bg-white" : "border-transparent bg-slate-50 cursor-default"}`}
                      >
                        {["Available Now", "Available part-time (< 30 hrs)", "Not available"].map((a) => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-[#0D1117] mb-5 flex items-center gap-2">
                    <Zap size={16} className="text-[#0284C7]" /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((s) => (
                      <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#0284C7] rounded-lg text-sm font-medium">
                        {s}
                        {editMode && (
                          <button onClick={() => setSkills(skills.filter((sk) => sk !== s))} className="hover:text-red-500 transition-colors">
                            <X size={11} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {editMode && (
                    <div className="flex gap-2">
                      <input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && newSkill.trim()) { setSkills([...skills, newSkill.trim()]); setNewSkill(""); } }}
                        placeholder="Add a skill and press Enter"
                        className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0284C7] transition-colors"
                      />
                      <button onClick={() => { if (newSkill.trim()) { setSkills([...skills, newSkill.trim()]); setNewSkill(""); } }} className="px-4 py-2.5 bg-blue-50 text-[#0284C7] rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
                        <Plus size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Portfolio */}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#0D1117] flex items-center gap-2">
                      <Layers size={16} className="text-[#0284C7]" /> Portfolio
                    </h3>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#0284C7] rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                      <Plus size={12} /> Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {PORTFOLIO_ITEMS.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-border hover:border-[#0284C7]/30 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#06B6D4] flex items-center justify-center flex-shrink-0">
                          <Code size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-sm text-[#0D1117]">{item.title}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{item.client} · {item.year}</div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded-lg transition-all">
                              <Pencil size={12} className="text-slate-400" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.tags.map((t) => <SkillTag key={t} label={t} />)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-[#0D1117] mb-5 flex items-center gap-2"><ShieldCheck size={16} className="text-[#0284C7]" /> Password</h3>
                  <div className="space-y-4 max-w-sm">
                    {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                      <div key={label}>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white outline-none focus:border-[#0284C7] transition-colors" />
                      </div>
                    ))}
                    <button className="px-5 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">Update Password</button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-[#0D1117] mb-5 flex items-center gap-2"><Globe size={16} className="text-[#0284C7]" /> Connected Accounts</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Google", icon: "G", connected: true, email: "diane.ngono@gmail.com", color: "bg-red-500" },
                      { label: "LinkedIn", icon: "in", connected: false, email: null, color: "bg-blue-700" },
                    ].map((acc) => (
                      <div key={acc.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg ${acc.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{acc.icon}</div>
                          <div>
                            <div className="font-semibold text-sm text-[#0D1117]">{acc.label}</div>
                            {acc.connected ? <div className="text-xs text-slate-500">{acc.email}</div> : <div className="text-xs text-slate-400">Not connected</div>}
                          </div>
                        </div>
                        <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${acc.connected ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-blue-50 text-[#0284C7] hover:bg-blue-100"}`}>
                          {acc.connected ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    ))}

                    {/* ═══ ENHANCED GITHUB INTEGRATION ═══ */}
                    <div className={`rounded-xl border transition-all overflow-hidden ${githubConnected ? "border-emerald-200 bg-slate-50" : "border-border bg-slate-50"}`}>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#0D1117] flex items-center justify-center text-white text-xs font-bold flex-shrink-0"><GitBranch size={16} /></div>
                          <div>
                            <div className="font-semibold text-sm text-[#0D1117]">GitHub</div>
                            {githubConnected ? <div className="text-xs text-emerald-600">@diane-ngono · Connected</div> : <div className="text-xs text-slate-400">Not connected</div>}
                          </div>
                        </div>
                        <button
                          onClick={() => setGithubConnected(!githubConnected)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${githubConnected ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-[#0D1117] text-white hover:bg-[#1a2332]"}`}
                        >
                          {githubConnected ? "Disconnect" : "Connect GitHub"}
                        </button>
                      </div>

                      {githubConnected && (
                        <div className="px-4 pb-4 space-y-3">
                          {/* Repos */}
                          <div className="space-y-2">
                            {[
                              { name: "fit-dashboard", stars: 48, lang: "TypeScript", langColor: "bg-blue-500", lastCommit: "2 days ago" },
                              { name: "mobile-money-sdk", stars: 124, lang: "JavaScript", langColor: "bg-yellow-400", lastCommit: "1 week ago" },
                              { name: "agritrack-api", stars: 32, lang: "Python", langColor: "bg-emerald-500", lastCommit: "3 weeks ago" },
                            ].map((repo) => (
                              <div key={repo.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-border">
                                <div className="flex items-center gap-2">
                                  <GitBranch size={13} className="text-slate-400" />
                                  <span className="text-sm font-semibold text-[#0284C7]">{repo.name}</span>
                                  <span className="flex items-center gap-1 text-[10px] text-slate-500"><Star size={9} className="text-amber-400" /> {repo.stars}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className={`w-2 h-2 rounded-full ${repo.langColor}`} />{repo.lang}</span>
                                  <span className="text-[10px] text-slate-400">{repo.lastCommit}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Contributions bar */}
                          <div className="bg-white rounded-lg border border-border p-3">
                            <div className="text-xs font-semibold text-slate-600 mb-2">Contribution Activity</div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 24 }, (_, i) => (
                                <div
                                  key={i}
                                  className="flex-1 rounded-sm"
                                  style={{ height: `${Math.max(8, Math.random() * 28)}px`, background: `rgba(2, 132, 199, ${0.15 + Math.random() * 0.7})` }}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400 mt-1"><span>6 months ago</span><span>Now</span></div>
                          </div>

                          {/* Show on profile toggle */}
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-border">
                            <div>
                              <div className="text-sm font-semibold text-[#0D1117]">Show on Profile</div>
                              <div className="text-xs text-slate-500">Display pinned repos in your portfolio</div>
                            </div>
                            <button
                              onClick={() => setShowGithubOnProfile(!showGithubOnProfile)}
                              className={`w-10 h-5 rounded-full transition-colors relative ${showGithubOnProfile ? "bg-[#0284C7]" : "bg-slate-300"}`}
                            >
                              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${showGithubOnProfile ? "left-5" : "left-0.5"}`} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-[#0D1117] mb-1 flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-600" /> Two-Factor Authentication</h3>
                  <p className="text-xs text-slate-500 mb-4">Add an extra layer of security to your account.</p>
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <div>
                        <div className="font-semibold text-sm text-[#0D1117]">2FA is enabled</div>
                        <div className="text-xs text-emerald-600">via Authenticator App</div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Manage</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── BILLING TAB ── */}
            {activeTab === "billing" && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-[#0D1117] mb-5 flex items-center gap-2"><Wallet size={16} className="text-[#0284C7]" /> Earnings Overview</h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "Total Earned", value: "$48,200", sub: "All time" },
                      { label: "This Month", value: "$3,400", sub: "June 2025" },
                      { label: "Pending", value: "$2,300", sub: "In escrow" },
                    ].map((s) => (
                      <div key={s.label} className="p-4 bg-slate-50 rounded-xl">
                        <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                        <div className="text-xl font-extrabold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
                        <div className="text-[10px] text-slate-400">{s.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-5">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Transactions</div>
                    <div className="space-y-3">
                      {[
                        { desc: "MTN FinTech Lab — Milestone 1", date: "June 18, 2025", amount: "+$800", status: "Received" },
                        { desc: "Afrikart Commerce — Final Payment", date: "June 10, 2025", amount: "+$600", status: "Received" },
                        { desc: "Connects purchase — 20 packs", date: "June 5, 2025", amount: "-$15", status: "Paid" },
                        { desc: "GreenField AgriTech — Milestone 2", date: "May 28, 2025", amount: "+$1,200", status: "Received" },
                      ].map((tx) => (
                        <div key={tx.desc} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                          <div>
                            <div className="text-sm font-medium text-[#0D1117]">{tx.desc}</div>
                            <div className="text-xs text-slate-400">{tx.date}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold font-mono ${tx.amount.startsWith("+") ? "text-emerald-600" : "text-red-500"}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{tx.amount}</div>
                            <Badge variant={tx.amount.startsWith("+") ? "success" : "default"}>{tx.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-[#0D1117] mb-4 flex items-center gap-2"><Building2 size={16} className="text-[#0284C7]" /> Withdrawal Methods</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Mobile Money (MTN)", detail: "6XX XXX XXX · Cameroon", primary: true },
                      { label: "Bank Account (SCB)", detail: "•••• •••• 4821 · XAF", primary: false },
                    ].map((m) => (
                      <div key={m.label} className={`flex items-center justify-between p-4 rounded-xl border ${m.primary ? "border-[#0284C7]/30 bg-blue-50/40" : "border-border bg-slate-50"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.primary ? "bg-gradient-to-br from-[#0284C7] to-[#06B6D4]" : "bg-slate-200"}`}>
                            <Wallet size={15} className={m.primary ? "text-white" : "text-slate-500"} />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[#0D1117]">{m.label}</div>
                            <div className="text-xs text-slate-500">{m.detail}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {m.primary && <Badge variant="blue">Primary</Badge>}
                          <button className="px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Edit</button>
                        </div>
                      </div>
                    ))}
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-xl text-sm font-medium text-slate-500 hover:border-[#0284C7] hover:text-[#0284C7] transition-colors w-full">
                      <Plus size={14} /> Add withdrawal method
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl border border-border p-6">
                <h3 className="font-bold text-[#0D1117] mb-5 flex items-center gap-2"><Bell size={16} className="text-[#0284C7]" /> Notification Preferences</h3>
                <div className="space-y-1">
                  {[
                    { section: "Jobs & Proposals", items: [
                      { label: "New job matches my profile", email: true, push: true },
                      { label: "Client views my profile", email: false, push: true },
                      { label: "Proposal status updates", email: true, push: true },
                    ]},
                    { section: "Contracts & Payments", items: [
                      { label: "New contract offer received", email: true, push: true },
                      { label: "Milestone approved & payment released", email: true, push: true },
                      { label: "Revision requests", email: true, push: false },
                    ]},
                    { section: "Messages", items: [
                      { label: "New direct message", email: false, push: true },
                      { label: "Interview invitation", email: true, push: true },
                    ]},
                    { section: "Account", items: [
                      { label: "Security alerts", email: true, push: true },
                      { label: "Weekly earnings summary", email: true, push: false },
                      { label: "Platform updates & news", email: false, push: false },
                    ]},
                  ].map((section) => (
                    <div key={section.section}>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider py-3 mt-3 first:mt-0">{section.section}</div>
                      {section.items.map((item, i) => (
                        <div key={item.label} className={`flex items-center justify-between py-3.5 ${i !== 0 ? "border-t border-border" : ""}`}>
                          <span className="text-sm text-[#0D1117]">{item.label}</span>
                          <div className="flex items-center gap-6">
                            <label className="flex flex-col items-center gap-1 cursor-pointer">
                              <span className="text-[10px] text-slate-400 font-medium">Email</span>
                              <div className={`w-9 h-5 rounded-full transition-all relative ${item.email ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4]" : "bg-slate-200"}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.email ? "left-4" : "left-0.5"}`} />
                              </div>
                            </label>
                            <label className="flex flex-col items-center gap-1 cursor-pointer">
                              <span className="text-[10px] text-slate-400 font-medium">Push</span>
                              <div className={`w-9 h-5 rounded-full transition-all relative ${item.push ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4]" : "bg-slate-200"}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.push ? "left-4" : "left-0.5"}`} />
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="pt-5 border-t border-border mt-4">
                  <button className="px-5 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── BUY CONNECTS PAGE ───────────────────────────────────────────────────────

function BuyConnectsPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [currency, setCurrency] = useState<"USD" | "XAF">("USD");
  const [selectedPackId, setSelectedPackId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"momo_mtn" | "momo_orange" | "card" | "paypal">("momo_mtn");
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  const packs = [
    { id: 1, connects: 10, priceUSD: 1.50, costPerConnectUSD: 0.15, unlocked: 1, label: "Starter Pack", save: null },
    { id: 2, connects: 20, priceUSD: 3.00, costPerConnectUSD: 0.15, unlocked: 3, label: "Starter Plus", save: null },
    { id: 3, connects: 50, priceUSD: 6.00, costPerConnectUSD: 0.12, unlocked: 8, label: "Most Popular", badge: "Most Popular", save: null },
    { id: 4, connects: 100, priceUSD: 10.00, costPerConnectUSD: 0.10, unlocked: 16, label: "Best Value", badge: "Best Value", save: "Save 33%" },
    { id: 5, connects: 200, priceUSD: 18.00, costPerConnectUSD: 0.09, unlocked: 33, label: "Power Pack", badge: "Power Pack", save: "Save 40%" },
  ];

  const selectedPack = packs.find(p => p.id === selectedPackId) || packs[0];

  const XAF_RATE = 600;
  const formatPrice = (usd: number) => {
    if (currency === "USD") {
      return `$${usd.toFixed(2)}`;
    } else {
      return `${Math.round(usd * XAF_RATE).toLocaleString()} XAF`;
    }
  };

  const getCostPerConnect = (usd: number) => {
    if (currency === "USD") {
      return `$${usd.toFixed(2)}/connect`;
    } else {
      return `${Math.round(usd * XAF_RATE)} XAF/connect`;
    }
  };

  const faqs = [
    {
      q: "Do Connects expire?",
      a: "Yes, Connects expire 1 year from the date of purchase. We always use your oldest Connects first when you submit proposals."
    },
    {
      q: "Can I get a refund?",
      a: "Purchased Connects are generally non-refundable unless there was a billing error. However, if a client cancels a job post without hiring, any Connects spent on your proposal will be automatically refunded."
    },
    {
      q: "What if my proposal is declined?",
      a: "Connects spent on submitted proposals are not returned if the client declines your proposal. They are only returned if the client cancels the job post."
    },
    {
      q: "Can I pay in XAF?",
      a: "Yes, we support local Cameroon mobile money payments (MTN Mobile Money and Orange Money) in XAF, processed instantly at competitive exchange rates."
    }
  ];

  const toggleFaq = (idx: number) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleNextStage = () => {
    if (stage === 1) {
      setStage(2);
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStage(3);
    }, 2000);
  };

  const getPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case "momo_mtn": return "MTN Mobile Money";
      case "momo_orange": return "Orange Money";
      case "card": return "Visa / Mastercard";
      case "paypal": return "PayPal";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={() => onNavigate("freelancer")}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </button>

        {/* STAGE 1 — Pick a Package */}
        {stage === 1 && (
          <div className="space-y-6">
            
            {/* Header Block */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Buy Connects</h1>
                <p className="text-sm text-slate-500 font-medium">Connects let you submit proposals and message clients on FIT.</p>
              </div>

              {/* Current balance display */}
              <div className="bg-[#0F172A] text-white py-3 px-5 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-800 self-start md:self-auto">
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-cyan-400" />
                  <span className="text-sm font-bold"><span className="text-cyan-400 font-mono text-base">42</span> Connects</span>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <span className="text-xs text-slate-400 font-semibold">Proposals left: <span className="text-amber-400 font-mono">~7</span></span>
              </div>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Show prices in</span>
              <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center gap-1 shadow-sm">
                <button
                  onClick={() => setCurrency("USD")}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currency === "USD"
                      ? "bg-[#0284C7] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🇺🇸 USD
                </button>
                <button
                  onClick={() => setCurrency("XAF")}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currency === "XAF"
                      ? "bg-[#0284C7] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🇨🇲 XAF
                </button>
              </div>
            </div>

            {/* Main content grid */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Column - Packages list */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packs.map((pack) => {
                    const isSelected = selectedPackId === pack.id;
                    return (
                      <div
                        key={pack.id}
                        onClick={() => setSelectedPackId(pack.id)}
                        className={`relative bg-white border-2 rounded-2xl p-6 cursor-pointer hover:border-[#0284C7]/50 hover:shadow-md transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-[#0284C7] ring-4 ring-[#0284C7]/10"
                            : "border-slate-200 shadow-sm"
                        }`}
                      >
                        {/* Selector checkmark */}
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-5 h-5 bg-[#0284C7] rounded-full flex items-center justify-center text-white">
                            <Check size={12} className="stroke-[3px]" />
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="flex items-center gap-1.5 mb-4">
                          {pack.badge && (
                            <span className="px-2 py-0.5 rounded bg-[#0284C7] text-white text-[10px] font-extrabold uppercase tracking-wide">
                              {pack.badge}
                            </span>
                          )}
                          {pack.save && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wide">
                              {pack.save}
                            </span>
                          )}
                          {!pack.badge && !pack.save && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px] font-bold">
                              {pack.label}
                            </span>
                          )}
                        </div>

                        {/* Middle block */}
                        <div>
                          <div className="text-3xl font-extrabold text-slate-900 mb-1">
                            {pack.connects} <span className="text-slate-400 text-lg font-bold">Connects</span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-xl font-bold text-slate-800">{formatPrice(pack.priceUSD)}</span>
                            <span className="text-xs text-slate-400 font-semibold">({getCostPerConnect(pack.costPerConnectUSD)})</span>
                          </div>
                        </div>

                        {/* Bottom Segmented bar */}
                        <div className="border-t border-slate-100 pt-4">
                          <div className="text-xs text-slate-500 font-semibold mb-1">
                            Good for <span className="text-[#0284C7] font-bold">~{pack.unlocked} proposals</span>
                          </div>
                          {/* Segmented bar indicator */}
                          <div className="flex gap-0.5 h-1.5 w-full rounded-full overflow-hidden bg-slate-100">
                            {Array.from({ length: 8 }).map((_, idx) => {
                              const limit = Math.ceil(pack.unlocked / 4.5);
                              return (
                                <div
                                  key={idx}
                                  className={`flex-1 h-full transition-colors duration-300 ${
                                    idx < limit
                                      ? "bg-[#0284C7]"
                                      : "bg-slate-200"
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Connects Usage Table */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <Info size={16} className="text-[#0284C7]" /> How Connects are used
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                    {[
                      { action: "Submit a proposal", cost: "6 connects" },
                      { action: "Send a message to a client (not in contract)", cost: "1 connects" },
                      { action: "Feature your proposal", cost: "2 connects" },
                      { action: "Bid on a premium job (talent tier)", cost: "16 connects" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700">
                        <span>{item.action}</span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[#0284C7] font-mono">{item.cost}</span>
                      </div>
                    ))}
                  </div>

                  {/* Refund notice banner */}
                  <div className="flex gap-2.5 items-start p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs font-medium text-slate-600">
                    <Info size={14} className="text-[#0284C7] mt-0.5 flex-shrink-0" />
                    <p>
                      Connects are refunded when a client closes a job without hiring, or if you withdraw before the client accepts proposals.
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column - Sidebar Summary & FAQs */}
              <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                
                {/* Selection summary sidebar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Your Selection</h3>
                  
                  {/* Selected pack highlight card */}
                  <div className="bg-[#0F172A] text-white p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-lg font-extrabold">{selectedPack.connects} Connects</div>
                      <div className="text-xs text-slate-400 font-semibold">{selectedPack.label}</div>
                    </div>
                    <div className="text-xl font-black text-cyan-400">{formatPrice(selectedPack.priceUSD)}</div>
                  </div>

                  {/* Pricing grid */}
                  <div className="space-y-2.5 text-sm font-semibold pt-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Balance after</span>
                      <span className="text-slate-800 font-mono">{42 + selectedPack.connects} connects</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Proposals unlocked</span>
                      <span className="text-emerald-600">+{selectedPack.unlocked} proposals</span>
                    </div>
                    <div className="flex justify-between text-slate-500 border-t border-slate-100 pt-2.5">
                      <span>Per connect</span>
                      <span className="text-slate-800 font-mono">{getCostPerConnect(selectedPack.costPerConnectUSD)}</span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    onClick={handleNextStage}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-2xl font-bold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    Continue to Payment <ArrowRight size={14} />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Lock size={11} className="text-emerald-500" /> Secure payment · No auto-renewal
                  </div>
                </div>

                {/* FAQ Accordion */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Common Questions</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {faqs.map((faq, idx) => {
                      const isOpen = faqOpen[idx];
                      return (
                        <div key={idx} className="text-slate-700">
                          <button
                            type="button"
                            onClick={() => toggleFaq(idx)}
                            className="w-full py-3.5 px-5 flex items-center justify-between text-left text-xs font-extrabold text-slate-800 hover:bg-slate-50 transition-colors"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown
                              size={14}
                              className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-4 text-xs font-semibold text-slate-500 leading-relaxed">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* STAGE 2 — Checkout */}
        {stage === 2 && (
          <form onSubmit={handlePay} className="space-y-6">
            
            {/* Back to Packages Link */}
            <button
              type="button"
              onClick={() => setStage(1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4"
            >
              <ChevronLeft size={14} /> Back to Packages
            </button>

            {/* Header Block */}
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Checkout</h1>
              <p className="text-sm text-slate-500 font-medium">Complete your purchase to add Connects to your wallet</p>
            </div>

            {/* Two Column Layout Grid */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Column - Payment Details & Currency */}
              <div className="flex-1 space-y-6">
                
                {/* Payment Method Block */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">Payment Method</h3>
                  
                  {/* Vertical stacked selector list */}
                  <div className="space-y-3">
                    {[
                      { id: "momo_mtn", name: "MTN Mobile Money", desc: "Instant · Cameroon", color: "bg-amber-400 text-slate-900", icon: "MoMo" },
                      { id: "momo_orange", name: "Orange Money", desc: "Instant · CEMAC", color: "bg-orange-500 text-white", icon: "OM" },
                      { id: "card", name: "Visa / Mastercard", desc: "Credit or Debit", color: "bg-[#0284C7] text-white", icon: "Card" },
                      { id: "paypal", name: "PayPal", desc: "International", color: "bg-[#003087] text-white", icon: "PP" },
                    ].map((m) => {
                      const isSelected = paymentMethod === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#0284C7] bg-[#F0F9FF]/20 shadow-sm"
                              : "border-slate-100 bg-white hover:border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Method icon box */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black tracking-tighter ${m.color}`}>
                              {m.icon}
                            </div>
                            <div>
                              <div className="text-sm font-extrabold text-slate-950">{m.name}</div>
                              <div className="text-xs text-slate-400 font-semibold">{m.desc}</div>
                            </div>
                          </div>

                          {/* Radio circle button */}
                          <div className="flex items-center justify-center">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? "border-[#0284C7]" : "border-slate-200"
                            }`}>
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form fields depending on selected payment method */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  
                  {/* Mobile Money inputs */}
                  {(paymentMethod === "momo_mtn" || paymentMethod === "momo_orange") && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 mb-1">
                          {paymentMethod === "momo_mtn" ? "MTN" : "Orange"} Mobile Money Number
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">You will receive a push notification to confirm payment</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="phone">
                          Phone Number (Cameroon)
                        </label>
                        <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0284C7]/20 focus-within:border-[#0284C7] shadow-sm bg-white">
                          <span className="bg-slate-50 border-r border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-500">
                            +237
                          </span>
                          <input
                            id="phone"
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="6XX XXX XXX"
                            className="flex-1 px-4 py-3.5 bg-white outline-none text-sm text-slate-800 font-bold"
                          />
                        </div>
                      </div>

                      {/* Warning notice box */}
                      <div className="flex gap-2.5 items-start p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-semibold text-amber-800">
                        <AlertCircle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p>
                          Make sure your phone is on and has sufficient {paymentMethod === "momo_mtn" ? "MTN MoMo" : "Orange Money"} balance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Credit Card inputs */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 mb-1">Visa / Mastercard Details</h3>
                        <p className="text-xs text-slate-400 font-medium">Processed securely through encryption protocols</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="cardholder">
                          Cardholder Name
                        </label>
                        <input
                          id="cardholder"
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Diane Ngono"
                          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] text-slate-800 font-semibold shadow-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="cardnumber">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            id="cardnumber"
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="•••• •••• •••• 4821"
                            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] text-slate-800 font-semibold shadow-sm pr-12"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                            <CreditCard size={18} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="expiry">
                            Expiry Date
                          </label>
                          <input
                            id="expiry"
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] text-slate-800 font-semibold shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="cvv">
                            CVV
                          </label>
                          <input
                            id="cvv"
                            type="text"
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] text-slate-800 font-semibold shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PayPal Details */}
                  {paymentMethod === "paypal" && (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-xs text-slate-500 font-semibold">
                        You will be redirected to PayPal's secure login screen to complete your payment.
                      </p>
                      <div className="inline-block py-2.5 px-5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
                        PayPal Gateway Active
                      </div>
                    </div>
                  )}

                </div>

                {/* Billing Currency toggle block */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">Billing Currency</h3>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-150">
                    <button
                      type="button"
                      onClick={() => setCurrency("USD")}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 text-center ${
                        currency === "USD"
                          ? "bg-white border border-slate-200 text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span className="text-xs mr-1">us</span> USD
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency("XAF")}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 text-center ${
                        currency === "XAF"
                          ? "bg-white border border-[#0284C7] text-[#0284C7] shadow-sm bg-[#F0F9FF]"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span className="text-xs mr-1">cm</span> XAF
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column - Order Summary Sidebar */}
              <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                
                {/* Order Summary sidebar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                  <h3 className="text-base font-extrabold text-slate-900">Order Summary</h3>

                  {/* Gradient Selected Pack Box */}
                  <div className="bg-gradient-to-r from-[#0D1117] via-[#0F2336] to-[#0D1117] text-white p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(2,132,199,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(2,132,199,0.3) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                    <div className="relative">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">You're purchasing</div>
                      <div className="text-2xl font-black">{selectedPack.connects} Connects</div>
                    </div>
                  </div>

                  {/* Item pricing detail list */}
                  <div className="space-y-3.5 text-sm font-semibold text-slate-500 pt-1">
                    <div className="flex justify-between">
                      <span>{selectedPack.connects} Connects pack</span>
                      <span className="text-slate-800 font-mono">{formatPrice(selectedPack.priceUSD)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per connect</span>
                      <span className="text-slate-800 font-mono">{getCostPerConnect(selectedPack.costPerConnectUSD)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span className="text-slate-400">Included</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-baseline justify-between">
                    <span className="text-base font-bold text-slate-900">Total</span>
                    <span className="text-xl font-extrabold text-[#0284C7] font-mono">{formatPrice(selectedPack.priceUSD)}</span>
                  </div>

                  {/* Balance Preview Card */}
                  <div className="bg-[#F0F9FF] border border-[#B3E0F2]/30 rounded-xl p-3.5 flex justify-between text-xs font-semibold">
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">After purchase</div>
                      <div className="text-slate-800 font-extrabold mt-0.5">{42 + selectedPack.connects} Connects</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Current balance</div>
                      <div className="text-slate-500 font-extrabold mt-0.5">42</div>
                    </div>
                  </div>

                  {/* Secure CTA Pay Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-2xl font-extrabold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={13} /> Pay {formatPrice(selectedPack.priceUSD)} Securely
                      </>
                    )}
                  </button>

                  {/* Security icons */}
                  <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1"><Lock size={11} className="text-amber-500" /> SSL Secured</span>
                    <span className="flex items-center gap-1"><Check size={11} className="text-emerald-500 stroke-[3px]" /> No auto-renewal</span>
                  </div>

                </div>

                {/* With connects you can details card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    WITH {selectedPack.connects} CONNECTS YOU CAN
                  </h4>
                  <div className="space-y-3 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-[#0284C7]" />
                      <span>Submit ~ <strong className="text-slate-800">{Math.floor(selectedPack.connects / 6)}</strong> proposals</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award size={16} className="text-amber-500" />
                      <span>Feature ~ <strong className="text-slate-800">{Math.floor(selectedPack.connects / 2)}</strong> bids as boosted</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare size={16} className="text-emerald-500" />
                      <span>Send ~ <strong className="text-slate-800">{selectedPack.connects}</strong> cold messages</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </form>
        )}

        {/* STAGE 3 — Done */}
        {stage === 3 && (
          <div className="max-w-md mx-auto text-center py-12 space-y-6">
            
            {/* Success Animation & Header */}
            <div className="flex flex-col items-center">
              
              {/* Checkmark circle */}
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-md mb-6 relative">
                <CheckCircle2 size={40} className="text-emerald-500" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full shadow-sm">
                  Zap
                </span>
              </div>

              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Payment Secured</h2>
              <p className="text-sm text-slate-500 font-semibold max-w-xs leading-relaxed">
                Thank you! Your connects have been added to your balance instantly.
              </p>
            </div>

            {/* Receipt details card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left divide-y divide-slate-100 space-y-4">
              
              <div className="pb-3 text-center">
                <span className="text-xs text-slate-400 uppercase font-extrabold tracking-wider">Transaction Receipt</span>
              </div>

              <div className="py-3 text-sm font-semibold space-y-2.5">
                <div className="flex justify-between text-slate-500">
                  <span>Package purchased</span>
                  <span className="text-slate-800 font-bold">{selectedPack.connects} Connects Pack</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Amount paid</span>
                  <span className="text-slate-800 font-bold font-mono">{formatPrice(selectedPack.priceUSD)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Payment method</span>
                  <span className="text-slate-800 font-bold">{getPaymentMethodLabel()}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-sm font-extrabold">
                <span className="text-slate-800">New Connects Balance</span>
                <span className="text-[#0284C7] font-mono text-lg">{42 + selectedPack.connects} Connects</span>
              </div>

            </div>

            {/* CTA action buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => onNavigate("freelancer")}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-2xl font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
              >
                Browse Jobs
              </button>
              <button
                onClick={() => {
                  setStage(1);
                  setPhoneNumber("");
                  setCardName("");
                  setCardNumber("");
                  setCardExpiry("");
                  setCardCvv("");
                }}
                className="w-full py-3 px-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-200 transition-colors"
              >
                Buy More Connects
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// ─── INTERNSHIPS PAGE ────────────────────────────────────────────────────────

function InternshipsPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [lang] = useLang();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = INTERNSHIPS.filter((intern) => {
    const matchSearch = search === "" || intern.title.toLowerCase().includes(search.toLowerCase()) || intern.company.toLowerCase().includes(search.toLowerCase()) || intern.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === "All" || intern.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-[#0D1117] tracking-tight">{t("internshipHub", lang)}</h1>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold flex items-center gap-1">
                <GraduationCap size={11} /> {t("forStudents", lang)}
              </span>
            </div>
            <p className="text-slate-500 text-sm">{t("internshipHubDesc", lang)}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-border focus-within:border-[#6366F1] transition-colors">
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === "en" ? "Search internships by title, company, or skill..." : "Rechercher par titre, entreprise ou compétence..."}
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {["All", "Remote", "On-site", "Hybrid"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${typeFilter === f ? "bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="text-sm text-slate-500 mb-4">{filtered.length} {lang === "en" ? "internships found" : "stages trouvés"}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((intern) => (
            <div key={intern.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-indigo-200 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-base text-[#0D1117] group-hover:text-[#6366F1] transition-colors">{intern.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <Building2 size={13} className="flex-shrink-0" />
                    <span className="font-medium">{intern.company}</span>
                    <span className="text-slate-300">·</span>
                    <MapPin size={12} className="flex-shrink-0" />
                    <span>{intern.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${intern.type === "Remote" ? "bg-blue-50 text-blue-700 border border-blue-200" : intern.type === "Hybrid" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                    {intern.type}
                  </span>
                  {intern.paid ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">{intern.stipend}</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">{lang === "en" ? "Unpaid" : "Non rémunéré"}</span>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed mb-4">{intern.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {intern.skills.map((s) => <SkillTag key={s} label={s} />)}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> {intern.duration}</span>
                </div>
                <button
                  onClick={() => { onNavigate("signup"); }}
                  className="px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {lang === "en" ? "Apply Now" : "Postuler"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SUPER ADMIN DASHBOARD ───────────────────────────────────────────────────

function AdminDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [lang] = useLang();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Stateful Admin Datasets for interactive front-end actions
  const [users, setUsers] = useState(ADMIN_USERS_LIST);
  const [projects, setProjects] = useState(ADMIN_PROJECTS_LIST);
  const [transactions, setTransactions] = useState(ADMIN_TRANSACTIONS_LIST);
  const [withdrawals, setWithdrawals] = useState(ADMIN_WITHDRAWALS_LIST);
  const [disputes, setDisputes] = useState(ADMIN_DISPUTES_LIST);
  const [reviews, setReviews] = useState(ADMIN_REVIEWS_LIST);
  const [categories, setCategories] = useState(ADMIN_CATEGORIES_LIST);
  const [skills, setSkills] = useState(ADMIN_SKILLS_LIST);
  const [notifications, setNotifications] = useState(ADMIN_NOTIFICATIONS_LIST);
  const [coupons, setCoupons] = useState(ADMIN_COUPONS_LIST);
  const [countries, setCountries] = useState(ADMIN_COUNTRIES_LIST);
  const [blogs, setBlogs] = useState(ADMIN_BLOGS_LIST);
  const [plans, setPlans] = useState(ADMIN_PLANS_LIST);

  // Search & filter states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  // Form states for creation
  const [newCatName, setNewCatName] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCat, setNewSkillCat] = useState("Software Development");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifAudience, setNotifAudience] = useState("All Users");
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("10%");
  const [newCountryName, setNewCountryName] = useState("");
  const [newCountryCurr, setNewCountryCurr] = useState("XAF");

  // Chat window state
  const [adminChatActive, setAdminChatActive] = useState(1);
  const [adminChatText, setAdminChatText] = useState("");
  const [adminChats, setAdminChats] = useState([
    { id: 1, name: "Diane Ngono", messages: [{ sender: "user", text: "Hello, my profile verification is still pending." }, { sender: "admin", text: "Let me check that right away." }] },
    { id: 2, name: "Afrikart Commerce", messages: [{ sender: "user", text: "We need assistance with withdrawing our escrow fund refund." }] },
  ]);

  // Settings states
  const [generalSettings, setGeneralSettings] = useState({ title: "Freelance Interconnect", domain: "fit.africa", email: "admin@fit.africa", supportPhone: "+237 677 000 111" });

  const groups = [
    {
      title: "Core System",
      items: [
        { id: 1, label: "Dashboard", icon: BarChart2 },
        { id: 14, label: "System Reports", icon: FileText },
        { id: 19, label: "System Settings", icon: Settings },
      ],
    },
    {
      title: "Users & Vetting",
      items: [
        { id: 2, label: "User Management", icon: Users },
        { id: 3, label: "Freelancer Verification", icon: ShieldCheck },
        { id: 4, label: "Client Records", icon: Building2 },
        { id: 9, label: "Review Moderator", icon: Star },
      ],
    },
    {
      title: "Projects & Operations",
      items: [
        { id: 5, label: "Project Directory", icon: Briefcase },
        { id: 8, label: "Dispute Center", icon: AlertCircle },
      ],
    },
    {
      title: "Financial Engine",
      items: [
        { id: 6, label: "Escrow Payments", icon: Wallet },
        { id: 7, label: "Withdrawal Requests", icon: DollarSign },
        { id: 15, label: "Subscription Plans", icon: Cpu },
        { id: 17, label: "Discount Coupons", icon: TagIcon },
      ],
    },
    {
      title: "Engagement & Content",
      items: [
        { id: 12, label: "System Broadcasts", icon: Bell },
        { id: 13, label: "Support Messages", icon: MessageSquare },
        { id: 18, label: "Editorial Blog", icon: FileCheck },
      ],
    },
    {
      title: "Platform Rules",
      items: [
        { id: 10, label: "Job Categories", icon: Layers },
        { id: 11, label: "Skills Library", icon: Code },
        { id: 16, label: "Supported Countries", icon: Globe },
        { id: 20, label: "Admin Profile", icon: Lock },
      ],
    },
  ];

  // Helper custom TagIcon since it's not standard
  function TagIcon(props: any) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
        <path d="M7 7h.01" />
      </svg>
    );
  }

  // Interactive action handlers
  const handleToggleUserStatus = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
  };

  const handleVerifyUser = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, verified: "verified" } : u));
  };

  const handleApproveWithdrawal = (id: number) => {
    setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: "Approved" } : w));
  };

  const handleRejectWithdrawal = (id: number) => {
    setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: "Rejected" } : w));
  };

  const handleResolveDispute = (id: string) => {
    setDisputes(disputes.map(d => d.id === id ? { ...d, status: "Resolved" } : d));
  };

  const handleToggleReviewVisibility = (id: number) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r));
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    setCategories([...categories, { id: Date.now(), name: newCatName, icon: "Layers", count: 0 }]);
    setNewCatName("");
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { id: Date.now(), skill: newSkillName, category: newSkillCat, count: 0 }]);
    setNewSkillName("");
  };

  const handleSendNotification = () => {
    if (!notifTitle.trim() || !notifMsg.trim()) return;
    setNotifications([{ id: Date.now(), title: notifTitle, message: notifMsg, audience: notifAudience, date: "Just Now" }, ...notifications]);
    setNotifTitle("");
    setNotifMsg("");
  };

  const handleAddCoupon = () => {
    if (!newCouponCode.trim()) return;
    setCoupons([...coupons, { id: Date.now(), code: newCouponCode.toUpperCase(), discount: newCouponDiscount, expiryDate: "Dec 31, 2026", status: "Active" }]);
    setNewCouponCode("");
  };

  const handleAddCountry = () => {
    if (!newCountryName.trim()) return;
    setCountries([...countries, { id: Date.now(), country: newCountryName, currency: newCountryCurr, status: "Active" }]);
    setNewCountryName("");
  };

  const handleSendAdminChatMessage = () => {
    if (!adminChatText.trim()) return;
    setAdminChats(adminChats.map(c => c.id === adminChatActive ? { ...c, messages: [...(c.messages || []), { sender: "admin", text: adminChatText }] } : c));
    setAdminChatText("");
  };

  const simulateExport = (type: string) => {
    setExportLoading(type);
    setTimeout(() => {
      setExportLoading(null);
      alert(`Report exported successfully as ${type}!`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#0D1117] text-slate-300 flex-shrink-0 transition-all duration-300 flex flex-col border-r border-slate-800`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <FITLogo theme="dark" size="sm" />
            {sidebarOpen && <span className="font-extrabold text-xs text-cyan-400 border border-cyan-400/40 rounded px-1 flex-shrink-0">ADMIN</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
            <Menu size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
          {groups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {sidebarOpen && <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">{group.title}</div>}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${activeTab === item.id ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white shadow-md shadow-[#0284C7]/10" : "hover:bg-slate-800/50 hover:text-white"}`}
                >
                  <item.icon size={15} className="flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => onNavigate("landing")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 transition-all"
          >
            <LogOut size={14} />
            {sidebarOpen && <span>Exit Dashboard</span>}
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-extrabold text-[#0D1117] text-base leading-tight">Super Admin Panel</h2>
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-border text-[10px] font-bold text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM OK · DOUALA-SECURE
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-50 border border-border rounded-lg p-1.5">
              <Avatar initials="AD" gradient="from-slate-700 to-slate-900" size="sm" />
              <div className="text-left hidden md:block px-1">
                <div className="text-xs font-bold text-[#0D1117]">System Administrator</div>
                <div className="text-[10px] text-slate-400">Level 4 access</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Panel */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 1 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "Total Users", value: "1,842", sub: "+12% this week", color: "text-[#0284C7]", icon: Users },
                  { label: "Active Projects", value: "320", sub: "28 in escrow", color: "text-indigo-600", icon: Briefcase },
                  { label: "Total Revenue", value: "XAF 8.4M", sub: "USD 14.2K converted", color: "text-emerald-600", icon: DollarSign },
                  { label: "Pending Withdrawals", value: "3 requests", sub: "Action required", color: "text-amber-600", icon: Wallet },
                  { label: "Open Disputes", value: "1 case", sub: "Review arguments", color: "text-red-600", icon: AlertCircle },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-border flex items-center justify-center">
                        <stat.icon size={13} className="text-slate-500" />
                      </div>
                    </div>
                    <div className={`text-xl font-extrabold ${stat.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-medium">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Premium Charts & Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Column */}
                <div className="bg-white rounded-2xl border border-border p-5 lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#0D1117]">Revenue Performance</h3>
                      <p className="text-[10px] text-slate-400">Total volume processed through escrows (Millions XAF)</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+18.4% MoM</span>
                  </div>
                  {/* Clean SVG Area Chart */}
                  <div className="h-48 w-full bg-slate-50 border border-border rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 90 Q 20 60 40 75 T 80 40 T 100 30 L 100 100 L 0 100 Z" fill="url(#chartGradient)" />
                      <path d="M 0 90 Q 20 60 40 75 T 80 40 T 100 30" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <div className="flex justify-between items-start z-10">
                      <span className="text-[9px] font-bold text-slate-400">8.0M</span>
                      <span className="text-[9px] font-bold text-slate-400">4.5M</span>
                      <span className="text-[9px] font-bold text-slate-400">2.0M</span>
                    </div>
                    <div className="flex justify-between items-end z-10 text-[9px] font-bold text-slate-400">
                      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    </div>
                  </div>
                </div>

                {/* Categories Breakdown */}
                <div className="bg-white rounded-2xl border border-border p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#0D1117] mb-1">Earnings by Category</h3>
                    <p className="text-[10px] text-slate-400 mb-4">Volume allocation per expertise category</p>
                  </div>
                  <div className="space-y-3.5">
                    {[
                      { label: "Software Dev", pct: 65, color: "bg-[#0284C7]" },
                      { label: "Design", pct: 20, color: "bg-[#06B6D4]" },
                      { label: "Writing & Translation", pct: 10, color: "bg-emerald-500" },
                      { label: "Marketing", pct: 5, color: "bg-amber-500" },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>{item.label}</span><span>{item.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 2 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#0D1117]">User Directory</h3>
                  <p className="text-xs text-slate-500">Filter, edit and moderate registered user profiles</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-border">
                    <Search size={14} className="text-slate-400" />
                    <input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users..."
                      className="bg-transparent text-xs outline-none placeholder:text-slate-400 text-slate-700 w-40"
                    />
                  </div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs font-semibold text-slate-600 outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="freelancer">Freelancers Only</option>
                    <option value="client">Clients Only</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">User</th>
                      <th className="pb-3">Contact</th>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Vetting</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => {
                        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
                        const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
                        return matchesSearch && matchesRole;
                      })
                      .map((user) => (
                        <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 text-xs text-slate-600 transition-colors">
                          <td className="py-3 flex items-center gap-2.5">
                            <Avatar initials={user.photo} gradient="from-blue-500 to-indigo-600" size="xs" />
                            <div>
                              <div className="font-bold text-[#0D1117]">{user.name}</div>
                              <div className="text-[10px] text-slate-400">Joined {user.dateJoined}</div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>{user.email}</div>
                            <div className="text-[10px] text-slate-400">{user.phone}</div>
                          </td>
                          <td className="py-3 font-medium">{user.country}</td>
                          <td className="py-3 capitalize">
                            <Badge variant={user.role === "client" ? "blue" : "cyan"}>{user.role}</Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant={user.verified === "verified" ? "success" : user.verified === "pending" ? "warning" : "default"}>
                              {user.verified}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex w-2 h-2 rounded-full mr-1.5 ${user.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                            <span className="capitalize">{user.status}</span>
                          </td>
                          <td className="py-3 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0D1117] rounded-lg font-bold transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${user.status === "active" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                            >
                              {user.status === "active" ? "Suspend" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FREELANCER VERIFICATION */}
          {activeTab === 3 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Freelancer Verification Desk</h3>
                <p className="text-xs text-slate-500">Review and verify professional portfolios and identification badges</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users
                  .filter((u) => u.role === "freelancer")
                  .map((free) => (
                    <div key={free.id} className="p-4 bg-slate-50 rounded-xl border border-border flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2.5">
                          <Avatar initials={free.photo} gradient="from-blue-600 to-indigo-600" size="sm" />
                          <div>
                            <div className="font-bold text-sm text-[#0D1117]">{free.name}</div>
                            <div className="text-[10px] text-slate-400">Vetting status: <span className="font-semibold text-slate-600">{free.verified}</span></div>
                          </div>
                        </div>
                        <Badge variant={free.verified === "verified" ? "success" : "warning"}>{free.verified}</Badge>
                      </div>

                      <div className="mt-4 flex gap-2 justify-end">
                        {free.verified !== "verified" && (
                          <button
                            onClick={() => handleVerifyUser(free.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                          >
                            Approve Verification
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleUserStatus(free.id)}
                          className="px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          Suspend Account
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: CLIENT RECORDS */}
          {activeTab === 4 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Enterprise Clients</h3>
                <p className="text-xs text-slate-500">Overview of client platforms, budgets and activity logs</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Client Company</th>
                      <th className="pb-3">Contact Email</th>
                      <th className="pb-3">Jobs Posted</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => u.role === "client")
                      .map((client) => (
                        <tr key={client.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 text-xs text-slate-600">
                          <td className="py-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[#0D1117] border border-border">
                              {client.photo}
                            </div>
                            <span className="font-bold text-[#0D1117]">{client.name}</span>
                          </td>
                          <td className="py-3">{client.email}</td>
                          <td className="py-3 font-semibold">12 active projects</td>
                          <td className="py-3">
                            <Badge variant={client.status === "active" ? "success" : "danger"}>{client.status}</Badge>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(client.id)}
                              className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                            >
                              Suspend
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECT DIRECTORY */}
          {activeTab === 5 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#0D1117]">Project Directory</h3>
                  <p className="text-xs text-slate-500">Track milestones and project status allocations</p>
                </div>
                <div className="flex gap-1.5 bg-slate-50 border border-border rounded-xl p-1">
                  {["all", "In Progress", "Completed", "Cancelled"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setProjectFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${projectFilter === f ? "bg-white text-[#0D1117] shadow-sm border border-border" : "text-slate-500 hover:text-slate-900"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Project Title</th>
                      <th className="pb-3">Client</th>
                      <th className="pb-3">Freelancer</th>
                      <th className="pb-3">Budget</th>
                      <th className="pb-3">Deadline</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects
                      .filter((p) => projectFilter === "all" || p.status === projectFilter)
                      .map((proj) => (
                        <tr key={proj.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 text-xs text-slate-600">
                          <td className="py-3 font-bold text-[#0D1117]">{proj.name}</td>
                          <td className="py-3">{proj.client}</td>
                          <td className="py-3">{proj.freelancer}</td>
                          <td className="py-3 font-semibold text-slate-700">{proj.budget}</td>
                          <td className="py-3">{proj.deadline}</td>
                          <td className="py-3">
                            <Badge variant={proj.status === "Completed" ? "success" : proj.status === "In Progress" ? "blue" : proj.status === "Cancelled" ? "danger" : "default"}>
                              {proj.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ESCROW PAYMENTS */}
          {activeTab === 6 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Escrow Payments Logs</h3>
                <p className="text-xs text-slate-500">Monitor transaction pipelines, refunds and currency payouts</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Transaction ID</th>
                      <th className="pb-3">Parties</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment Method</th>
                      <th className="pb-3">Escrow Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 text-xs text-slate-600">
                        <td className="py-3 font-bold text-[#0D1117]">{txn.id}</td>
                        <td className="py-3">
                          <div className="font-medium text-[#0D1117]">{txn.client} (Client)</div>
                          <div className="text-[10px] text-slate-400">to {txn.freelancer} (Freelancer)</div>
                        </td>
                        <td className="py-3 font-semibold text-[#0D1117]">{txn.amount}</td>
                        <td className="py-3">{txn.method}</td>
                        <td className="py-3">
                          <Badge variant={txn.status === "Released" ? "success" : txn.status === "Escrow Funded" ? "blue" : "danger"}>
                            {txn.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          {txn.status === "Escrow Funded" && (
                            <button
                              onClick={() => {
                                setTransactions(transactions.map(t => t.id === txn.id ? { ...t, status: "Released" } : t));
                              }}
                              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                            >
                              Release Fund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: WITHDRAWAL REQUESTS */}
          {activeTab === 7 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border pb-4">
                {[
                  { label: "Pending Payouts", count: withdrawals.filter(w => w.status === "Pending").length, color: "text-amber-600" },
                  { label: "Approved Payouts", count: withdrawals.filter(w => w.status === "Approved").length, color: "text-emerald-600" },
                  { label: "Rejected Payouts", count: withdrawals.filter(w => w.status === "Rejected").length, color: "text-slate-500" },
                ].map((c, i) => (
                  <div key={i} className="bg-slate-50 p-3.5 rounded-xl border border-border text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.label}</div>
                    <div className={`text-2xl font-extrabold ${c.color} mt-1`}>{c.count}</div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Freelancer</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment Method</th>
                      <th className="pb-3">Request Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdraw) => (
                      <tr key={withdraw.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 text-xs text-slate-600">
                        <td className="py-3 font-bold text-[#0D1117]">{withdraw.freelancer}</td>
                        <td className="py-3 font-semibold text-slate-700">{withdraw.amount}</td>
                        <td className="py-3">{withdraw.method}</td>
                        <td className="py-3 text-slate-400">{withdraw.date}</td>
                        <td className="py-3">
                          <Badge variant={withdraw.status === "Approved" ? "success" : withdraw.status === "Pending" ? "warning" : "danger"}>
                            {withdraw.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right space-x-1.5">
                          {withdraw.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApproveWithdrawal(withdraw.id)}
                                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(withdraw.id)}
                                className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: DISPUTE CENTER */}
          {activeTab === 8 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Escrow Dispute Center</h3>
                <p className="text-xs text-slate-500">Coordinate and resolve milestone disagreements between clients and freelancers</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {disputes.map((disp) => (
                  <div key={disp.id} className="p-4 bg-slate-50 rounded-xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-extrabold text-sm text-[#0D1117]">{disp.id}</span>
                        <Badge variant={disp.status === "Resolved" ? "success" : disp.status === "Open" ? "danger" : "warning"}>
                          {disp.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">Project: {disp.project}</p>
                      <div className="text-[10px] text-slate-400 mt-1 flex gap-2">
                        <span>Client: {disp.client}</span>
                        <span>·</span>
                        <span>Freelancer: {disp.freelancer}</span>
                        <span>·</span>
                        <span>Opened: {disp.date}</span>
                      </div>
                    </div>
                    {disp.status !== "Resolved" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveDispute(disp.id)}
                          className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                          Mark as Resolved
                        </button>
                        <button
                          onClick={() => {
                            setDisputes(disputes.map(d => d.id === disp.id ? { ...d, status: "Closed" } : d));
                          }}
                          className="px-3 py-2 bg-white border border-border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          Close Case
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: REVIEW MODERATOR */}
          {activeTab === 9 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Review Moderator Desk</h3>
                <p className="text-xs text-slate-500">Monitor and manage platform reviews to prevent spam and platform misconduct</p>
              </div>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-border relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#0D1117]">{rev.reviewer}</span>
                        <span className="text-[10px] text-slate-400">reviewed</span>
                        <span className="font-bold text-xs text-[#0D1117]">{rev.user}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} size={12} className={idx < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
                      ))}
                    </div>
                    <p className={`text-xs ${rev.hidden ? "text-slate-400 italic line-through" : "text-slate-600"}`}>
                      {rev.hidden ? "[Hidden by Admin] " : ""}{rev.comment}
                    </p>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleReviewVisibility(rev.id)}
                        className="px-2.5 py-1.5 bg-white border border-border rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        {rev.hidden ? "Unhide Review" : "Hide Review"}
                      </button>
                      <button
                        onClick={() => setReviews(reviews.filter(r => r.id !== rev.id))}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition-colors"
                      >
                        Delete Permanent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: JOB CATEGORIES */}
          {activeTab === 10 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Platform Job Categories</h3>
                <p className="text-xs text-slate-500">Manage categories, icons and job assignments</p>
              </div>

              {/* Add category form */}
              <div className="flex gap-2 p-4 bg-slate-50 rounded-xl border border-border">
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New category name..."
                  className="bg-white px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700 flex-1"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Create Category
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 border border-border bg-white rounded-2xl relative group">
                    <div className="font-bold text-sm text-[#0D1117]">{cat.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{cat.count} jobs posted</div>
                    <button
                      onClick={() => setCategories(categories.filter(c => c.id !== cat.id))}
                      className="absolute top-2 right-2 p-1 hover:bg-red-50 text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <LogOut size={11} className="rotate-45" /> {/* simple cross representation */}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SKILLS LIBRARY */}
          {activeTab === 11 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Skills Dictionary</h3>
                <p className="text-xs text-slate-500">Define search tags and assign them to categories</p>
              </div>

              {/* Add form */}
              <div className="flex flex-col md:flex-row gap-2 p-4 bg-slate-50 rounded-xl border border-border">
                <input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="New skill tag (e.g. Next.js)..."
                  className="bg-white px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700 flex-1"
                />
                <select
                  value={newSkillCat}
                  onChange={(e) => setNewSkillCat(e.target.value)}
                  className="bg-white px-3 py-2 border border-border rounded-xl text-xs text-slate-600 outline-none"
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Add Tag
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Skill Tag</th>
                      <th className="pb-3">Category Association</th>
                      <th className="pb-3">Freelancers List Count</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((tag) => (
                      <tr key={tag.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 text-xs text-slate-600">
                        <td className="py-3 font-semibold text-[#0D1117]">{tag.skill}</td>
                        <td className="py-3 text-slate-500">{tag.category}</td>
                        <td className="py-3 font-bold">{tag.count || 24}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSkills(skills.filter(s => s.id !== tag.id))}
                            className="px-2 py-1 bg-red-50 text-red-500 rounded text-[10px] font-bold hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: SYSTEM BROADCASTS */}
          {activeTab === 12 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-border p-6 lg:col-span-2 space-y-4">
                <div>
                  <h3 className="font-bold text-base text-[#0D1117]">Create System Broadcast</h3>
                  <p className="text-xs text-slate-500">Send platform-wide notifications and announcements to user panels</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notification Title</label>
                    <input
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="Maintenance Announcement, Payment policy update..."
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Audience</label>
                    <select
                      value={notifAudience}
                      onChange={(e) => setNotifAudience(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs text-slate-600 outline-none"
                    >
                      <option>All Users</option>
                      <option>Freelancers Only</option>
                      <option>Clients Only</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Broadcast Message</label>
                    <textarea
                      value={notifMsg}
                      onChange={(e) => setNotifMsg(e.target.value)}
                      placeholder="Write announcement body here..."
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700 h-24 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSendNotification}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Broadcast Now
                  </button>
                </div>
              </div>

              {/* History */}
              <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
                <h3 className="font-bold text-sm text-[#0D1117]">Broadcast Logs</h3>
                <div className="space-y-3.5 overflow-y-auto max-h-80">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-border text-xs relative">
                      <div className="font-bold text-[#0D1117] mb-1">{n.title}</div>
                      <p className="text-slate-500 leading-relaxed mb-2">{n.message}</p>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>For {n.audience}</span>
                        <span>{n.date}</span>
                      </div>
                      <button
                        onClick={() => setNotifications(notifications.filter(item => item.id !== n.id))}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: SUPPORT MESSAGES */}
          {activeTab === 13 && (
            <div className="bg-white rounded-2xl border border-border h-[500px] overflow-hidden flex animate-fadeIn">
              {/* Chat Sidebar */}
              <div className="w-1/3 border-r border-border bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-border font-bold text-xs text-[#0D1117] uppercase tracking-wider">Active Inquiries</div>
                <div className="flex-1 overflow-y-auto">
                  {adminChats.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setAdminChatActive(c.id)}
                      className={`w-full text-left p-3.5 border-b border-border text-xs transition-colors flex items-center justify-between ${adminChatActive === c.id ? "bg-white border-l-2 border-l-[#0284C7]" : "hover:bg-slate-100"}`}
                    >
                      <span className="font-bold text-[#0D1117]">{c.name}</span>
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat panel */}
              <div className="flex-1 flex flex-col bg-white">
                <div className="p-4 border-b border-border font-bold text-xs text-[#0D1117]">
                  Conversation with {adminChats.find(c => c.id === adminChatActive)?.name}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {adminChats.find(c => c.id === adminChatActive)?.messages?.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 rounded-2xl max-w-sm text-xs ${m.sender === "admin" ? "bg-slate-800 text-white rounded-tr-sm" : "bg-slate-100 text-[#0D1117] rounded-tl-sm"}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border flex gap-2">
                  <input
                    value={adminChatText}
                    onChange={(e) => setAdminChatText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendAdminChatMessage()}
                    placeholder="Type reply message..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs outline-none text-[#0D1117]"
                  />
                  <button
                    onClick={handleSendAdminChatMessage}
                    className="px-3.5 py-2 bg-[#0D1117] hover:opacity-90 text-white rounded-xl text-xs font-semibold"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: SYSTEM REPORTS */}
          {activeTab === 14 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Platform Reports & Data Export</h3>
                <p className="text-xs text-slate-500">Download formatted databases for taxation audits and operations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { title: "Financial Revenue Statement", desc: "PDF export containing escrow payouts and commission cuts", format: "PDF", color: "from-rose-500 to-red-600" },
                  { title: "Active Freelancer Database", desc: "Excel file spreadsheet listing user profiles and skills tags", format: "Excel", color: "from-emerald-500 to-teal-600" },
                  { title: "Project Escrow Audits", desc: "CSV database documenting transaction IDs and released payouts", format: "CSV", color: "from-blue-500 to-indigo-600" },
                ].map((rep, idx) => (
                  <div key={idx} className="p-5 border border-border bg-slate-50 rounded-2xl flex flex-col justify-between h-48">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold text-white bg-gradient-to-r ${rep.color}`}>{rep.format}</span>
                      <h4 className="font-bold text-sm text-[#0D1117] mt-2">{rep.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{rep.desc}</p>
                    </div>
                    <button
                      onClick={() => simulateExport(rep.format)}
                      disabled={exportLoading !== null}
                      className="w-full py-2 bg-[#0D1117] hover:opacity-90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      {exportLoading === rep.format ? (
                        <>
                          <Loader2 size={12} className="animate-spin" /> Exporting...
                        </>
                      ) : (
                        `Download ${rep.format}`
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 15: SUBSCRIPTION PLANS */}
          {activeTab === 15 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Subscription Packages</h3>
                <p className="text-xs text-slate-500">Configure pricing structures and subscriber limits</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {plans.map((p) => (
                  <div key={p.id} className="p-5 border border-border rounded-2xl bg-slate-50/50 space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-[#0D1117]">{p.name}</h4>
                      <div className="text-lg font-extrabold text-[#0284C7] mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.price}</div>
                      <div className="text-[10px] text-slate-400">billed per {p.billing}</div>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-semibold text-slate-500">
                      <span>Subscribers</span>
                      <span className="text-[#0D1117]">{p.subscribers} users</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const newPrice = prompt(`Enter new price for ${p.name}:`, p.price);
                          if (newPrice !== null) {
                            setPlans(plans.map(item => item.id === p.id ? { ...item, price: newPrice } : item));
                          }
                        }}
                        className="w-full py-1.5 bg-white border border-border hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600"
                      >
                        Edit Price
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 16: SUPPORTED COUNTRIES */}
          {activeTab === 16 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Supported Trade Countries</h3>
                <p className="text-xs text-slate-500">Configure currency exchanges and regional operations</p>
              </div>

              {/* Add form */}
              <div className="flex flex-col md:flex-row gap-2 p-4 bg-slate-50 rounded-xl border border-border">
                <input
                  value={newCountryName}
                  onChange={(e) => setNewCountryName(e.target.value)}
                  placeholder="New Country Name (e.g. Senegal)..."
                  className="bg-white px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700 flex-1"
                />
                <input
                  value={newCountryCurr}
                  onChange={(e) => setNewCountryCurr(e.target.value)}
                  placeholder="Currency Code (e.g. XOF)..."
                  className="bg-white px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700 w-32"
                />
                <button
                  onClick={handleAddCountry}
                  className="px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Add Country
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Country</th>
                      <th className="pb-3">Local Currency</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((c) => (
                      <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 text-xs text-slate-600">
                        <td className="py-3 font-semibold text-[#0D1117]">{c.country}</td>
                        <td className="py-3 text-slate-500">{c.currency}</td>
                        <td className="py-3">
                          <Badge variant={c.status === "Active" ? "success" : "danger"}>{c.status}</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setCountries(countries.map(item => item.id === c.id ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item));
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 17: DISCOUNT COUPONS */}
          {activeTab === 17 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Promotion Coupons</h3>
                <p className="text-xs text-slate-500">Provide Connects discount structures and campaigns</p>
              </div>

              {/* Add form */}
              <div className="flex flex-col md:flex-row gap-2 p-4 bg-slate-50 rounded-xl border border-border">
                <input
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="Coupon Code (e.g. DIBOMBA)..."
                  className="bg-white px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700 flex-1 uppercase"
                />
                <select
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="bg-white px-3 py-2 border border-border rounded-xl text-xs text-slate-600 outline-none"
                >
                  <option value="5%">5% Discount</option>
                  <option value="10%">10% Discount</option>
                  <option value="15%">15% Discount</option>
                  <option value="20%">20% Discount</option>
                  <option value="50%">50% Discount</option>
                </select>
                <button
                  onClick={handleAddCoupon}
                  className="px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Create Code
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Promo Code</th>
                      <th className="pb-3">Discount Pct</th>
                      <th className="pb-3">Expiry</th>
                      <th className="pb-3">Campaign Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 text-xs text-slate-600">
                        <td className="py-3 font-extrabold text-indigo-600">{c.code}</td>
                        <td className="py-3 font-semibold text-[#0D1117]">{c.discount}</td>
                        <td className="py-3 text-slate-400">{c.expiryDate}</td>
                        <td className="py-3">
                          <Badge variant={c.status === "Active" ? "success" : "default"}>{c.status}</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setCoupons(coupons.filter(item => item.id !== c.id))}
                            className="px-2 py-1 bg-red-50 text-red-500 rounded text-[10px] font-bold hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 18: EDITORIAL BLOG */}
          {activeTab === 18 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#0D1117]">Editorial Blog Posts</h3>
                  <p className="text-xs text-slate-500">Draft, edit and publish resource articles for the user landing page</p>
                </div>
                <button
                  onClick={() => {
                    const title = prompt("Enter new article title:");
                    if (title) {
                      setBlogs([...blogs, { id: Date.now(), title, category: "Tips", status: "Draft", date: "Just Now" }]);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Create Article
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {blogs.map((b) => (
                  <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0D1117]">{b.title}</h4>
                      <div className="text-[10px] text-slate-400 mt-1 flex gap-2">
                        <span>Category: {b.category}</span>
                        <span>·</span>
                        <span>Created: {b.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={b.status === "Published" ? "success" : "default"}>{b.status}</Badge>
                      {b.status !== "Published" && (
                        <button
                          onClick={() => {
                            setBlogs(blogs.map(item => item.id === b.id ? { ...item, status: "Published" } : item));
                          }}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => setBlogs(blogs.filter(item => item.id !== b.id))}
                        className="px-2.5 py-1.5 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 19: SYSTEM SETTINGS */}
          {activeTab === 19 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">System Settings</h3>
                <p className="text-xs text-slate-500">Configure global metadata headers and customer support references</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-border">General Settings</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Platform Title</label>
                    <input
                      value={generalSettings.title}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, title: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Custom Domain</label>
                    <input
                      value={generalSettings.domain}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, domain: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-border">Contact Information</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Support Email Address</label>
                    <input
                      value={generalSettings.email}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Support Phone Hotline</label>
                    <input
                      value={generalSettings.supportPhone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  onClick={() => alert("Settings saved successfully!")}
                  className="px-5 py-2.5 bg-[#0D1117] hover:opacity-90 text-white rounded-xl text-xs font-bold"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          )}

          {/* TAB 20: ADMIN PROFILE */}
          {activeTab === 20 && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6 animate-fadeIn max-w-xl">
              <div>
                <h3 className="font-bold text-base text-[#0D1117]">Administrator Profile</h3>
                <p className="text-xs text-slate-500">Edit credentials and authentication parameters</p>
              </div>

              <div className="flex items-center gap-4 border-b border-border pb-6">
                <Avatar initials="AD" gradient="from-slate-700 to-slate-900" size="xl" />
                <div>
                  <h4 className="font-bold text-sm text-[#0D1117]">System Administrator</h4>
                  <p className="text-xs text-slate-400">admin@fit.africa</p>
                  <button className="mt-2 px-3 py-1.5 border border-border hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 transition-colors">
                    Upload Photo
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admin Name</label>
                    <input defaultValue="Adolf Eko" className="w-full px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Secure Phone</label>
                    <input defaultValue="+237 671 00 22 11" className="w-full px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input defaultValue="admin@fit.africa" className="w-full px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700" />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  onClick={() => alert("Profile updated!")}
                  className="px-5 py-2.5 bg-[#0D1117] hover:opacity-90 text-white rounded-xl text-xs font-bold"
                >
                  Update Profile
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Details Modal (Interactive View) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-[#0D1117]">User Profile Inspection</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-slate-100 rounded text-slate-500">×</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar initials={selectedUser.photo} gradient="from-blue-600 to-indigo-600" size="md" />
                <div>
                  <div className="font-bold text-sm text-[#0D1117]">{selectedUser.name}</div>
                  <div className="text-xs text-slate-400 capitalize">{selectedUser.role}</div>
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-border text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">Email:</span>
                  <span className="text-[#0D1117] font-semibold">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">Phone:</span>
                  <span className="text-[#0D1117] font-semibold">{selectedUser.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">Country:</span>
                  <span className="text-[#0D1117] font-semibold">{selectedUser.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">Joined:</span>
                  <span className="text-slate-500">{selectedUser.dateJoined}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">Vetting Status:</span>
                  <span className="font-semibold capitalize">{selectedUser.verified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">Account status:</span>
                  <span className="font-semibold capitalize">{selectedUser.status}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-2 bg-[#0D1117] hover:opacity-90 text-white rounded-xl text-xs font-bold mt-4"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded styles for animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// ─── BOOTLOADER ──────────────────────────────────────────────────────────────

function Bootloader() {
  const [fade, setFade] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const fadeTimeout = setTimeout(() => {
      setFade(true);
    }, 3000);

    const unmountTimeout = setTimeout(() => {
      setMounted(false);
    }, 3500);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(unmountTimeout);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0D1117] transition-opacity duration-500 ease-out ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        
        {/* Glowing background halo */}
        <div className="absolute -inset-10 rounded-full bg-[#0284C7]/20 blur-3xl animate-pulse" />
        
        {/* Animated logo badge */}
        <div className="relative w-28 h-28 bg-[#161F30]/85 border border-slate-800 rounded-3xl p-5 flex items-center justify-center shadow-2xl backdrop-blur-md">
          {/* Dashboard ring indicator */}
          <div className="absolute inset-0 rounded-3xl border border-dashed border-cyan-400/40 animate-[spin_20s_linear_infinite]" />
          
          <img
            src="/loader-logo.png"
            alt="FIT Load Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse"
          />
        </div>

        {/* Loading details */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="text-white font-extrabold text-lg tracking-wider uppercase" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Freelance Interconnect
          </div>
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.25em] animate-pulse">
            Booting system...
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── APP ROOT ────────────────────────────────────────────────────────────────

export default function App({ initialRole = "guest", initialView = "landing" }: { initialRole?: Role; initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  const [role, setRole] = useState<Role>(initialRole);

  const handleNavigate = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRoleSwitch = (r: Role) => setRole(r);

  const hideNav = view === "login" || view === "signup" || view === "admin";

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Bootloader />
      {!hideNav && <Navbar view={view} role={role} onNavigate={handleNavigate} onRoleSwitch={handleRoleSwitch} />}
      {view === "landing" && <LandingPage onNavigate={handleNavigate} onRoleSwitch={handleRoleSwitch} />}
      {view === "freelancer" && <FreelancerDashboard onNavigate={handleNavigate} />}
      {view === "proposal" && <ProposalPage onNavigate={handleNavigate} />}
      {view === "client" && <ClientDashboard onNavigate={handleNavigate} />}
      {view === "talent" && <TalentSearch onNavigate={handleNavigate} />}
      {view === "wizard" && <JobWizard onNavigate={handleNavigate} />}
      {view === "messages" && <MessengerPage />}
      {view === "contracts" && <ContractsPage onNavigate={handleNavigate} />}
      {view === "login" && <LoginPage onNavigate={handleNavigate} onRoleSwitch={handleRoleSwitch} />}
      {view === "signup" && <SignupPage onNavigate={handleNavigate} onRoleSwitch={handleRoleSwitch} />}
      {view === "account" && <AccountPage onNavigate={handleNavigate} role={role} />}
      {view === "buy-connects" && <BuyConnectsPage onNavigate={handleNavigate} />}
      {view === "internships" && <InternshipsPage onNavigate={handleNavigate} />}
      {view === "admin" && <AdminDashboard onNavigate={handleNavigate} />}
    </div>
  );
}
