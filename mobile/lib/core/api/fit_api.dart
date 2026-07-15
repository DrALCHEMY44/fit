import 'package:flutter/material.dart';

import '../data/mock_data.dart';
import '../theme/app_colors.dart';
import 'api_client.dart';
import 'session.dart';

/// High-level FIT API service. Returns the app's existing view models
/// (Job, Freelancer, Contract, ChatThread, …) built from live API data.
class FitApi {
  FitApi._();

  static ApiClient get _client => ApiClient.instance;

  static const _gradients = <LinearGradient>[
    AppColors.gradientBlue,
    AppColors.gradientPurple,
    AppColors.gradientGreen,
    AppColors.gradientAmber,
    AppColors.gradientPink,
    AppColors.gradientTeal,
  ];

  static LinearGradient gradientFor(int seed) => _gradients[seed.abs() % _gradients.length];

  static String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    return parts.take(2).map((p) => p[0].toUpperCase()).join();
  }

  static String _timeAgo(String? iso) {
    if (iso == null) return '';
    final date = DateTime.tryParse(iso);
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24) return '${diff.inHours} hours ago';
    if (diff.inDays < 30) return '${diff.inDays} days ago';
    return '${date.day}/${date.month}/${date.year}';
  }

  static String formatMoney(num amount, [String currency = 'XAF']) {
    if (currency == 'USD') return '\$${amount.round()}';
    return '${amount.round().toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (m) => ',')} XAF';
  }

  // ── Auth ──────────────────────────────────────────────────────────────

  static Future<FitUser> login(String identifier, String password) async {
    final payload = await _client.post('/auth/login', body: {
      'identifier': identifier,
      'password': password,
      'device_name': 'mobile',
    }) as Map<String, dynamic>;
    await _client.saveToken(payload['token'] as String);
    final user = FitUser.fromJson(unwrap(payload['user']));
    Session.user.value = user;
    return user;
  }

  static Future<FitUser> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    final payload = await _client.post('/auth/register', body: {
      'name': name,
      'email': email,
      'password': password,
      'role': role,
    }) as Map<String, dynamic>;
    await _client.saveToken(payload['token'] as String);
    final user = FitUser.fromJson(unwrap(payload['user']));
    Session.user.value = user;
    return user;
  }

  /// Restores the session from a stored token. Returns null when logged out.
  static Future<FitUser?> restoreSession() async {
    await _client.loadToken();
    if (!_client.hasToken) return null;
    try {
      final payload = await _client.get('/auth/me');
      final user = FitUser.fromJson(unwrap(payload));
      Session.user.value = user;
      return user;
    } on ApiException {
      return null;
    }
  }

  static Future<void> refreshUser() async {
    if (!_client.hasToken) return;
    final payload = await _client.get('/auth/me');
    Session.user.value = FitUser.fromJson(unwrap(payload));
  }

  /// Toggles the freelancer availability flag and refreshes the session.
  static Future<void> setAvailability(bool available) async {
    await _client.patch('/me/freelancer-profile', body: {
      'availability': available ? 'available' : 'unavailable',
    });
    await refreshUser();
  }

  static Future<void> logout() async {
    try {
      await _client.post('/auth/logout');
    } on ApiException {
      // Token may already be revoked.
    }
    await _client.clearToken();
    Session.user.value = null;
  }

  // ── Jobs ──────────────────────────────────────────────────────────────

  static Job _jobFromJson(Map<String, dynamic> json, {Set<int> savedIds = const {}}) {
    final client = json['client'] as Map<String, dynamic>?;
    final clientProfile = client?['client_profile'] as Map<String, dynamic>?;
    final budgetType = json['budget_type']?.toString() ?? 'fixed';
    final min = double.tryParse('${json['budget_min'] ?? ''}');
    final max = double.tryParse('${json['budget_max'] ?? ''}');
    final currency = json['currency']?.toString() ?? 'XAF';
    final level = json['experience_level']?.toString() ?? 'intermediate';

    return Job(
      id: json['id'] as int,
      title: json['title']?.toString() ?? '',
      type: budgetType == 'hourly' ? 'hourly' : 'fixed',
      budget: budgetType == 'hourly'
          ? JobBudget(min: min?.round(), max: max?.round(), currency: currency)
          : JobBudget(amount: (max ?? min)?.round(), currency: currency),
      posted: _timeAgo(json['published_at']?.toString() ?? json['created_at']?.toString()),
      description: json['description']?.toString() ?? '',
      skills: (json['skills'] as List?)
              ?.whereType<Map<String, dynamic>>()
              .map((s) => s['name'].toString())
              .toList() ??
          const [],
      duration: json['duration']?.toString() ?? 'Flexible',
      level: level[0].toUpperCase() + level.substring(1),
      proposals: (json['proposals_count'] as num?)?.toInt() ?? 0,
      client: JobClient(
        name: clientProfile?['company_name']?.toString() ?? client?['name']?.toString() ?? 'FIT Client',
        location: (client?['city'] as Map<String, dynamic>?)?['name'] != null
            ? '${(client?['city'] as Map<String, dynamic>)['name']}, Cameroon'
            : 'Cameroon',
        verified: client?['email_verified'] == true,
        paymentVerified: clientProfile?['payment_verified'] == true,
        rating: double.tryParse('${clientProfile?['rating'] ?? 0}') ?? 0,
        spent: formatMoney(double.tryParse('${clientProfile?['total_spent'] ?? 0}') ?? 0, currency),
        jobs: (clientProfile?['jobs_posted_count'] as num?)?.toInt() ?? 0,
      ),
      saved: savedIds.contains(json['id'] as int),
      category: (json['category'] as Map<String, dynamic>?)?['name_en']?.toString() ?? '',
    );
  }

  static Future<List<Job>> jobs({String? search}) async {
    final payload = await _client.get('/jobs', query: {
      if (search != null && search.isNotEmpty) 'search': search,
      'sort': 'newest',
    });
    final saved = await savedJobIds();
    return unwrapList(payload).map((json) => _jobFromJson(json, savedIds: saved)).toList();
  }

  static Future<Job> job(int id) async =>
      _jobFromJson(unwrap(await _client.get('/jobs/$id')));

  static Future<Set<int>> savedJobIds() async {
    if (!_client.hasToken) return {};
    try {
      final payload = await _client.get('/favorites') as Map<String, dynamic>;
      final jobs = payload['jobs'];
      final list = jobs is Map<String, dynamic> ? jobs['data'] : jobs;
      if (list is List) {
        return list.whereType<Map<String, dynamic>>().map((j) => j['id'] as int).toSet();
      }
      return {};
    } on ApiException {
      return {};
    }
  }

  static Future<void> toggleSaveJob(int jobId, bool save) => save
      ? _client.post('/favorites', body: {'type': 'job', 'id': jobId})
      : _client.delete('/favorites', body: {'type': 'job', 'id': jobId});

  static Future<Map<String, dynamic>> createJob(Map<String, dynamic> payload) async =>
      await _client.post('/jobs', body: payload) as Map<String, dynamic>;

  /// The authenticated client's posted jobs (raw API rows).
  static Future<List<Map<String, dynamic>>> myJobs() async =>
      unwrapList(await _client.get('/me/jobs'));

  static Future<List<Map<String, dynamic>>> categories() async =>
      unwrapList(await _client.get('/meta/categories'));

  static Future<List<Map<String, dynamic>>> skills() async =>
      unwrapList(await _client.get('/meta/skills'));

  // ── Talent ────────────────────────────────────────────────────────────

  static Freelancer _freelancerFromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final name = user?['name']?.toString() ?? 'FIT Freelancer';
    final userId = (json['user_id'] as num?)?.toInt() ?? 0;

    return Freelancer(
      id: userId,
      name: name,
      title: json['title']?.toString() ?? 'Freelancer',
      initials: _initials(name),
      gradient: gradientFor(userId),
      location: (user?['city'] as Map<String, dynamic>?)?['name'] != null
          ? '${(user?['city'] as Map<String, dynamic>)['name']}, Cameroon'
          : 'Cameroon',
      jss: (json['job_success_score'] as num?)?.toInt() ?? 0,
      hourlyRate: (double.tryParse('${json['hourly_rate'] ?? 0}') ?? 0).round(),
      currency: json['currency']?.toString() ?? 'XAF',
      totalEarnings: '${formatMoney(double.tryParse('${json['total_earned'] ?? 0}') ?? 0)}+',
      skills: (json['skills'] as List?)
              ?.whereType<Map<String, dynamic>>()
              .map((s) => s['name'].toString())
              .toList() ??
          const [],
      bio: json['bio']?.toString() ?? '',
      completedJobs: (json['completed_orders_count'] as num?)?.toInt() ?? 0,
      rating: double.tryParse('${json['rating'] ?? 0}') ?? 0,
      available: json['availability'] == 'available',
      topRated: json['is_top_rated'] == true,
    );
  }

  static Future<List<Freelancer>> freelancers({String? search}) async {
    final payload = await _client.get('/freelancers', query: {
      if (search != null && search.isNotEmpty) 'search': search,
    });
    return unwrapList(payload).map(_freelancerFromJson).toList();
  }

  // ── Proposals ─────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> submitProposal({
    required int jobId,
    required double amount,
    required int deliveryDays,
    required String coverLetter,
    List<Map<String, dynamic>>? milestones,
  }) async {
    return await _client.post('/jobs/$jobId/proposals', body: {
      'amount': amount,
      'delivery_days': deliveryDays,
      'cover_letter': coverLetter,
      'milestones': ?(milestones != null && milestones.isNotEmpty ? milestones : null),
    }) as Map<String, dynamic>;
  }

  static Future<List<Map<String, dynamic>>> myProposals() async =>
      unwrapList(await _client.get('/me/proposals'));

  // ── Orders / contracts ────────────────────────────────────────────────

  static Contract _contractFromJson(Map<String, dynamic> json) {
    final milestones = (json['milestones'] as List?)
            ?.whereType<Map<String, dynamic>>()
            .map((m) => Milestone(
                  id: m['id'] as int,
                  name: m['title']?.toString() ?? '',
                  amount: (double.tryParse('${m['amount'] ?? 0}') ?? 0).round(),
                  status: m['status']?.toString() ?? 'pending',
                  dueDate: m['due_date']?.toString() ?? '—',
                ))
            .toList() ??
        const <Milestone>[];

    return Contract(
      id: json['id'] as int,
      title: json['title']?.toString() ?? '',
      client: (json['client'] as Map<String, dynamic>?)?['name']?.toString() ?? 'Client',
      freelancer: (json['freelancer'] as Map<String, dynamic>?)?['name']?.toString() ?? 'Freelancer',
      totalAmount: (double.tryParse('${json['amount'] ?? 0}') ?? 0).round(),
      currency: json['currency']?.toString() ?? 'XAF',
      status: json['status']?.toString() ?? 'active',
      milestones: milestones,
    );
  }

  static Future<List<Contract>> contracts() async =>
      unwrapList(await _client.get('/orders')).map(_contractFromJson).toList();

  /// Funds a milestone through the sandbox flow (initiate + confirm). In
  /// production the Mobile Money webhook performs the confirmation step.
  static Future<void> fundMilestone(int milestoneId, {String provider = 'mtn_momo', String? phoneNumber}) async {
    final payment = unwrap(await _client.post('/milestones/$milestoneId/pay', body: {
      'provider': provider,
      'phone_number': phoneNumber ?? Session.current?.phone ?? '237600000000',
    }));
    await _client.post('/payments/${payment['reference']}/confirm-sandbox');
  }

  static Future<void> submitDelivery(int orderId, {int? milestoneId, String? message, String? linkUrl}) =>
      _client.post('/orders/$orderId/deliveries', body: {
        'milestone_id': ?milestoneId,
        'message': ?(message != null && message.isNotEmpty ? message : null),
        'link_url': ?(linkUrl != null && linkUrl.isNotEmpty ? linkUrl : null),
      });

  /// Approves the submitted delivery attached to [milestoneId] (or the order
  /// itself when null), releasing the escrowed payment.
  static Future<void> approveDelivery(int orderId, {int? milestoneId}) async {
    final order = unwrap(await _client.get('/orders/$orderId'));
    final deliveries =
        (order['deliveries'] as List?)?.whereType<Map<String, dynamic>>().toList() ?? const [];
    final target = deliveries.where((d) =>
        d['status'] == 'submitted' &&
        (milestoneId == null || d['order_milestone_id'] == milestoneId)).toList();
    if (target.isEmpty) {
      throw ApiException(422, 'No submitted delivery to approve yet.');
    }
    await _client.post('/deliveries/${target.first['id']}/approve');
  }

  // ── Messaging ─────────────────────────────────────────────────────────

  static ChatThread _threadFromJson(Map<String, dynamic> json, int myUserId) {
    final client = json['client'] as Map<String, dynamic>?;
    final freelancer = json['freelancer'] as Map<String, dynamic>?;
    final other = (client?['id'] == myUserId) ? freelancer : client;
    final name = other?['name']?.toString() ?? 'Conversation';
    final lastMessage = json['last_message'] as Map<String, dynamic>?;

    return ChatThread(
      id: json['id'] as int,
      contact: name,
      initials: _initials(name),
      gradient: gradientFor((other?['id'] as num?)?.toInt() ?? 0),
      lastMessage: lastMessage?['body']?.toString() ?? 'Attachment',
      time: _timeAgo(json['last_message_at']?.toString()),
      unread: (json['unread_count'] as num?)?.toInt() ?? 0,
      type: json['order_id'] != null ? 'contract' : 'interview',
      online: false,
    );
  }

  static Future<List<ChatThread>> conversations() async {
    final myId = Session.current?.id ?? 0;
    return unwrapList(await _client.get('/conversations'))
        .map((json) => _threadFromJson(json, myId))
        .toList();
  }

  static Future<List<ChatMessage>> messages(int conversationId) async {
    final myId = Session.current?.id ?? 0;
    final list = unwrapList(await _client.get('/conversations/$conversationId/messages'))
        .map((json) => ChatMessage(
              id: json['id'] as int,
              sender: json['sender_id'] == myId ? 'me' : 'them',
              text: json['body']?.toString() ?? '',
              time: _timeAgo(json['created_at']?.toString()),
            ))
        .toList();
    _client.post('/conversations/$conversationId/read').ignore();
    return list.reversed.toList();
  }

  /// Returns the anti-bypass warning when the message was flagged, else null.
  static Future<String?> sendMessage(int conversationId, String body) async {
    final payload =
        await _client.post('/conversations/$conversationId/messages', body: {'body': body})
            as Map<String, dynamic>;
    return payload['contact_warning']?.toString();
  }

  static Future<int> startConversation(int recipientId, {int? jobId, int? orderId}) async {
    final payload = await _client.post('/conversations', body: {
      'recipient_id': recipientId,
      'job_post_id': ?jobId,
      'order_id': ?orderId,
    });
    return unwrap(payload)['id'] as int;
  }

  // ── Wallet / connects / payments ──────────────────────────────────────

  static Future<Map<String, dynamic>> wallet() async =>
      unwrap(await _client.get('/wallet'));

  static Future<List<Map<String, dynamic>>> walletTransactions() async =>
      unwrapList(await _client.get('/wallet/transactions'));

  static Future<List<Map<String, dynamic>>> withdrawals() async =>
      unwrapList(await _client.get('/withdrawals'));

  static Future<void> requestWithdrawal({
    required double amount,
    required String method,
    required String accountNumber,
  }) =>
      _client.post('/withdrawals', body: {
        'amount': amount,
        'method': method,
        'account_number': accountNumber,
      });

  static Future<List<Map<String, dynamic>>> connectPacks() async =>
      unwrapList(await _client.get('/connect-packs'));

  /// Buys a pack and settles it through the sandbox confirm endpoint.
  /// In production the Mobile Money webhook performs the settlement.
  static Future<void> purchaseConnects(int packId, String provider, String currency,
      {String? phoneNumber}) async {
    final payment = unwrap(await _client.post('/connect-packs/$packId/purchase', body: {
      'provider': provider,
      'currency': currency,
      'phone_number': ?phoneNumber,
    }));
    await _client.post('/payments/${payment['reference']}/confirm-sandbox');
    await refreshUser();
  }

  static Future<void> payOrder(int orderId, String provider, {String? phoneNumber}) async {
    final payload = await _client.post('/orders/$orderId/pay', body: {
      'provider': provider,
      'phone_number': ?phoneNumber,
    }) as Map<String, dynamic>;
    final payment = unwrap(payload['payment']);
    await _client.post('/payments/${payment['reference']}/confirm-sandbox');
  }

  // ── Internships ───────────────────────────────────────────────────────

  static Future<List<Map<String, dynamic>>> internships({String? search}) async =>
      unwrapList(await _client.get('/internships', query: {
        if (search != null && search.isNotEmpty) 'search': search,
      }));

  static Future<void> applyToInternship(int id, {String? coverLetter}) =>
      _client.post('/internships/$id/apply', body: {
        'cover_letter': ?coverLetter,
      });
}
