import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/data/mock_data.dart';
import '../../shared/widgets/fit_badge.dart';
import '../../shared/widgets/skill_tag.dart';
import '../../shared/widgets/fit_gradient_button.dart';
import 'proposal_success_screen.dart';

/// Full-screen proposal submission flow with job details, bid input, milestones, and cover letter.
class ProposalScreen extends StatefulWidget {
  const ProposalScreen({super.key});

  @override
  State<ProposalScreen> createState() => _ProposalScreenState();
}

class _ProposalScreenState extends State<ProposalScreen> {
  final _job = kJobs[0];
  final _bidController = TextEditingController(text: '30');
  final _coverController = TextEditingController();
  bool _jobDetailsExpanded = false;

  List<Map<String, dynamic>> _milestones = [
    {'name': 'Design & Prototype', 'amount': '600'},
    {'name': 'Frontend Development', 'amount': '900'},
    {'name': 'Backend & Integration', 'amount': '700'},
  ];

  double get _totalBid => _milestones.fold(0, (sum, m) => sum + (double.tryParse(m['amount'] ?? '0') ?? 0));
  double get _bidRate => double.tryParse(_bidController.text) ?? 0;
  double get _netRate => _bidRate * 0.8;

  @override
  void dispose() {
    _bidController.dispose();
    _coverController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Submit Proposal', style: AppTextStyles.titleLarge),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(0.5),
          child: Container(height: 0.5, color: AppColors.border),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Job Details (collapsible) ──
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                InkWell(
                  onTap: () => setState(() => _jobDetailsExpanded = !_jobDetailsExpanded),
                  borderRadius: BorderRadius.circular(16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  FitBadge(text: 'Hourly', variant: BadgeVariant.blue, icon: Icons.access_time),
                                  const SizedBox(width: 6),
                                  const FitBadge(text: 'Payment Verified', variant: BadgeVariant.success, icon: Icons.verified_user),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(_job.title, style: AppTextStyles.titleLarge.copyWith(height: 1.3)),
                            ],
                          ),
                        ),
                        Icon(
                          _jobDetailsExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                          color: AppColors.textTertiary,
                        ),
                      ],
                    ),
                  ),
                ),
                if (_jobDetailsExpanded) ...[
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_job.description, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                        const SizedBox(height: 12),
                        // Budget grid
                        Row(
                          children: [
                            _InfoTile(label: 'Budget', value: '\$${_job.budget.min}–\$${_job.budget.max}/hr'),
                            const SizedBox(width: 8),
                            _InfoTile(label: 'Duration', value: _job.duration),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            _InfoTile(label: 'Experience', value: _job.level),
                            const SizedBox(width: 8),
                            _InfoTile(label: 'Proposals', value: '${_job.proposals} sent'),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: _job.skills.map((s) => SkillTag(label: s)).toList(),
                        ),
                        const SizedBox(height: 16),
                        // Client info
                        Container(
                          padding: const EdgeInsets.only(top: 12),
                          decoration: BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
                          child: Row(
                            children: [
                              Container(
                                width: 32,
                                height: 32,
                                decoration: BoxDecoration(
                                  gradient: AppColors.gradientBlue,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                alignment: Alignment.center,
                                child: Text('M', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(_job.client.name, style: AppTextStyles.titleSmall),
                                  Text('${_job.client.rating} ★ · ${_job.client.jobs} jobs · ${_job.client.spent}',
                                      style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Bid Rate ──
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
                Text('Your Bid Rate', style: AppTextStyles.titleLarge),
                const SizedBox(height: 4),
                Text('The client\'s budget is \$${_job.budget.min}–\$${_job.budget.max}/hr',
                    style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('YOUR RATE (USD/HR)', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary, letterSpacing: 0.5)),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: AppColors.slate50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              children: [
                                Text('\$', style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textTertiary)),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextField(
                                    controller: _bidController,
                                    keyboardType: TextInputType.number,
                                    onChanged: (_) => setState(() {}),
                                    style: AppTextStyles.monoMedium.copyWith(color: AppColors.textPrimary),
                                    decoration: const InputDecoration(
                                      border: InputBorder.none,
                                      isDense: true,
                                      contentPadding: EdgeInsets.zero,
                                      filled: false,
                                    ),
                                  ),
                                ),
                                Text('/ hr', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("YOU'LL RECEIVE", style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary, letterSpacing: 0.5)),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                            decoration: BoxDecoration(
                              color: AppColors.successLight,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.successBorder),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('\$${_netRate.toStringAsFixed(2)}/hr',
                                    style: AppTextStyles.monoSmall.copyWith(color: AppColors.success, fontWeight: FontWeight.w700)),
                                Text('After 20% FIT fee', style: AppTextStyles.caption.copyWith(color: AppColors.success)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Milestones ──
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Project Milestones', style: AppTextStyles.titleLarge),
                        Text('Break down your work into payable deliverables',
                            style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => setState(() => _milestones.add({'name': '', 'amount': ''})),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.blueBadgeBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.add, size: 14, color: AppColors.fitBlue),
                            const SizedBox(width: 4),
                            Text('Add', style: AppTextStyles.labelSmall.copyWith(color: AppColors.fitBlue, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ...List.generate(_milestones.length, (i) {
                  return Padding(
                    padding: EdgeInsets.only(bottom: i < _milestones.length - 1 ? 8 : 0),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.slate50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(gradient: AppColors.fitGradient, shape: BoxShape.circle),
                            alignment: Alignment.center,
                            child: Text('${i + 1}', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: TextEditingController(text: _milestones[i]['name']),
                              onChanged: (v) => _milestones[i]['name'] = v,
                              style: AppTextStyles.titleSmall.copyWith(color: AppColors.textPrimary),
                              decoration: InputDecoration(
                                hintText: 'Milestone description',
                                hintStyle: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary),
                                border: InputBorder.none, isDense: true, contentPadding: EdgeInsets.zero, filled: false,
                              ),
                            ),
                          ),
                          Container(
                            width: 80,
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              children: [
                                Text('\$', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary)),
                                Expanded(
                                  child: TextField(
                                    controller: TextEditingController(text: _milestones[i]['amount']),
                                    keyboardType: TextInputType.number,
                                    onChanged: (v) { _milestones[i]['amount'] = v; setState(() {}); },
                                    style: AppTextStyles.monoCaption.copyWith(color: AppColors.textPrimary),
                                    decoration: const InputDecoration(
                                      border: InputBorder.none, isDense: true, contentPadding: EdgeInsets.zero, filled: false,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (_milestones.length > 1)
                            GestureDetector(
                              onTap: () => setState(() => _milestones.removeAt(i)),
                              child: Padding(
                                padding: const EdgeInsets.only(left: 6),
                                child: Icon(Icons.close, size: 16, color: AppColors.textTertiary),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.only(top: 12),
                  decoration: BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total Project Value', style: AppTextStyles.titleSmall.copyWith(color: AppColors.textSecondary)),
                      Text('\$${_totalBid.toStringAsFixed(0)}', style: AppTextStyles.monoMedium.copyWith(color: AppColors.textPrimary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Cover Letter ──
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
                Text('Cover Letter', style: AppTextStyles.titleLarge),
                const SizedBox(height: 4),
                Text('Describe your relevant experience, approach, and why you\'re the best fit.',
                    style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: 12),
                TextField(
                  controller: _coverController,
                  maxLines: 8,
                  onChanged: (_) => setState(() {}),
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: 'Dear ${_job.client.name},\n\nI am very excited to submit my proposal for this project...',
                    hintStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.textTertiary),
                    filled: true,
                    fillColor: AppColors.slate50,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.fitBlue),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.attach_file, size: 16, color: AppColors.textSecondary),
                        const SizedBox(width: 6),
                        Text('Attach work samples', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textSecondary)),
                      ],
                    ),
                    Text('${_coverController.text.length} / 5000', style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Submit ──
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Text.rich(
                  TextSpan(
                    style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                    children: [
                      const TextSpan(text: 'Submitting this proposal will use '),
                      TextSpan(text: '6 Connects', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      const TextSpan(text: '. You have '),
                      TextSpan(text: '42 remaining', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.fitBlue)),
                      const TextSpan(text: '.'),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                FitGradientButton(
                  text: 'Submit Proposal',
                  icon: Icons.send,
                  fullWidth: true,
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const ProposalSuccessScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final String label;
  final String value;
  const _InfoTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.slate50,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
            const SizedBox(height: 2),
            Text(value, style: AppTextStyles.monoCaption.copyWith(color: AppColors.textPrimary, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}
