import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../features/auth/splash_screen.dart';

class FITApp extends StatelessWidget {
  const FITApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Freelance Interconnect',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const SplashScreen(),
    );
  }
}
