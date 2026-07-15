import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/api/fit_api.dart';
import '../../core/api/session.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/fit_gradient_button.dart';
import 'buy_connects_screen.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  double _availableXAF = 0;
  double _pendingXAF = 0;
  bool _loading = true;
  bool _isWithdrawMode = false;
  bool _isSubmitting = false;
  bool _success = false;
  double _lastWithdrawnAmount = 0;

  // Withdrawal form inputs
  final TextEditingController _amountController = TextEditingController();
  String _withdrawMethod = 'momo_mtn'; // 'momo_mtn' | 'momo_orange'
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _paypalEmailController = TextEditingController();
  final TextEditingController _bankAccountController = TextEditingController();
  final TextEditingController _bankNameController = TextEditingController();

  List<Map<String, dynamic>> _transactions = [];

  @override
  void initState() {
    super.initState();
    _phoneController.text = Session.current?.phone ?? '';
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        FitApi.wallet(),
        FitApi.walletTransactions(),
      ]);
      if (!mounted) return;
      final wallet = results[0] as Map<String, dynamic>;
      final transactions = results[1] as List<Map<String, dynamic>>;
      setState(() {
        _availableXAF = double.tryParse('${wallet['available_balance'] ?? 0}') ?? 0;
        _pendingXAF = double.tryParse('${wallet['pending_balance'] ?? 0}') ?? 0;
        _transactions = transactions.map((tx) {
          final type = tx['type']?.toString() ?? '';
          return {
            'type': type == 'withdrawal'
                ? 'withdrawal'
                : type == 'escrow_release'
                    ? 'payout'
                    : 'connects',
            'desc': tx['description']?.toString() ?? type.replaceAll('_', ' '),
            'amount': double.tryParse('${tx['amount'] ?? 0}') ?? 0,
            'date': (tx['created_at']?.toString() ?? '').split('T').first,
            'status': 'completed',
          };
        }).toList();
        _loading = false;
      });
    } on ApiException {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _phoneController.dispose();
    _paypalEmailController.dispose();
    _bankAccountController.dispose();
    _bankNameController.dispose();
    super.dispose();
  }

  Future<void> _handleWithdraw() async {
    final amt = double.tryParse(_amountController.text.trim()) ?? 0.0;

    if (amt <= 0 || amt > _availableXAF) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(amt <= 0 ? 'Please enter a valid withdrawal amount.' : 'Insufficient balance.'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await FitApi.requestWithdrawal(
        amount: amt,
        method: _withdrawMethod == 'momo_orange' ? 'orange_money' : 'mtn_momo',
        accountNumber: _phoneController.text.trim(),
      );
      await _load();
      if (!mounted) return;
      setState(() {
        _isSubmitting = false;
        _lastWithdrawnAmount = amt;
        _success = true;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.firstError), backgroundColor: AppColors.danger),
      );
    }
  }

  String _getMethodLabel() {
    switch (_withdrawMethod) {
      case 'momo_mtn': return 'MTN Mobile Money';
      case 'momo_orange': return 'Orange Money';
      case 'paypal': return 'PayPal';
      case 'bank': return 'Bank Account';
      default: return 'MTN MoMo';
    }
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
            if (_success) {
              setState(() {
                _success = false;
                _isWithdrawMode = false;
                _amountController.clear();
              });
            } else if (_isWithdrawMode) {
              setState(() => _isWithdrawMode = false);
            } else {
              Navigator.pop(context);
            }
          },
        ),
        title: Text('My Wallet', style: AppTextStyles.titleLarge),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(0.5),
          child: Container(height: 0.5, color: AppColors.border),
        ),
      ),
      body: _isSubmitting
          ? const Center(child: CircularProgressIndicator(color: AppColors.fitBlue))
          : _success
              ? _buildSuccessView()
              : _isWithdrawMode
                  ? _buildWithdrawForm()
                  : _buildWalletDashboard(),
    );
  }

  Widget _buildWalletDashboard() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.fitBlue));
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Balance Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: AppColors.darkGradient,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Available Balance', style: AppTextStyles.titleSmall.copyWith(color: Colors.white70)),
                  const Icon(Icons.account_balance_wallet, color: Color(0xFF22D3EE), size: 24),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                FitApi.formatMoney(_availableXAF),
                style: AppTextStyles.displayLarge.copyWith(color: Colors.white),
              ),
              const SizedBox(height: 4),
              Text(
                '${FitApi.formatMoney(_pendingXAF)} pending in escrow',
                style: AppTextStyles.monoMedium.copyWith(color: AppColors.fitCyan),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white30),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const BuyConnectsScreen()),
                        );
                      },
                      child: const Text('Buy Connects'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: AppColors.fitGradient,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () => setState(() => _isWithdrawMode = true),
                          borderRadius: BorderRadius.circular(12),
                          child: Center(
                            child: Text(
                              'Withdraw Funds',
                              style: AppTextStyles.labelLarge.copyWith(color: Colors.white),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 28),
        Text('TRANSACTION HISTORY', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary, letterSpacing: 0.5)),
        const SizedBox(height: 10),
        ..._transactions.map((tx) {
          final isDebit = (tx['amount'] as double) < 0;
          final amountText = isDebit
              ? '-${FitApi.formatMoney((tx['amount'] as double).abs())}'
              : '+${FitApi.formatMoney(tx['amount'] as double)}';
          final icon = tx['type'] == 'withdrawal'
              ? Icons.arrow_outward
              : tx['type'] == 'connects'
                  ? Icons.account_balance_wallet_outlined
                  : Icons.south_west;

          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Material(
              color: AppColors.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: AppColors.border),
              ),
              child: ListTile(
                dense: true,
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isDebit ? AppColors.dangerLight : AppColors.successLight,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    icon,
                    size: 16,
                    color: isDebit ? AppColors.danger : AppColors.success,
                  ),
                ),
                title: Text(tx['desc'], style: AppTextStyles.titleSmall),
                subtitle: Text(tx['date'], style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                trailing: Text(
                  amountText,
                  style: AppTextStyles.monoSmall.copyWith(
                    color: isDebit ? AppColors.danger : AppColors.success,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildWithdrawForm() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Withdraw Payout',
          style: AppTextStyles.headlineMedium.copyWith(color: AppColors.textPrimary),
        ),
        const SizedBox(height: 4),
        Text(
          'Available balance: ${FitApi.formatMoney(_availableXAF)}',
          style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 20),
        Text('WITHDRAWAL AMOUNT (XAF)', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
        const SizedBox(height: 8),
        TextField(
          controller: _amountController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          onChanged: (v) => setState(() {}),
          decoration: const InputDecoration(
            hintText: 'e.g. 25000',
            prefixText: 'XAF ',
          ),
        ),
        const SizedBox(height: 20),
        Text('CHOOSE PAYOUT METHOD', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _withdrawMethod,
          decoration: const InputDecoration(
            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
          items: [
            {'val': 'momo_mtn', 'lbl': 'MTN Mobile Money'},
            {'val': 'momo_orange', 'lbl': 'Orange Money'},
          ].map((m) {
            return DropdownMenuItem<String>(
              value: m['val'],
              child: Text(m['lbl']!, style: AppTextStyles.bodyMedium),
            );
          }).toList(),
          onChanged: (val) {
            if (val != null) {
              setState(() => _withdrawMethod = val);
            }
          },
        ),
        const SizedBox(height: 20),
        if (_withdrawMethod.startsWith('momo')) ...[
          Text('PHONE NUMBER', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(hintText: 'e.g. 677890123'),
          ),
        ] else if (_withdrawMethod == 'paypal') ...[
          Text('PAYPAL EMAIL ADDRESS', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _paypalEmailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(hintText: 'name@paypal.com'),
          ),
        ] else ...[
          Text('BANK NAME', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _bankNameController,
            decoration: const InputDecoration(hintText: 'e.g. Afriland First Bank'),
          ),
          const SizedBox(height: 16),
          Text('ACCOUNT NUMBER / IBAN', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _bankAccountController,
            decoration: const InputDecoration(hintText: 'e.g. CM21 10005 00010...'),
          ),
        ],
        const SizedBox(height: 32),
        FitGradientButton(
          text: 'Withdraw ${_amountController.text.isNotEmpty ? '\$${_amountController.text}' : ''} Payout',
          fullWidth: true,
          onPressed: _handleWithdraw,
        ),
      ],
    );
  }

  Widget _buildSuccessView() {
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
              Text('Withdrawal Submitted!', style: AppTextStyles.headlineLarge.copyWith(color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              Text(
                'Your payout request is pending FIT approval. Mobile Money transfers arrive shortly after approval.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.slate50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _RowDetail(label: 'Amount Requested', value: FitApi.formatMoney(_lastWithdrawnAmount)),
                    _RowDetail(label: 'Withdrawal Method', value: _getMethodLabel()),
                    _RowDetail(label: 'Payout Number', value: _phoneController.text.trim()),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              FitGradientButton(
                text: 'Done',
                fullWidth: true,
                onPressed: () {
                  setState(() {
                    _success = false;
                    _isWithdrawMode = false;
                    _amountController.clear();
                  });
                },
              ),
            ],
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
