import 'package:flutter/material.dart';
import '../core/theme.dart';

class MapScreen extends StatelessWidget {
  const MapScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Placeholder untuk Peta Asli (flutter_map / google_maps_flutter)
        Container(
          color: Colors.grey.shade200,
          child: const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.map_outlined, size: 80, color: Colors.grey),
                SizedBox(height: 16),
                Text(
                  'Map View Placeholder\n(Gunakan flutter_map di layer ini)', 
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)
                ),
              ],
            ),
          ),
        ),
        
        // Komponen Overlay: Search Bar
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const TextField(
                    decoration: InputDecoration(
                      hintText: 'Cari lokasi pelanggan...',
                      prefixIcon: Icon(Icons.search, color: Colors.grey),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      fillColor: Colors.transparent,
                    ),
                  ),
                ),
                const Spacer(),
                
                // Komponen Overlay: Floating Action Buttons (FAB) Peta
                Align(
                  alignment: Alignment.bottomRight,
                  child: Column(
                    children: [
                      FloatingActionButton(
                        heroTag: 'refresh_map',
                        backgroundColor: Colors.white,
                        foregroundColor: AppTheme.fDark,
                        mini: true,
                        onPressed: () {},
                        child: const Icon(Icons.refresh),
                      ),
                      const SizedBox(height: 8),
                      FloatingActionButton(
                        heroTag: 'my_location',
                        backgroundColor: AppTheme.fGreen,
                        foregroundColor: Colors.white,
                        onPressed: () {},
                        child: const Icon(Icons.my_location),
                      ),
                    ],
                  ),
                )
              ],
            ),
          ),
        ),
      ],
    );
  }
}
