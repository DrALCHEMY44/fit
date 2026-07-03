import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/fit_badge.dart';
import '../../shared/widgets/fit_avatar.dart';

class ProposalsListScreen extends StatefulWidget {
  const ProposalsListScreen({super.key});

  @override
  State<ProposalsListScreen> createState() => _ProposalsListScreenState();
}

class _ProposalsListScreenState extends State<ProposalsListScreen> {
  int _activeTab = 0;
  final List<String> _tabs = ['Active', 'Submitted', 'Offers'];

  final List<Map<String, dynamic>> _activeProposals = [
    {
      'title': 'Offline-First AgriTech Mobile App using Flutter',
      'client': 'GreenField AgriTech',
      'initials': 'GA',
      'gradient': AppColors.gradientGreen,
      'date': 'Submitted Jul 1, 2026',
      'bid': '\$30/hr',
      'status': 'Interviewing',
      'badgeColor': BadgeVariant.blue,
    },
    {
      'title': 'Bilingual Content Writer — French & English Tech Articles',
      'client': 'TechAfrique Media',
      'initials': 'TM',
      'gradient': AppColors.gradientAmber,
      'date': 'Submitted Jun 29, 2026',
      'bid': 'XAF 150,000 fixed',
      'status': 'Pending Review',
      'badgeColor': BadgeVariant.defaultVariant,
    },
  ];

  final List<Map<String, dynamic>> _offers = [
    {
      'title': 'CEMAC Mobile Money Dashboard Integration',
      'client': 'MTN FinTech Lab',
      'initials': 'MF',
      'gradient': AppColors.gradientBlue,
      'date': 'Received Jun 30, 2026',
      'bid': '\$45/hr',
      'status': 'Offer Received',
      'badgeColor': BadgeVariant.success,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final list = _activeTab == 2
        ? _offers
        : _activeTab == 1
            ? _activeProposals.where((p) => p['status'] == 'Pending Review').toList()
            : _activeProposals;

    return Column(
      children: [
        // Custom segmented control
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: AppColors.slate50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: List.generate(_tabs.length, (i) {
                final isActive = _activeTab == i;
                final count = i == 2
                    ? _offers.length
                    : i == 1
                        ? _activeProposals.where((p) => p['status'] == 'Pending Review').length
                        : _activeProposals.length;

                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _activeTab = i),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        gradient: isActive ? AppColors.fitGradient : null,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${_tabs[i]} ($count)',
                        style: AppTextStyles.labelMedium.copyWith(
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
        // Proposals list
        Expanded(
          child: list.isEmpty
              ? Center(
                  child: Text(
                    'No proposals found in this section.',
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final item = list[i];
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
                            children: [
                              FitAvatar.sm(
                                initials: item['initials'],
                                gradient: item['gradient'],
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item['client'], style: AppTextStyles.titleSmall),
                                    Text(item['date'], style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                                  ],
                                ),
                              ),
                              FitBadge(text: item['status'], variant: item['badgeColor']),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            item['title'],
                            style: AppTextStyles.titleMedium.copyWith(color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Your proposed rate:',
                                style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                              ),
                              Text(
                                item['bid'],
                                style: AppTextStyles.monoCaption.copyWith(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          if (item['status'] == 'Offer Received') ...[
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: () {},
                                    child: const Text('Decline'),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Container(
                                    height: 48,
                                    decoration: BoxDecoration(
                                      gradient: AppColors.fitGradient,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        onTap: () {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(
                                              content: Text('Offer accepted! Starting contract.'),
                                              backgroundColor: AppColors.success,
                                            ),
                                          );
                                        },
                                        borderRadius: BorderRadius.circular(12),
                                        child: Center(
                                          child: Text(
                                            'Accept Offer',
                                            style: AppTextStyles.labelLarge.copyWith(color: Colors.white),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
