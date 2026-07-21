"use client";

/**
 * FIT API client.
 *
 * Thin typed wrapper around fetch for the Laravel backend (/api/v1).
 * - Base URL comes from NEXT_PUBLIC_API_URL (see .env.local.example).
 * - The Sanctum bearer token is kept in localStorage and attached to every
 *   authenticated request.
 * - Validation failures (422) surface field errors; auth failures (401)
 *   clear the stored session so the UI can redirect to login.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.fit.fobs.dev/api/v1";

const TOKEN_KEY = "fit_token";
const USER_KEY = "fit_user";

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  /** First validation message, falling back to the top-level message. */
  get firstError(): string {
    const first = Object.values(this.errors)[0];
    return first?.[0] ?? this.message;
  }
}

// ─── Session storage ────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: ApiUser): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setStoredUser(user: ApiUser): void {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): ApiUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

// ─── Core request helper ────────────────────────────────────────────────────

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  formData?: FormData;
  params?: Record<string, string | number | boolean | undefined | null>;
};

export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, params } = options;

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(0, "Network error — check your connection and that the FIT API is running.");
  }

  if (response.status === 204) return undefined as T;

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    /* non-JSON body */
  }

  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new ApiError(
      response.status,
      payload?.message ?? `Request failed (${response.status})`,
      payload?.errors ?? {},
    );
  }

  return payload as T;
}

// ─── Shared API types (mirror backend resources) ────────────────────────────

export type Paginated<T> = {
  data: T[];
  links: { next: string | null; prev: string | null };
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export type ApiUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: "client" | "freelancer" | "admin" | "super_admin";
  status?: string;
  language: string;
  avatar_url: string | null;
  connects_balance?: number;
  referral_code?: string;
  email_verified: boolean;
  phone_verified: boolean;
  city?: { id: number; name: string; region?: string | null; country_id: number } | null;
  freelancer_profile?: ApiFreelancerProfile | null;
  client_profile?: ApiClientProfile | null;
  created_at?: string;
};

export type ApiSkill = { id: number; name: string; slug: string; category_id: number | null };

export type ApiFreelancerProfile = {
  id: number;
  user_id: number;
  title: string | null;
  bio: string | null;
  experience_level: string;
  hourly_rate: string | number | null;
  min_price: string | number | null;
  currency: string;
  availability: "available" | "busy" | "unavailable";
  rating: number;
  reviews_count: number;
  job_success_score: number;
  completed_orders_count: number;
  total_earned: number;
  is_verified: boolean;
  is_top_rated: boolean;
  profile_completion: number;
  skills?: ApiSkill[];
  user?: ApiUser;
};

export type ApiClientProfile = {
  id: number;
  user_id: number;
  type: string;
  company_name: string | null;
  sector: string | null;
  payment_verified: boolean;
  rating: number;
  reviews_count: number;
  total_spent: number;
  jobs_posted_count: number;
  hires_count: number;
  user?: ApiUser;
};

export type ApiCategory = {
  id: number;
  name_en: string;
  name_fr: string;
  slug: string;
  icon: string | null;
  parent_id: number | null;
  is_active: boolean;
  children?: ApiCategory[];
  jobs_count?: number;
  services_count?: number;
};

export type ApiJob = {
  id: number;
  title: string;
  slug: string;
  description: string;
  budget_type: "fixed" | "hourly" | "negotiable";
  budget_min: string | number | null;
  budget_max: string | number | null;
  currency: string;
  duration: string | null;
  experience_level: string;
  urgency: string;
  mode: string;
  deadline: string | null;
  status: string;
  connects_cost: number;
  proposals_count: number;
  views_count: number;
  is_featured: boolean;
  published_at: string | null;
  category?: ApiCategory;
  skills?: ApiSkill[];
  client?: ApiUser;
  created_at: string;
};

export type ApiProposalMilestone = {
  id?: number;
  title: string;
  amount: number;
  due_label?: string | null;
};

export type ApiProposal = {
  id: number;
  job_post_id: number;
  amount: number;
  currency: string;
  delivery_days: number;
  cover_letter: string;
  status: string;
  connects_spent: number;
  freelancer?: ApiUser;
  job?: ApiJob;
  milestones?: ApiProposalMilestone[];
  created_at: string;
};

