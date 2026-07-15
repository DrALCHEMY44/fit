import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/api/fit_api.dart';
import '../../core/api/session.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/data/mock_data.dart';
import '../../shared/widgets/fit_badge.dart';
import '../../shared/widgets/milestone_status.dart';

class ContractsScreen extends StatefulWidget {
  final bool isFreelancerMode;
  const ContractsScreen({super.key, this.isFreelancerMode = true});

  @override
  State<ContractsScreen> createState() => _ContractsScreenState();
}

class _ContractsScreenState extends State<ContractsScreen> {
  Contract? _activeContract;
  List<Contract> _contracts = [];
  bool _loading = true;
  String? _error;

  bool get _isFreelancerMode => Session.current?.isFreelancer ?? widget.isFreelancerMode;

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
      final contracts = await FitApi.contracts();
      if (!mounted) return;
      setState(() {
        _contracts = contracts;
        _activeContract = contracts.isEmpty
            ? null
            : contracts.firstWhere((c) => c.id == _activeContract?.id, orElse: () => contracts.first);
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

  String _getStatus(Contract c, Milestone m) => m.status;

  int _getApprovedCount(Contract c) {
    return c.milestones.where((m) => _getStatus(c, m) == 'approved').length;
  }

  void _showApiError(Object e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(e is ApiException ? e.firstError : 'Action failed.'),
        backgroundColor: AppColors.danger,
      ),
    );
  }

