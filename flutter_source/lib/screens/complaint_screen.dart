import 'package:flutter/material.dart';
import '../core/theme.dart';

class ComplaintScreen extends StatelessWidget {
  const ComplaintScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        // Dummy logic untuk warna status
        String status = index % 3 == 0 ? 'Menunggu' : (index % 2 == 0 ? 'Proses' : 'Selesai');
        Color statusBgColor = status == 'Selesai' ? Colors.green.shade100 : (status == 'Proses' ? Colors.orange.shade100 : Colors.red.shade100);
        Color statusTextColor = status == 'Selesai' ? Colors.green.shade700 : (status == 'Proses' ? Colors.orange.shade800 : Colors.red.shade700);

        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Klien: Budi Santoso', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusBgColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(status, style: TextStyle(color: statusTextColor, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Internet mati sejak pagi, lampu loss merah di modem indikator berkedip.', 
                  style: TextStyle(color: Colors.black87)
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('14 Okt 2023 - 09:30 WIB', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                    TextButton(
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      onPressed: () {},
                      child: const Text('Detail', style: TextStyle(color: AppTheme.fGreen)),
                    )
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
