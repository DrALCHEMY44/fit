import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/fit_gradient_button.dart';

class HelpCenterScreen extends StatefulWidget {
  const HelpCenterScreen({super.key});

  @override
  State<HelpCenterScreen> createState() => _HelpCenterScreenState();
}

class _HelpCenterScreenState extends State<HelpCenterScreen> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _ticketTitleController = TextEditingController();
  final TextEditingController _ticketDescController = TextEditingController();
  String _selectedCategory = 'Billing & Payments';

  String _searchQuery = '';

  final List<Map<String, String>> _faqs = [
    {
      'q': 'Do Connects expire?',
      'a': 'Yes, Connects expire 1 year from the date of purchase. We always use your oldest Connects first when you submit proposals.'
    },
    {
      'q': 'Can I get a refund?',
      'a': 'Purchased Connects are generally non-refundable unless there was a billing error. However, if a client cancels a job post without hiring, any Connects spent on your proposal will be automatically refunded.'
    },
    {
      'q': 'What if my proposal is declined?',
      'a': 'Connects spent on submitted proposals are not returned if the client declines your proposal. They are only returned if the client cancels the job post.'
    },
    {
      'q': 'Can I pay in XAF?',
      'a': 'Yes, we support local Cameroon mobile money payments (MTN Mobile Money and Orange Money) in XAF, processed instantly at competitive exchange rates.'
    },
    {
      'q': 'How does escrow work?',
      'a': 'When a contract starts, the client funds the milestones in escrow. The money is securely held by FIT and only released to the freelancer after the client reviews and approves the work.'
    }
  ];

  List<Map<String, String>> get _filteredFaqs {
    if (_searchQuery.isEmpty) return _faqs;
    return _faqs.where((faq) {
      return faq['q']!.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          faq['a']!.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();
  }

  void _submitTicket() {
    if (_ticketTitleController.text.isEmpty || _ticketDescController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill out all support ticket fields.'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Support ticket #${DateTime.now().millisecondsSinceEpoch.toString().substring(8)} submitted successfully!'),
        backgroundColor: AppColors.success,
      ),
    );

    setState(() {
      _ticketTitleController.clear();
      _ticketDescController.clear();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _ticketTitleController.dispose();
    _ticketDescController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final faqs = _filteredFaqs;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Help & Support', style: AppTextStyles.titleLarge),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(0.5),
          child: Container(height: 0.5, color: AppColors.border),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'How can we help you?',
            style: AppTextStyles.headlineMedium.copyWith(color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),
          // FAQ Search Bar
          Container(
            height: 44,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Icon(Icons.search, size: 18, color: AppColors.textTertiary),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onChanged: (v) => setState(() => _searchQuery = v),
                    style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
                    decoration: const InputDecoration(
                      hintText: 'Search help topics, FAQs...',
                      hintStyle: TextStyle(fontSize: 14, color: AppColors.textTertiary),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                      filled: false,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // FAQ Section
          Text('FREQUENTLY ASKED QUESTIONS', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary, letterSpacing: 0.5)),
          const SizedBox(height: 8),
          if (faqs.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Text(
                'No FAQs found matching your query.',
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              ),
            )
          else
            ...faqs.map((faq) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Material(
                  color: AppColors.surface,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: AppColors.border),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: ExpansionTile(
                    title: Text(faq['q']!, style: AppTextStyles.titleSmall),
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: Text(
                          faq['a']!,
                          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary, height: 1.5),
                        ),
                      )
                    ],
                  ),
                ),
              );
            }),
          const SizedBox(height: 24),

          // Support Ticket Section
          Text('SUBMIT A SUPPORT TICKET', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary, letterSpacing: 0.5)),
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
                  Text('TICKET CATEGORY', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _selectedCategory,
                    decoration: const InputDecoration(
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    items: ['Billing & Payments', 'Escrow Disputes', 'Profile Verification', 'Job Post Assistance'].map((provider) {
                      return DropdownMenuItem<String>(
                        value: provider,
                        child: Text(provider, style: AppTextStyles.bodyMedium),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedCategory = val);
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  Text('SUBJECT', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _ticketTitleController,
                    decoration: const InputDecoration(hintText: 'e.g. Escrow payout not received'),
                  ),
                  const SizedBox(height: 16),
                  Text('MESSAGE DETAILS', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _ticketDescController,
                    maxLines: 4,
                    decoration: const InputDecoration(hintText: 'Provide details about your query...'),
                  ),
                  const SizedBox(height: 20),
                  FitGradientButton(
                    text: 'Submit Support Ticket',
                    fullWidth: true,
                    onPressed: _submitTicket,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}
