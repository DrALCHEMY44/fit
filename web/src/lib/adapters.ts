"use client";

/**
 * Adapters mapping API resources onto the view-model shapes the FIT screens
 * were designed around, so screen markup stays untouched while the data
 * becomes real.
 */

import type {
  ApiConversation,
  ApiFreelancerProfile,
  ApiInternship,
  ApiJob,
  ApiMessage,
  ApiOrder,
  ApiProposal,
} from "./api";

/** Some endpoints return `{data: {...}}`, others a bare object. Normalize. */
export function unwrap<T>(payload: T | { data: T }): T {
  return payload !== null && typeof payload === "object" && "data" in (payload as object)
    ? (payload as { data: T }).data
    : (payload as T);
}

const GRADIENTS = [
  "from-[#0284C7] to-[#06B6D4]",
  "from-[#7C3AED] to-[#A78BFA]",
  "from-[#16A34A] to-[#34D399]",
  "from-[#D97706] to-[#FBBF24]",
  "from-[#DB2777] to-[#F472B6]",
  "from-[#0891B2] to-[#22D3EE]",
];

export function gradientFor(id: number): string {
  return GRADIENTS[Math.abs(id) % GRADIENTS.length];
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatMoney(amount: number | string | null | undefined, currency = "XAF"): string {
  if (amount === null || amount === undefined) return "—";
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (currency === "USD") return `$${value.toLocaleString()}`;
  return `${Math.round(value).toLocaleString()} XAF`;
}

// ─── View models (the shapes the screens already render) ────────────────────

export type JobVM = {
  id: number;
  title: string;
  type: "hourly" | "fixed";
  budget: { min?: number; max?: number; amount?: number; currency: string };
  posted: string;
  description: string;
  skills: string[];
  duration: string;
  level: string;
  proposals: number;
  connectsCost: number;
  status: string;
  client: {
    id?: number;
    name: string;
    location: string;
    verified: boolean;
    paymentVerified: boolean;
    rating: number;
    spent: string;
    jobs: number;
  };
  saved: boolean;
  category: string;
};

export function toJobVM(job: ApiJob, savedIds: Set<number> = new Set()): JobVM {
  const clientProfile = job.client?.client_profile;
  const budgetMin = job.budget_min !== null && job.budget_min !== undefined ? Number(job.budget_min) : undefined;
  const budgetMax = job.budget_max !== null && job.budget_max !== undefined ? Number(job.budget_max) : undefined;

  return {
    id: job.id,
    title: job.title,
    type: job.budget_type === "hourly" ? "hourly" : "fixed",
    budget:
      job.budget_type === "hourly"
        ? { min: budgetMin, max: budgetMax, currency: job.currency }
        : { amount: budgetMax ?? budgetMin, currency: job.currency },
    posted: timeAgo(job.published_at ?? job.created_at),
    description: job.description,
    skills: (job.skills ?? []).map((skill) => skill.name),
    duration: job.duration ?? "Flexible",
    level: capitalize(job.experience_level),
    proposals: job.proposals_count,
    connectsCost: job.connects_cost,
    status: job.status,
    client: {
      id: job.client?.id,
      name: clientProfile?.company_name ?? job.client?.name ?? "FIT Client",
      location: job.client?.city?.name ? `${job.client.city.name}, Cameroon` : "Cameroon",
      verified: job.client?.email_verified ?? false,
      paymentVerified: clientProfile?.payment_verified ?? false,
      rating: Number(clientProfile?.rating ?? 0),
      spent: formatMoney(clientProfile?.total_spent ?? 0, job.currency),
      jobs: clientProfile?.jobs_posted_count ?? 0,
    },
    saved: savedIds.has(job.id),
    category: job.category?.name_en ?? "",
  };
}

export type FreelancerVM = {
  id: number;
  userId: number;
  name: string;
  title: string;
  initials: string;
  color: string;
  location: string;
  jss: number;
  hourlyRate: number;
  currency: string;
  totalEarnings: string;
  skills: string[];
  bio: string;
  completedJobs: number;
  rating: number;
  available: boolean;
  topRated: boolean;
  verified: boolean;
};

export function toFreelancerVM(profile: ApiFreelancerProfile): FreelancerVM {
  const user = profile.user;
  const name = user?.name ?? "FIT Freelancer";

  return {
    id: profile.id,
    userId: profile.user_id,
    name,
    title: profile.title ?? "Freelancer",
    initials: initialsOf(name),
    color: gradientFor(profile.user_id),
    location: user?.city?.name ? `${user.city.name}, Cameroon` : "Cameroon",
    jss: profile.job_success_score,
    hourlyRate: Number(profile.hourly_rate ?? 0),
    currency: profile.currency,
    totalEarnings: `${formatMoney(profile.total_earned, profile.currency)}+`,
    skills: (profile.skills ?? []).map((skill) => skill.name),
    bio: profile.bio ?? "",
    completedJobs: profile.completed_orders_count,
    rating: Number(profile.rating),
    available: profile.availability === "available",
    topRated: profile.is_top_rated,
    verified: profile.is_verified,
  };
}

export type MilestoneVM = {
  id: number;
  name: string;
  amount: number;
  status: string; // pending | funded | in_review | approved
  dueDate: string;
};

export type ContractVM = {
  id: number;
  number: string;
  title: string;
  client: string;
  clientId: number;
  freelancer: string;
  freelancerId: number;
  totalAmount: number;
  currency: string;
  status: string;
  revisionsAllowed: number;
  revisionsUsed: number;
  milestones: MilestoneVM[];
  deliveries: ApiOrder["deliveries"];
};

export function toContractVM(order: ApiOrder): ContractVM {
  return {
    id: order.id,
    number: order.number,
    title: order.title,
    client: order.client?.name ?? "Client",
    clientId: order.client?.id ?? 0,
    freelancer: order.freelancer?.name ?? "Freelancer",
    freelancerId: order.freelancer?.id ?? 0,
    totalAmount: Number(order.amount),
    currency: order.currency,
    status: order.status,
    revisionsAllowed: order.revisions_allowed,
    revisionsUsed: order.revisions_used,
    milestones: (order.milestones ?? []).map((milestone) => ({
      id: milestone.id,
      name: milestone.title,
      amount: Number(milestone.amount),
      status: milestone.status === "in_review" ? "in_review" : milestone.status,
      dueDate: milestone.due_date ?? "—",
    })),
    deliveries: order.deliveries ?? [],
  };
}

export type ThreadVM = {
  id: number;
  contact: string;
  initials: string;
  color: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: "contract" | "interview";
  online: boolean;
  otherUserId: number;
};

export function toThreadVM(conversation: ApiConversation, myUserId: number): ThreadVM {
  const other =
    conversation.client?.id === myUserId ? conversation.freelancer : conversation.client;
  const name = other?.name ?? "Conversation";

  return {
    id: conversation.id,
    contact: name,
    initials: initialsOf(name),
    color: gradientFor(other?.id ?? conversation.id),
    lastMessage: conversation.last_message?.body ?? "Attachment",
    time: timeAgo(conversation.last_message_at),
    unread: conversation.unread_count ?? 0,
    type: conversation.order_id ? "contract" : "interview",
    online: false,
    otherUserId: other?.id ?? 0,
  };
}

export type MessageVM = {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
  flagged: boolean;
};

export function toMessageVM(message: ApiMessage, myUserId: number): MessageVM {
  return {
    id: message.id,
    sender: message.sender_id === myUserId ? "me" : "them",
    text: message.body ?? (message.attachment_name ? `📎 ${message.attachment_name}` : ""),
    time: new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    flagged: message.is_flagged,
  };
}

export type InternshipVM = {
  id: number;
  title: string;
  company: string;
  location: string;
  duration: string;
  stipend: string;
  skills: string[];
  type: "Remote" | "On-site" | "Hybrid";
  paid: boolean;
  description: string;
};

export function toInternshipVM(internship: ApiInternship): InternshipVM {
  return {
    id: internship.id,
    title: internship.title,
    company: internship.company_name,
    location: internship.location ?? "Cameroon",
    duration: internship.duration ?? "—",
    stipend: internship.stipend ?? "",
    skills: internship.skills ?? [],
    type: internship.type === "remote" ? "Remote" : internship.type === "hybrid" ? "Hybrid" : "On-site",
    paid: internship.is_paid,
    description: internship.description ?? "",
  };
}

export type ProposalVM = {
  id: number;
  jobId: number;
  jobTitle: string;
  amount: number;
  currency: string;
  deliveryDays: number;
  coverLetter: string;
  status: string;
  connectsSpent: number;
  freelancerName: string;
  freelancerId: number;
  submitted: string;
};

export function toProposalVM(proposal: ApiProposal): ProposalVM {
  return {
    id: proposal.id,
    jobId: proposal.job_post_id,
    jobTitle: proposal.job?.title ?? "",
    amount: Number(proposal.amount),
    currency: proposal.currency,
    deliveryDays: proposal.delivery_days,
    coverLetter: proposal.cover_letter,
    status: proposal.status,
    connectsSpent: proposal.connects_spent,
    freelancerName: proposal.freelancer?.name ?? "",
    freelancerId: proposal.freelancer?.id ?? 0,
    submitted: timeAgo(proposal.created_at),
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
