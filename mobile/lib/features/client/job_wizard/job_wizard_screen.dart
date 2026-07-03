import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/data/mock_data.dart';
import '../../../shared/widgets/fit_gradient_button.dart';

class JobWizardScreen extends StatefulWidget {
  const JobWizardScreen({super.key});

  @override
  State<JobWizardScreen> createState() => _JobWizardScreenState();
}

class _JobWizardScreenState extends State<JobWizardScreen> {
  int _currentStep = 1;
  bool _published = false;

  // Form Fields State
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _fixedBudgetController = TextEditingController();
  final TextEditingController _minHourlyController = TextEditingController();
  final TextEditingController _maxHourlyController = TextEditingController();

  String _selectedCategory = '';
  final Set<String> _selectedSkills = {};
  String _selectedDuration = '';
  String _selectedExperienceLevel = '';
  String _budgetType = 'fixed'; // 'fixed' or 'hourly'
  String _selectedCurrency = 'USD';

  final List<String> _steps = ['Title', 'Skills', 'Scope', 'Budget'];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _fixedBudgetController.dispose();
    _minHourlyController.dispose();
    _maxHourlyController.dispose();
    super.dispose();
  }

  bool get _canProceed {
    if (_currentStep == 1) {
      return _titleController.text.length > 5 && _selectedCategory.isNotEmpty;
    }
    if (_currentStep == 2) {
      return _selectedSkills.isNotEmpty;
    }
    if (_currentStep == 3) {
      return _selectedDuration.isNotEmpty && _selectedExperienceLevel.isNotEmpty;
    }
    if (_currentStep == 4) {
      if (_budgetType == 'fixed') {
        return _fixedBudgetController.text.isNotEmpty;
      } else {
        return _minHourlyController.text.isNotEmpty && _maxHourlyController.text.isNotEmpty;
      }
    }
    return false;
  }

  void _nextStep() {
    if (_currentStep < 4) {
      setState(() => _currentStep++);
    } else {
      setState(() => _published = true);
    }
  }

  void _prevStep() {
    if (_currentStep > 1) {
      setState(() => _currentStep--);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_published) {
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
                  Text('Job Posted!', style: AppTextStyles.headlineLarge.copyWith(color: AppColors.textPrimary)),
                  const SizedBox(height: 8),
                  Text(
                    'Your job is live. Freelancers can now submit proposals. You\'ll be notified as they arrive.',
                    textAlign: TextAlign.center,
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 28),
                  FitGradientButton(
                    text: 'Go to Dashboard',
                    fullWidth: true,
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Post a Job', style: AppTextStyles.titleLarge),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(0.5),
          child: Container(height: 0.5, color: AppColors.border),
        ),
      ),
      body: Column(
        children: [
          // Step progress header
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            child: Row(
              children: List.generate(_steps.length, (i) {
                final stepNum = i + 1;
                final isCurrent = _currentStep == stepNum;
                final isCompleted = _currentStep > stepNum;

                return Expanded(
                  child: Row(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: (isCurrent || isCompleted) ? AppColors.fitGradient : null,
                              color: (isCurrent || isCompleted) ? null : AppColors.slate100,
                            ),
                            alignment: Alignment.center,
                            child: isCompleted
                                ? const Icon(Icons.check, size: 16, color: Colors.white)
                                : Text(
                                    '$stepNum',
                                    style: TextStyle(
                                      color: (isCurrent || isCompleted) ? Colors.white : AppColors.textTertiary,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 12,
                                    ),
                                  ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _steps[i],
                            style: AppTextStyles.caption.copyWith(
                              color: isCurrent
                                  ? AppColors.fitBlue
                                  : isCompleted
                                      ? AppColors.textSecondary
                                      : AppColors.textTertiary,
                              fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      if (i < _steps.length - 1)
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(bottom: 16, left: 4, right: 4),
                            child: Container(
                              height: 2,
                              color: isCompleted ? AppColors.fitBlue : AppColors.slate200,
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              }),
            ),
          ),
          // Form Step Body
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: _buildStepContent(),
                ),
              ],
            ),
          ),
          // Sticky Bottom Actions
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                if (_currentStep > 1)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _prevStep,
                      child: const Text('Previous'),
                    ),
                  ),
                if (_currentStep > 1) const SizedBox(width: 12),
                Expanded(
                  child: FitGradientButton(
                    text: _currentStep == 4 ? 'Publish Job Post' : 'Continue',
                    onPressed: _canProceed ? _nextStep : null,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 1:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Job Title *', style: AppTextStyles.titleLarge),
            const SizedBox(height: 8),
            TextField(
              controller: _titleController,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                hintText: 'e.g. Full-Stack Developer for FinTech Dashboard',
              ),
            ),
            const SizedBox(height: 20),
            Text('Category *', style: AppTextStyles.titleLarge),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Web Development',
                'Mobile Development',
                'Design & Creative',
                'Writing & Translation',
                'Data & Analytics',
                'Admin Support',
                'Sales & Marketing',
                'Engineering & IT',
              ].map((cat) {
                final isSelected = _selectedCategory == cat;
                return ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  selectedColor: AppColors.blueBadgeBg,
                  onSelected: (selected) {
                    setState(() {
                      _selectedCategory = selected ? cat : '';
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            Text('Job Description', style: AppTextStyles.titleLarge),
            const SizedBox(height: 8),
            TextField(
              controller: _descController,
              maxLines: 5,
              decoration: const InputDecoration(
                hintText: 'Describe the project, deliverables, and requirements...',
              ),
            ),
          ],
        );
      case 2:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Required Skills *', style: AppTextStyles.titleLarge),
            const SizedBox(height: 4),
            Text('Select skills needed for this role', style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: kWizardSkills.map((skill) {
                final isSelected = _selectedSkills.contains(skill);
                return FilterChip(
                  label: Text(skill),
                  selected: isSelected,
                  selectedColor: AppColors.blueBadgeBg,
                  checkmarkColor: AppColors.fitBlue,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedSkills.add(skill);
                      } else {
                        _selectedSkills.remove(skill);
                      }
                    });
                  },
                );
              }).toList(),
            ),
            if (_selectedSkills.isNotEmpty) ...[
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.blueBadgeBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.blueBadgeBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Selected Skills (${_selectedSkills.length})',
                      style: AppTextStyles.labelSmall.copyWith(color: AppColors.blueBadgeText, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: _selectedSkills.map((s) {
                        return Chip(
                          label: Text(s, style: TextStyle(color: AppColors.fitBlue, fontSize: 11)),
                          backgroundColor: Colors.white,
                          side: const BorderSide(color: AppColors.blueBadgeBorder),
                          onDeleted: () {
                            setState(() {
                              _selectedSkills.remove(s);
                            });
                          },
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ],
          ],
        );
      case 3:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Project Duration *', style: AppTextStyles.titleLarge),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 2.8,
              children: [
                'Less than 1 week',
                '1–4 weeks',
                '1–3 months',
                '3–6 months',
                '6+ months',
                'Ongoing',
              ].map((d) {
                final isSelected = _selectedDuration == d;
                return ChoiceChip(
                  label: Center(child: Text(d)),
                  selected: isSelected,
                  selectedColor: AppColors.blueBadgeBg,
                  onSelected: (selected) {
                    setState(() {
                      _selectedDuration = selected ? d : '';
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            Text('Experience Level *', style: AppTextStyles.titleLarge),
            const SizedBox(height: 12),
            ...[
              _ExpLevelOption(
                level: 'Entry',
                desc: 'New to the field, learning skills, lower rates',
                isSelected: _selectedExperienceLevel == 'Entry',
                onTap: () => setState(() => _selectedExperienceLevel = 'Entry'),
              ),
              const SizedBox(height: 8),
              _ExpLevelOption(
                level: 'Intermediate',
                desc: 'Substantial experience and established work history',
                isSelected: _selectedExperienceLevel == 'Intermediate',
                onTap: () => setState(() => _selectedExperienceLevel = 'Intermediate'),
              ),
              const SizedBox(height: 8),
              _ExpLevelOption(
                level: 'Expert',
                desc: 'Highly skilled with deep expertise, commands premium rates',
                isSelected: _selectedExperienceLevel == 'Expert',
                onTap: () => setState(() => _selectedExperienceLevel = 'Expert'),
              ),
            ],
          ],
        );
      case 4:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Payment Type', style: AppTextStyles.titleLarge),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: const Center(child: Text('Fixed Price')),
                    selected: _budgetType == 'fixed',
                    selectedColor: AppColors.blueBadgeBg,
                    onSelected: (selected) => setState(() => _budgetType = 'fixed'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ChoiceChip(
                    label: const Center(child: Text('Hourly Rate')),
                    selected: _budgetType == 'hourly',
                    selectedColor: AppColors.blueBadgeBg,
                    onSelected: (selected) => setState(() => _budgetType = 'hourly'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Text('Currency', style: AppTextStyles.titleLarge),
            const SizedBox(height: 12),
            Row(
              children: ['USD', 'XAF', 'EUR'].map((cur) {
                final isSelected = _selectedCurrency == cur;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cur),
                    selected: isSelected,
                    selectedColor: AppColors.blueBadgeBg,
                    onSelected: (selected) => setState(() => _selectedCurrency = cur),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            if (_budgetType == 'fixed') ...[
              Text('Fixed Budget (${_selectedCurrency})', style: AppTextStyles.titleLarge),
              const SizedBox(height: 8),
              TextField(
                controller: _fixedBudgetController,
                keyboardType: TextInputType.number,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  prefixText: _selectedCurrency == 'XAF' ? 'XAF ' : '\$ ',
                ),
              ),
            ] else ...[
              Text('Hourly Rate Range (${_selectedCurrency}/hr)', style: AppTextStyles.titleLarge),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _minHourlyController,
                      keyboardType: TextInputType.number,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(
                        prefixText: 'Min: ',
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _maxHourlyController,
                      keyboardType: TextInputType.number,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(
                        prefixText: 'Max: ',
                      ),
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 24),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: AppColors.darkGradient,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Job Summary', style: AppTextStyles.titleSmall.copyWith(color: Colors.white)),
                  const SizedBox(height: 12),
                  _SummaryRow(label: 'Title', value: _titleController.text),
                  _SummaryRow(label: 'Category', value: _selectedCategory),
                  _SummaryRow(label: 'Skills', value: '${_selectedSkills.length} selected'),
                  _SummaryRow(label: 'Duration', value: _selectedDuration),
                  _SummaryRow(label: 'Level', value: _selectedExperienceLevel),
                  _SummaryRow(
                    label: 'Budget',
                    value: _budgetType == 'fixed'
                        ? '${_selectedCurrency} ${_fixedBudgetController.text}'
                        : '${_selectedCurrency} ${_minHourlyController.text}–${_maxHourlyController.text}/hr',
                    color: AppColors.fitCyan,
                  ),
                ],
              ),
            ),
          ],
        );
      default:
        return const SizedBox.shrink();
    }
  }
}

class _ExpLevelOption extends StatelessWidget {
  final String level;
  final String desc;
  final bool isSelected;
  final VoidCallback onTap;

  const _ExpLevelOption({
    required this.level,
    required this.desc,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.blueBadgeBg : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? AppColors.fitBlue : AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isSelected ? Icons.check_circle : Icons.circle_outlined,
                  color: isSelected ? AppColors.fitBlue : AppColors.slate300,
                  size: 18,
                ),
                const SizedBox(width: 8),
                Text(
                  level,
                  style: AppTextStyles.titleSmall.copyWith(
                    color: isSelected ? AppColors.fitBlue : AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Padding(
              padding: const EdgeInsets.only(left: 26),
              child: Text(
                desc,
                style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;

  const _SummaryRow({required this.label, required this.value, this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.caption.copyWith(color: AppColors.slate400)),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: AppTextStyles.bodySmall.copyWith(
                color: color ?? Colors.white,
                fontWeight: FontWeight.bold,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
