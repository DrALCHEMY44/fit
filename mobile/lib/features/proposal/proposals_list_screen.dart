import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/api/fit_api.dart';
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

  List<Map<String, dynamic>> _activeProposals = [];
  List<Map<String, dynamic>> _offers = [];
  bool _loading = true;
  String? _error;

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
      final proposals = await FitApi.myProposals();
      if (!mounted) return;

      Map<String, dynamic> mapRow(Map<String, dynamic> p) {
        final job = p['job'] as Map<String, dynamic>?;
        final status = p['status']?.toString() ?? 'pending';
        final clientName =
            (job?['client'] as Map<String, dynamic>?)?['name']?.toString() ?? 'FIT Client';
        final amount = double.tryParse('${p['amount'] ?? 0}') ?? 0;
        return {
          'title': job?['title']?.toString() ?? 'Job proposal',
          'client': clientName,
          'initials': clientName.trim().split(RegExp(r'\s+')).take(2).map((w) => w[0].toUpperCase()).join(),
          'gradient': FitApi.gradientFor((p['id'] as num?)?.toInt() ?? 0),
          'date': 'Submitted ${(p['created_at']?.toString() ?? '').split('T').first}',
          'bid': FitApi.formatMoney(amount, p['currency']?.toString() ?? 'XAF'),
          'status': status == 'shortlisted'
              ? 'Interviewing'
              : status == 'accepted'
                  ? 'Offer Received'
                  : status == 'declined'
                      ? 'Declined'
                      : 'Pending Review',
          'badgeColor': status == 'shortlisted'
              ? BadgeVariant.blue
              : status == 'accepted'
                  ? BadgeVariant.success
                  : status == 'declined'
                      ? BadgeVariant.danger
                      : BadgeVariant.defaultVariant,
        };
      }

      setState(() {
        _activeProposals = proposals
            .where((p) => ['pending', 'shortlisted'].contains(p['status']))
            .map(mapRow)
            .toList();
        _offers = proposals.where((p) => p['status'] == 'accepted').map(mapRow).toList();
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
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: AppColors.fitBlue))
              : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, textAlign: TextAlign.center, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                      const SizedBox(height: 8),
                      TextButton(onPressed: _load, child: const Text('Try again')),
                    ],
                  ),
                )
              : list.isEmpty
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
