import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';
import '../shared/widgets/fit_avatar.dart';
import '../features/client/job_wizard/job_wizard_screen.dart';
import '../features/profile/settings_screen.dart';
import '../features/profile/wallet_screen.dart';
import '../features/internships/internship_hub_screen.dart';
import '../features/help/help_center_screen.dart';
import '../features/auth/login_screen.dart';

/// Navigation drawer with user profile, role switch, and secondary links.
class FitDrawer extends StatelessWidget {
  final bool isFreelancerMode;
  final VoidCallback onSwitchRole;
  final ValueChanged<int> onTabSelected;

  const FitDrawer({
    super.key,
    required this.isFreelancerMode,
    required this.onSwitchRole,
    required this.onTabSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.surface,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── User Profile Header ──
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: AppColors.darkGradient,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      FitAvatar.lg(
                        initials: isFreelancerMode ? 'DN' : 'AF',
                        gradient: AppColors.gradientBlue,
                        showOnline: true,
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    isFreelancerMode ? 'Diane Ngono' : 'Afrikart Commerce',
                    style: AppTextStyles.titleLarge.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isFreelancerMode ? 'Senior React Developer' : 'Client Account',
                    style: AppTextStyles.bodySmall.copyWith(color: Colors.white70),
                  ),
                  const SizedBox(height: 12),
                  // Role Switch Toggle
                  GestureDetector(
                    onTap: () {
                      onSwitchRole();
                      Navigator.pop(context);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white.withOpacity(0.15)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.swap_horiz, color: Colors.white70, size: 16),
                          const SizedBox(width: 8),
                          Text(
                            isFreelancerMode ? 'Switch to Client' : 'Switch to Freelancer',
                            style: AppTextStyles.labelMedium.copyWith(color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── Navigation Links ──
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _DrawerItem(
                    icon: Icons.dashboard_outlined,
                    label: 'Dashboard',
                    onTap: () {
                      Navigator.pop(context);
                      onTabSelected(0);
                    },
                  ),
                  if (isFreelancerMode) ...[
                    _DrawerItem(
                      icon: Icons.work_outline,
                      label: 'Find Work',
                      onTap: () {
                        Navigator.pop(context);
                        onTabSelected(0);
                      },
                    ),
                    _DrawerItem(
                      icon: Icons.description_outlined,
                      label: 'My Proposals',
                      onTap: () {
                        Navigator.pop(context);
                        onTabSelected(1);
                      },
                    ),
                    _DrawerItem(
                      icon: Icons.account_balance_wallet_outlined,
                      label: 'Buy Connects',
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          gradient: AppColors.fitGradient,
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: const Text(
                          '42',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const WalletScreen()),
                        );
                      },
                    ),
                  ] else ...[
                    _DrawerItem(
                      icon: Icons.search,
                      label: 'Find Talent',
                      onTap: () {
                        Navigator.pop(context);
                        onTabSelected(1);
                      },
                    ),
                    _DrawerItem(
                      icon: Icons.add_circle_outline,
                      label: 'Post a Job',
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const JobWizardScreen()),
                        );
                      },
                    ),
                  ],
                  _DrawerItem(
                    icon: Icons.fact_check_outlined,
                    label: 'Contracts',
                    onTap: () {
                      Navigator.pop(context);
                      onTabSelected(3);
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.chat_bubble_outline,
                    label: 'Messages',
                    onTap: () {
                      Navigator.pop(context);
                      onTabSelected(2);
                    },
                  ),
                  const Divider(height: 24, indent: 16, endIndent: 16),
                  _DrawerItem(
                    icon: Icons.school_outlined,
                    label: 'Internships',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const InternshipHubScreen()),
                      );
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.language,
                    label: 'Language: EN / FR',
                    onTap: () {
                      Navigator.pop(context);
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.settings_outlined,
                    label: 'Settings',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const SettingsScreen()),
                      );
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.help_outline,
                    label: 'Help Center',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const HelpCenterScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),

            // ── Logout ──
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: _DrawerItem(
                icon: Icons.logout,
                label: 'Log Out',
                color: AppColors.danger,
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Widget? trailing;
  final Color? color;
  final VoidCallback? onTap;

  const _DrawerItem({
    required this.icon,
    required this.label,
    this.trailing,
    this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final itemColor = color ?? AppColors.textSecondary;
    return Material(
      color: Colors.transparent,
      child: ListTile(
        leading: Icon(icon, size: 20, color: itemColor),
        title: Text(
          label,
          style: AppTextStyles.titleSmall.copyWith(color: color ?? AppColors.textPrimary),
        ),
        trailing: trailing,
        onTap: onTap,
        dense: true,
        visualDensity: const VisualDensity(vertical: -1),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}
