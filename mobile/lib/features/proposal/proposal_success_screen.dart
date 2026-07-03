import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/fit_gradient_button.dart';

/// Success confirmation screen after proposal submission.
class ProposalSuccessScreen extends StatelessWidget {
  const ProposalSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
                  decoration: BoxDecoration(
                    color: AppColors.successLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle, size: 40, color: AppColors.success),
                ),
                const SizedBox(height: 20),
                Text('Proposal Sent!', style: AppTextStyles.headlineLarge.copyWith(color: AppColors.textPrimary)),
                const SizedBox(height: 8),
                Text(
                  'Your proposal has been submitted to MTN FinTech Lab. You used 6 Connects.',
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
