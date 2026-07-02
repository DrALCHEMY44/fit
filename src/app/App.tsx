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
  CreditCard, Loader2,
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
  | "buy-connects";
type Role = "guest" | "freelancer" | "client";

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

// ─── NAVBAR ─────────────────────────────────────────────────────────────────

function Navbar({ view, role, onNavigate, onRoleSwitch }: {
  view: View; role: Role;
  onNavigate: (v: View) => void;
  onRoleSwitch: (r: Role) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
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
              <button onClick={() => { onRoleSwitch("freelancer"); onNavigate("freelancer"); }} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${textCls}`}>Find Work</button>
              <button onClick={() => { onRoleSwitch("client"); onNavigate("talent"); }} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${textCls}`}>Find Talent</button>
              <a href="#" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${textCls}`}>Why FIT</a>
            </>
          )}
          {role === "freelancer" && (
            <>
              <button onClick={() => onNavigate("freelancer")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "freelancer" ? "text-[#0284C7] bg-blue-50" : textCls}`}>Find Work</button>
              <button onClick={() => onNavigate("contracts")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "contracts" ? "text-[#0284C7] bg-blue-50" : textCls}`}>My Jobs</button>
              <button onClick={() => onNavigate("messages")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "messages" ? "text-[#0284C7] bg-blue-50" : textCls}`}>Messages</button>
            </>
          )}
          {role === "client" && (
            <>
              <button onClick={() => onNavigate("talent")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "talent" ? "text-[#0284C7] bg-blue-50" : textCls}`}>Find Talent</button>
              <button onClick={() => onNavigate("client")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "client" ? "text-[#0284C7] bg-blue-50" : textCls}`}>My Jobs</button>
              <button onClick={() => onNavigate("messages")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "messages" ? "text-[#0284C7] bg-blue-50" : textCls}`}>Messages</button>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {role === "guest" ? (
            <>
              <button onClick={() => onNavigate("login")} className={`hidden md:block text-sm font-medium px-4 py-2 rounded-lg transition-colors ${isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}>Log In</button>
              <button onClick={() => onNavigate("signup")} className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white hover:opacity-90 transition-opacity">
                Get Started
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
                  onClick={() => { onRoleSwitch(role === "freelancer" ? "client" : "freelancer"); onNavigate(role === "freelancer" ? "client" : "freelancer"); }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-medium text-slate-600"
                >
                  <RotateCcw size={11} />
                  {role === "freelancer" ? "Client View" : "Freelancer View"}
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
          <button onClick={() => { onNavigate("freelancer"); setMobileOpen(false); }} className={`text-sm font-medium px-3 py-2 rounded-lg text-left ${textCls}`}>Find Work</button>
          <button onClick={() => { onNavigate("talent"); setMobileOpen(false); }} className={`text-sm font-medium px-3 py-2 rounded-lg text-left ${textCls}`}>Find Talent</button>
          <button onClick={() => { onNavigate("messages"); setMobileOpen(false); }} className={`text-sm font-medium px-3 py-2 rounded-lg text-left ${textCls}`}>Messages</button>
          <button onClick={() => { onNavigate("contracts"); setMobileOpen(false); }} className={`text-sm font-medium px-3 py-2 rounded-lg text-left ${textCls}`}>Contracts</button>
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
              Africa's Premier Freelance Marketplace
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              Connecting Talents,
              <br />
              <span className="bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] bg-clip-text text-transparent">
                Building Dreams.
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-10">
              FREELANCE INTERCONNECT (FIT) bridges the gap between exceptional African talent and the world's best opportunities. Post jobs in XAF or USD. Hire verified freelancers from Cameroon and across the continent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => { onRoleSwitch("client"); onNavigate("wizard"); }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-semibold text-base hover:opacity-90 transition-opacity flex items-center gap-2 justify-center"
              >
                <Briefcase size={18} />
                Post a Job — Free
              </button>
              <button
                onClick={() => { onRoleSwitch("freelancer"); onNavigate("freelancer"); }}
                className="px-6 py-3.5 rounded-xl bg-white/8 border border-white/15 text-white font-semibold text-base hover:bg-white/12 transition-colors flex items-center gap-2 justify-center"
              >
                Join as a Freelancer
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-8 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Free to join</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> No subscription fees</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> XAF & USD payments</span>
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

      {/* Browse Categories */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0D1117] tracking-tight">Browse by Category</h2>
            <p className="text-slate-500 mt-1">Explore opportunities in your field of expertise</p>
          </div>
          <button onClick={() => { onRoleSwitch("freelancer"); onNavigate("freelancer"); }} className="hidden md:flex items-center gap-1.5 text-[#0284C7] font-semibold text-sm hover:gap-2.5 transition-all">
            View all categories <ArrowRight size={14} />
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
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">How FIT Works</h2>
            <p className="text-slate-400 mt-3">Go from idea to done — in four simple steps</p>
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

      {/* Featured Talent Teaser */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0D1117] tracking-tight">Top Talent on FIT</h2>
            <p className="text-slate-500 mt-1">Vetted professionals ready to work</p>
          </div>
          <button onClick={() => { onRoleSwitch("client"); onNavigate("talent"); }} className="hidden md:flex items-center gap-1.5 text-[#0284C7] font-semibold text-sm">
            Browse all talent <ArrowRight size={14} />
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

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-[#0284C7] to-[#06B6D4] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">Ready to get started?</h2>
          <p className="text-blue-100 text-lg mb-8">Join thousands of African freelancers and businesses already growing with FIT.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => { onRoleSwitch("client"); onNavigate("wizard"); }} className="px-7 py-3.5 bg-white text-[#0284C7] font-bold rounded-xl hover:bg-blue-50 transition-colors">
              Post a Job
            </button>
            <button onClick={() => { onRoleSwitch("freelancer"); onNavigate("freelancer"); }} className="px-7 py-3.5 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-colors">
              Find Work
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
              <p className="text-slate-500 text-sm mt-2 max-w-xs">Connecting Talents, Building Dreams — across Cameroon and the African continent.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              {[
                { title: "Platform", links: ["Find Work", "Find Talent", "Enterprise", "How It Works"] },
                { title: "Company", links: ["About FIT", "Blog", "Careers", "Press"] },
                { title: "Support", links: ["Help Center", "Trust & Safety", "Privacy Policy", "Terms"] },
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
              <span className="flex items-center gap-1"><Globe size={11} /> English</span>
              <span className="mx-2 text-slate-700">|</span>
              <span>XAF · USD · EUR</span>
            </div>
          </div>
        </div>
      </footer>
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
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "me", text: newMessage, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setNewMessage("");
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
                      { label: "GitHub", icon: "gh", connected: false, email: null, color: "bg-[#0D1117]" },
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

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [role, setRole] = useState<Role>("guest");

  const handleNavigate = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRoleSwitch = (r: Role) => setRole(r);

  const hideNav = view === "login" || view === "signup";

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
    </div>
  );
}
