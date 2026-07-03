import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import 'fit_app_bar.dart';
import 'fit_drawer.dart';
import '../features/freelancer/freelancer_dashboard.dart';
import '../features/client/client_dashboard.dart';
import '../features/client/talent_search_screen.dart';
import '../features/proposal/proposals_list_screen.dart';
import '../features/messaging/messages_screen.dart';
import '../features/contracts/contracts_screen.dart';
import '../features/profile/profile_screen.dart';

/// Main scaffold with BottomNavigationBar — 5 tabs.
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;
  bool _isFreelancerMode = true; // true = freelancer, false = client

  final _scaffoldKey = GlobalKey<ScaffoldState>();

  void _switchRole() {
    setState(() {
      _isFreelancerMode = !_isFreelancerMode;
      _currentIndex = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = <Widget>[
      _isFreelancerMode
          ? const FreelancerDashboard()
          : const ClientDashboard(),
      // Proposals tab — for freelancer it shows proposals, for client it shows talent
      _isFreelancerMode
          ? const ProposalsListScreen()
          : const TalentSearchScreen(isTab: true),
      const MessagesScreen(),
      ContractsScreen(isFreelancerMode: _isFreelancerMode),
      const ProfileScreen(),
    ];

    return Scaffold(
      key: _scaffoldKey,
      appBar: FitAppBar(
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      drawer: FitDrawer(
        isFreelancerMode: _isFreelancerMode,
        onSwitchRole: _switchRole,
        onTabSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: Border(
            top: BorderSide(color: AppColors.border, width: 0.5),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          items: [
            BottomNavigationBarItem(
              icon: const Icon(Icons.home_outlined),
              activeIcon: const Icon(Icons.home),
              label: _isFreelancerMode ? 'Jobs' : 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.description_outlined),
              activeIcon: const Icon(Icons.description),
              label: _isFreelancerMode ? 'Proposals' : 'Talent',
            ),
            BottomNavigationBarItem(
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.chat_bubble_outline),
                  Positioned(
                    right: -6,
                    top: -4,
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: const BoxDecoration(
                        gradient: AppColors.fitGradient,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        '4',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              activeIcon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.chat_bubble),
                  Positioned(
                    right: -6,
                    top: -4,
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: const BoxDecoration(
                        gradient: AppColors.fitGradient,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        '4',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              label: 'Messages',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.fact_check_outlined),
              activeIcon: Icon(Icons.fact_check),
              label: 'Contracts',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
