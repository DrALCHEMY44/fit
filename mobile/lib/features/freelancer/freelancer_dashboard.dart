import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/data/mock_data.dart';
import '../../shared/widgets/fit_avatar.dart';
import '../../shared/widgets/fit_search_bar.dart';
import 'widgets/job_card.dart';
import 'widgets/connects_card.dart';
import '../proposal/proposal_screen.dart';

/// Freelancer job feed dashboard with profile stats banner, tabs, and job cards.
class FreelancerDashboard extends StatefulWidget {
  const FreelancerDashboard({super.key});

  @override
  State<FreelancerDashboard> createState() => _FreelancerDashboardState();
}

class _FreelancerDashboardState extends State<FreelancerDashboard> {
  int _activeTab = 0;
  final Set<int> _savedJobs = {2, 5}; // Pre-saved job IDs
  bool _statsExpanded = true;

  final _tabs = ['My Feed', 'Best Matches', 'Saved'];

  List<Job> get _displayJobs {
    if (_activeTab == 2) {
      return kJobs.where((j) => _savedJobs.contains(j.id)).toList();
    }
    return kJobs;
  }

  void _toggleSave(int jobId) {
    setState(() {
      if (_savedJobs.contains(jobId)) {
        _savedJobs.remove(jobId);
      } else {
        _savedJobs.add(jobId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        // ── Profile Stats Banner ──
        SliverToBoxAdapter(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    // Header row (always visible)
                    InkWell(
                      onTap: () => setState(() => _statsExpanded = !_statsExpanded),
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            const FitAvatar.lg(
                              initials: 'DN',
                              gradient: AppColors.gradientBlue,
                              showOnline: true,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Diane Ngono', style: AppTextStyles.titleLarge.copyWith(color: AppColors.textPrimary)),
                                  const SizedBox(height: 2),
                                  Text('Senior React Developer', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: const BoxDecoration(
                                          color: AppColors.emerald,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Text('Available', style: AppTextStyles.labelSmall.copyWith(color: AppColors.success, fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            Icon(
                              _statsExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                              color: AppColors.textTertiary,
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Expandable stats section
                    if (_statsExpanded) ...[
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Column(
                          children: [
                            // Profile completeness
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Profile completeness', style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                                Text('87%', style: AppTextStyles.labelMedium.copyWith(color: AppColors.fitBlue, fontWeight: FontWeight.w700)),
                              ],
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(100),
                              child: LinearProgressIndicator(
                                value: 0.87,
                                minHeight: 6,
                                backgroundColor: AppColors.slate100,
                                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.fitBlue),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Align(
                              alignment: Alignment.centerLeft,
                              child: Text('Add a portfolio item to reach 100%', style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                            ),
                            const SizedBox(height: 16),

                            // Stats row
                            Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                border: Border(top: BorderSide(color: AppColors.border)),
                              ),
                              child: Row(
                                children: [
                                  _StatPill(label: 'Proposals', value: '6'),
                                  _StatPill(label: 'Connects', value: '42'),
                                  _StatPill(label: 'Active', value: '2'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),

        // ── Connects Card ──
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: const ConnectsCard(),
          ),
        ),

        // ── Search Bar ──
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Row(
              children: [
                Expanded(
                  child: FitSearchBar(
                    hint: 'Search jobs, skills, keywords...',
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.tune, size: 16, color: AppColors.textSecondary),
                      const SizedBox(width: 6),
                      Text('Filters', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // ── Tabs ──
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: List.generate(_tabs.length, (i) {
                  final isActive = _activeTab == i;
                  final label = i == 2 ? 'Saved (${_savedJobs.length})' : _tabs[i];
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _activeTab = i),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          gradient: isActive ? AppColors.fitGradient : null,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          label,
                          style: AppTextStyles.labelLarge.copyWith(
                            color: isActive ? Colors.white : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
        ),

        // ── Job Cards List ──
        if (_displayJobs.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  const Icon(Icons.bookmark_outline, size: 48, color: AppColors.slate300),
                  const SizedBox(height: 12),
                  Text(
                    'No saved jobs yet.\nBookmark jobs to see them here.',
                    textAlign: TextAlign.center,
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            sliver: SliverList.separated(
              itemCount: _displayJobs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final job = _displayJobs[index];
                return JobCard(
                  job: job,
                  isSaved: _savedJobs.contains(job.id),
                  onToggleSave: () => _toggleSave(job.id),
                  onApply: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ProposalScreen()),
                    );
                  },
                );
              },
            ),
          ),
      ],
    );
  }
}

class _StatPill extends StatelessWidget {
  final String label;
  final String value;
  const _StatPill({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: AppTextStyles.monoMedium.copyWith(color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