  void _releasePayment(Contract c, Milestone ms) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppColors.surface,
          title: const Text('Release Payout'),
          content: Text(
            'Are you sure you want to release ${FitApi.formatMoney(ms.amount, c.currency)} from Escrow to ${c.freelancer} for milestone "${ms.name}"?',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                Navigator.pop(context);
                try {
                  await FitApi.approveDelivery(c.id, milestoneId: ms.id);
                  await _load();
                  if (!mounted) return;
                  ScaffoldMessenger.of(this.context).showSnackBar(
                    SnackBar(
                      content: Text('Released ${FitApi.formatMoney(ms.amount, c.currency)} to ${c.freelancer}!'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                } catch (e) {
                  if (mounted) _showApiError(e);
                }
              },
              child: const Text('Confirm Release', style: TextStyle(color: AppColors.success)),
            ),
          ],
        );
      },
    );
  }

  void _fundMilestone(Contract c, Milestone ms) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppColors.surface,
          title: const Text('Pay Contract'),
          content: Text(
            'Fund ${FitApi.formatMoney(ms.amount, c.currency)} into Escrow for milestone "${ms.name}" via MTN Mobile Money?',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                Navigator.pop(context);
                try {
                  await FitApi.fundMilestone(ms.id);
                  await _load();
                  if (!mounted) return;
                  ScaffoldMessenger.of(this.context).showSnackBar(
                    SnackBar(
                      content: Text('Funded ${FitApi.formatMoney(ms.amount, c.currency)} into Escrow!'),
                      backgroundColor: AppColors.fitBlue,
                    ),
                  );
                } catch (e) {
                  if (mounted) _showApiError(e);
                }
              },
              child: const Text('Pay/Fund', style: TextStyle(color: AppColors.fitBlue)),
            ),
          ],
        );
      },
    );
  }

  void _submitWork(Contract c, Milestone ms) {
    final linkController = TextEditingController();
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
              Text('Submit Milestone Work', style: AppTextStyles.titleLarge),
              const SizedBox(height: 4),
              Text(
                'Submitting work for "${ms.name}"',
                style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 16),
              Text('WORK LINK / ATTACHMENT', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 8),
              TextField(
                controller: linkController,
                decoration: const InputDecoration(hintText: 'e.g. github.com/username/project'),
              ),
              const SizedBox(height: 16),
              Text('NOTE TO CLIENT', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 8),
              TextField(
                controller: noteController,
                maxLines: 3,
                decoration: const InputDecoration(hintText: 'Describe the completed deliverables...'),
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () async {
                  Navigator.pop(context);
                  try {
                    await FitApi.submitDelivery(
                      c.id,
                      milestoneId: ms.id,
                      message: noteController.text,
                      linkUrl: linkController.text,
                    );
                    await _load();
                    if (!mounted) return;
                    ScaffoldMessenger.of(this.context).showSnackBar(
                      SnackBar(
                        content: Text('Submitted milestone to ${c.client} for review!'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  } catch (e) {
                    if (mounted) _showApiError(e);
                  }
                },
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: AppColors.fitGradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    'Submit Work',
                    style: AppTextStyles.labelLarge.copyWith(color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.fitBlue));
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.wifi_off, size: 48, color: AppColors.slate300),
              const SizedBox(height: 12),
              Text(_error!, textAlign: TextAlign.center, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 8),
              TextButton(onPressed: _load, child: const Text('Try again')),
            ],
          ),
        ),
      );
    }

    final active = _activeContract;
    if (active == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.description_outlined, size: 48, color: AppColors.slate300),
              const SizedBox(height: 12),
              Text(
                'No contracts yet.\nAccepted proposals and service orders will appear here.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        // Dark overview card
        Padding(
          padding: const EdgeInsets.all(16),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppColors.darkGradient,
              borderRadius: BorderRadius.circular(16),
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
                          Text(
                            active.title,
                            style: AppTextStyles.titleMedium.copyWith(color: Colors.white),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Client: ${active.client} · Freelancer: ${active.freelancer}',
                            style: AppTextStyles.caption.copyWith(color: AppColors.slate400),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    FitBadge(
                      text: active.status.replaceAll('_', ' '),
                      variant: active.status == 'active'
                          ? BadgeVariant.success
                          : active.status == 'pending_payment'
                              ? BadgeVariant.warning
                              : BadgeVariant.defaultVariant,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _DetailStat(label: 'Total Value', value: FitApi.formatMoney(active.totalAmount, active.currency)),
                    _DetailStat(label: 'Milestones', value: '${active.milestones.length}'),
                    _DetailStat(
                      label: 'Approved',
                      value: '${_getApprovedCount(active)}',
                      valueColor: AppColors.emerald,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        // Accordion Title
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'ALL CONTRACTS',
              style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary, letterSpacing: 0.5),
            ),
          ),
        ),
        const SizedBox(height: 8),
        // Collapsible lists of contracts
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _contracts.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final c = _contracts[index];
              final approvedCount = _getApprovedCount(c);
              final isCurrentActive = _activeContract?.id == c.id;

              return Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isCurrentActive ? AppColors.fitBlue : AppColors.border,
                    width: isCurrentActive ? 1.5 : 1,
                  ),
                ),
                child: Theme(
                  data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    title: Text(
                      c.title,
                      style: AppTextStyles.titleSmall.copyWith(color: AppColors.textPrimary),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(
                          'with ${c.freelancer} · ${FitApi.formatMoney(c.totalAmount, c.currency)}',
                          style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(100),
                          child: LinearProgressIndicator(
                            value: c.milestones.isEmpty ? 0 : approvedCount / c.milestones.length,
                            minHeight: 4,
                            backgroundColor: AppColors.slate100,
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.fitBlue),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$approvedCount of ${c.milestones.length} milestones approved',
                          style: AppTextStyles.caption.copyWith(fontSize: 10, color: AppColors.textTertiary),
                        ),
                      ],
                    ),
                    onExpansionChanged: (expanded) {
                      if (expanded) {
                        setState(() => _activeContract = c);
                      }
                    },
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          border: Border(top: BorderSide(color: AppColors.border)),
                          color: AppColors.slate50,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Column(
                          children: c.milestones.asMap().entries.map((entry) {
                            final msIndex = entry.key;
                            final ms = entry.value;
                            final currentStatus = _getStatus(c, ms);
                            final canRelease = !_isFreelancerMode && currentStatus == 'in_review';
                            final canSubmit = _isFreelancerMode && currentStatus == 'funded';
                            final canFund = !_isFreelancerMode && currentStatus == 'pending';

                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 24,
                                        height: 24,
                                        decoration: const BoxDecoration(
                                          color: AppColors.slate200,
                                          shape: BoxShape.circle,
                                        ),
                                        alignment: Alignment.center,
                                        child: Text('${msIndex + 1}', style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.bold)),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(ms.name, style: AppTextStyles.titleSmall),
                                            const SizedBox(height: 2),
                                            Text('Due: ${ms.dueDate}', style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                                          ],
                                        ),
                                      ),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            FitApi.formatMoney(ms.amount, c.currency),
                                            style: AppTextStyles.monoCaption.copyWith(color: AppColors.textPrimary, fontWeight: FontWeight.bold),
                                          ),
                                          const SizedBox(height: 4),
                                          MilestoneStatusBadge(status: currentStatus),
                                        ],
                                      ),
                                    ],
                                  ),
                                  if (canRelease) ...[
                                    const SizedBox(height: 8),
                                    Align(
                                      alignment: Alignment.centerRight,
                                      child: GestureDetector(
                                        onTap: () => _releasePayment(c, ms),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                          decoration: BoxDecoration(
                                            color: AppColors.successLight,
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: AppColors.successBorder),
                                          ),
                                          child: Text(
                                            'Release Payment',
                                            style: AppTextStyles.labelSmall.copyWith(
                                              color: AppColors.success,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                  if (canSubmit) ...[
                                    const SizedBox(height: 8),
                                    Align(
                                      alignment: Alignment.centerRight,
                                      child: GestureDetector(
                                        onTap: () => _submitWork(c, ms),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                          decoration: BoxDecoration(
                                            color: AppColors.blueBadgeBg,
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: AppColors.blueBadgeBorder),
                                          ),
                                          child: Text(
                                            'Submit Deliverable',
                                            style: AppTextStyles.labelSmall.copyWith(
                                              color: AppColors.fitBlue,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                  if (canFund) ...[
                                    const SizedBox(height: 8),
                                    Align(
                                      alignment: Alignment.centerRight,
                                      child: GestureDetector(
                                        onTap: () => _fundMilestone(c, ms),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                          decoration: BoxDecoration(
                                            color: AppColors.blueBadgeBg,
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: AppColors.blueBadgeBorder),
                                          ),
                                          child: Text(
                                            'Pay Contract',
                                            style: AppTextStyles.labelSmall.copyWith(
                                              color: AppColors.fitBlue,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _DetailStat extends StatelessWidget {
  final String label, value;
  final Color? valueColor;

  const _DetailStat({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.caption.copyWith(color: AppColors.slate400)),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTextStyles.monoMedium.copyWith(
              color: valueColor ?? Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
