import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

enum BadgeVariant { defaultVariant, success, warning, danger, blue, cyan }

/// Rounded pill badge widget matching web Badge component.
class FitBadge extends StatelessWidget {
  final String text;
  final BadgeVariant variant;
  final IconData? icon;

  const FitBadge({
    super.key,
    required this.text,
    this.variant = BadgeVariant.defaultVariant,
    this.icon,
  });

  Color get _bg {
    switch (variant) {
      case BadgeVariant.success:
        return AppColors.successLight;
      case BadgeVariant.warning:
        return AppColors.warningLight;
      case BadgeVariant.danger:
        return AppColors.dangerLight;
      case BadgeVariant.blue:
        return AppColors.blueBadgeBg;
      case BadgeVariant.cyan:
        return AppColors.cyanBadgeBg;
      case BadgeVariant.defaultVariant:
        return AppColors.defaultBadgeBg;
    }
  }

  Color get _textColor {
    switch (variant) {
      case BadgeVariant.success:
        return const Color(0xFF15803D);
      case BadgeVariant.warning:
        return const Color(0xFFB45309);
      case BadgeVariant.danger:
        return const Color(0xFFDC2626);
      case BadgeVariant.blue:
        return AppColors.blueBadgeText;
      case BadgeVariant.cyan:
        return AppColors.cyanBadgeText;
      case BadgeVariant.defaultVariant:
        return AppColors.defaultBadgeText;
    }
  }

  Color? get _borderColor {
    switch (variant) {
      case BadgeVariant.success:
        return AppColors.successBorder;
      case BadgeVariant.warning:
        return AppColors.warningBorder;
      case BadgeVariant.danger:
        return AppColors.dangerBorder;
      case BadgeVariant.blue:
        return AppColors.blueBadgeBorder;
      case BadgeVariant.cyan:
        return AppColors.cyanBadgeBorder;
      case BadgeVariant.defaultVariant:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.circular(100),
        border: _borderColor != null
            ? Border.all(color: _borderColor!, width: 0.5)
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 10, color: _textColor),
            const SizedBox(width: 3),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: _textColor,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }
}
