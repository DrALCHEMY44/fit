import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/fit_gradient_button.dart';

class BuyConnectsScreen extends StatefulWidget {
  const BuyConnectsScreen({super.key});

  @override
  State<BuyConnectsScreen> createState() => _BuyConnectsScreenState();
}

class _BuyConnectsScreenState extends State<BuyConnectsScreen> {
  int _stage = 1; // 1: Pick Package, 2: Payment details, 3: Success
  String _currency = 'USD'; // 'USD' or 'XAF'
  int _selectedPackId = 1;
  String _paymentMethod = 'momo_mtn'; // 'momo_mtn', 'momo_orange', 'card', 'paypal'

  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _cardNameController = TextEditingController();
  final TextEditingController _cardNumberController = TextEditingController();
  final TextEditingController _cardExpiryController = TextEditingController();
  final TextEditingController _cardCvvController = TextEditingController();

  bool _isSubmitting = false;

  final List<Map<String, dynamic>> _packs = [
    { 'id': 1, 'connects': 10, 'priceUSD': 1.50, 'costPerUSD': 0.15, 'label': 'Starter Pack', 'badge': null, 'save': null },
    { 'id': 2, 'connects': 20, 'priceUSD': 3.00, 'costPerUSD': 0.15, 'label': 'Starter Plus', 'badge': null, 'save': null },
    { 'id': 3, 'connects': 50, 'priceUSD': 6.00, 'costPerUSD': 0.12, 'label': 'Most Popular', 'badge': 'Most Popular', 'save': null },
    { 'id': 4, 'connects': 100, 'priceUSD': 10.00, 'costPerUSD': 0.10, 'label': 'Best Value', 'badge': 'Best Value', 'save': 'Save 33%' },
    { 'id': 5, 'connects': 200, 'priceUSD': 18.00, 'costPerUSD': 0.09, 'label': 'Power Pack', 'badge': 'Power Pack', 'save': 'Save 40%' },
  ];

  static const double _xafRate = 600.0;

  @override
  void dispose() {
    _phoneController.dispose();
    _cardNameController.dispose();
    _cardNumberController.dispose();
    _cardExpiryController.dispose();
    _cardCvvController.dispose();
    super.dispose();
  }

