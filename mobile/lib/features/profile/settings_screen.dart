import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/fit_gradient_button.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  // Notification States
  bool _emailAlerts = true;
  bool _pushNotifications = true;
  bool _proposalUpdates = true;
  bool _mfaEnabled = false;

  // Wallet / Security States
  String _selectedCurrency = 'XAF';
  final TextEditingController _momoNumberController = TextEditingController(text: '677890123');
  String _selectedMomoOperator = 'MTN Mobile Money';

  @override
  void dispose() {
    _momoNumberController.dispose();
    super.dispose();
  }

  void _saveSettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Settings saved successfully!'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Account Settings', style: AppTextStyles.titleLarge),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(0.5),
          child: Container(height: 0.5, color: AppColors.border),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── SECTION 1: Notifications ──
          _buildSectionHeader('Notifications'),
          const SizedBox(height: 8),
          Material(
            color: AppColors.surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: AppColors.border),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                _buildSwitchTile(
                  title: 'Email Alerts',
                  subtitle: 'Receive daily job summaries and proposals activity',
                  value: _emailAlerts,
                  onChanged: (v) => setState(() => _emailAlerts = v),
                ),
                Divider(color: AppColors.border),
                _buildSwitchTile(
                  title: 'Mobile Push Notifications',
                  subtitle: 'Get alerts for new messages, offers, and milestones',
                  value: _pushNotifications,
                  onChanged: (v) => setState(() => _pushNotifications = v),
                ),
                Divider(color: AppColors.border),
                _buildSwitchTile(
                  title: 'Proposal Updates',
                  subtitle: 'Notify me when a client views or reviews my proposals',
                  value: _proposalUpdates,
                  onChanged: (v) => setState(() => _proposalUpdates = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── SECTION 2: Payment & Wallet ──
          _buildSectionHeader('Local Wallet & Escrow'),
          const SizedBox(height: 8),
          Material(
            color: AppColors.surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: AppColors.border),
            ),
            clipBehavior: Clip.antiAlias,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('DEFAULT ESCROW CURRENCY', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 8),
                  Row(
                    children: ['USD', 'XAF'].map((c) {
                      final isSelected = _selectedCurrency == c;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(c),
                          selected: isSelected,
                          selectedColor: AppColors.blueBadgeBg,
                          onSelected: (selected) {
                            if (selected) setState(() => _selectedCurrency = c);
                          },
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
                  Text('DEFAULT MOBILE MONEY NUMBER', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _momoNumberController,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(hintText: 'Enter phone number'),
                  ),
                  const SizedBox(height: 16),
                  Text('MOMO PROVIDER', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _selectedMomoOperator,
                    decoration: const InputDecoration(
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    items: ['MTN Mobile Money', 'Orange Money'].map((provider) {
                      return DropdownMenuItem<String>(
                        value: provider,
                        child: Text(provider, style: AppTextStyles.bodyMedium),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedMomoOperator = val);
                      }
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // ── SECTION 3: Account & Security ──
          _buildSectionHeader('Security'),
          const SizedBox(height: 8),
          Material(
            color: AppColors.surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: AppColors.border),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                _buildSwitchTile(
                  title: 'Two-Factor Authentication (2FA)',
                  subtitle: 'Secure your payouts and billing settings',
                  value: _mfaEnabled,
                  onChanged: (v) => setState(() => _mfaEnabled = v),
                ),
                Divider(color: AppColors.border),
                ListTile(
                  title: Text('Change Password', style: AppTextStyles.titleSmall),
                  subtitle: Text('Last updated 3 months ago', style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                  trailing: const Icon(Icons.chevron_right, size: 16, color: AppColors.textTertiary),
                  onTap: () {},
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          FitGradientButton(
            text: 'Save Settings',
            fullWidth: true,
            onPressed: _saveSettings,
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title.toUpperCase(),
        style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary, letterSpacing: 0.5),
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return SwitchListTile(
      title: Text(title, style: AppTextStyles.titleSmall),
      subtitle: Text(subtitle, style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
      value: value,
      activeColor: AppColors.fitBlue,
      onChanged: onChanged,
    );
  }
}
