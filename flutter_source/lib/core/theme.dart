import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Warna Utama (Berdasarkan spesifikasi Tailwind ke Hex)
  static const Color fGreen = Color(0xFFDC2626); // red-600 di React
  static const Color fGreenLight = Color(0xFFFEE2E2); // red-100
  static const Color fRed = Color(0xFFE11D48); // rose-600
  static const Color fDark = Color(0xFF0F172A); // slate-900
  static const Color scaffoldBackground = Color(0xFFF8FAFC); // slate-50
  static const Color cardBackground = Colors.white;

  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: fGreen,
      scaffoldBackgroundColor: scaffoldBackground,
      textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      colorScheme: ColorScheme.fromSeed(
        seedColor: fGreen,
        primary: fGreen,
        secondary: fRed,
        background: scaffoldBackground,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: cardBackground,
        elevation: 0.5,
        iconTheme: IconThemeData(color: fDark),
        titleTextStyle: TextStyle(
          color: fDark,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: fGreen,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.grey.shade50,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: fGreen, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      ),
    );
  }
}
