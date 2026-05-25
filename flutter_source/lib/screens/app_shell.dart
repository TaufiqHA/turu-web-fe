import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart'; // import AuthProvider
import '../core/theme.dart';
import 'dashboard_screen.dart';
import 'finance_screen.dart';
import 'map_screen.dart';
import 'complaint_screen.dart';
import 'inventory_screen.dart';

class AppShellScreen extends StatefulWidget {
  const AppShellScreen({Key? key}) : super(key: key);

  @override
  State<AppShellScreen> createState() => _AppShellScreenState();
}

class _AppShellScreenState extends State<AppShellScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    // Ambil Role dari provider, jika null kita anggap pelanggan sebagai fallback
    final role = context.watch<AuthProvider>().role ?? 'pelanggan';

    // Daftar menu yang dinamis berdasarkan hak akses / role
    List<Map<String, dynamic>> menuItems = [];

    if (role == 'superadmin') {
      menuItems = [
        {'icon': Icons.home_outlined, 'active': Icons.home, 'label': 'Home', 'screen': const DashboardScreen()},
        {'icon': Icons.account_balance_wallet_outlined, 'active': Icons.account_balance_wallet, 'label': 'Finance', 'screen': const FinanceScreen()},
        {'icon': Icons.map_outlined, 'active': Icons.map, 'label': 'Map', 'screen': const MapScreen()},
        {'icon': Icons.message_outlined, 'active': Icons.message, 'label': 'Komplain', 'screen': const ComplaintScreen()},
        {'icon': Icons.inventory_2_outlined, 'active': Icons.inventory, 'label': 'Gudang', 'screen': const InventoryScreen()},
      ];
    } else if (role == 'teknisi') {
      menuItems = [
        {'icon': Icons.home_outlined, 'active': Icons.home, 'label': 'Home', 'screen': const DashboardScreen()},
        {'icon': Icons.map_outlined, 'active': Icons.map, 'label': 'Map', 'screen': const MapScreen()},
        {'icon': Icons.message_outlined, 'active': Icons.message, 'label': 'Komplain', 'screen': const ComplaintScreen()},
        {'icon': Icons.inventory_2_outlined, 'active': Icons.inventory, 'label': 'Gudang', 'screen': const InventoryScreen()},
      ];
    } else {
      // Pelanggan
      menuItems = [
        {'icon': Icons.home_outlined, 'active': Icons.home, 'label': 'Home', 'screen': const DashboardScreen()},
        {'icon': Icons.message_outlined, 'active': Icons.message, 'label': 'Komplain', 'screen': const ComplaintScreen()},
      ];
    }

    // Hindari error index out of bounds jika role ganti
    if (_currentIndex >= menuItems.length) {
      _currentIndex = 0;
    }

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(
                color: AppTheme.fGreen,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.wifi, color: Colors.white, size: 16),
            ),
            const SizedBox(width: 8),
            const Text('Turu Sore'),
          ],
        ),
        actions: [
          // Lencana Status Role
          Center(
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.fGreenLight,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                role.toUpperCase(), 
                style: const TextStyle(color: AppTheme.fGreen, fontSize: 10, fontWeight: FontWeight.bold)
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              context.read<AuthProvider>().logout();
            },
          )
        ],
      ),
      body: menuItems[_currentIndex]['screen'],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppTheme.fGreen,
        unselectedItemColor: Colors.grey,
        backgroundColor: Colors.white,
        elevation: 10,
        items: menuItems.map((item) {
          return BottomNavigationBarItem(
            icon: Padding(
              padding: const EdgeInsets.only(bottom: 4.0),
              child: Icon(item['icon']),
            ),
            activeIcon: Padding(
              padding: const EdgeInsets.only(bottom: 4.0),
              child: Icon(item['active']),
            ),
            label: item['label'],
          );
        }).toList(),
      ),
    );
  }
}
