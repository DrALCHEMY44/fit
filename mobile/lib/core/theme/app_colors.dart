import 'package:flutter/material.dart';

/// FIT Brand Colors extracted from the fit.png logo and web design system.
class AppColors {
  AppColors._();

  // ── Primary Brand ──
  static const Color fitBlack = Color(0xFF0D1117);
  static const Color fitCharcoal = Color(0xFF1A1A1A);
  static const Color fitDarkBg = Color(0xFF111827);
  static const Color fitBlue = Color(0xFF0284C7);
  static const Color fitCyan = Color(0xFF06B6D4);
  static const Color fitSkyBlue = Color(0xFF0EA5E9);

  // ── Primary Gradient ──
  static const LinearGradient fitGradient = LinearGradient(
    colors: [fitBlue, fitCyan],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient fitGradientVertical = LinearGradient(
    colors: [fitBlue, fitCyan],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [fitBlack, Color(0xFF1E293B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Surface & Background ──
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Colors.white;
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderLight = Color(0xFFF1F5F9);

  // ── Text ──
  static const Color textPrimary = Color(0xFF0D1117);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFF94A3B8);
  static const Color textOnDark = Colors.white;
  static const Color textOnGradient = Colors.white;

  // ── Status ──
  static const Color success = Color(0xFF16A34A);
  static const Color successLight = Color(0xFFF0FDF4);
  static const Color successBorder = Color(0xFFBBF7D0);
  static const Color emerald = Color(0xFF34D399);

  static const Color warning = Color(0xFFD97706);
  static const Color warningLight = Color(0xFFFFFBEB);
  static const Color warningBorder = Color(0xFFFDE68A);

  static const Color danger = Color(0xFFDC2626);
  static const Color dangerLight = Color(0xFFFEF2F2);
  static const Color dangerBorder = Color(0xFFFECACA);

  // ── Badge Backgrounds ──
  static const Color blueBadgeBg = Color(0xFFEFF6FF);
  static const Color blueBadgeText = Color(0xFF1D4ED8);
  static const Color blueBadgeBorder = Color(0xFFBFDBFE);

  static const Color cyanBadgeBg = Color(0xFFECFEFF);
  static const Color cyanBadgeText = Color(0xFF0E7490);
  static const Color cyanBadgeBorder = Color(0xFFA5F3FC);

  static const Color defaultBadgeBg = Color(0xFFF1F5F9);
  static const Color defaultBadgeText = Color(0xFF475569);

  // ── Accent Gradients (Avatars / Feature Cards) ──
  static const LinearGradient gradientBlue = LinearGradient(
    colors: [Color(0xFF0284C7), Color(0xFF06B6D4)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientPurple = LinearGradient(
    colors: [Color(0xFF7C3AED), Color(0xFFA78BFA)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientGreen = LinearGradient(
    colors: [Color(0xFF16A34A), Color(0xFF34D399)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientAmber = LinearGradient(
    colors: [Color(0xFFD97706), Color(0xFFFBBF24)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientPink = LinearGradient(
    colors: [Color(0xFFDB2777), Color(0xFFF472B6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientTeal = LinearGradient(
    colors: [Color(0xFF0891B2), Color(0xFF22D3EE)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientIndigo = LinearGradient(
    colors: [Color(0xFF6366F1), Color(0xFF818CF8)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Slate shades ──
  static const Color slate50 = Color(0xFFF8FAFC);
  static const Color slate100 = Color(0xFFF1F5F9);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate500 = Color(0xFF64748B);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate700 = Color(0xFF334155);
}