export type ApiMilestone = {
  id: number;
  order_id: number;
  title: string;
  amount: number;
  due_date: string | null;
  status: "pending" | "funded" | "in_review" | "approved";
  sort_order: number;
};

export type ApiOrder = {
  id: number;
  number: string;
  title: string;
  amount: number;
  currency: string;
  commission_amount: number;
  freelancer_amount: number;
  deadline: string | null;
  revisions_allowed: number;
  revisions_used: number;
  status: string;
  client?: ApiUser;
  freelancer?: ApiUser;
  milestones?: ApiMilestone[];
  deliveries?: ApiDelivery[];
  created_at: string;
};

export type ApiDelivery = {
  id: number;
  order_id: number;
  order_milestone_id: number | null;
  message: string | null;
  files: { name: string; url: string }[];
  link_url: string | null;
  status: string;
  client_feedback: string | null;
  created_at: string;
};

export type ApiConversation = {
  id: number;
  job_post_id: number | null;
  order_id: number | null;
  client?: ApiUser;
  freelancer?: ApiUser;
  last_message?: ApiMessage | null;
  unread_count?: number;
  last_message_at: string | null;
};

export type ApiMessage = {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  is_flagged: boolean;
  read_at: string | null;
  created_at: string;
};

export type ApiConnectPack = {
  id: number;
  name: string;
  connects: number;
  price_usd: number;
  price_xaf: number;
  badge: string | null;
  savings_label: string | null;
};

export type ApiPayment = {
  id: number;
  reference: string;
  purpose: string;
  amount: number;
  currency: string;
  provider: string;
  status: "pending" | "successful" | "failed" | "refunded";
  paid_at: string | null;
};

export type ApiWallet = {
  pending_balance: number;
  available_balance: number;
  total_earned: number;
  total_withdrawn: number;
  currency: string;
};

export type ApiInternship = {
  id: number;
  title: string;
  company_name: string;
  location: string | null;
  duration: string | null;
  stipend: string | null;
  is_paid: boolean;
  type: "remote" | "onsite" | "hybrid";
  skills: string[] | null;
  description: string | null;
  status: string;
};

export type ApiWithdrawal = {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  account_number: string;
  status: string;
  user?: ApiUser;
  created_at: string;
};

export type ApiDispute = {
  id: number;
  order_id: number;
  reason: string;
  description: string;
  status: string;
  resolution: string | null;
  opener?: ApiUser;
  order?: ApiOrder;
  created_at: string;
};

export type ApiVerificationRequest = {
  id: number;
  type: string;
  document_type: string | null;
  status: string;
  user?: ApiUser;
  created_at: string;
};

export type ApiNotification = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

// ─── Auth ───────────────────────────────────────────────────────────────────

export const auth = {
  register: (payload: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    role: "client" | "freelancer";
    language?: string;
    referral_code?: string;
  }) => api<{ token: string; user: ApiUser }>("/auth/register", { method: "POST", body: payload }),

  login: (identifier: string, password: string) =>
    api<{ token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: { identifier, password, device_name: "web" },
    }),

  logout: () => api("/auth/logout", { method: "POST" }),

  me: () => api<{ data: ApiUser }>("/auth/me"),
};

// ─── Profile ────────────────────────────────────────────────────────────────

export const profile = {
  update: (payload: Partial<{ name: string; email: string; phone: string; language: string; city_id: number }>) =>
    api<{ data: ApiUser }>("/me", { method: "PATCH", body: payload }),

  changePassword: (current_password: string, password: string, password_confirmation: string) =>
    api("/me/password", { method: "PATCH", body: { current_password, password, password_confirmation } }),

  switchRole: (role: "client" | "freelancer") =>
    api<{ data: ApiUser }>("/me/switch-role", { method: "POST", body: { role } }),

  updateFreelancerProfile: (payload: Partial<{ title: string; bio: string; experience_level: string; hourly_rate: number; min_price: number; availability: string }>) =>
    api<{ data: ApiFreelancerProfile }>("/me/freelancer-profile", { method: "PATCH", body: payload }),

  updateClientProfile: (payload: Partial<{ type: string; company_name: string; sector: string; address: string; website: string; about: string }>) =>
    api<{ data: ApiClientProfile }>("/me/client-profile", { method: "PATCH", body: payload }),
};

// ─── Catalog / meta ─────────────────────────────────────────────────────────

