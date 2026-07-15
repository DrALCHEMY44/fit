import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/fit_gradient_button.dart';

/// Success confirmation screen after proposal submission.
class ProposalSuccessScreen extends StatelessWidget {
  const ProposalSuccessScreen({
    super.key,
    this.clientName = 'the client',
    this.connectsSpent = 6,
    this.connectsRemaining,
  });

  final String clientName;
  final int connectsSpent;
  final int? connectsRemaining;

  @override
  Widget build(BuildContext context) {
    final remaining = connectsRemaining != null ? ' You have $connectsRemaining Connects left.' : '';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: const BoxDecoration(
                    color: AppColors.successLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle, size: 40, color: AppColors.success),
                ),
                const SizedBox(height: 20),
                Text('Proposal Sent!', style: AppTextStyles.headlineLarge.copyWith(color: AppColors.textPrimary)),
                const SizedBox(height: 8),
                Text(
                  'Your proposal has been submitted to $clientName. You used $connectsSpent Connects.$remaining',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 28),
                FitGradientButton(
                  text: 'Back to Job Feed',
                  fullWidth: true,
                  onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
