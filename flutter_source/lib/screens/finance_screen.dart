import 'package:flutter/material.dart';
import '../core/theme.dart';

class FinanceScreen extends StatelessWidget {
  const FinanceScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          Container(
            color: Colors.white,
            child: const TabBar(
              labelColor: AppTheme.fGreen,
              unselectedLabelColor: Colors.grey,
              indicatorColor: AppTheme.fGreen,
              tabs: [
                Tab(text: 'Billing'),
                Tab(text: 'Pengeluaran'),
                Tab(text: 'Kolektor'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildList('Tagihan Pelanggan', Icons.payment, Colors.blue),
                _buildList('Catatan Pengeluaran', Icons.money_off, Colors.red),
                _buildList('Tugas Kolektor', Icons.directions_bike, Colors.orange),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildList(String title, IconData icon, Color iconColor) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 6,
      itemBuilder: (context, index) {
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: CircleAvatar(
              backgroundColor: iconColor.withOpacity(0.1),
              child: Icon(icon, color: iconColor),
            ),
            title: Text('$title #${index + 1}', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: const Text('Rp 150.000 - 12 Okt 2023\nStatus: Selesai', style: TextStyle(height: 1.5)),
            isThreeLine: true,
            trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
            onTap: () {},
          ),
        );
      },
    );
  }
}
