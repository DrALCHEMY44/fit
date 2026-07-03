import 'package:flutter/material.dart';
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
  late Contract _activeContract;
  final Map<String, String> _customStatuses = {};

  @override
  void initState() {
    super.initState();
    _activeContract = kContracts[0];
  }

  String _getStatus(Contract c, Milestone m) {
    return _customStatuses['${c.id}_${m.id}'] ?? m.status;
  }

  int _getApprovedCount(Contract c) {
    return c.milestones.where((m) => _getStatus(c, m) == 'approved').length;
  }

  void _releasePayment(Contract c, Milestone ms) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppColors.surface,
          title: const Text('Release Payout'),
          content: Text(
            'Are you sure you want to release ${c.currency} ${ms.amount} from Escrow to ${c.freelancer} for milestone "${ms.name}"?',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() {
                  _customStatuses['${c.id}_${ms.id}'] = 'approved';
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Released ${c.currency} ${ms.amount} to ${c.freelancer}!'),
                    backgroundColor: AppColors.success,
                  ),
                );
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
            'Are you sure you want to fund ${c.currency} ${ms.amount} into Escrow for milestone "${ms.name}"?',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() {
                  _customStatuses['${c.id}_${ms.id}'] = 'funded';
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Funded ${c.currency} ${ms.amount} into Escrow!'),
                    backgroundColor: AppColors.fitBlue,
                  ),
                );
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
                onTap: () {
                  Navigator.pop(context);
                  setState(() {
                    _customStatuses['${c.id}_${ms.id}'] = 'in_review';
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Submitted milestone to ${c.client} for review!'),
                      backgroundColor: AppColors.success,
                    ),
                  );
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
                            _activeContract.title,
                            style: AppTextStyles.titleMedium.copyWith(color: Colors.white),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Client: ${_activeContract.client} · Freelancer: ${_activeContract.freelancer}',
                            style: AppTextStyles.caption.copyWith(color: AppColors.slate400),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    FitBadge(
                      text: _activeContract.status,
                      variant: _activeContract.status == 'active' ? BadgeVariant.success : BadgeVariant.defaultVariant,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _DetailStat(label: 'Total Value', value: '${_activeContract.currency} ${_activeContract.totalAmount}'),
                    _DetailStat(label: 'Milestones', value: '${_activeContract.milestones.length}'),
                    _DetailStat(
                      label: 'Approved',
                      value: '${_getApprovedCount(_activeContract)}',
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
            itemCount: kContracts.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final c = kContracts[index];
              final approvedCount = _getApprovedCount(c);
              final isCurrentActive = _activeContract.id == c.id;

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
                          'with ${c.freelancer} · ${c.currency} ${c.totalAmount}',
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
                          children: c.milestones.map((ms) {
                            final currentStatus = _getStatus(c, ms);
                            final canRelease = !widget.isFreelancerMode && currentStatus == 'in_review';
                            final canSubmit = widget.isFreelancerMode && currentStatus == 'funded';
                            final canFund = !widget.isFreelancerMode && currentStatus == 'pending';

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
                                        child: Text('${ms.id}', style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.bold)),
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
                                            '${c.currency} ${ms.amount}',
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
