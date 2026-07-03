import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Gradient circle avatar with initials and optional online indicator.
class FitAvatar extends StatelessWidget {
  final String initials;
  final LinearGradient gradient;
  final double size;
  final bool showOnline;

  const FitAvatar({
    super.key,
    required this.initials,
    this.gradient = AppColors.gradientBlue,
    this.size = 40,
    this.showOnline = false,
  });

  /// Named size constructors for convenience.
  const FitAvatar.xs({
    super.key,
    required this.initials,
    this.gradient = AppColors.gradientBlue,
    this.showOnline = false,
  }) : size = 24;

  const FitAvatar.sm({
    super.key,
    required this.initials,
    this.gradient = AppColors.gradientBlue,
    this.showOnline = false,
  }) : size = 32;

  const FitAvatar.md({
    super.key,
    required this.initials,
    this.gradient = AppColors.gradientBlue,
    this.showOnline = false,
  }) : size = 40;

  const FitAvatar.lg({
    super.key,
    required this.initials,
    this.gradient = AppColors.gradientBlue,
    this.showOnline = false,
  }) : size = 48;

  const FitAvatar.xl({
    super.key,
    required this.initials,
    this.gradient = AppColors.gradientBlue,
    this.showOnline = false,
  }) : size = 64;

  double get _fontSize {
    if (size <= 24) return 9;
    if (size <= 32) return 11;
    if (size <= 40) return 13;
    if (size <= 48) return 15;
    return 20;
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: gradient,
          ),
          alignment: Alignment.center,
          child: Text(
            initials,
            style: TextStyle(
              color: Colors.white,
              fontSize: _fontSize,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        if (showOnline)
          Positioned(
            right: -1,
            bottom: -1,
            child: Container(
              width: size * 0.3,
              height: size * 0.3,
              decoration: BoxDecoration(
                color: AppColors.emerald,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
            ),
          ),
      ],
    );
  }
}
