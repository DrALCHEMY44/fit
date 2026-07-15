"use client";

import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
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
import * as fit from "../lib/api";
import { ApiError, type ApiUser } from "../lib/api";
import {
  unwrap, gradientFor, initialsOf, formatMoney, timeAgo,
  toJobVM, toFreelancerVM, toContractVM, toThreadVM, toMessageVM,
  toInternshipVM, toProposalVM,
  type JobVM, type FreelancerVM, type ContractVM, type ThreadVM,
  type MessageVM, type InternshipVM, type ProposalVM,
} from "../lib/adapters";

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

// ─── APP SESSION (real API auth state) ──────────────────────────────────────

type AppSession = {
  user: ApiUser | null;
  setUser: (user: ApiUser | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  selectedJobId: number | null;
  setSelectedJobId: (id: number | null) => void;
  openConversationId: number | null;
  setOpenConversationId: (id: number | null) => void;
};

const AppCtx = createContext<AppSession>({
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
  logout: async () => {},
  selectedJobId: null,
  setSelectedJobId: () => {},
  openConversationId: null,
  setOpenConversationId: () => {},
});

function useApp(): AppSession {
  return useContext(AppCtx);
}

function roleOf(user: ApiUser | null): Role {
  if (!user) return "guest";
  if (user.role === "admin" || user.role === "super_admin") return "admin";
  return user.role;
}

/** Fetch-on-mount helper with loading / error / reload state. */
function useFetch<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    loader()
      .then((result) => setData(result))
      .catch((err) => setError(err instanceof ApiError ? err.firstError : "Something went wrong."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}

function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
      <Loader2 size={28} className="animate-spin text-[#0284C7]" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <AlertCircle size={28} className="text-red-400" />
      <span className="text-sm font-medium text-slate-500">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
          Try again
        </button>
      )}
    </div>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
      <Info size={26} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

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

