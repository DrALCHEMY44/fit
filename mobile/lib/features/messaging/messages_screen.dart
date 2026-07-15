import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/api/fit_api.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/data/mock_data.dart';
import '../../shared/widgets/fit_avatar.dart';
import '../../shared/widgets/fit_badge.dart';
import 'chat_room_screen.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  String _activeFilter = 'All';
  String _search = '';
  final List<String> _filters = ['All', 'Contracts', 'Interviews'];

  List<ChatThread> _threads = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final threads = await FitApi.conversations();
      if (!mounted) return;
      setState(() {
        _threads = threads;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.firstError;
        _loading = false;
      });
    }
  }

  List<ChatThread> get _filteredThreads {
    return _threads.where((t) {
      final matchesSearch =
          _search.isEmpty || t.contact.toLowerCase().contains(_search.toLowerCase());
      if (!matchesSearch) return false;
      if (_activeFilter == 'Contracts') return t.type == 'contract';
      if (_activeFilter == 'Interviews') return t.type == 'interview';
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final threads = _filteredThreads;

    return Column(
      children: [
        // Filter tabs and search
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            children: [
              // Search input
              Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppColors.slate50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.search, size: 16, color: AppColors.textTertiary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        onChanged: (v) => setState(() => _search = v),
                        style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
                        decoration: const InputDecoration(
                          hintText: 'Search conversations...',
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
              const SizedBox(height: 10),
              // Segmented Filter chips
              Row(
                children: _filters.map((f) {
                  final isActive = _activeFilter == f;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: GestureDetector(
                        onTap: () => setState(() => _activeFilter = f),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            gradient: isActive ? AppColors.fitGradient : null,
                            color: isActive ? null : AppColors.slate100,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            f,
                            style: AppTextStyles.labelMedium.copyWith(
                              color: isActive ? Colors.white : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
        // Threads List
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: AppColors.fitBlue))
              : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, textAlign: TextAlign.center, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                      const SizedBox(height: 8),
                      TextButton(onPressed: _load, child: const Text('Try again')),
                    ],
                  ),
                )
              : threads.isEmpty
              ? Center(
                  child: Text(
                    'No conversations yet.',
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                )
              : ListView.separated(
                  itemCount: threads.length,
                  separatorBuilder: (context, index) => Divider(color: AppColors.border, height: 1),
                  itemBuilder: (context, index) {
                    final thread = threads[index];
                    return Material(
                      color: Colors.transparent,
                      child: ListTile(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ChatRoomScreen(thread: thread),
                            ),
                          );
                        },
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        leading: FitAvatar.sm(
                          initials: thread.initials,
                          gradient: thread.gradient,
                          showOnline: thread.online,
                        ),
                        title: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(thread.contact, style: AppTextStyles.titleSmall),
                            Text(thread.time, style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary)),
                          ],
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text(
                              thread.lastMessage,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.bodySmall.copyWith(
                                color: thread.unread > 0 ? AppColors.textPrimary : AppColors.textSecondary,
                                fontWeight: thread.unread > 0 ? FontWeight.w700 : FontWeight.w400,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                FitBadge(
                                  text: thread.type,
                                  variant: thread.type == 'contract' ? BadgeVariant.success : BadgeVariant.blue,
                                ),
                                if (thread.unread > 0)
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: const BoxDecoration(
                                      gradient: AppColors.fitGradient,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Text(
                                      '${thread.unread}',
                                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
