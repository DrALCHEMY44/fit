import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Compact skill tag chip widget.
class SkillTag extends StatelessWidget {
  final String label;

  const SkillTag({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.slate100,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: AppColors.textSecondary,
          height: 1.2,
        ),
      ),
    );
  }
}
