import 'dart:async';

import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/api/fit_api.dart';
import '../../core/api/session.dart';
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
  final Set<int> _savedJobs = {};
  bool _statsExpanded = true;

  List<Job> _jobs = [];
  bool _loading = true;
  String? _error;
  int _proposalCount = 0;
  int _activeContracts = 0;
  Timer? _searchDebounce;
  String _search = '';

  final _tabs = ['My Feed', 'Best Matches', 'Saved'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        FitApi.jobs(search: _search),
        FitApi.savedJobIds(),
        FitApi.myProposals().catchError((_) => <Map<String, dynamic>>[]),
        FitApi.contracts().catchError((_) => <Contract>[]),
      ]);
      if (!mounted) return;
      setState(() {
        _jobs = results[0] as List<Job>;
        _savedJobs
          ..clear()
          ..addAll(results[1] as Set<int>);
        _proposalCount = (results[2] as List).length;
        _activeContracts =
            (results[3] as List<Contract>).where((c) => c.status == 'active').length;
        _loading = false;
      });
      FitApi.refreshUser().catchError((_) {});
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.firstError;
        _loading = false;
      });
    }
  }

  void _onSearchChanged(String value) {
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 500), () {
      _search = value;
      _load();
    });
  }

  List<Job> get _displayJobs {
    if (_activeTab == 2) {
      return _jobs.where((j) => _savedJobs.contains(j.id)).toList();
    }
    if (_activeTab == 1) {
      final sorted = [..._jobs]..sort((a, b) => a.proposals.compareTo(b.proposals));
      return sorted;
    }
    return _jobs;
  }

  void _toggleSave(int jobId) {
    final wasSaved = _savedJobs.contains(jobId);
    setState(() {
      wasSaved ? _savedJobs.remove(jobId) : _savedJobs.add(jobId);
    });
    FitApi.toggleSaveJob(jobId, !wasSaved).catchError((_) {
      if (mounted) {
        setState(() {
          wasSaved ? _savedJobs.add(jobId) : _savedJobs.remove(jobId);
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Session.current;
    final completion = (user?.profileCompletion ?? 0) / 100;

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
                            FitAvatar.lg(
                              initials: user?.initials ?? 'FI',
                              gradient: AppColors.gradientBlue,
                              showOnline: user?.availability == 'available',
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(user?.name ?? 'Freelancer', style: AppTextStyles.titleLarge.copyWith(color: AppColors.textPrimary)),
                                  const SizedBox(height: 2),
                                  Text(user?.title ?? 'Complete your profile', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: BoxDecoration(
                                          color: user?.availability == 'available' ? AppColors.emerald : AppColors.warning,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        user?.availability == 'busy'
                                            ? 'Busy'
                                            : user?.availability == 'unavailable'
                                                ? 'Unavailable'
                                                : 'Available',
                                        style: AppTextStyles.labelSmall.copyWith(color: AppColors.success, fontWeight: FontWeight.w600),
                                      ),
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
                                Text('${user?.profileCompletion ?? 0}%', style: AppTextStyles.labelMedium.copyWith(color: AppColors.fitBlue, fontWeight: FontWeight.w700)),
                              ],
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(100),
                              child: LinearProgressIndicator(
                                value: completion,
                                minHeight: 6,
                                backgroundColor: AppColors.slate100,
                                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.fitBlue),
                              ),
                            ),
                            const SizedBox(height: 4),
                            if ((user?.profileCompletion ?? 0) < 100)
                              Align(
                                alignment: Alignment.centerLeft,
                                child: Text('Add skills and portfolio items to reach 100%', style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
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
                                  _StatPill(label: 'Proposals', value: '$_proposalCount'),
                                  _StatPill(label: 'Connects', value: '${user?.connectsBalance ?? 0}'),
                                  _StatPill(label: 'Active', value: '$_activeContracts'),
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
                    onChanged: _onSearchChanged,
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
        if (_loading)
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(48),
              child: Center(child: CircularProgressIndicator(color: AppColors.fitBlue)),
            ),
          )
        else if (_error != null)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  const Icon(Icons.wifi_off, size: 48, color: AppColors.slate300),
                  const SizedBox(height: 12),
                  Text(
                    _error!,
                    textAlign: TextAlign.center,
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 12),
                  TextButton(onPressed: _load, child: const Text('Try again')),
                ],
              ),
            ),
          )
        else if (_displayJobs.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  const Icon(Icons.bookmark_outline, size: 48, color: AppColors.slate300),
                  const SizedBox(height: 12),
                  Text(
                    _activeTab == 2
                        ? 'No saved jobs yet.\nBookmark jobs to see them here.'
                        : 'No jobs match your search yet.',
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
                      MaterialPageRoute(builder: (_) => ProposalScreen(job: job)),
                    ).then((_) => _load());
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
