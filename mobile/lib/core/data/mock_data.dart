import 'package:flutter/material.dart';

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