export const meta = {
  categories: () => api<{ data: ApiCategory[] }>("/meta/categories"),
  skills: (search?: string) => api<{ data: ApiSkill[] }>("/meta/skills", { params: { search } }),
  cities: () => api<{ data: { id: number; name: string }[] }>("/meta/cities"),
  settings: () => api<Record<string, unknown>>("/meta/settings"),
};

// ─── Jobs ───────────────────────────────────────────────────────────────────

export const jobs = {
  list: (params: Record<string, string | number | undefined> = {}) =>
    api<Paginated<ApiJob>>("/jobs", { params }),

  get: (id: number) => api<{ data: ApiJob }>(`/jobs/${id}`),

  create: (payload: Record<string, unknown>) =>
    api<{ job: { data?: ApiJob } & ApiJob; contact_warning: string | null }>("/jobs", {
      method: "POST",
      body: payload,
    }),

  mine: (status?: string) => api<Paginated<ApiJob>>("/me/jobs", { params: { status } }),

  close: (id: number) => api(`/jobs/${id}/close`, { method: "POST" }),
  cancel: (id: number) => api(`/jobs/${id}/cancel`, { method: "POST" }),
  publish: (id: number) => api(`/jobs/${id}/publish`, { method: "POST" }),
};

// ─── Freelancer directory ───────────────────────────────────────────────────

export const freelancers = {
  search: (params: Record<string, string | number | boolean | undefined> = {}) =>
    api<Paginated<ApiFreelancerProfile>>("/freelancers", { params }),

  get: (userId: number) => api<{ data: ApiFreelancerProfile }>(`/freelancers/${userId}`),
};

// ─── Proposals ──────────────────────────────────────────────────────────────

export const proposals = {
  submit: (
    jobId: number,
    payload: {
      amount: number;
      delivery_days: number;
      cover_letter: string;
      milestones?: { title: string; amount: number; due_label?: string }[];
    },
  ) =>
    api<{ proposal: ApiProposal; connects_spent: number; connects_balance: number }>(
      `/jobs/${jobId}/proposals`,
      { method: "POST", body: payload },
    ),

  mine: (status?: string) => api<Paginated<ApiProposal>>("/me/proposals", { params: { status } }),

  forJob: (jobId: number) => api<Paginated<ApiProposal>>(`/jobs/${jobId}/proposals`),

  accept: (id: number) => api<{ order: { data?: ApiOrder } & ApiOrder }>(`/proposals/${id}/accept`, { method: "POST" }),
  decline: (id: number) => api(`/proposals/${id}/decline`, { method: "POST" }),
  shortlist: (id: number) => api(`/proposals/${id}/shortlist`, { method: "POST" }),
  withdraw: (id: number) => api(`/proposals/${id}/withdraw`, { method: "POST" }),
};

// ─── Messaging ──────────────────────────────────────────────────────────────

export const messaging = {
  conversations: () => api<Paginated<ApiConversation>>("/conversations"),

  start: (recipient_id: number, context: { job_post_id?: number; order_id?: number } = {}) =>
    api<{ data: ApiConversation }>("/conversations", { method: "POST", body: { recipient_id, ...context } }),

  messages: (conversationId: number, page = 1) =>
    api<Paginated<ApiMessage>>(`/conversations/${conversationId}/messages`, { params: { page } }),

  send: (conversationId: number, body: string) =>
    api<{ message: { data?: ApiMessage } & ApiMessage; contact_warning: string | null }>(
      `/conversations/${conversationId}/messages`,
      { method: "POST", body: { body } },
    ),

  markRead: (conversationId: number) => api(`/conversations/${conversationId}/read`, { method: "POST" }),
};

// ─── Orders / contracts ─────────────────────────────────────────────────────

