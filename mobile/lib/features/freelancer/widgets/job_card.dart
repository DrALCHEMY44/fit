import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/data/mock_data.dart';
import '../../../shared/widgets/fit_badge.dart';
import '../../../shared/widgets/skill_tag.dart';

/// Modular job card widget for the freelancer feed.
class JobCard extends StatelessWidget {
  final Job job;
  final bool isSaved;
  final VoidCallback? onToggleSave;
  final VoidCallback? onApply;

  const JobCard({
    super.key,
    required this.job,
    this.isSaved = false,
    this.onToggleSave,
    this.onApply,
  });

  String get _budgetDisplay {
    if (job.type == 'hourly') {
      return '\$${job.budget.min}–\$${job.budget.max}/hr';
    }
    if (job.budget.currency == 'XAF') {
      return 'XAF ${_formatNumber(job.budget.amount ?? 0)}';
    }
    return '\$${_formatNumber(job.budget.amount ?? 0)}';
  }

  String _formatNumber(int n) {
    if (n >= 1000) {
      return '${(n / 1000).toStringAsFixed(n % 1000 == 0 ? 0 : 1)}K';
    }
    return n.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Badges Row + Bookmark ──
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    FitBadge(
                      text: job.type == 'hourly' ? 'Hourly' : 'Fixed Price',
                      variant: job.type == 'hourly' ? BadgeVariant.blue : BadgeVariant.cyan,
                      icon: job.type == 'hourly' ? Icons.access_time : Icons.attach_money,
                    ),
                    FitBadge(text: job.category, variant: BadgeVariant.defaultVariant),
                    if (job.client.paymentVerified)
                      const FitBadge(
                        text: 'Payment Verified',
                        variant: BadgeVariant.success,
                        icon: Icons.verified_user,
                      ),
                  ],
                ),
              ),
              GestureDetector(
                onTap: onToggleSave,
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Icon(
                    isSaved ? Icons.bookmark : Icons.bookmark_outline,
                    size: 20,
                    color: isSaved ? AppColors.fitBlue : AppColors.textTertiary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // ── Title ──
          GestureDetector(
            onTap: onApply,
            child: Text(
              job.title,
              style: AppTextStyles.titleLarge.copyWith(
                color: AppColors.textPrimary,
                height: 1.3,
              ),
            ),
          ),
          const SizedBox(height: 8),

          // ── Description ──
          Text(
            job.description,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 12),

          // ── Skills ──
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: job.skills.map((s) => SkillTag(label: s)).toList(),
          ),
          const SizedBox(height: 14),

          // ── Metadata Row ──
          Container(
            padding: const EdgeInsets.only(top: 14),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: Column(
              children: [
                // Budget + metadata
                Row(
                  children: [
                    Text(
                      _budgetDisplay,
                      style: AppTextStyles.monoSmall.copyWith(color: AppColors.textPrimary),
                    ),
                    const SizedBox(width: 16),
                    Icon(Icons.access_time, size: 12, color: AppColors.textTertiary),
                    const SizedBox(width: 4),
                    Text(job.duration, style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                    const SizedBox(width: 12),
                    Icon(Icons.military_tech, size: 12, color: AppColors.textTertiary),
                    const SizedBox(width: 4),
                    Text(job.level, style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                  ],
                ),
                const SizedBox(height: 10),
                // Location + apply
                Row(
                  children: [
                    Icon(Icons.location_on_outlined, size: 12, color: AppColors.textTertiary),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        '${job.client.location} · ${job.posted} · ${job.proposals} proposals',
                        style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: onApply,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          gradient: AppColors.fitGradient,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Apply Now',
                          style: AppTextStyles.labelMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
