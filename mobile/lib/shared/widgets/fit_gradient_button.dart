import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// ElevatedButton with the FIT blue-to-cyan gradient.
class FitGradientButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool fullWidth;
  final double height;

  const FitGradientButton({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
    this.fullWidth = false,
    this.height = 48,
  });

  @override
  Widget build(BuildContext context) {
    final child = Container(
      height: height,
      width: fullWidth ? double.infinity : null,
      padding: EdgeInsets.symmetric(horizontal: fullWidth ? 0 : 20),
      decoration: BoxDecoration(
        gradient: onPressed != null ? AppColors.fitGradient : null,
        color: onPressed == null ? AppColors.slate200 : null,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 16, color: onPressed != null ? Colors.white : AppColors.textTertiary),
            const SizedBox(width: 8),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: onPressed != null ? Colors.white : AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(12),
        child: child,
      ),
    );
  }
}
