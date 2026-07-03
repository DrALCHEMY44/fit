import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/data/mock_data.dart';
import '../../shared/widgets/fit_badge.dart';
import '../../shared/widgets/fit_gradient_button.dart';
import 'talent_search_screen.dart';
import 'job_wizard/job_wizard_screen.dart';

/// Client dashboard with stats, active jobs, contracts overview.
class ClientDashboard extends StatelessWidget {
  const ClientDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final stats = [
      _Stat('Active Jobs', '3', Icons.work_outline, AppColors.fitBlue, AppColors.blueBadgeBg),
      _Stat('Contracts', '5', Icons.fact_check_outlined, AppColors.success, AppColors.successLight),
      _Stat('Total Spent', '\$12.4K', Icons.attach_money, AppColors.warning, AppColors.warningLight),
      _Stat('Hired', '11', Icons.people_outline, const Color(0xFF7C3AED), const Color(0xFFF5F3FF)),
    ];

    final activeJobs = [
      {'title': 'Full-Stack React / Node.js Developer', 'proposals': 12, 'status': 'active', 'budget': '\$25–45/hr', 'posted': 'June 18, 2025'},
      {'title': 'Flutter Mobile App Developer', 'proposals': 5, 'status': 'active', 'budget': '\$20–35/hr', 'posted': 'June 20, 2025'},
      {'title': 'Brand Identity Designer', 'proposals': 7, 'status': 'draft', 'budget': '\$850 fixed', 'posted': 'Draft'},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // ── Header ──
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Client Dashboard', style: AppTextStyles.headlineLarge),
                const SizedBox(height: 2),
                Text('Afrikart Commerce · Nairobi, Kenya', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
              ],
            ),
            FitGradientButton(
              text: 'Post Job',
              icon: Icons.add,
              height: 40,
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const JobWizardScreen())),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // ── Stats Grid ──
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.8,
          children: stats.map((s) => Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(color: s.bg, borderRadius: BorderRadius.circular(12)),
                  child: Icon(s.icon, size: 20, color: s.color),
                ),
                const SizedBox(width: 12),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s.value, style: AppTextStyles.monoMedium.copyWith(color: AppColors.textPrimary)),
                    Text(s.label, style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                  ],
                ),
              ],
            ),
          )).toList(),
        ),
        const SizedBox(height: 20),

        // ── Active & Draft Jobs ──
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Active & Draft Jobs', style: AppTextStyles.titleLarge),
                    GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const JobWizardScreen())),
                      child: Padding(
                        padding: const EdgeInsets.all(4.0),
                        child: Row(
                          children: [
                            Icon(Icons.add, size: 14, color: AppColors.fitBlue),
                            const SizedBox(width: 4),
                            Text('New Post', style: AppTextStyles.labelSmall.copyWith(color: AppColors.fitBlue, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              ...activeJobs.map((job) => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 8, height: 8,
                          decoration: BoxDecoration(
                            color: job['status'] == 'active' ? AppColors.emerald : AppColors.warning,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(child: Text(job['title'] as String, style: AppTextStyles.titleSmall, overflow: TextOverflow.ellipsis)),
                        FitBadge(
                          text: job['status'] == 'active' ? 'Live' : 'Draft',
                          variant: job['status'] == 'active' ? BadgeVariant.success : BadgeVariant.warning,
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${job['budget']} · ${job['proposals']} proposals · Posted ${job['posted']}',
                      style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        if (job['status'] == 'active') ...[
                          _ActionChip(label: 'View ${job['proposals']} Proposals', color: AppColors.fitBlue, bg: AppColors.blueBadgeBg),
                          const SizedBox(width: 8),
                          GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TalentSearchScreen())),
                            child: _ActionChip(label: 'Find Talent', color: AppColors.textSecondary, bg: AppColors.slate100),
                          ),
                        ] else
                          GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const JobWizardScreen())),
                            child: _ActionChip(label: 'Continue Editing', color: AppColors.warning, bg: AppColors.warningLight),
                          ),
                      ],
                    ),
                  ],
                ),
              )),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // ── Contracts Summary ──
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Open Contracts', style: AppTextStyles.titleLarge),
                    Row(
                      children: [
                        Text('View all', style: AppTextStyles.labelSmall.copyWith(color: AppColors.fitBlue, fontWeight: FontWeight.w700)),
                        Icon(Icons.chevron_right, size: 14, color: AppColors.fitBlue),
                      ],
                    ),
                  ],
                ),
              ),
              ...kContracts.map((c) => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(c.title, style: AppTextStyles.titleSmall, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 2),
                          Text('with ${c.freelancer}', style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('${c.currency} ${c.totalAmount}', style: AppTextStyles.monoCaption.copyWith(color: AppColors.textPrimary)),
                        const SizedBox(height: 2),
                        FitBadge(text: c.status, variant: c.status == 'active' ? BadgeVariant.success : BadgeVariant.defaultVariant),
                      ],
                    ),
                  ],
                ),
              )),
            ],
          ),
        ),

        // ── Spending Overview ──
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(gradient: AppColors.darkGradient, borderRadius: BorderRadius.circular(16)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('This Month', style: AppTextStyles.titleSmall.copyWith(color: Colors.white)),
                  const Icon(Icons.bar_chart, size: 18, color: Color(0xFF22D3EE)),
                ],
              ),
              const SizedBox(height: 16),
              ...[
                _SpendingRow('Escrow Held', '\$2,300', 0.6),
                _SpendingRow('Released', '\$800', 0.3),
                _SpendingRow('Pending Review', '\$1,200', 0.4),
              ].map((r) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(r.label, style: AppTextStyles.caption.copyWith(color: AppColors.slate400)),
                        Text(r.value, style: AppTextStyles.monoCaption.copyWith(color: Colors.white)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(100),
                      child: LinearProgressIndicator(
                        value: r.progress,
                        minHeight: 5,
                        backgroundColor: Colors.white.withOpacity(0.1),
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.fitCyan),
                      ),
                    ),
                  ],
                ),
              )),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

class _Stat {
  final String label, value;
  final IconData icon;
  final Color color, bg;
  const _Stat(this.label, this.value, this.icon, this.color, this.bg);
}

class _SpendingRow {
  final String label, value;
  final double progress;
  const _SpendingRow(this.label, this.value, this.progress);
}

class _ActionChip extends StatelessWidget {
  final String label;
  final Color color, bg;
  const _ActionChip({required this.label, required this.color, required this.bg});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: AppTextStyles.labelSmall.copyWith(color: color, fontWeight: FontWeight.w700)),
    );
  }
}