export const orders = {
  list: (params: { role?: "client" | "freelancer"; status?: string } = {}) =>
    api<Paginated<ApiOrder>>("/orders", { params }),

  get: (id: number) => api<{ data: ApiOrder }>(`/orders/${id}`),

  cancel: (id: number, reason?: string) =>
    api<{ data: ApiOrder }>(`/orders/${id}/cancel`, { method: "POST", body: { reason } }),

  pay: (id: number, provider: string, phone_number?: string) =>
    api<{ payment: { data?: ApiPayment } & ApiPayment; instructions: string }>(`/orders/${id}/pay`, {
      method: "POST",
      body: { provider, phone_number },
    }),

  payMilestone: (milestoneId: number, provider: string, phone_number?: string) =>
    api<{ data: ApiPayment }>(`/milestones/${milestoneId}/pay`, {
      method: "POST",
      body: { provider, phone_number },
    }),

  deliver: (orderId: number, payload: { message?: string; link_url?: string; milestone_id?: number }) =>
    api<{ data: ApiDelivery }>(`/orders/${orderId}/deliveries`, { method: "POST", body: payload }),

  approveDelivery: (deliveryId: number) =>
    api<{ data: ApiOrder }>(`/deliveries/${deliveryId}/approve`, { method: "POST" }),

  requestRevision: (deliveryId: number, feedback: string) =>
    api<{ data: ApiOrder }>(`/deliveries/${deliveryId}/request-revision`, { method: "POST", body: { feedback } }),

  review: (orderId: number, payload: { rating: number; comment?: string }) =>
    api(`/orders/${orderId}/reviews`, { method: "POST", body: payload }),

  openDispute: (orderId: number, reason: string, description: string) =>
    api(`/orders/${orderId}/disputes`, { method: "POST", body: { reason, description } }),
};

// ─── Payments / wallet / connects ───────────────────────────────────────────

export const payments = {
  confirmSandbox: (reference: string) =>
    api<{ data: ApiPayment }>(`/payments/${reference}/confirm-sandbox`, { method: "POST" }),

  status: (reference: string) => api<{ data: ApiPayment }>(`/payments/${reference}`),

  mine: () => api<Paginated<ApiPayment>>("/payments"),
};

export const wallet = {
  get: () => api<{ data: ApiWallet }>("/wallet"),
  transactions: () => api<Paginated<{ id: number; type: string; amount: number; description: string; created_at: string }>>("/wallet/transactions"),
  requestWithdrawal: (payload: { amount: number; method: string; account_number: string; account_name?: string }) =>
    api<{ data: ApiWithdrawal }>("/withdrawals", { method: "POST", body: payload }),
  withdrawals: () => api<Paginated<ApiWithdrawal>>("/withdrawals"),
};

export const connects = {
  packs: () => api<{ data: ApiConnectPack[] }>("/connect-packs"),
  purchase: (packId: number, provider: string, currency: "USD" | "XAF", phone_number?: string) =>
    api<{ data: ApiPayment }>(`/connect-packs/${packId}/purchase`, {
      method: "POST",
      body: { provider, currency, phone_number },
    }),
  history: () => api<{ balance: number; transactions: Paginated<{ id: number; type: string; amount: number; description: string; created_at: string }> }>("/connects/history"),
};

// ─── Favorites ──────────────────────────────────────────────────────────────

export const favorites = {
  list: () => api<{ jobs: ApiJob[]; services: unknown[]; freelancers: ApiUser[] }>("/favorites"),
  save: (type: "job" | "service" | "freelancer", id: number) =>
    api("/favorites", { method: "POST", body: { type, id } }),
  remove: (type: "job" | "service" | "freelancer", id: number) =>
    api("/favorites", { method: "DELETE", body: { type, id } }),
};

// ─── Internships ────────────────────────────────────────────────────────────

export const internships = {
  list: (params: { search?: string; type?: string } = {}) =>
    api<Paginated<ApiInternship>>("/internships", { params }),
  apply: (id: number, cover_letter?: string) =>
    api(`/internships/${id}/apply`, { method: "POST", body: { cover_letter } }),
};

// ─── Notifications ──────────────────────────────────────────────────────────

export const notifications = {
  list: (unread?: boolean) => api<Paginated<ApiNotification>>("/notifications", { params: { unread } }),
  markAllRead: () => api("/notifications/read-all", { method: "POST" }),
};

// ─── Admin ──────────────────────────────────────────────────────────────────

