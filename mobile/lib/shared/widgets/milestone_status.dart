import 'package:flutter/material.dart';
import 'fit_badge.dart';

/// Milestone status badge with icon mapping.
class MilestoneStatusBadge extends StatelessWidget {
  final String status;

  const MilestoneStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final config = _getConfig(status);
    return FitBadge(
      text: config.label,
      variant: config.variant,
      icon: config.icon,
    );
  }

  static _MilestoneConfig _getConfig(String status) {
    switch (status) {
      case 'approved':
        return _MilestoneConfig('Approved', BadgeVariant.success, Icons.check_circle_outline);
      case 'in_review':
        return _MilestoneConfig('In Review', BadgeVariant.warning, Icons.visibility_outlined);
      case 'funded':
        return _MilestoneConfig('Escrow Funded', BadgeVariant.blue, Icons.account_balance_wallet_outlined);
      case 'pending':
        return _MilestoneConfig('Pending', BadgeVariant.defaultVariant, Icons.circle_outlined);
      default:
        return _MilestoneConfig(status, BadgeVariant.defaultVariant, null);
    }
  }
}

class _MilestoneConfig {
  final String label;
  final BadgeVariant variant;
  final IconData? icon;
  const _MilestoneConfig(this.label, this.variant, this.icon);
}
