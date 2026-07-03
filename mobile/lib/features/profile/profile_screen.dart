import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/fit_avatar.dart';
import '../../shared/widgets/jss_bar.dart';
import '../../shared/widgets/skill_tag.dart';
import '../auth/login_screen.dart';
import 'settings_screen.dart';
import 'wallet_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _available = true;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Profile Header Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  const FitAvatar.xl(
                    initials: 'DN',
                    gradient: AppColors.gradientBlue,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Diane Ngono', style: AppTextStyles.headlineMedium),
                        Text('Senior React & TypeScript Developer', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 12, color: AppColors.textTertiary),
                            const SizedBox(width: 4),
                            Text('Douala, Cameroon', style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Divider(color: AppColors.border),
              const SizedBox(height: 12),
              // Availability Toggle Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Availability', style: AppTextStyles.titleSmall),
                      Text('Open to new opportunities', style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                  Switch(
                    value: _available,
                    activeColor: AppColors.fitBlue,
                    onChanged: (val) => setState(() => _available = val),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Stats Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Statistics', style: AppTextStyles.titleLarge),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _StatItem(label: 'Earnings', value: '\$48.2K+'),
                  _StatItem(label: 'Jobs completed', value: '84'),
                  _StatItem(label: 'Rating', value: '4.97 ★'),
                ],
              ),
              const SizedBox(height: 16),
              Divider(color: AppColors.border),
              const SizedBox(height: 12),
              Text('Job Success Score', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 6),
              const JssBar(score: 97),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Skills Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Skills', style: AppTextStyles.titleLarge),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: const [
                  SkillTag(label: 'React'),
                  SkillTag(label: 'TypeScript'),
                  SkillTag(label: 'Node.js'),
                  SkillTag(label: 'GraphQL'),
                  SkillTag(label: 'AWS'),
                  SkillTag(label: 'Next.js'),
                  SkillTag(label: 'TailwindCSS'),
                  SkillTag(label: 'Figma'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Quick Settings card
        Material(
          color: AppColors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppColors.border),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              _SettingTile(icon: Icons.edit_outlined, label: 'Edit Profile', onTap: () {}),
              _SettingTile(
                icon: Icons.account_balance_wallet_outlined,
                label: 'Wallet & Connects',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const WalletScreen()),
                  );
                },
              ),
              _SettingTile(
                icon: Icons.translate,
                label: 'Bilingual Language Settings',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SettingsScreen()),
                  );
                },
              ),
              _SettingTile(
                icon: Icons.notifications_none_outlined,
                label: 'Notification Settings',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SettingsScreen()),
                  );
                },
              ),
              _SettingTile(
                icon: Icons.logout,
                label: 'Log Out',
                color: AppColors.danger,
                onTap: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
                  );
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label, value;
  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: AppTextStyles.monoMedium.copyWith(color: AppColors.textPrimary)),
        const SizedBox(height: 2),
        Text(label, style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
      ],
    );
  }
}

class _SettingTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;
  final VoidCallback onTap;

  const _SettingTile({
    required this.icon,
    required this.label,
    this.color,
    required this.onTap,
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
        trailing: Icon(Icons.chevron_right, size: 16, color: AppColors.textTertiary),
        onTap: onTap,
        dense: true,
        visualDensity: const VisualDensity(vertical: -1),
      ),
    );
  }
}
