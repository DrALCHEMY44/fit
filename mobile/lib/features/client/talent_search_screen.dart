import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/api/fit_api.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/data/mock_data.dart';
import '../../shared/widgets/fit_avatar.dart';
import '../../shared/widgets/fit_badge.dart';
import '../../shared/widgets/jss_bar.dart';
import '../../shared/widgets/skill_tag.dart';
import '../../shared/widgets/fit_gradient_button.dart';

class TalentSearchScreen extends StatefulWidget {
  final bool isTab;
  const TalentSearchScreen({super.key, this.isTab = false});

  @override
  State<TalentSearchScreen> createState() => _TalentSearchScreenState();
}

class _TalentSearchScreenState extends State<TalentSearchScreen> {
  static const double _rateCeiling = 50000.0;

  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All';
  double _rateMax = _rateCeiling;
  String _searchQuery = '';

  List<Freelancer> _freelancers = [];
  bool _loading = true;
  String? _error;

  final List<String> _categories = ['All', 'Development', 'Design', 'Writing', 'Data', 'Marketing'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final freelancers = await FitApi.freelancers();
      if (!mounted) return;
      setState(() {
        _freelancers = freelancers;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.firstError;
        _loading = false;
      });
    }
  }

  List<Freelancer> get _filteredFreelancers {
    return _freelancers.where((f) {
      final matchesSearch = _searchQuery.isEmpty ||
          f.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          f.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          f.skills.any((s) => s.toLowerCase().contains(_searchQuery.toLowerCase()));

      final matchesRate = _rateMax >= _rateCeiling || f.hourlyRate <= _rateMax;

      final matchesCategory = _selectedCategory == 'All' ||
          ( _selectedCategory == 'Development' && (f.title.contains('Developer') || f.title.contains('Flutter') || f.title.contains('React'))) ||
          ( _selectedCategory == 'Design' && f.title.contains('Designer')) ||
          ( _selectedCategory == 'Writing' && f.title.contains('Writer') || f.title.contains('Copywriter')) ||
          ( _selectedCategory == 'Data' && f.title.contains('Data') || f.title.contains('Analyst'));

      return matchesSearch && matchesRate && matchesCategory;
    }).toList();
  }

  void _showInviteModal(BuildContext context, Freelancer freelancer) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Invite to a Job', style: AppTextStyles.titleLarge),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'Select which job to invite ${freelancer.name} to:',
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 16),
                _InviteJobOption(title: 'Full-Stack React / Node.js Developer', isSelected: true),
                const SizedBox(height: 8),
                _InviteJobOption(title: 'Flutter Mobile App Developer', isSelected: false),
                const SizedBox(height: 24),
                FitGradientButton(
                  text: 'Send Invitation',
                  fullWidth: true,
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Invitation sent to ${freelancer.name}!'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Filters', style: AppTextStyles.titleLarge),
                      TextButton(
                        onPressed: () {
                          setModalState(() {
                            _rateMax = _rateCeiling;
                          });
                          setState(() {});
                        },
                        child: const Text('Reset All'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text('MAX HOURLY RATE (XAF)', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                  Row(
                    children: [
                      Text(
                        _rateMax >= _rateCeiling ? 'Any' : FitApi.formatMoney(_rateMax),
                        style: AppTextStyles.monoMedium.copyWith(color: AppColors.textPrimary),
                      ),
                      Text('/hr', style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                    ],
                  ),
                  Slider(
                    value: _rateMax,
                    min: 1000.0,
                    max: _rateCeiling,
                    activeColor: AppColors.fitBlue,
                    inactiveColor: AppColors.slate200,
                    onChanged: (val) {
                      setModalState(() {
                        _rateMax = val;
                      });
                      setState(() {});
                    },
                  ),
                  const SizedBox(height: 16),
                  Text('AVAILABILITY', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                  RadioListTile<String>(
                    title: const Text('Available Now', style: TextStyle(fontSize: 14)),
                    value: 'now',
                    groupValue: 'any',
                    activeColor: AppColors.fitBlue,
                    onChanged: (_) {},
                  ),
                  RadioListTile<String>(
                    title: const Text('Any Availability', style: TextStyle(fontSize: 14)),
                    value: 'any',
                    groupValue: 'any',
                    activeColor: AppColors.fitBlue,
                    onChanged: (_) {},
                  ),
                  const SizedBox(height: 24),
                  FitGradientButton(
                    text: 'Apply Filters',
                    fullWidth: true,
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final freelancers = _filteredFreelancers;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: widget.isTab
          ? null
          : AppBar(
              backgroundColor: AppColors.surface,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
              title: Text('Find Talent', style: AppTextStyles.titleLarge),
              elevation: 0,
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(0.5),
                child: Container(height: 0.5, color: AppColors.border),
              ),
            ),
      body: Column(
        children: [
          // Search & Filters Panel
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 44,
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: AppColors.slate50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.search, size: 18, color: AppColors.textTertiary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextField(
                                controller: _searchController,
                                onChanged: (v) => setState(() => _searchQuery = v),
                                style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
                                decoration: const InputDecoration(
                                  hintText: 'Search by name, skills, or title...',
                                  hintStyle: TextStyle(fontSize: 14, color: AppColors.textTertiary),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: InputBorder.none,
                                  isDense: true,
                                  contentPadding: EdgeInsets.zero,
                                  filled: false,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.tune, color: AppColors.textSecondary),
                      onPressed: _showFilterBottomSheet,
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.slate50,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: AppColors.border),
                        ),
                        padding: const EdgeInsets.all(10),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Horizontal scroll category chips
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, i) {
                      final cat = _categories[i];
                      final isSelected = _selectedCategory == cat;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedCategory = cat),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            gradient: isSelected ? AppColors.fitGradient : null,
                            color: isSelected ? null : AppColors.slate100,
                            borderRadius: BorderRadius.circular(100),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            cat,
                            style: AppTextStyles.labelMedium.copyWith(
                              color: isSelected ? Colors.white : AppColors.textSecondary,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          // Freelancer List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.fitBlue))
                : _error != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.wifi_off, size: 48, color: AppColors.slate300),
                          const SizedBox(height: 12),
                          Text(
                            _error!,
                            textAlign: TextAlign.center,
                            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 8),
                          TextButton(onPressed: _load, child: const Text('Try again')),
                        ],
                      ),
                    ),
                  )
                : freelancers.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.people_outline, size: 48, color: AppColors.slate300),
                          const SizedBox(height: 12),
                          Text(
                            'No freelancers found matching the criteria.',
                            textAlign: TextAlign.center,
                            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: freelancers.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final f = freelancers[index];
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
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                FitAvatar.lg(
                                  initials: f.initials,
                                  gradient: f.gradient,
                                  showOnline: f.available,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(f.name, style: AppTextStyles.titleLarge),
                                          const SizedBox(width: 6),
                                          if (f.topRated)
                                            const FitBadge(
                                              text: 'Top Rated',
                                              variant: BadgeVariant.warning,
                                              icon: Icons.military_tech,
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(f.title, style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          const Icon(Icons.location_on_outlined, size: 12, color: AppColors.textTertiary),
                                          const SizedBox(width: 4),
                                          Text(f.location, style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text('\$${f.hourlyRate}', style: AppTextStyles.monoMedium.copyWith(color: AppColors.textPrimary)),
                                    Text('/hr USD', style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            // JSS
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Job Success Score', style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                                Text('${f.completedJobs} jobs · ⭐ ${f.rating}', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            JssBar(score: f.jss),
                            const SizedBox(height: 12),
                            // Bio
                            Text(
                              f.bio,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 12),
                            // Skills
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: f.skills.map((s) => SkillTag(label: s)).toList(),
                            ),
                            const SizedBox(height: 16),
                            // Full-width invite button
                            FitGradientButton(
                              text: 'Invite to Job',
                              fullWidth: true,
                              onPressed: () => _showInviteModal(context, f),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _InviteJobOption extends StatelessWidget {
  final String title;
  final bool isSelected;
  const _InviteJobOption({required this.title, required this.isSelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.blueBadgeBg : AppColors.slate50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isSelected ? AppColors.fitBlue : AppColors.border),
      ),
      child: Row(
        children: [
          Icon(
            isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
            color: isSelected ? AppColors.fitBlue : AppColors.textTertiary,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: AppTextStyles.titleSmall.copyWith(
                color: isSelected ? AppColors.blueBadgeText : AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
