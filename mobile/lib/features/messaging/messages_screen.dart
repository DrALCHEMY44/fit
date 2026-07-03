import 'package:flutter/material.dart';
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
  final List<String> _filters = ['All', 'Contracts', 'Interviews'];

  List<ChatThread> get _filteredThreads {
    return kThreadList.where((t) {
      if (_activeFilter == 'All') return true;
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
                  children: const [
                    Icon(Icons.search, size: 16, color: AppColors.textTertiary),
                    SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        style: TextStyle(fontSize: 14, color: AppColors.textPrimary),
                        decoration: InputDecoration(
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
          child: threads.isEmpty
              ? Center(
                  child: Text(
                    'No messages found.',
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
