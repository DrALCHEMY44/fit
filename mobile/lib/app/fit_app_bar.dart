import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

/// Custom AppBar with FIT logo, search, and notification bell.
class FitAppBar extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback? onMenuTap;

  const FitAppBar({super.key, this.onMenuTap});

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.surface,
      elevation: 0,
      scrolledUnderElevation: 0.5,
      surfaceTintColor: Colors.transparent,
      leading: IconButton(
        onPressed: onMenuTap,
        icon: const Icon(Icons.menu, color: AppColors.textPrimary, size: 22),
      ),
      title: Image.asset(
        'assets/images/logo-dark.png',
        height: 28,
        fit: BoxFit.contain,
      ),
      centerTitle: false,
      actions: [
        // Search button
        IconButton(
          onPressed: () {
            // TODO: Navigate to search screen
          },
          icon: const Icon(Icons.search, size: 22),
          color: AppColors.textSecondary,
        ),
        // Notification bell with dot
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              onPressed: () {
                // TODO: Navigate to notifications
              },
              icon: const Icon(Icons.notifications_outlined, size: 22),
              color: AppColors.textSecondary,
            ),
            Positioned(
              right: 12,
              top: 12,
              child: Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.fitBlue,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: 4),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(0.5),
        child: Container(
          height: 0.5,
          color: AppColors.border,
        ),
      ),
    );
  }
}