export const admin = {
  dashboard: () => api<Record<string, any>>("/admin/dashboard"),

  users: (params: Record<string, string | number | undefined> = {}) =>
    api<Paginated<ApiUser>>("/admin/users", { params }),
  suspendUser: (id: number, reason?: string) =>
    api<{ data: ApiUser }>(`/admin/users/${id}/suspend`, { method: "POST", body: { reason } }),
  activateUser: (id: number) => api<{ data: ApiUser }>(`/admin/users/${id}/activate`, { method: "POST" }),

  verifications: (status?: string) =>
    api<Paginated<ApiVerificationRequest>>("/admin/verification-requests", { params: { status } }),
  approveVerification: (id: number) =>
    api(`/admin/verification-requests/${id}/approve`, { method: "POST" }),
  rejectVerification: (id: number, reason: string) =>
    api(`/admin/verification-requests/${id}/reject`, { method: "POST", body: { reason } }),

  jobs: (params: Record<string, string | number | boolean | undefined> = {}) =>
    api<Paginated<ApiJob>>("/admin/jobs", { params }),
  moderateJob: (id: number, payload: Record<string, unknown>) =>
    api(`/admin/jobs/${id}`, { method: "PATCH", body: payload }),

  orders: (params: Record<string, string | undefined> = {}) =>
    api<Paginated<ApiOrder>>("/admin/orders", { params }),

  payments: (params: Record<string, string | undefined> = {}) =>
    api<Paginated<ApiPayment>>("/admin/payments", { params }),

  withdrawals: (status?: string) =>
    api<Paginated<ApiWithdrawal>>("/admin/withdrawals", { params: { status } }),
  approveWithdrawal: (id: number) => api(`/admin/withdrawals/${id}/approve`, { method: "POST" }),
  markWithdrawalPaid: (id: number) => api(`/admin/withdrawals/${id}/mark-paid`, { method: "POST" }),
  rejectWithdrawal: (id: number, reason: string) =>
    api(`/admin/withdrawals/${id}/reject`, { method: "POST", body: { reason } }),

  disputes: (status?: string) => api<Paginated<ApiDispute>>("/admin/disputes", { params: { status } }),
  resolveDispute: (id: number, resolution: string, note?: string, refund_amount?: number, release_amount?: number) =>
    api(`/admin/disputes/${id}/resolve`, {
      method: "POST",
      body: { resolution, note, refund_amount, release_amount },
    }),

  reviews: (status?: string) => api<Paginated<any>>("/admin/reviews", { params: { status } }),
  moderateReview: (id: number, status: "published" | "hidden" | "flagged") =>
    api(`/admin/reviews/${id}`, { method: "PATCH", body: { status } }),

  categories: () => api<{ data: ApiCategory[] }>("/admin/categories"),
  createCategory: (payload: { name_en: string; name_fr: string; icon?: string; parent_id?: number }) =>
    api<{ data: ApiCategory }>("/admin/categories", { method: "POST", body: payload }),
  updateCategory: (id: number, payload: Record<string, unknown>) =>
    api<{ data: ApiCategory }>(`/admin/categories/${id}`, { method: "PATCH", body: payload }),

  skills: () => api<Paginated<ApiSkill>>("/admin/skills"),
  createSkill: (name: string, category_id?: number) =>
    api<{ data: ApiSkill }>("/admin/skills", { method: "POST", body: { name, category_id } }),

  countries: () => api<{ data: { id: number; name: string; code: string; currency_code: string }[] }>("/admin/countries"),
  createCountry: (payload: { name: string; code: string; currency_code: string }) =>
    api("/admin/countries", { method: "POST", body: payload }),

  connectPacks: () => api<{ data: ApiConnectPack[] }>("/admin/connect-packs"),
  plans: () => api<{ data: any[] }>("/admin/subscription-plans"),

  coupons: () => api<Paginated<any>>("/admin/coupons"),
  createCoupon: (payload: { code: string; type: "percent" | "fixed"; value: number; expires_at?: string }) =>
    api("/admin/coupons", { method: "POST", body: payload }),

  settings: () => api<Record<string, unknown>>("/admin/settings"),
  updateSettings: (payload: Record<string, unknown>) =>
    api<Record<string, unknown>>("/admin/settings", { method: "PUT", body: payload }),

  broadcasts: () => api<Paginated<any>>("/admin/broadcasts"),
  sendBroadcast: (title: string, body: string, audience: "all" | "freelancers" | "clients") =>
    api("/admin/broadcasts", { method: "POST", body: { title, body, audience } }),

  auditLogs: () => api<Paginated<any>>("/admin/audit-logs"),
  revenueReport: () => api<{ months: any[] }>("/admin/reports/revenue"),

  tickets: (status?: string) => api<Paginated<any>>("/admin/support/tickets", { params: { status } }),
  replyTicket: (id: number, message: string) =>
    api(`/admin/support/tickets/${id}/messages`, { method: "POST", body: { message } }),
};
