import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../profile/buy_connects_screen.dart';

/// Dark gradient card showing connects balance and Buy CTA.
class ConnectsCard extends StatelessWidget {
  const ConnectsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: AppColors.darkGradient,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('Connects Balance', style: AppTextStyles.titleSmall.copyWith(color: AppColors.slate300)),
                    const Spacer(),
                    const Icon(Icons.account_balance_wallet_outlined, size: 18, color: Color(0xFF22D3EE)),
                  ],
                ),
                const SizedBox(height: 8),
                Text('42', style: AppTextStyles.monoDisplayLarge.copyWith(color: Colors.white)),
                const SizedBox(height: 2),
                Text('~7 proposals remaining', style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
              ],
            ),
          ),
          const SizedBox(width: 16),
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const BuyConnectsScreen()));
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                gradient: AppColors.fitGradient,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                'Buy Connects',
                style: AppTextStyles.labelMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
