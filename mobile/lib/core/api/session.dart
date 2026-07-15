import 'package:flutter/foundation.dart';

/// The authenticated FIT account, kept globally after login.
class FitUser {
  const FitUser({
    required this.id,
    required this.name,
    required this.role,
    this.email,
    this.phone,
    this.cityName,
    this.connectsBalance = 0,
    this.title,
    this.bio,
    this.hourlyRate,
    this.availability,
    this.jss = 0,
    this.rating = 0,
    this.completedOrders = 0,
    this.totalEarned = 0,
    this.profileCompletion = 0,
    this.isVerified = false,
    this.isTopRated = false,
    this.skills = const [],
  });

  final int id;
  final String name;
  final String role; // client | freelancer | admin | super_admin
  final String? email;
  final String? phone;
  final String? cityName;
  final int connectsBalance;
  final String? title;
  final String? bio;
  final double? hourlyRate;
  final String? availability;
  final int jss;
  final double rating;
  final int completedOrders;
  final double totalEarned;
  final int profileCompletion;
  final bool isVerified;
  final bool isTopRated;
  final List<String> skills;

  bool get isFreelancer => role == 'freelancer';
  bool get isClient => role == 'client';

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    return parts.take(2).map((p) => p[0].toUpperCase()).join();
  }

  static FitUser fromJson(Map<String, dynamic> json) {
    final freelancerProfile = json['freelancer_profile'] as Map<String, dynamic>?;
    final skills = (freelancerProfile?['skills'] as List?)
            ?.whereType<Map<String, dynamic>>()
            .map((s) => s['name'].toString())
            .toList() ??
        const <String>[];

    return FitUser(
      id: json['id'] as int,
      name: json['name']?.toString() ?? 'FIT User',
      role: json['role']?.toString() ?? 'client',
      email: json['email']?.toString(),
      phone: json['phone']?.toString(),
      cityName: (json['city'] as Map<String, dynamic>?)?['name']?.toString(),
      connectsBalance: (json['connects_balance'] as num?)?.toInt() ?? 0,
      title: freelancerProfile?['title']?.toString(),
      bio: freelancerProfile?['bio']?.toString(),
      hourlyRate: double.tryParse('${freelancerProfile?['hourly_rate'] ?? ''}'),
      availability: freelancerProfile?['availability']?.toString(),
      jss: (freelancerProfile?['job_success_score'] as num?)?.toInt() ?? 0,
      rating: double.tryParse('${freelancerProfile?['rating'] ?? 0}') ?? 0,
      completedOrders: (freelancerProfile?['completed_orders_count'] as num?)?.toInt() ?? 0,
      totalEarned: double.tryParse('${freelancerProfile?['total_earned'] ?? 0}') ?? 0,
      profileCompletion: (freelancerProfile?['profile_completion'] as num?)?.toInt() ?? 0,
      isVerified: freelancerProfile?['is_verified'] == true,
      isTopRated: freelancerProfile?['is_top_rated'] == true,
      skills: skills,
    );
  }
}

/// Global session holder — screens listen to [Session.user] for identity.
class Session {
  static final ValueNotifier<FitUser?> user = ValueNotifier<FitUser?>(null);

  static FitUser? get current => user.value;
  static bool get isLoggedIn => user.value != null;
}