const ADMIN_BLOGS_LIST = [
  { id: 1, title: "How Mobile Money is Transforming African Freelancing", category: "FinTech", status: "Published", date: "June 26, 2025" },
  { id: 2, title: "Top 10 High-Income Tech Skills to Learn in Cameroon in 2025", category: "Education", status: "Draft", date: "June 24, 2025" },
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
  const { user, setUser, logout } = useApp();
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
                  onClick={async () => {
                    if (user && (user.role === "admin" || user.role === "super_admin")) {
                      onRoleSwitch("admin");
                      onNavigate("admin");
                      return;
                    }
                    const nextRole = role === "freelancer" ? "client" : "freelancer";
                    if (user) {
                      try {
                        const updated = unwrap(await fit.profile.switchRole(nextRole));
                        setUser(updated);
                      } catch {
                        return;
                      }
                    }
                    onRoleSwitch(nextRole);
                    onNavigate(nextRole === "client" ? "client" : "freelancer");
                  }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-medium text-slate-600"
                >
                  <RotateCcw size={11} />
                  {role === "freelancer" ? t("clientView", lang) : role === "client" ? t("freelancerView", lang) : t("freelancerView", lang)}
                </button>
                <button onClick={() => onNavigate("account")} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0284C7] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
                  {user ? initialsOf(user.name) : "FI"}
                </button>
                <button onClick={() => logout()} title="Log out" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <LogOut size={16} className={isDark ? "text-slate-400" : "text-slate-500"} />
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

  const landingState = useFetch(async () => {
    const [talent, internshipList] = await Promise.all([
      fit.freelancers.search({ sort: "rating" }).catch(() => null),
      fit.internships.list().catch(() => null),
    ]);
    return {
      topTalent: (talent?.data ?? []).slice(0, 3).map(toFreelancerVM),
      internships: (internshipList?.data ?? []).slice(0, 4).map(toInternshipVM),
    };
  }, []);

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
          {(landingState.data?.topTalent ?? []).map((f) => (
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
            {(landingState.data?.internships ?? []).map((intern) => (
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
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const { user, setSelectedJobId, refreshUser } = useApp();

  const jobsState = useFetch(async () => {
    const [feedResponse, saved] = await Promise.all([
      fit.jobs.list({ search: query || undefined, sort: "newest" }),
      fit.getToken() ? fit.favorites.list().catch(() => ({ jobs: [] as fit.ApiJob[], services: [], freelancers: [] })) : Promise.resolve({ jobs: [] as fit.ApiJob[], services: [], freelancers: [] }),
    ]);
    const savedIds = new Set(saved.jobs.map((job) => job.id));
    setSavedJobs(Array.from(savedIds));
    return {
      feed: feedResponse.data.map((job) => toJobVM(job, savedIds)),
      saved: saved.jobs.map((job) => toJobVM(job, savedIds)),
    };
  }, [query]);

  const statsState = useFetch(async () => {
    if (!fit.getToken()) return { proposals: 0, active: 0 };
    const [mine, active] = await Promise.all([
      fit.proposals.mine().catch(() => null),
      fit.orders.list({ role: "freelancer", status: "active" }).catch(() => null),
    ]);
    return { proposals: mine?.meta.total ?? 0, active: active?.meta.total ?? 0 };
  }, []);

  useEffect(() => {
    refreshUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSave = async (jobId: number, isSaved: boolean) => {
    setSavedJobs((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
    try {
      if (isSaved) {
        await fit.favorites.remove("job", jobId);
      } else {
        await fit.favorites.save("job", jobId);
      }
    } catch {
      setSavedJobs((prev) => (isSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId)));
    }
  };

  const openProposal = (jobId: number) => {
    setSelectedJobId(jobId);
    onNavigate("proposal");
  };

  const profile = user?.freelancer_profile;
  const connectsBalance = user?.connects_balance ?? 0;
  const completion = profile?.profile_completion ?? 0;

  const tabs = [
    { key: "feed", label: "My Feed" },
    { key: "matches", label: "Best Matches" },
    { key: "saved", label: `Saved (${savedJobs.length})` },
  ];

  const feed = jobsState.data?.feed ?? [];
  const displayJobs =
    activeTab === "saved"
      ? jobsState.data?.saved ?? []
      : activeTab === "matches"
        ? [...feed].sort((a, b) => a.proposals - b.proposals)
        : feed;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0 space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar initials={user ? initialsOf(user.name) : "FI"} gradient="from-[#0284C7] to-[#06B6D4]" size="lg" />
                <div>
                  <div className="font-bold text-sm text-[#0D1117]">{user?.name ?? "Guest"}</div>
                  <div className="text-xs text-slate-500">{profile?.title ?? "Complete your profile"}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${profile?.availability === "available" ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <span className={`text-xs font-medium ${profile?.availability === "available" ? "text-emerald-600" : "text-amber-600"}`}>
                      {profile?.availability === "busy" ? "Busy" : profile?.availability === "unavailable" ? "Unavailable" : "Available"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Profile completeness */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Profile completeness</span>
                  <span className="font-semibold text-[#0284C7]">{completion}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0284C7] to-[#06B6D4]" style={{ width: `${completion}%` }} />
                </div>
                {completion < 100 && <p className="text-xs text-slate-400 mt-1.5">Add skills and portfolio items to reach 100%</p>}
              </div>
              <div className="border-t border-border pt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Proposals", value: String(statsState.data?.proposals ?? "—") },
                  { label: "Connects", value: String(connectsBalance) },
                  { label: "Active", value: String(statsState.data?.active ?? "—") },
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
              <div className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{connectsBalance}</div>
              <div className="text-xs text-slate-500 mb-4">~{Math.floor(connectsBalance / 6)} proposals remaining</div>
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
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") setQuery(search); }}
                  placeholder="Search jobs, skills, keywords..."
                  className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <button onClick={() => setQuery(search)} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Search size={14} />
                Search
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
              {jobsState.loading && <LoadingBlock label="Loading jobs…" />}
              {jobsState.error && <ErrorBlock message={jobsState.error} onRetry={jobsState.reload} />}
              {!jobsState.loading && !jobsState.error && displayJobs.length === 0 && (
                <div className="bg-white rounded-2xl border border-border p-10 text-center">
                  <Bookmark size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">
                    {activeTab === "saved" ? "No saved jobs yet. Bookmark jobs to see them here." : "No jobs match your search yet."}
                  </p>
                </div>
              )}
              {!jobsState.loading && !jobsState.error && displayJobs.map((job) => {
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
                          onClick={() => openProposal(job.id)}
                          className="text-base font-bold text-[#0D1117] hover:text-[#0284C7] transition-colors text-left leading-snug"
                        >
                          {job.title}
                        </button>
                      </div>
                      <button
                        onClick={() => toggleSave(job.id, isSaved)}
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
                          onClick={() => openProposal(job.id)}
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
  const { user, selectedJobId, refreshUser } = useApp();
  const [bidRate, setBidRate] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("14");
  const [coverLetter, setCoverLetter] = useState("");
  const [milestones, setMilestones] = useState<{ id: number; name: string; amount: string; dueDate: string }[]>([
    { id: 1, name: "", amount: "", dueDate: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ connectsSpent: number; balance: number } | null>(null);

  const jobState = useFetch(async () => {
    if (selectedJobId) return toJobVM(unwrap(await fit.jobs.get(selectedJobId)));
    const feed = await fit.jobs.list({ sort: "newest" });
    return feed.data.length ? toJobVM(feed.data[0]) : null;
  }, [selectedJobId]);

  const totalBid = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  const handleSubmit = async () => {
    const job = jobState.data;
    if (!job) return;
    setSubmitting(true);
    setSubmitError(null);

    const filledMilestones = milestones.filter((m) => m.name.trim() && parseFloat(m.amount) > 0);
    const amount = filledMilestones.length > 0 ? totalBid : parseFloat(bidRate) || 0;

    try {
      const result = await fit.proposals.submit(job.id, {
        amount,
        delivery_days: Math.max(1, parseInt(deliveryDays, 10) || 14),
        cover_letter: coverLetter,
        milestones: filledMilestones.length
          ? filledMilestones.map((m) => ({ title: m.name, amount: parseFloat(m.amount), due_label: m.dueDate || undefined }))
          : undefined,
      });
      setSubmitted({ connectsSpent: result.connects_spent, balance: result.connects_balance });
      refreshUser().catch(() => {});
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.firstError : "Could not submit the proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (jobState.loading) {
    return <div className="min-h-screen bg-background"><LoadingBlock label="Loading job…" /></div>;
  }

  if (jobState.error || !jobState.data) {
    return (
      <div className="min-h-screen bg-background">
        <ErrorBlock message={jobState.error ?? "Job not found."} onRetry={jobState.reload} />
      </div>
    );
  }

  const job = jobState.data;
  const currencySymbol = job.budget.currency === "USD" ? "$" : "XAF ";
  const budgetLabel =
    job.type === "hourly"
      ? `${currencySymbol}${job.budget.min ?? 0}–${currencySymbol}${job.budget.max ?? 0}/hr`
      : formatMoney(job.budget.amount ?? job.budget.max ?? 0, job.budget.currency);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0D1117] mb-2">Proposal Sent!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your proposal has been submitted to {job.client.name}. You used {submitted.connectsSpent} Connects — {submitted.balance} remaining.
          </p>
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
                {job.client.paymentVerified && <Badge variant="success"><ShieldCheck size={10} /> Payment Verified</Badge>}
              </div>
              <h2 className="text-base font-bold text-[#0D1117] mb-3 leading-snug">{job.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{job.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Budget", value: budgetLabel },
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
              <h3 className="font-bold text-[#0D1117] mb-1">Your Bid</h3>
              <p className="text-xs text-slate-500 mb-4">The client's budget is {budgetLabel}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bid ({job.budget.currency})</label>
                  <div className="flex items-center gap-2 mt-2 px-4 py-3 border border-border rounded-xl bg-slate-50 focus-within:border-[#0284C7] focus-within:bg-white transition-colors">
                    <span className="text-slate-400 font-mono">{currencySymbol}</span>
                    <input
                      type="number"
                      value={totalBid > 0 ? String(totalBid) : bidRate}
                      disabled={totalBid > 0}
                      onChange={(e) => setBidRate(e.target.value)}
                      placeholder="0"
                      className="flex-1 bg-transparent outline-none text-lg font-bold text-[#0D1117] disabled:text-slate-400"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                  </div>
                  {totalBid > 0 && <p className="text-[11px] text-slate-400 mt-1">Computed from your milestones below.</p>}
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery Time (days)</label>
                  <div className="flex items-center gap-2 mt-2 px-4 py-3 border border-border rounded-xl bg-slate-50 focus-within:border-[#0284C7] focus-within:bg-white transition-colors">
                    <Clock size={15} className="text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-lg font-bold text-[#0D1117]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <span className="text-slate-400 text-sm">days</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 mt-1">
                    You'll receive {formatMoney((totalBid > 0 ? totalBid : parseFloat(bidRate) || 0) * 0.9, job.budget.currency)} after the 10% FIT commission.
                  </p>
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
                      <span className="text-slate-400 text-sm">{currencySymbol}</span>
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
                <span className="text-lg font-extrabold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatMoney(totalBid, job.budget.currency)}</span>
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
            {submitError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium">
                <AlertCircle size={16} className="flex-shrink-0" /> {submitError}
              </div>
            )}
            <div className="bg-white rounded-2xl border border-border p-5 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Submitting this proposal will use <span className="font-bold text-[#0D1117]">{job.connectsCost} Connects</span>. You have <span className="font-bold text-[#0284C7]">{user?.connects_balance ?? 0} remaining</span>.
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !coverLetter.trim() || (totalBid <= 0 && !(parseFloat(bidRate) > 0))}
                className="px-6 py-3 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
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
  const { user, refreshUser } = useApp();
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [jobProposals, setJobProposals] = useState<Record<number, ProposalVM[]>>({});
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const dashState = useFetch(async () => {
    const [myJobs, myOrders] = await Promise.all([
      fit.jobs.mine(),
      fit.orders.list({ role: "client" }),
    ]);
    return {
      jobs: myJobs.data.map((job) => toJobVM(job)),
      contracts: myOrders.data.map(toContractVM),
      totalOrders: myOrders.meta.total,
    };
  }, []);

  useEffect(() => {
    refreshUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contracts = dashState.data?.contracts ?? [];
  const activeJobs = dashState.data?.jobs ?? [];
  const openContracts = contracts.filter((c) => !["completed", "cancelled"].includes(c.status));
  const clientProfile = user?.client_profile;

  const clientStats = [
    { label: "Active Jobs", value: String(activeJobs.filter((j) => ["open", "in_selection"].includes(j.status)).length), icon: Briefcase, color: "text-[#0284C7]", bg: "bg-blue-50" },
    { label: "Open Contracts", value: String(openContracts.length), icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Spent", value: formatMoney(clientProfile?.total_spent ?? 0), icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Freelancers Hired", value: String(clientProfile?.hires_count ?? 0), icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  const escrowHeld = contracts.filter((c) => ["active", "submitted", "revision_requested"].includes(c.status)).reduce((sum, c) => sum + c.totalAmount, 0);
  const released = contracts.filter((c) => c.status === "completed").reduce((sum, c) => sum + c.totalAmount, 0);
  const pendingReview = contracts.filter((c) => c.status === "submitted").reduce((sum, c) => sum + c.totalAmount, 0);
  const spendMax = Math.max(escrowHeld, released, pendingReview, 1);

  const toggleProposals = async (jobId: number) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(jobId);
    if (!jobProposals[jobId]) {
      setProposalsLoading(true);
      try {
        const response = await fit.proposals.forJob(jobId);
        setJobProposals((prev) => ({ ...prev, [jobId]: response.data.map(toProposalVM) }));
      } catch (err) {
        setActionError(err instanceof ApiError ? err.firstError : "Could not load proposals.");
      } finally {
        setProposalsLoading(false);
      }
    }
  };

  const actOnProposal = async (proposal: ProposalVM, action: "accept" | "decline") => {
    setActionError(null);
    try {
      if (action === "accept") {
        await fit.proposals.accept(proposal.id);
        onNavigate("contracts");
      } else {
        await fit.proposals.decline(proposal.id);
      }
      const response = await fit.proposals.forJob(proposal.jobId);
      setJobProposals((prev) => ({ ...prev, [proposal.jobId]: response.data.map(toProposalVM) }));
      dashState.reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.firstError : "Action failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D1117] tracking-tight">Client Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">{clientProfile?.company_name ?? user?.name ?? "Your workspace"}{user?.city ? ` · ${user.city.name}, Cameroon` : ""}</p>
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
                {dashState.loading && <LoadingBlock label="Loading your jobs…" />}
                {dashState.error && <ErrorBlock message={dashState.error} onRetry={dashState.reload} />}
                {!dashState.loading && !dashState.error && activeJobs.length === 0 && (
                  <EmptyBlock message="No jobs yet — post your first one." />
                )}
                {activeJobs.map((job) => (
                  <div key={job.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${["open", "in_selection"].includes(job.status) ? "bg-emerald-400" : job.status === "contracted" ? "bg-blue-400" : "bg-amber-400"}`} />
                          <span className="font-semibold text-sm text-[#0D1117] truncate">{job.title}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="font-medium text-[#0D1117]">
                            {job.type === "hourly" ? `${job.budget.min ?? 0}–${job.budget.max ?? 0}/hr` : formatMoney(job.budget.amount, job.budget.currency)}
                          </span>
                          <span>{job.proposals} proposals</span>
                          <span>Posted {job.posted}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={["open", "in_selection"].includes(job.status) ? "success" : job.status === "contracted" ? "blue" : "warning"}>
                          {job.status === "open" ? "Live" : job.status === "in_selection" ? "Reviewing" : job.status === "contracted" ? "Hired" : job.status === "draft" ? "Draft" : job.status}
                        </Badge>
                      </div>
                    </div>
                    {["open", "in_selection"].includes(job.status) && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => toggleProposals(job.id)} className="px-3 py-1.5 bg-blue-50 text-[#0284C7] text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                          {expandedJobId === job.id ? "Hide Proposals" : `View ${job.proposals} Proposals`}
                        </button>
                        <button onClick={() => fit.jobs.close(job.id).then(dashState.reload)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                          Close Job
                        </button>
                      </div>
                    )}
                    {job.status === "draft" && (
                      <button onClick={() => fit.jobs.publish(job.id).then(dashState.reload)} className="mt-3 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors">
                        Publish Job
                      </button>
                    )}
                    {expandedJobId === job.id && (
                      <div className="mt-3 space-y-2">
                        {proposalsLoading && <div className="text-xs text-slate-400 py-2">Loading proposals…</div>}
                        {actionError && <div className="text-xs text-red-500 py-1">{actionError}</div>}
                        {(jobProposals[job.id] ?? []).length === 0 && !proposalsLoading && (
                          <div className="text-xs text-slate-400 py-2">No proposals yet.</div>
                        )}
                        {(jobProposals[job.id] ?? []).map((proposal) => (
                          <div key={proposal.id} className="p-3 bg-slate-50 rounded-xl border border-border">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar initials={initialsOf(proposal.freelancerName)} gradient={gradientFor(proposal.freelancerId)} size="sm" />
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-[#0D1117] truncate">{proposal.freelancerName}</div>
                                  <div className="text-[11px] text-slate-500">
                                    {formatMoney(proposal.amount, proposal.currency)} · {proposal.deliveryDays} days · {proposal.submitted}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {proposal.status === "accepted" ? (
                                  <Badge variant="success">Accepted</Badge>
                                ) : proposal.status === "declined" ? (
                                  <Badge variant="danger">Declined</Badge>
                                ) : (
                                  <>
                                    <button onClick={() => actOnProposal(proposal, "accept")} className="px-2.5 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:opacity-90">
                                      Accept & Hire
                                    </button>
                                    <button onClick={() => actOnProposal(proposal, "decline")} className="px-2.5 py-1.5 bg-white border border-border text-slate-500 text-[11px] font-bold rounded-lg hover:bg-slate-100">
                                      Decline
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            {proposal.coverLetter && <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{proposal.coverLetter}</p>}
                          </div>
                        ))}
                      </div>
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
              {openContracts.length === 0 && !dashState.loading && (
                <div className="px-6 py-6 text-xs text-slate-400">No open contracts yet.</div>
              )}
              {openContracts.slice(0, 4).map((c) => (
                <div key={c.id} className="px-6 py-4 border-b border-border last:border-b-0 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-[#0D1117]">{c.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">with {c.freelancer}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatMoney(c.totalAmount, c.currency)}</div>
                      <Badge variant={c.status === "active" ? "success" : c.status === "pending_payment" ? "warning" : "default"}>{c.status.replace(/_/g, " ")}</Badge>
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
                { label: "Escrow Held", value: formatMoney(escrowHeld), bar: Math.round((escrowHeld / spendMax) * 100) },
                { label: "Released", value: formatMoney(released), bar: Math.round((released / spendMax) * 100) },
                { label: "Pending Review", value: formatMoney(pendingReview), bar: Math.round((pendingReview / spendMax) * 100) },
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
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [inviteModal, setInviteModal] = useState<FreelancerVM | null>(null);
  const [inviteJobId, setInviteJobId] = useState<number | null>(null);
  const [inviteSending, setInviteSending] = useState(false);
  const [rateMax, setRateMax] = useState(100);
  const [sort, setSort] = useState<"rating" | "jss" | "rate_asc">("rating");
  const { user, setOpenConversationId } = useApp();

  // Debounced keyword search.
  useEffect(() => {
    const timeout = setTimeout(() => setQuery(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const categoriesState = useFetch(async () => (await fit.meta.categories()).data, []);

  const talentState = useFetch(async () => {
    const response = await fit.freelancers.search({
      search: query || undefined,
      category_id: selectedCategory ?? undefined,
      max_rate: rateMax < 100 ? rateMax : undefined,
      sort,
    });
    return response.data.map(toFreelancerVM);
  }, [query, selectedCategory, rateMax, sort]);

  const myJobsState = useFetch(async () => {
    if (!fit.getToken()) return [] as JobVM[];
    const response = await fit.jobs.mine("open").catch(() => null);
    return (response?.data ?? []).map((job) => toJobVM(job));
  }, []);

  const filtered = talentState.data ?? [];

  const startChat = async (freelancer: FreelancerVM, jobId?: number, inviteText?: string) => {
    if (!user) {
      onNavigate("login");
      return;
    }
    const conversation = unwrap(await fit.messaging.start(freelancer.userId, jobId ? { job_post_id: jobId } : {}));
    if (inviteText) {
      await fit.messaging.send(conversation.id, inviteText);
    }
    setOpenConversationId(conversation.id);
    onNavigate("messages");
  };

  const sendInvite = async () => {
    if (!inviteModal || !inviteJobId) return;
    setInviteSending(true);
    try {
      const job = myJobsState.data?.find((j) => j.id === inviteJobId);
      await startChat(inviteModal, inviteJobId, `Hi ${inviteModal.name.split(" ")[0]} — I'd like to invite you to send a proposal for my job "${job?.title ?? "my job"}" on FIT.`);
      setInviteModal(null);
    } finally {
      setInviteSending(false);
    }
  };

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
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${selectedCategory === null ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              All
            </button>
            {(categoriesState.data ?? []).slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${selectedCategory === cat.id ? "bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {cat.name_en}
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
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-slate-600 outline-none"
              >
                <option value="rating">Sort: Best Rated</option>
                <option value="jss">Highest JSS</option>
                <option value="rate_asc">Lowest Rate</option>
              </select>
            </div>
            {talentState.loading && <LoadingBlock label="Searching talent…" />}
            {talentState.error && <ErrorBlock message={talentState.error} onRetry={talentState.reload} />}
            {!talentState.loading && !talentState.error && filtered.length === 0 && (
              <EmptyBlock message="No freelancers match your filters yet." />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!talentState.loading && filtered.map((f) => (
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
                      <button onClick={() => startChat(f).catch(() => {})} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1">
                        <MessageSquare size={11} /> Message
                      </button>
                      <button onClick={() => { setInviteModal(f); setInviteJobId(null); }} className="px-3 py-1.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
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
              Select which job to invite <strong>{inviteModal.name}</strong> to:
            </p>
            <div className="space-y-2 mb-5">
              {(myJobsState.data ?? []).length === 0 && (
                <p className="text-xs text-slate-400">You have no open jobs. Post one first from the Job Wizard.</p>
              )}
              {(myJobsState.data ?? []).map((j) => (
                <label key={j.id} className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:border-[#0284C7] transition-colors">
                  <input type="radio" name="inviteJob" checked={inviteJobId === j.id} onChange={() => setInviteJobId(j.id)} className="accent-[#0284C7]" />
                  <span className="text-sm text-slate-700 font-medium">{j.title}</span>
                </label>
              ))}
            </div>
            <button
              onClick={sendInvite}
              disabled={!inviteJobId || inviteSending}
              className="w-full py-3 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
            >
              {inviteSending ? "Sending…" : "Send Invitation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── JOB POST WIZARD ─────────────────────────────────────────────────────────

function JobWizard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    categoryId: null as number | null,
    category: "",
    description: "",
    skills: [] as string[],
    duration: "",
    level: "",
    budgetType: "fixed" as "fixed" | "hourly",
    fixedAmount: "",
    hourlyMin: "",
    hourlyMax: "",
    currency: "XAF",
  });
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [contactWarning, setContactWarning] = useState<string | null>(null);

  const categoriesState = useFetch(async () => (await fit.meta.categories()).data, []);
  const skillsState = useFetch(async () => (await fit.meta.skills()).data, []);

  const steps = [
    { num: 1, label: "Title & Category" },
    { num: 2, label: "Skills Required" },
    { num: 3, label: "Scope & Level" },
    { num: 4, label: "Budget" },
  ];

  const canProceed = (s: number) => {
    if (s === 1) return form.title.length > 5 && form.categoryId !== null;
    if (s === 2) return form.skills.length > 0;
    if (s === 3) return form.duration !== "" && form.level !== "";
    return true;
  };

  const handlePublish = async () => {
    if (!form.categoryId) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const skillIds = (skillsState.data ?? [])
        .filter((skill) => form.skills.includes(skill.name))
        .map((skill) => skill.id);

      const result = await fit.jobs.create({
        title: form.title,
        description: form.description || form.title,
        category_id: form.categoryId,
        budget_type: form.budgetType,
        budget_min: form.budgetType === "fixed" ? parseFloat(form.fixedAmount) || 0 : parseFloat(form.hourlyMin) || 0,
        budget_max: form.budgetType === "fixed" ? parseFloat(form.fixedAmount) || 0 : parseFloat(form.hourlyMax) || 0,
        currency: form.currency,
        duration: form.duration,
        experience_level: form.level.toLowerCase(),
        mode: "remote",
        skill_ids: skillIds,
        publish: true,
      });
      setContactWarning(result.contact_warning);
      setPublished(true);
    } catch (err) {
      setPublishError(err instanceof ApiError ? err.firstError : "Could not publish the job.");
    } finally {
      setPublishing(false);
    }
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
          {contactWarning && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">{contactWarning}</p>
          )}
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
                {categoriesState.loading && <div className="text-xs text-slate-400 py-2">Loading categories…</div>}
                <div className="grid grid-cols-2 gap-2">
                  {(categoriesState.data ?? []).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setForm({ ...form, categoryId: cat.id, category: cat.name_en })}
                      className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${form.categoryId === cat.id ? "border-[#0284C7] bg-blue-50 text-[#0284C7]" : "border-border text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      {cat.name_en}
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
                {skillsState.loading && <div className="text-xs text-slate-400 py-2">Loading skills…</div>}
                <div className="flex flex-wrap gap-2">
                  {(skillsState.data ?? []).map((apiSkill) => {
                    const skill = apiSkill.name;
                    const selected = form.skills.includes(skill);
                    return (
                      <button
                        key={apiSkill.id}
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
                  {["XAF", "USD"].map((cur) => (
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
            <div className="flex flex-col items-end gap-2">
              {publishError && <span className="text-xs text-red-500 font-medium">{publishError}</span>}
              <button onClick={handlePublish} disabled={publishing} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-60">
                {publishing ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />} Publish Job Post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MESSENGER ───────────────────────────────────────────────────────────────

function MessengerPage() {
  const { user, openConversationId, setOpenConversationId } = useApp();
  const myUserId = user?.id ?? 0;
  const [activeThread, setActiveThread] = useState<ThreadVM | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<MessageVM[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [contactWarning, setContactWarning] = useState<string | null>(null);
  const [threadSearch, setThreadSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "contract" | "interview">("all");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [selectedDuration, setSelectedDuration] = useState("30 min");
  const [interviewNote, setInterviewNote] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const threadsState = useFetch(async () => {
    const response = await fit.messaging.conversations();
    return response.data.map((conversation) => toThreadVM(conversation, myUserId));
  }, [myUserId]);

  // Select the requested conversation (e.g. from Talent Search) or the first one.
  useEffect(() => {
    const threads = threadsState.data ?? [];
    if (threads.length === 0) return;
    const preferred = openConversationId ? threads.find((thread) => thread.id === openConversationId) : null;
    setActiveThread((current) => preferred ?? current ?? threads[0]);
    if (preferred) setOpenConversationId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadsState.data]);

  const loadMessages = useCallback(async (conversationId: number, showSpinner: boolean) => {
    if (showSpinner) setMessagesLoading(true);
    try {
      const response = await fit.messaging.messages(conversationId);
      setMessages(response.data.map((message) => toMessageVM(message, myUserId)).reverse());
      fit.messaging.markRead(conversationId).catch(() => {});
    } finally {
      if (showSpinner) setMessagesLoading(false);
    }
  }, [myUserId]);

  // Load messages when a thread opens, then poll for new ones.
  useEffect(() => {
    if (!activeThread) return;
    loadMessages(activeThread.id, true).catch(() => {});
    const poller = setInterval(() => loadMessages(activeThread.id, false).catch(() => {}), 8000);
    return () => clearInterval(poller);
  }, [activeThread?.id, loadMessages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendText = async (text: string) => {
    if (!activeThread || !text.trim()) return;
    setSendError(null);
    try {
      const result = await fit.messaging.send(activeThread.id, text);
      setContactWarning(result.contact_warning);
      const sent = unwrap(result.message) as fit.ApiMessage;
      setMessages((prev) => [...prev, toMessageVM(sent, myUserId)]);
    } catch (err) {
      setSendError(err instanceof ApiError ? err.firstError : "Message failed to send.");
    }
  };

  const handleSend = async () => {
    const text = newMessage;
    setNewMessage("");
    await sendText(text);
  };

  const handleScheduleInterview = async () => {
    await sendText(
      `📅 Video Interview Scheduled\n\n📆 July ${selectedDate}, 2026 at ${selectedTime}\n⏱ Duration: ${selectedDuration}\n📹 Platform: FIT Video\n${interviewNote ? `\n📝 Note: ${interviewNote}` : ""}`,
    );
    setShowScheduleModal(false);
    setInterviewNote("");
  };

  const filtered = (threadsState.data ?? []).filter((thread) => {
    const matchFilter = activeFilter === "all" || thread.type === activeFilter;
    const matchSearch = threadSearch === "" || thread.contact.toLowerCase().includes(threadSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Thread List */}
      <div className="w-full max-w-xs flex-shrink-0 border-r border-border flex flex-col bg-white">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-[#0D1117] mb-3">Messages</h2>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-border">
            <Search size={14} className="text-slate-400" />
            <input value={threadSearch} onChange={(e) => setThreadSearch(e.target.value)} placeholder="Search conversations..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
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
          {threadsState.loading && <LoadingBlock label="Loading conversations…" />}
          {threadsState.error && <ErrorBlock message={threadsState.error} onRetry={threadsState.reload} />}
          {!threadsState.loading && !threadsState.error && filtered.length === 0 && (
            <EmptyBlock message="No conversations yet." />
          )}
          {filtered.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={`w-full flex items-start gap-3 p-4 border-b border-border hover:bg-slate-50 transition-colors text-left ${activeThread?.id === thread.id ? "bg-blue-50/60 border-l-2 border-l-[#0284C7]" : ""}`}
            >
              <div className="relative flex-shrink-0">
                <Avatar initials={thread.initials} gradient={thread.color} size="sm" />
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
        {!activeThread ? (
          <EmptyBlock message="Select a conversation to start chatting." />
        ) : (
        <>
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar initials={activeThread.initials} gradient={activeThread.color} size="md" />
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
          {messagesLoading && <LoadingBlock label="Loading messages…" />}
          {!messagesLoading && messages.length === 0 && (
            <div className="text-center text-xs text-slate-400 font-medium">No messages yet — say hello 👋</div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === "me" ? "flex-row-reverse" : ""}`}>
              {msg.sender !== "me" && (
                <Avatar initials={activeThread.initials} gradient={activeThread.color} size="xs" />
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
          {contactWarning && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium">
              <Shield size={13} className="flex-shrink-0" /> {contactWarning}
              <button onClick={() => setContactWarning(null)} className="ml-auto"><X size={12} /></button>
            </div>
          )}
          {sendError && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              <AlertCircle size={13} className="flex-shrink-0" /> {sendError}
            </div>
          )}
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
        </>
        )}
      </div>

      {/* ═══ SCHEDULE INTERVIEW MODAL ═══ */}
      {showScheduleModal && activeThread && (
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
  const { user, setOpenConversationId } = useApp();
  const [activeContract, setActiveContract] = useState<ContractVM | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const contractsState = useFetch(async () => {
    const response = await fit.orders.list();
    return response.data.map(toContractVM);
  }, []);

  useEffect(() => {
    const contracts = contractsState.data ?? [];
    if (contracts.length > 0) {
      setActiveContract((current) => contracts.find((c) => c.id === current?.id) ?? contracts[0]);
    } else {
      setActiveContract(null);
    }
  }, [contractsState.data]);

  const isClient = activeContract !== null && user?.id === activeContract.clientId;
  const isFreelancer = activeContract !== null && user?.id === activeContract.freelancerId;

  // Refresh the selected order with its deliveries so approve/revise can target them.
  const refreshActive = async (orderId: number) => {
    const [fresh] = await Promise.all([fit.orders.get(orderId), contractsState.reload()]);
    setActiveContract(toContractVM(unwrap(fresh)));
  };

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    if (!activeContract) return;
    setActionBusy(true);
    setActionError(null);
    setActionNotice(null);
    try {
      await action();
      await refreshActive(activeContract.id);
      setActionNotice(label);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.firstError : "Action failed.");
    } finally {
      setActionBusy(false);
    }
  };

  /** Sandbox payment: initiate then immediately confirm (replaced by the MoMo webhook in production). */
  const payAndConfirm = async (initiate: () => Promise<{ reference: string }>) => {
    const payment = await initiate();
    await fit.payments.confirmSandbox(payment.reference);
  };

  const submittedDeliveryFor = (milestoneId: number | null) =>
    (activeContract?.deliveries ?? []).find(
      (delivery) => delivery.status === "submitted" && (milestoneId === null || delivery.order_milestone_id === milestoneId),
    );

  const payOrder = () =>
    runAction("Payment confirmed — funds held in escrow.", () =>
      payAndConfirm(async () => unwrap((await fit.orders.pay(activeContract!.id, "mtn_momo", user?.phone ?? "237600000000")).payment) as fit.ApiPayment),
    );

  const fundMilestone = (milestoneId: number) =>
    runAction("Milestone funded.", () =>
      payAndConfirm(async () => unwrap(await fit.orders.payMilestone(milestoneId, "mtn_momo", user?.phone ?? "237600000000"))),
    );

  const approveMilestone = (milestoneId: number | null) => {
    const delivery = submittedDeliveryFor(milestoneId);
    if (!delivery) {
      setActionError("No submitted delivery to approve yet.");
      return;
    }
    runAction("Delivery approved — payment released.", () => fit.orders.approveDelivery(delivery.id));
  };

  const requestRevision = (milestoneId: number | null) => {
    const delivery = submittedDeliveryFor(milestoneId);
    if (!delivery) {
      setActionError("No submitted delivery to revise.");
      return;
    }
    const feedback = window.prompt("What should be changed? (sent to the freelancer)");
    if (!feedback) return;
    runAction("Revision requested.", () => fit.orders.requestRevision(delivery.id, feedback));
  };

  const submitDelivery = () => {
    const message = window.prompt("Delivery note for the client (attach files from the mobile app or API):");
    if (!message) return;
    const inReviewMilestone = activeContract?.milestones.find((m) => m.status === "funded");
    runAction("Delivery submitted for review.", () =>
      fit.orders.deliver(activeContract!.id, { message, milestone_id: inReviewMilestone?.id }),
    );
  };

  const messageCounterpart = async () => {
    if (!activeContract || !user) return;
    const otherId = user.id === activeContract.clientId ? activeContract.freelancerId : activeContract.clientId;
    const conversation = unwrap(await fit.messaging.start(otherId, { order_id: activeContract.id }));
    setOpenConversationId(conversation.id);
    onNavigate("messages");
  };

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
            {contractsState.loading && <LoadingBlock label="Loading contracts…" />}
            {contractsState.error && <ErrorBlock message={contractsState.error} onRetry={contractsState.reload} />}
            {!contractsState.loading && !contractsState.error && (contractsState.data ?? []).length === 0 && (
              <EmptyBlock message="No contracts yet." />
            )}
            {(contractsState.data ?? []).map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveContract(c)}
                className={`w-full text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-sm ${activeContract?.id === c.id ? "border-[#0284C7] ring-1 ring-[#0284C7]/20" : "border-border"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-sm text-[#0D1117] leading-snug flex-1 pr-2">{c.title}</div>
                  <Badge variant={c.status === "active" ? "success" : c.status === "pending_payment" ? "warning" : c.status === "disputed" ? "danger" : "default"}>{c.status.replace(/_/g, " ")}</Badge>
                </div>
                <div className="text-xs text-slate-500 mb-2">{c.client} ↔ {c.freelancer}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatMoney(c.totalAmount, c.currency)}</span>
                  <span className="text-xs text-slate-400">{c.milestones.length} milestones</span>
                </div>
                {c.milestones.length > 0 && (
                  <>
                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0284C7] to-[#06B6D4]"
                        style={{ width: `${(c.milestones.filter((m) => m.status === "approved").length / c.milestones.length) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {c.milestones.filter((m) => m.status === "approved").length} of {c.milestones.length} milestones approved
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Contract Detail */}
          <div className="lg:col-span-2">
            {!activeContract ? (
              <div className="bg-white rounded-2xl border border-border"><EmptyBlock message="Select a contract to see its milestones." /></div>
            ) : (
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
                  <Badge variant={activeContract.status === "active" ? "success" : activeContract.status === "pending_payment" ? "warning" : activeContract.status === "disputed" ? "danger" : "default"}>{activeContract.status.replace(/_/g, " ")}</Badge>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-slate-500">Total Value</div>
                    <div className="text-xl font-extrabold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatMoney(activeContract.totalAmount, activeContract.currency)}</div>
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
                    {activeContract.milestones.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-6 text-center text-xs text-slate-400">
                        Single-payment contract — no milestones. Use the actions below.
                      </td></tr>
                    )}
                    {activeContract.milestones.map((ms, msIndex) => (
                      <tr key={ms.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0284C7] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold">{msIndex + 1}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-sm text-[#0D1117]">{ms.name}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">{ms.dueDate}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-extrabold text-sm text-[#0D1117]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {formatMoney(ms.amount, activeContract.currency)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <MilestoneStatus status={ms.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {ms.status === "in_review" && isClient && (
                              <>
                                <button disabled={actionBusy} onClick={() => approveMilestone(ms.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 disabled:opacity-50">
                                  <ThumbsUp size={11} /> Approve
                                </button>
                                <button disabled={actionBusy} onClick={() => requestRevision(ms.id)} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1 disabled:opacity-50">
                                  <RotateCcw size={11} /> Revise
                                </button>
                              </>
                            )}
                            {ms.status === "in_review" && isFreelancer && (
                              <span className="text-xs text-slate-400">Awaiting client review</span>
                            )}
                            {ms.status === "funded" && isFreelancer && (
                              <button disabled={actionBusy} onClick={submitDelivery} className="px-3 py-1.5 bg-blue-50 text-[#0284C7] text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50">
                                <Upload size={11} /> Deliver Work
                              </button>
                            )}
                            {ms.status === "funded" && isClient && (
                              <span className="text-xs text-slate-400">In progress</span>
                            )}
                            {ms.status === "approved" && (
                              <span className="text-xs text-slate-400 flex items-center gap-1"><Check size={11} className="text-emerald-500" /> Released</span>
                            )}
                            {ms.status === "pending" && isClient && (
                              <button disabled={actionBusy} onClick={() => fundMilestone(ms.id)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1 disabled:opacity-50">
                                <Wallet size={11} /> Fund Escrow
                              </button>
                            )}
                            {ms.status === "pending" && isFreelancer && (
                              <span className="text-xs text-slate-400">Awaiting funding</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Contract Footer */}
              {(actionError || actionNotice) && (
                <div className={`mx-6 mt-4 px-4 py-3 rounded-xl text-sm font-medium border ${actionError ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                  {actionError ?? actionNotice}
                </div>
              )}
              <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => messageCounterpart().catch(() => {})} className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <MessageSquare size={14} /> Message {isClient ? "Freelancer" : "Client"}
                  </button>
                  <span className="text-xs text-slate-400">{activeContract.number} · {activeContract.revisionsUsed}/{activeContract.revisionsAllowed} revisions used</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeContract.status === "pending_payment" && isClient && (
                    <button disabled={actionBusy} onClick={payOrder} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                      {actionBusy ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />} Pay & Fund Escrow
                    </button>
                  )}
                  {["active", "revision_requested"].includes(activeContract.status) && isFreelancer && activeContract.milestones.length === 0 && (
                    <button disabled={actionBusy} onClick={submitDelivery} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                      <Upload size={14} /> Submit Delivery
                    </button>
                  )}
                  {activeContract.status === "submitted" && isClient && (
                    <>
                      <button disabled={actionBusy} onClick={() => approveMilestone(null)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                        <ThumbsUp size={14} /> Approve & Release Payment
                      </button>
                      <button disabled={actionBusy} onClick={() => requestRevision(null)} className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50">
                        <RotateCcw size={14} /> Request Revision
                      </button>
                    </>
                  )}
                  {activeContract.status === "completed" && (
                    <button
                      disabled={actionBusy}
                      onClick={() => {
                        const rating = parseInt(window.prompt("Rate this collaboration (1–5):") ?? "", 10);
                        if (!rating || rating < 1 || rating > 5) return;
                        const comment = window.prompt("Leave a short review (optional):") ?? undefined;
                        runAction("Review submitted — thank you!", () => fit.orders.review(activeContract.id, { rating, comment }));
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Star size={14} /> Leave a Review
                    </button>
                  )}
                  {["active", "submitted", "revision_requested"].includes(activeContract.status) && (
                    <button
                      disabled={actionBusy}
                      onClick={() => {
                        const description = window.prompt("Describe the problem — FIT support will review the case:");
                        if (!description) return;
                        runAction("Dispute opened. FIT support will review it.", () => fit.orders.openDispute(activeContract.id, "other", description));
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <AlertCircle size={13} /> Open Dispute
                    </button>
                  )}
                </div>
              </div>
            </div>
            )}
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { token, user } = await fit.auth.login(email, password);
      fit.setSession(token, user);
      setUser(user);
      const landedRole = roleOf(user);
      onRoleSwitch(landedRole);
      onNavigate(landedRole === "admin" ? "admin" : landedRole === "client" ? "client" : "freelancer");
    } catch (err) {
      setError(err instanceof ApiError ? err.firstError : "Login failed. Check your connection.");
    } finally {
      setSubmitting(false);
    }
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

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium">
              <AlertCircle size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white hover:opacity-90 transition-opacity rounded-2xl flex items-center justify-center gap-2 font-bold text-base shadow-sm mt-8 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { token, user } = await fit.auth.register({
        name: fullName,
        email,
        password,
        role: userType,
      });
      fit.setSession(token, user);
      setUser(user);
      onRoleSwitch(userType);
      onNavigate(userType === "freelancer" ? "freelancer" : "client");
    } catch (err) {
      setError(err instanceof ApiError ? err.firstError : "Signup failed. Check your connection.");
    } finally {
      setSubmitting(false);
    }
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
            <label className="block text-sm font-semibold text-slate-800" htmlFor="fullname">
              Full name
            </label>
            <input
              id="fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Diane Ngono"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] rounded-2xl text-slate-900 placeholder-slate-400 text-sm transition-all shadow-sm"
            />
          </div>

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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (min 8 characters)"
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

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium">
              <AlertCircle size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white hover:opacity-90 transition-opacity rounded-2xl flex items-center justify-center gap-2 font-bold text-base shadow-sm mt-8 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Sign Up <ArrowRight size={18} /></>}
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

function AccountPage({ onNavigate, role }: { onNavigate: (v: View) => void; role: Role }) {
  const { user, setUser, refreshUser } = useApp();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "billing" | "notifications">("profile");
  const [editMode, setEditMode] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [skillError, setSkillError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    hourlyRate: "",
    availability: "Available Now",
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);
  const [showGithubOnProfile, setShowGithubOnProfile] = useState(true);

  const catalogSkills = useFetch(async () => (await fit.meta.skills()).data, []);
  const portfolioState = useFetch(async () => {
    if (!fit.getToken()) return [] as { id: number; title: string; desc: string; tags: string[]; client: string; year: string }[];
    const response = await fit.api<{ data: any[] }>("/me/portfolio").catch(() => ({ data: [] as any[] }));
    return response.data.map((item) => ({
      id: item.id as number,
      title: item.title as string,
      desc: (item.description ?? "") as string,
      tags: [] as string[],
      client: (item.type === "link" ? "External link" : item.type) as string,
      year: item.created_at ? new Date(item.created_at).getFullYear().toString() : "",
    }));
  }, []);
  const billingState = useFetch(async () => {
    if (!fit.getToken()) return null;
    const [walletResponse, transactions] = await Promise.all([
      fit.wallet.get().catch(() => null),
      fit.wallet.transactions().catch(() => null),
    ]);
    return {
      wallet: walletResponse ? unwrap(walletResponse) : null,
      transactions: transactions?.data ?? [],
    };
  }, []);

  const freelancerProfile = user?.freelancer_profile;

  // Hydrate the form from the authenticated user.
  useEffect(() => {
    if (!user) return;
    const [firstName, ...rest] = user.name.split(" ");
    setProfileForm({
      firstName,
      lastName: rest.join(" "),
      title: freelancerProfile?.title ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      location: user.city?.name ?? "",
      bio: freelancerProfile?.bio ?? "",
      hourlyRate: freelancerProfile?.hourly_rate != null ? String(freelancerProfile.hourly_rate) : "",
      availability:
        freelancerProfile?.availability === "busy"
          ? "Available part-time (< 30 hrs)"
          : freelancerProfile?.availability === "unavailable"
            ? "Not available"
            : "Available Now",
    });
    setSkills((freelancerProfile?.skills ?? []).map((skill) => skill.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const tabs = [
    { key: "profile", label: "Profile", icon: Users },
    { key: "security", label: "Security", icon: ShieldCheck },
    { key: "billing", label: "Billing", icon: Wallet },
    { key: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleSave = async () => {
    setSaveError(null);
    try {
      const updated = unwrap(await fit.profile.update({
        name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
        email: profileForm.email || undefined,
        phone: profileForm.phone || undefined,
      }));

      if (role === "freelancer" || user?.freelancer_profile) {
        await fit.profile.updateFreelancerProfile({
          title: profileForm.title || undefined,
          bio: profileForm.bio || undefined,
          hourly_rate: profileForm.hourlyRate ? parseFloat(profileForm.hourlyRate) : undefined,
          availability: profileForm.availability.startsWith("Available Now")
            ? "available"
            : profileForm.availability.startsWith("Not")
              ? "unavailable"
              : "busy",
        });

        const skillIds = (catalogSkills.data ?? [])
          .filter((skill) => skills.includes(skill.name))
          .map((skill) => skill.id);
        if (skillIds.length > 0) {
          await fit.api("/me/freelancer-profile/skills", { method: "PUT", body: { skill_ids: skillIds } });
        }
      }

      setUser(updated);
      await refreshUser();
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.firstError : "Could not save your profile.");
    }
  };

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const catalogMatch = (catalogSkills.data ?? []).find((skill) => skill.name.toLowerCase() === trimmed.toLowerCase());
    if (!catalogMatch) {
      setSkillError(`"${trimmed}" is not in the FIT skills catalog yet. Pick an existing skill.`);
      return;
    }
    setSkillError(null);
    if (!skills.includes(catalogMatch.name)) setSkills([...skills, catalogMatch.name]);
    setNewSkill("");
  };

  const handlePasswordUpdate = async () => {
    setPasswordMessage(null);
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage({ ok: false, text: "New passwords do not match." });
      return;
    }
    try {
      await fit.profile.changePassword(passwordForm.current, passwordForm.next, passwordForm.confirm);
      setPasswordMessage({ ok: true, text: "Password updated." });
      setPasswordForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPasswordMessage({ ok: false, text: err instanceof ApiError ? err.firstError : "Password change failed." });
    }
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
                  {user ? initialsOf(user.name) : "FI"}
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
                  {freelancerProfile?.is_verified && <Badge variant="success"><ShieldCheck size={10} /> ID Verified</Badge>}
                  {freelancerProfile?.is_top_rated && <Badge variant="warning"><Award size={10} /> Top Rated</Badge>}
                </div>
                <p className="text-slate-500 text-sm">{profileForm.title || (role === "client" ? "Client account" : "Add a professional headline")}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                  {profileForm.location && <span className="flex items-center gap-1"><MapPin size={10} />{profileForm.location}</span>}
                  <span className="flex items-center gap-1"><Star size={10} className="text-amber-400" />{Number(freelancerProfile?.rating ?? user?.client_profile?.rating ?? 0).toFixed(2)} rating</span>
                  <span className="flex items-center gap-1"><Briefcase size={10} />{freelancerProfile?.completed_orders_count ?? user?.client_profile?.hires_count ?? 0} jobs completed</span>
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
            {saveError && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium mb-4">
                <AlertCircle size={14} /> {saveError}
              </div>
            )}

            {/* Quick stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
              {[
                { label: "Job Success Score", value: `${freelancerProfile?.job_success_score ?? 0}%`, color: "text-emerald-600", sub: "Based on completed orders" },
                { label: "Total Earned", value: formatMoney(freelancerProfile?.total_earned ?? 0), color: "text-[#0284C7]", sub: `Across ${freelancerProfile?.completed_orders_count ?? 0} contracts` },
                { label: "Connects", value: String(user?.connects_balance ?? 0), color: "text-[#0D1117]", sub: `~${Math.floor((user?.connects_balance ?? 0) / 6)} proposals left` },
                { label: "Reviews", value: String(freelancerProfile?.reviews_count ?? user?.client_profile?.reviews_count ?? 0), color: "text-[#0D1117]", sub: "Order-verified reviews" },
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
                    <>
                      <div className="flex gap-2">
                        <input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { addSkill(newSkill); } }}
                          list="fit-skill-catalog"
                          placeholder="Add a skill and press Enter"
                          className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0284C7] transition-colors"
                        />
                        <datalist id="fit-skill-catalog">
                          {(catalogSkills.data ?? []).map((skill) => <option key={skill.id} value={skill.name} />)}
                        </datalist>
                        <button onClick={() => addSkill(newSkill)} className="px-4 py-2.5 bg-blue-50 text-[#0284C7] rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
                          <Plus size={15} />
                        </button>
                      </div>
                      {skillError && <p className="text-xs text-red-500 mt-2">{skillError}</p>}
                    </>
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
                    {(portfolioState.data ?? []).length === 0 && (
                      <p className="text-xs text-slate-400 py-2">No portfolio items yet — add work samples via the mobile app or API.</p>
                    )}
                    {(portfolioState.data ?? []).map((item) => (
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
                    {([
                      { label: "Current Password", key: "current" as const },
                      { label: "New Password", key: "next" as const },
                      { label: "Confirm New Password", key: "confirm" as const },
                    ]).map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{field.label}</label>
                        <input
                          type="password"
                          value={passwordForm[field.key]}
                          onChange={(e) => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white outline-none focus:border-[#0284C7] transition-colors"
                        />
                      </div>
                    ))}
                    {passwordMessage && (
                      <p className={`text-xs font-medium ${passwordMessage.ok ? "text-emerald-600" : "text-red-500"}`}>{passwordMessage.text}</p>
                    )}
                    <button onClick={handlePasswordUpdate} className="px-5 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">Update Password</button>
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
                  {billingState.loading && <LoadingBlock label="Loading wallet…" />}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "Total Earned", value: formatMoney(billingState.data?.wallet?.total_earned ?? 0), sub: "All time" },
                      { label: "Available", value: formatMoney(billingState.data?.wallet?.available_balance ?? 0), sub: "Ready to withdraw" },
                      { label: "Pending", value: formatMoney(billingState.data?.wallet?.pending_balance ?? 0), sub: "In escrow" },
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
                      {(billingState.data?.transactions ?? []).length === 0 && !billingState.loading && (
                        <p className="text-xs text-slate-400 py-2">No wallet activity yet.</p>
                      )}
                      {(billingState.data?.transactions ?? []).slice(0, 8).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                          <div>
                            <div className="text-sm font-medium text-[#0D1117]">{tx.description ?? tx.type.replace(/_/g, " ")}</div>
                            <div className="text-xs text-slate-400">{timeAgo(tx.created_at)}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold font-mono ${Number(tx.amount) >= 0 ? "text-emerald-600" : "text-red-500"}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                              {Number(tx.amount) >= 0 ? "+" : ""}{formatMoney(tx.amount)}
                            </div>
                            <Badge variant={Number(tx.amount) >= 0 ? "success" : "default"}>{tx.type.replace(/_/g, " ")}</Badge>
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
  const [payError, setPayError] = useState<string | null>(null);
  const { user, refreshUser } = useApp();
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  const packsState = useFetch(async () => {
    const [packsResponse, settings] = await Promise.all([
      fit.connects.packs(),
      fit.meta.settings().catch(() => ({}) as Record<string, unknown>),
    ]);
    return {
      packs: packsResponse.data.map((pack) => ({
        id: pack.id,
        connects: pack.connects,
        priceUSD: Number(pack.price_usd),
        priceXAF: Number(pack.price_xaf),
        costPerConnectUSD: Number(pack.price_usd) / pack.connects,
        unlocked: Math.floor(pack.connects / 6),
        label: pack.name,
        badge: pack.badge ?? undefined,
        save: pack.savings_label,
      })),
      xafRate: Number((settings as Record<string, unknown>).xaf_per_usd ?? 600),
    };
  }, []);

  const packs = packsState.data?.packs ?? [];
  const selectedPack = packs.find(p => p.id === selectedPackId) || packs[0];
  const balance = user?.connects_balance ?? 0;

  const XAF_RATE = packsState.data?.xafRate ?? 600;
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

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPack) return;
    setIsSubmitting(true);
    setPayError(null);
    try {
      const payment = unwrap(await fit.connects.purchase(selectedPack.id, paymentMethod, currency, phoneNumber || undefined)) as fit.ApiPayment;
      // Sandbox settlement — in production the Mobile Money webhook confirms the payment.
      await fit.payments.confirmSandbox(payment.reference);
      await refreshUser();
      setStage(3);
    } catch (err) {
      setPayError(err instanceof ApiError ? err.firstError : "Payment failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case "momo_mtn": return "MTN Mobile Money";
      case "momo_orange": return "Orange Money";
      case "card": return "Visa / Mastercard";
      case "paypal": return "PayPal";
    }
  };

  if (packsState.loading || !selectedPack) {
    return <div className="min-h-screen bg-slate-50"><LoadingBlock label="Loading connect packs…" /></div>;
  }

  if (packsState.error) {
    return <div className="min-h-screen bg-slate-50"><ErrorBlock message={packsState.error} onRetry={packsState.reload} /></div>;
  }

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
                  <span className="text-sm font-bold"><span className="text-cyan-400 font-mono text-base">{balance}</span> Connects</span>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <span className="text-xs text-slate-400 font-semibold">Proposals left: <span className="text-amber-400 font-mono">~{Math.floor(balance / 6)}</span></span>
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
                      <span className="text-slate-800 font-mono">{balance + selectedPack.connects} connects</span>
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
                      <div className="text-slate-800 font-extrabold mt-0.5">{balance + selectedPack.connects} Connects</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Current balance</div>
                      <div className="text-slate-500 font-extrabold mt-0.5">{balance}</div>
                    </div>
                  </div>

                  {/* Secure CTA Pay Button */}
                  {payError && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium">
                      <AlertCircle size={15} className="flex-shrink-0" /> {payError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white rounded-2xl font-extrabold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-60"
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
                <span className="text-[#0284C7] font-mono text-lg">{balance} Connects</span>
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
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [applyError, setApplyError] = useState<string | null>(null);
  const { user } = useApp();

  const internshipsState = useFetch(async () => {
    const response = await fit.internships.list();
    return response.data.map(toInternshipVM);
  }, []);

  const filtered = (internshipsState.data ?? []).filter((intern) => {
    const matchSearch = search === "" || intern.title.toLowerCase().includes(search.toLowerCase()) || intern.company.toLowerCase().includes(search.toLowerCase()) || intern.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === "All" || intern.type === typeFilter;
    return matchSearch && matchType;
  });

  const apply = async (internshipId: number) => {
    if (!user) {
      onNavigate("signup");
      return;
    }
    setApplyError(null);
    try {
      await fit.internships.apply(internshipId);
      setAppliedIds((prev) => [...prev, internshipId]);
    } catch (err) {
      setApplyError(err instanceof ApiError ? err.firstError : "Application failed.");
    }
  };

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
        {internshipsState.loading && <LoadingBlock label="Loading internships…" />}
        {internshipsState.error && <ErrorBlock message={internshipsState.error} onRetry={internshipsState.reload} />}
        {applyError && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
            <AlertCircle size={15} /> {applyError}
          </div>
        )}
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
                  onClick={() => apply(intern.id)}
                  disabled={appliedIds.includes(intern.id)}
                  className="px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {appliedIds.includes(intern.id) ? (lang === "en" ? "Applied ✓" : "Postulé ✓") : lang === "en" ? "Apply Now" : "Postuler"}
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
  const { user: adminUser } = useApp();

  // Admin datasets, loaded from the FIT API and mapped to the table row shapes.
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [blogs, setBlogs] = useState(ADMIN_BLOGS_LIST); // Editorial blog has no backend module yet (local only).
  const [plans, setPlans] = useState<any[]>([]);
  const [kpis, setKpis] = useState<Record<string, any> | null>(null);
  const [revenueMonths, setRevenueMonths] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<Record<string, any>>({});
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);

  const fmtDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";

  const loadAdminData = useCallback(async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const [
        dashboard, usersRes, verificationsRes, jobsRes, paymentsRes, withdrawalsRes,
        disputesRes, reviewsRes, categoriesRes, skillsRes, broadcastsRes, couponsRes,
        countriesRes, plansRes, revenueRes, ticketsRes,
      ] = await Promise.all([
        fit.admin.dashboard(),
        fit.admin.users(),
        fit.admin.verifications(),
        fit.admin.jobs(),
        fit.admin.payments(),
        fit.admin.withdrawals(),
        fit.admin.disputes(),
        fit.admin.reviews(),
        fit.admin.categories(),
        fit.admin.skills(),
        fit.admin.broadcasts(),
        fit.admin.coupons(),
        fit.admin.countries(),
        fit.admin.plans(),
        fit.admin.revenueReport(),
        fit.admin.tickets(),
      ]);
      const settingsRes = await fit.admin.settings().catch(() => ({}));

      setKpis(dashboard);
      setPlatformSettings(settingsRes as Record<string, any>);
      setUsers(usersRes.data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email ?? "—",
        phone: u.phone ?? "—",
        country: u.city?.name ?? "Cameroon",
        role: u.role,
        status: u.status ?? "active",
        verified: u.freelancer_profile?.is_verified ? "verified" : u.email_verified ? "pending" : "unverified",
        dateJoined: fmtDate(u.created_at),
        photo: initialsOf(u.name),
      })));
      setVerifications(verificationsRes.data.map((v: any) => ({
        id: v.id,
        name: v.user?.name ?? "User",
        type: v.type,
        documentType: v.document_type ?? "document",
        status: v.status,
        date: fmtDate(v.created_at),
      })));
      setProjects(jobsRes.data.map((j: any) => ({
        id: j.id,
        name: j.title,
        client: j.client?.name ?? "—",
        freelancer: "—",
        budget: j.budget_max ? formatMoney(j.budget_max, j.currency) : "Negotiable",
        deadline: j.deadline ?? "—",
        status: j.status === "open" ? "Open" : j.status === "contracted" ? "In Progress" : j.status === "cancelled" ? "Cancelled" : j.status === "closed" ? "Completed" : j.status,
        flagged: j.contact_flagged ?? false,
      })));
      setTransactions(paymentsRes.data.map((p: any) => ({
        id: p.reference,
        client: p.payer?.name ?? "—",
        freelancer: p.order?.freelancer?.name ?? "—",
        amount: formatMoney(p.amount, p.currency),
        method: p.provider === "mtn_momo" ? "MTN Mobile Money" : p.provider === "orange_money" ? "Orange Money" : p.provider === "card" ? "Card" : p.provider,
        status: p.status === "successful" ? "Escrow Funded" : p.status === "refunded" ? "Refunded" : p.status === "failed" ? "Failed" : "Pending",
        date: fmtDate(p.created_at),
      })));
      setWithdrawals(withdrawalsRes.data.map((w: any) => ({
        id: w.id,
        freelancer: w.user?.name ?? "—",
        amount: formatMoney(w.amount, w.currency),
        method: w.method === "mtn_momo" ? "MTN MoMo" : "Orange Money",
        date: fmtDate(w.created_at),
        status: w.status.charAt(0).toUpperCase() + w.status.slice(1),
      })));
      setDisputes(disputesRes.data.map((d: any) => ({
        id: d.id,
        ref: `DSP-${d.id}`,
        client: d.order?.client?.name ?? "—",
        freelancer: d.order?.freelancer?.name ?? "—",
        project: d.order?.title ?? "—",
        date: fmtDate(d.created_at),
        status: d.status === "resolved" ? "Resolved" : d.status === "under_review" ? "Pending" : "Open",
      })));
      setReviews(reviewsRes.data.map((r: any) => ({
        id: r.id,
        reviewer: r.reviewer?.name ?? "—",
        user: r.reviewee?.name ?? "—",
        rating: r.rating,
        comment: r.comment ?? "",
        date: fmtDate(r.created_at),
        hidden: r.status !== "published",
      })));
      setCategories(categoriesRes.data.map((c: any) => ({
        id: c.id,
        name: c.name_en,
        icon: c.icon ?? "Layers",
        count: c.jobs_count ?? 0,
        active: c.is_active,
      })));
      setSkills(skillsRes.data.map((s: any) => ({
        id: s.id,
        skill: s.name,
        category: categoriesRes.data.find((c: any) => c.id === s.category_id)?.name_en ?? "General",
        count: 0,
      })));
      setNotifications((broadcastsRes.data ?? []).map((b: any) => ({
        id: b.id,
        title: b.title,
        message: b.body,
        audience: b.audience === "all" ? "All Users" : b.audience === "freelancers" ? "Freelancers" : "Clients",
        date: fmtDate(b.sent_at),
      })));
      setCoupons((couponsRes.data ?? []).map((c: any) => ({
        id: c.id,
        code: c.code,
        discount: c.type === "percent" ? `${Number(c.value)}%` : formatMoney(c.value),
        expiryDate: c.expires_at ? fmtDate(c.expires_at) : "No expiry",
        status: c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date()) ? "Active" : "Expired",
      })));
      setCountries(countriesRes.data.map((c: any) => ({
        id: c.id,
        country: c.name,
        currency: c.currency_code,
        status: "Active",
      })));
      setPlans(plansRes.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: formatMoney(p.price, p.currency),
        billing: p.period === "yearly" ? "year" : "month",
        subscribers: 0,
      })));
      setRevenueMonths(revenueRes.months ?? []);
      setAdminChats((ticketsRes.data ?? []).map((t: any) => ({
        id: t.id,
        name: `${t.user?.name ?? "User"} — ${t.subject}`,
        status: t.status,
        messages: [],
      })));
    } catch (err) {
      setAdminError(err instanceof ApiError ? err.firstError : "Could not load admin data. Are you signed in as an admin?");
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

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

  // Interactive action handlers — each calls the API, then refreshes the datasets.
  const runAdminAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await loadAdminData();
    } catch (err) {
      setAdminError(err instanceof ApiError ? err.firstError : "Action failed.");
    }
  };

  const handleToggleUserStatus = (id: number) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    runAdminAction(() => target.status === "active" ? fit.admin.suspendUser(id) : fit.admin.activateUser(id));
  };

  const handleVerifyUser = (id: number) => {
    // Approves the user's oldest pending verification request.
    const pending = verifications.find(v => v.status === "pending" && users.find(u => u.id === id)?.name === v.name);
    if (!pending) {
      setAdminError("This user has no pending verification request.");
      return;
    }
    runAdminAction(() => fit.admin.approveVerification(pending.id));
  };

  const handleApproveWithdrawal = (id: number) => {
    runAdminAction(() => fit.admin.approveWithdrawal(id));
  };

  const handleMarkWithdrawalPaid = (id: number) => {
    runAdminAction(() => fit.admin.markWithdrawalPaid(id));
  };

  const handleRejectWithdrawal = (id: number) => {
    const reason = window.prompt("Reason for rejection (sent to the freelancer):");
    if (!reason) return;
    runAdminAction(() => fit.admin.rejectWithdrawal(id, reason));
  };

  const handleResolveDispute = (id: number | string) => {
    const numericId = typeof id === "string" ? parseInt(id.replace(/\D/g, ""), 10) : id;
    const resolution = window.prompt("Resolution: refund_client | release_freelancer | cancel_order", "release_freelancer");
    if (!resolution || !["refund_client", "release_freelancer", "cancel_order"].includes(resolution)) return;
    const note = window.prompt("Decision note (kept in the audit trail):") ?? undefined;
    runAdminAction(() => fit.admin.resolveDispute(numericId, resolution, note));
  };

  const handleToggleReviewVisibility = (id: number) => {
    const review = reviews.find(r => r.id === id);
    if (!review) return;
    runAdminAction(() => fit.admin.moderateReview(id, review.hidden ? "published" : "hidden"));
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    runAdminAction(() => fit.admin.createCategory({ name_en: newCatName.trim(), name_fr: newCatName.trim() }));
    setNewCatName("");
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const category = categories.find(c => c.name === newSkillCat);
    runAdminAction(() => fit.admin.createSkill(newSkillName.trim(), category?.id));
    setNewSkillName("");
  };

  const handleSendNotification = () => {
    if (!notifTitle.trim() || !notifMsg.trim()) return;
    const audience = notifAudience === "Freelancers" ? "freelancers" : notifAudience === "Clients" ? "clients" : "all";
    runAdminAction(() => fit.admin.sendBroadcast(notifTitle, notifMsg, audience as "all" | "freelancers" | "clients"));
    setNotifTitle("");
    setNotifMsg("");
  };

  const handleAddCoupon = () => {
    if (!newCouponCode.trim()) return;
    const value = parseFloat(newCouponDiscount.replace(/[^\d.]/g, "")) || 10;
    runAdminAction(() => fit.admin.createCoupon({ code: newCouponCode.toUpperCase(), type: "percent", value }));
    setNewCouponCode("");
  };

  const handleAddCountry = () => {
    if (!newCountryName.trim()) return;
    const code = newCountryName.trim().slice(0, 2).toUpperCase();
    runAdminAction(() => fit.admin.createCountry({ name: newCountryName.trim(), code, currency_code: newCountryCurr }));
    setNewCountryName("");
  };

  const handleSendAdminChatMessage = () => {
    if (!adminChatText.trim()) return;
    const text = adminChatText;
    setAdminChats(adminChats.map(c => c.id === adminChatActive ? { ...c, messages: [...(c.messages || []), { sender: "admin", text }] } : c));
    setAdminChatText("");
    fit.admin.replyTicket(adminChatActive, text).catch(() => setAdminError("Reply failed to send."));
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
              {adminLoading && <LoadingBlock label="Loading platform data…" />}
              {adminError && <ErrorBlock message={adminError} onRetry={loadAdminData} />}
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "Total Users", value: String(kpis?.users?.total ?? "—"), sub: `+${kpis?.users?.new_this_month ?? 0} this month`, color: "text-[#0284C7]", icon: Users },
                  { label: "Active Orders", value: String(kpis?.orders?.active ?? "—"), sub: `${kpis?.jobs?.open ?? 0} jobs open`, color: "text-indigo-600", icon: Briefcase },
                  { label: "Commission Revenue", value: formatMoney(kpis?.finance?.commission_revenue ?? 0), sub: `${formatMoney(kpis?.orders?.gross_volume ?? 0)} gross volume`, color: "text-emerald-600", icon: DollarSign },
                  { label: "Pending Withdrawals", value: `${kpis?.finance?.withdrawals_pending ?? 0} requests`, sub: formatMoney(kpis?.finance?.withdrawals_pending_amount ?? 0), color: "text-amber-600", icon: Wallet },
                  { label: "Open Disputes", value: `${kpis?.disputes?.open ?? 0} cases`, sub: "Review arguments", color: "text-red-600", icon: AlertCircle },
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
                          {withdraw.status === "Approved" && (
                            <button
                              onClick={() => handleMarkWithdrawalPaid(withdraw.id)}
                              className="px-2.5 py-1.5 bg-blue-50 text-[#0284C7] rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                            >
                              Mark Paid
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

              {/* Monthly revenue (live) */}
              <div className="border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue — last 12 months</span>
                  <button
                    onClick={() => {
                      const csv = ["month,completed_orders,gross_volume,commission_revenue",
                        ...revenueMonths.map((m: any) => `${m.month},${m.completed_orders},${m.gross_volume},${m.commission_revenue}`)].join("\n");
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
                      link.download = "fit-revenue-report.csv";
                      link.click();
                    }}
                    className="text-[10px] font-bold text-[#0284C7] hover:underline"
                  >
                    Export CSV
                  </button>
                </div>
                {revenueMonths.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-slate-400">No completed orders in the last 12 months yet.</p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead><tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-border">
                      <th className="px-4 py-2">Month</th><th className="px-4 py-2">Completed Orders</th><th className="px-4 py-2">Gross Volume</th><th className="px-4 py-2">Commission Revenue</th>
                    </tr></thead>
                    <tbody>
                      {revenueMonths.map((m: any) => (
                        <tr key={m.month} className="border-b border-slate-50 last:border-0 text-slate-600">
                          <td className="px-4 py-2.5 font-bold text-[#0D1117]">{m.month}</td>
                          <td className="px-4 py-2.5">{m.completed_orders}</td>
                          <td className="px-4 py-2.5 font-mono">{formatMoney(m.gross_volume)}</td>
                          <td className="px-4 py-2.5 font-mono text-emerald-600">{formatMoney(m.commission_revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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

              {/* Marketplace economics — live platform settings */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-border">Marketplace Economics (live)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: "commission_rate", label: "Commission Rate (0–0.5)" },
                    { key: "default_connects_per_proposal", label: "Connects per Proposal" },
                    { key: "free_connects_on_signup", label: "Signup Bonus Connects" },
                    { key: "referral_bonus_connects", label: "Referral Bonus Connects" },
                    { key: "xaf_per_usd", label: "XAF per USD" },
                    { key: "min_withdrawal_amount", label: "Min Withdrawal (XAF)" },
                  ].map((setting) => (
                    <div key={setting.key} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{setting.label}</label>
                      <input
                        value={platformSettings[setting.key] ?? ""}
                        onChange={(e) => setPlatformSettings({ ...platformSettings, [setting.key]: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-xl text-xs outline-none text-slate-700 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  onClick={() => runAdminAction(() => fit.admin.updateSettings({
                    commission_rate: parseFloat(platformSettings.commission_rate) || 0.1,
                    default_connects_per_proposal: parseInt(platformSettings.default_connects_per_proposal, 10) || 6,
                    free_connects_on_signup: parseInt(platformSettings.free_connects_on_signup, 10) || 10,
                    referral_bonus_connects: parseInt(platformSettings.referral_bonus_connects, 10) || 5,
                    xaf_per_usd: parseFloat(platformSettings.xaf_per_usd) || 600,
                    min_withdrawal_amount: parseFloat(platformSettings.min_withdrawal_amount) || 5000,
                  }))}
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
                <Avatar initials={adminUser ? initialsOf(adminUser.name) : "AD"} gradient="from-slate-700 to-slate-900" size="xl" />
                <div>
                  <h4 className="font-bold text-sm text-[#0D1117]">{adminUser?.name ?? "System Administrator"}</h4>
                  <p className="text-xs text-slate-400">{adminUser?.email ?? "admin@fit.africa"}</p>
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
  const [user, setUser] = useState<ApiUser | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [openConversationId, setOpenConversationId] = useState<number | null>(null);

  // Restore the session from the stored Sanctum token on first load.
  useEffect(() => {
    const stored = fit.getStoredUser();
    if (stored) {
      setUser(stored);
      setRole(roleOf(stored));
    }
    if (fit.getToken()) {
      fit.auth
        .me()
        .then((response) => {
          const fresh = unwrap(response);
          setUser(fresh);
          fit.setStoredUser(fresh);
          setRole(roleOf(fresh));
        })
        .catch(() => {
          fit.clearSession();
          setUser(null);
          setRole("guest");
        });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!fit.getToken()) return;
    const fresh = unwrap(await fit.auth.me());
    setUser(fresh);
    fit.setStoredUser(fresh);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fit.auth.logout();
    } catch {
      /* token may already be invalid */
    }
    fit.clearSession();
    setUser(null);
    setRole("guest");
    setView("landing");
  }, []);

  const session: AppSession = {
    user,
    setUser: (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        fit.setStoredUser(nextUser);
        setRole(roleOf(nextUser));
      }
    },
    refreshUser,
    logout,
    selectedJobId,
    setSelectedJobId,
    openConversationId,
    setOpenConversationId,
  };

  const handleNavigate = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRoleSwitch = (r: Role) => setRole(r);

  const hideNav = view === "login" || view === "signup" || view === "admin";

  return (
    <AppCtx.Provider value={session}>
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
    </AppCtx.Provider>
  );
}
