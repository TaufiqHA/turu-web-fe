import 'package:flutter/material.dart';
import '../core/theme.dart';

class InventoryScreen extends StatelessWidget {
  const InventoryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: BorderSide(color: Colors.grey.shade200),
                  ),
                  child: const TextField(
                    decoration: InputDecoration(
                      hintText: 'Cari SN atau tipe modem...',
                      prefixIcon: Icon(Icons.search, color: Colors.grey),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      fillColor: Colors.transparent,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.fDark,
                  padding: const EdgeInsets.all(16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {}, // Pindah ke ScanModemScreen (nantinya)
                child: const Icon(Icons.qr_code_scanner, color: Colors.white),
              )
            ],
          ),
        ),
        
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: 8,
            itemBuilder: (context, index) {
              return Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: Colors.grey.shade200),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: const Icon(Icons.router, color: AppTheme.fDark, size: 36),
                  title: Text('Modem ZTE F609 - Unit ${index + 1}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Padding(
                    padding: EdgeInsets.only(top: 8.0),
                    child: Text('SN: ZTE123456789\nMAC: 00:1A:2B:3C:4D', style: TextStyle(height: 1.4)),
                  ),
                  isThreeLine: true,
                  trailing: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.fGreenLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('Tersedia', style: TextStyle(color: AppTheme.fGreen, fontSize: 10, fontWeight: FontWeight.bold)),
                  )
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