  String _formatPrice(double usd) {
    if (_currency == 'USD') {
      return '\$${usd.toStringAsFixed(2)}';
    } else {
      return '${(usd * _xafRate).round().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')} XAF';
    }
  }

  String _getCostPerConnect(double usd) {
    if (_currency == 'USD') {
      return '\$${usd.toStringAsFixed(2)}/connect';
    } else {
      return '${(usd * _xafRate).round()} XAF/connect';
    }
  }

  Map<String, dynamic> get _selectedPack {
    return _packs.firstWhere((p) => p['id'] == _selectedPackId);
  }

  void _handlePay() {
    setState(() => _isSubmitting = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _stage = 3;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_stage > 1 && _stage < 3) {
              setState(() => _stage--);
            } else {
              Navigator.pop(context);
            }
          },
        ),
        title: Text('Buy Connects', style: AppTextStyles.titleLarge),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(0.5),
          child: Container(height: 0.5, color: AppColors.border),
        ),
      ),
      body: _isSubmitting
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.fitBlue),
            )
          : _buildStageContent(),
    );
  }

  Widget _buildStageContent() {
    if (_stage == 1) return _buildPackSelection();
    if (_stage == 2) return _buildPaymentDetails();
    return _buildSuccessStage();
  }

  Widget _buildPackSelection() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Available Bundles',
          style: AppTextStyles.headlineMedium.copyWith(color: AppColors.textPrimary),
        ),
        const SizedBox(height: 4),
        Text(
          'Connects help you apply for your dream jobs.',
          style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 16),
        // Currency Toggle Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Currency:', style: AppTextStyles.titleSmall),
            Row(
              children: ['USD', 'XAF'].map((c) {
                final isSelected = _currency == c;
                return Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: ChoiceChip(
                    label: Text(c),
                    selected: isSelected,
                    selectedColor: AppColors.blueBadgeBg,
                    onSelected: (selected) {
                      if (selected) setState(() => _currency = c);
                    },
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Pack lists
        ..._packs.map((pack) {
          final isSelected = _selectedPackId == pack['id'];
          final priceText = _formatPrice(pack['priceUSD']);
          final costPerText = _getCostPerConnect(pack['costPerUSD']);

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GestureDetector(
              onTap: () => setState(() => _selectedPackId = pack['id']),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? AppColors.fitBlue : AppColors.border,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text('${pack['connects']} Connects', style: AppTextStyles.titleLarge),
                              if (pack['save'] != null) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.successLight,
                                    borderRadius: BorderRadius.circular(100),
                                    border: Border.all(color: AppColors.successBorder),
                                  ),
                                  child: Text(
                                    pack['save'],
                                    style: const TextStyle(fontSize: 10, color: AppColors.success, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(pack['label'], style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                          const SizedBox(height: 2),
                          Text(costPerText, style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                        ],
                      ),
                    ),
                    Text(
                      priceText,
                      style: AppTextStyles.monoMedium.copyWith(
                        color: isSelected ? AppColors.fitBlue : AppColors.textPrimary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
        const SizedBox(height: 16),
        FitGradientButton(
          text: 'Proceed to Payment',
          fullWidth: true,
          onPressed: () => setState(() => _stage = 2),
        ),
      ],
    );
  }

  Widget _buildPaymentDetails() {
    final priceText = _formatPrice(_selectedPack['priceUSD']);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Summary Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: AppColors.darkGradient,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Order Summary', style: AppTextStyles.titleSmall.copyWith(color: Colors.white70)),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${_selectedPack['connects']} Connects Bundle', style: AppTextStyles.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                  Text(priceText, style: AppTextStyles.monoMedium.copyWith(color: AppColors.fitCyan, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Text('Select Payment Method', style: AppTextStyles.titleLarge),
        const SizedBox(height: 12),
        Row(
          children: [
            _PayMethodTab(
              label: 'MTN MoMo',
              isSelected: _paymentMethod == 'momo_mtn',
              onTap: () => setState(() => _paymentMethod = 'momo_mtn'),
            ),
            const SizedBox(width: 8),
            _PayMethodTab(
              label: 'Orange Money',
              isSelected: _paymentMethod == 'momo_orange',
              onTap: () => setState(() => _paymentMethod = 'momo_orange'),
            ),
            const SizedBox(width: 8),
            _PayMethodTab(
              label: 'Card',
              isSelected: _paymentMethod == 'card',
              onTap: () => setState(() => _paymentMethod = 'card'),
            ),
          ],
        ),
        const SizedBox(height: 20),
        if (_paymentMethod.startsWith('momo')) ...[
          Text('PHONE NUMBER', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              hintText: 'e.g. 677123456',
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Ensure you have your phone nearby to confirm the secure push authorization dial.',
            style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
          ),
        ] else ...[
          Text('CARDHOLDER NAME', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _cardNameController,
            decoration: const InputDecoration(hintText: 'Diane Ngono'),
          ),
          const SizedBox(height: 16),
          Text('CARD NUMBER', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _cardNumberController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(hintText: '4000 1234 5678 9010'),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('EXPIRY DATE', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _cardExpiryController,
                      decoration: const InputDecoration(hintText: 'MM/YY'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('CVV', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _cardCvvController,
                      obscureText: true,
                      decoration: const InputDecoration(hintText: '123'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
        const SizedBox(height: 32),
        FitGradientButton(
          text: 'Pay $priceText Now',
          fullWidth: true,
          onPressed: _handlePay,
        ),
      ],
    );
  }

  Widget _buildSuccessStage() {
    final priceText = _formatPrice(_selectedPack['priceUSD']);

    return SafeArea(
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
              Text('Purchase Successful!', style: AppTextStyles.headlineLarge.copyWith(color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              Text(
                'We\'ve credited your account with ${_selectedPack['connects']} Connects.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.slate50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _RowDetail(label: 'Order ID', value: 'TXN-982312'),
                    _RowDetail(label: 'Amount Paid', value: priceText),
                    _RowDetail(label: 'Total Connects Added', value: '${_selectedPack['connects']}'),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              FitGradientButton(
                text: 'Done',
                fullWidth: true,
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PayMethodTab extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _PayMethodTab({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 48,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.blueBadgeBg : AppColors.slate50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? AppColors.fitBlue : AppColors.border, width: 1.5),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: AppTextStyles.labelMedium.copyWith(
              color: isSelected ? AppColors.blueBadgeText : AppColors.textSecondary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}

class _RowDetail extends StatelessWidget {
  final String label, value;
  const _RowDetail({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
          Text(value, style: AppTextStyles.titleSmall.copyWith(color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
