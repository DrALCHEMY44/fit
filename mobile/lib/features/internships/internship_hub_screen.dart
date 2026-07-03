import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/fit_badge.dart';
import '../../shared/widgets/skill_tag.dart';
import '../../shared/widgets/fit_gradient_button.dart';

class InternshipHubScreen extends StatefulWidget {
  const InternshipHubScreen({super.key});

  @override
  State<InternshipHubScreen> createState() => _InternshipHubScreenState();
}

class _InternshipHubScreenState extends State<InternshipHubScreen> {
  String _searchQuery = '';
  String _typeFilter = 'All';

  final List<Map<String, dynamic>> _internships = [
    {
      'id': 1,
      'title': 'Frontend Engineering Intern',
      'company': 'MTN Innovation Lab',
      'location': 'Douala, Cameroon',
      'duration': '3 months',
      'stipend': 'XAF 150,000/mo',
      'skills': ['React', 'TypeScript', 'CSS'],
      'type': 'Hybrid',
      'paid': true,
      'description': 'Work alongside senior engineers building the next generation of mobile money dashboards. Learn React, design systems, and agile development.'
    },
    {
      'id': 2,
      'title': 'UI/UX Design Intern',
      'company': 'Afrikart Commerce',
      'location': 'Yaoundé, Cameroon',
      'duration': '4 months',
      'stipend': 'XAF 120,000/mo',
      'skills': ['Figma', 'Adobe XD', 'Prototyping'],
      'type': 'Remote',
      'paid': true,
      'description': 'Help redesign the Afrikart mobile app experience. Collaborate with product managers on user research and prototyping.'
    },
    {
      'id': 3,
      'title': 'Data Science Intern',
      'company': 'GreenField AgriTech',
      'location': 'Bamenda, Cameroon',
      'duration': '6 months',
      'stipend': 'XAF 200,000/mo',
      'skills': ['Python', 'SQL', 'Machine Learning'],
      'type': 'On-site',
      'paid': true,
      'description': 'Analyze agricultural data from IoT sensors across 3 West African countries. Build predictive models for crop yield optimization.'
    },
    {
      'id': 4,
      'title': 'Backend Developer Intern',
      'company': 'CloudOps Cameroon',
      'location': 'Bafoussam, Cameroon',
      'duration': '3 months',
      'stipend': 'XAF 100,000/mo',
      'skills': ['Node.js', 'PostgreSQL', 'Docker'],
      'type': 'Remote',
      'paid': true,
      'description': 'Contribute to our cloud infrastructure platform. Write APIs, optimize databases, and learn DevOps best practices.'
    },
    {
      'id': 5,
      'title': 'Content & Social Media Intern',
      'company': 'TechAfrique Media',
      'location': 'Douala, Cameroon',
      'duration': '3 months',
      'stipend': 'Unpaid',
      'skills': ['Content Writing', 'French', 'SEO'],
      'type': 'Remote',
      'paid': false,
      'description': 'Create bilingual content about Africa\'s tech ecosystem. Manage social media accounts and track engagement analytics.'
    },
  ];

  List<Map<String, dynamic>> get _filteredInternships {
    return _internships.where((intern) {
      final matchesSearch = _searchQuery.isEmpty ||
          intern['title'].toLowerCase().contains(_searchQuery.toLowerCase()) ||
          intern['company'].toLowerCase().contains(_searchQuery.toLowerCase()) ||
          intern['skills'].any((s) => s.toLowerCase().contains(_searchQuery.toLowerCase()));

      final matchesType = _typeFilter == 'All' || intern['type'] == _typeFilter;

      return matchesSearch && matchesType;
    }).toList();
  }

  void _showApplyModal(BuildContext context, Map<String, dynamic> internship) {
    final emailController = TextEditingController();
    final noteController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Apply for Internship', style: AppTextStyles.titleLarge),
                        Text(internship['title'], style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text('EMAIL ADDRESS', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 8),
              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(hintText: 'name@example.com'),
              ),
              const SizedBox(height: 16),
              Text('WHY ARE YOU A GOOD FIT FOR THIS INTERNSHIP?', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 8),
              TextField(
                controller: noteController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Share a bit about your experience, motivation, and relevant skills...',
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  const Icon(Icons.attach_file, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 8),
                  Text('Upload Resume / CV', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textSecondary)),
                  const Spacer(),
                  const FitBadge(text: 'Required', variant: BadgeVariant.warning),
                ],
              ),
              const SizedBox(height: 24),
              FitGradientButton(
                text: 'Submit Application',
                fullWidth: true,
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Application submitted successfully for ${internship['title']}!'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final list = _filteredInternships;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Text('Internship Hub', style: AppTextStyles.titleLarge),
            const SizedBox(width: 8),
            const FitBadge(
              text: 'Student Specials',
              variant: BadgeVariant.blue,
              icon: Icons.school_outlined,
            ),
          ],
        ),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(0.5),
          child: Container(height: 0.5, color: AppColors.border),
        ),
      ),
      body: Column(
        children: [
          // Search & Filter Panel
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                Container(
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
                          onChanged: (v) => setState(() => _searchQuery = v),
                          style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
                          decoration: const InputDecoration(
                            hintText: 'Search internships by title, company, or skills...',
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
                const SizedBox(height: 12),
                Row(
                  children: ['All', 'Remote', 'On-site', 'Hybrid'].map((type) {
                    final isSelected = _typeFilter == type;
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 2),
                        child: GestureDetector(
                          onTap: () => setState(() => _typeFilter = type),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              gradient: isSelected ? AppColors.fitGradient : null,
                              color: isSelected ? null : AppColors.slate100,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              type,
                              style: AppTextStyles.labelMedium.copyWith(
                                color: isSelected ? Colors.white : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          // Internships List
          Expanded(
            child: list.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.school_outlined, size: 48, color: AppColors.slate300),
                          const SizedBox(height: 12),
                          Text(
                            'No internships found matching your filters.',
                            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: list.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, i) {
                      final item = list[i];
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item['title'], style: AppTextStyles.titleLarge),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          const Icon(Icons.business, size: 12, color: AppColors.textSecondary),
                                          const SizedBox(width: 4),
                                          Text(item['company'], style: AppTextStyles.labelMedium.copyWith(color: AppColors.textSecondary)),
                                          const SizedBox(width: 8),
                                          const Icon(Icons.location_on_outlined, size: 12, color: AppColors.textTertiary),
                                          const SizedBox(width: 2),
                                          Text(item['location'], style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    FitBadge(
                                      text: item['type'],
                                      variant: item['type'] == 'Remote'
                                          ? BadgeVariant.blue
                                          : item['type'] == 'Hybrid'
                                              ? BadgeVariant.warning
                                              : BadgeVariant.success,
                                    ),
                                    const SizedBox(height: 4),
                                    FitBadge(
                                      text: item['paid'] ? item['stipend'] : 'Unpaid',
                                      variant: item['paid'] ? BadgeVariant.success : BadgeVariant.defaultVariant,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              item['description'],
                              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: (item['skills'] as List<String>)
                                  .map((s) => SkillTag(label: s))
                                  .toList(),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.access_time, size: 12, color: AppColors.textTertiary),
                                    const SizedBox(width: 4),
                                    Text(item['duration'], style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                                  ],
                                ),
                                FitGradientButton(
                                  text: 'Apply Now',
                                  height: 38,
                                  onPressed: () => _showApplyModal(context, item),
                                ),
                              ],
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
