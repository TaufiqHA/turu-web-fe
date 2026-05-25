import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme.dart';
import 'screens/login_screen.dart';
import 'screens/app_shell.dart';

// Dummy Provider untuk menyimpan state user/session
class AuthProvider with ChangeNotifier {
  String? _role; // null artinya belum login
  String? get role => _role;

  void login(String username, String password) {
    // Logika dummy login
    if (username == 'admin' && password == 'admin') {
      _role = 'superadmin';
    } else {
      _role = 'pelanggan';
    }
    notifyListeners();
  }

  void logout() {
    _role = null;
    notifyListeners();
  }
}

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const TuruSoreApp(),
    ),
  );
}

class TuruSoreApp extends StatelessWidget {
  const TuruSoreApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Turu Sore',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: Consumer<AuthProvider>(
        builder: (context, auth, child) {
          if (auth.role == null) {
            return const LoginScreen();
          }
          // Jika sudah login, return AppShell (Halaman Utama)
          return const AppShellScreen();
        },
      ),
    );
  }
}
