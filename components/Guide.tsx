import React from 'react';
import { ArrowLeft, GitMerge, Check, Copy, ArrowDown, ArrowUp, MousePointerClick, Plus, AlertTriangle, Code } from 'lucide-react';
import { Button } from './Button';

interface GuideProps {
  onBack: () => void;
}

export const Guide: React.FC<GuideProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Sticky */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-tech-light/30 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} icon={<ArrowLeft size={18} />}>
                Kembali ke Aplikasi
            </Button>
            <span className="text-sm font-bold font-heading text-tech-black hidden sm:inline">Panduan Pengguna</span>
        </div>
      </div>

      {/* Main Content - Native Scroll */}
      <div className="max-w-4xl mx-auto px-4 py-12 pb-32">
            
            {/* Intro */}
            <div className="text-center space-y-6 mb-16">
                <div className="inline-flex items-center justify-center p-4 bg-tech-black text-white rounded-2xl shadow-lg transform -rotate-3">
                    <GitMerge size={40} />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold font-heading text-tech-black mb-3">Cara Menggunakan Smart Merge</h1>
                    <p className="text-lg text-tech-dim max-w-2xl mx-auto font-sans leading-relaxed">
                        Tutorial praktis menggabungkan dua teks (atau lebih) dan menyelesaikan perbedaan di antaranya.
                    </p>
                </div>
            </div>

            <div className="space-y-16 relative">
                {/* Connecting Line */}
                <div className="absolute left-4 md:left-8 top-8 bottom-8 w-0.5 bg-tech-light/20 hidden md:block"></div>

                {/* Step 1: Input */}
                <section className="relative pl-0 md:pl-20">
                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 rounded-full bg-tech-black text-white items-center justify-center font-bold text-xl border-4 border-white shadow-lg z-10">1</div>
                    <div className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-tech-black text-white font-bold mb-4">1</div>
                    
                    <h2 className="text-2xl font-bold font-heading text-tech-black mb-4">Masukkan Teks</h2>
                    <p className="text-tech-dim mb-6 font-sans">
                        Siapkan teks yang ingin digabung. Misalnya, Anda punya <strong>Draft Awal</strong> dan <strong>Revisi Dosen</strong>.
                    </p>

                    {/* Visual Example: Input */}
                    <div className="bg-gray-50 rounded-xl border border-tech-light/40 p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-lg border border-tech-light/30 shadow-sm">
                                <div className="text-xs font-bold text-tech-light uppercase mb-2">Version 1 (Draft Awal)</div>
                                <div className="font-mono text-xs text-tech-black">
                                    Proyek ini harus selesai hari <span className="bg-rose-100 text-rose-700 px-1 rounded">Senin</span>.
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-tech-light/30 shadow-sm">
                                <div className="text-xs font-bold text-tech-light uppercase mb-2">Version 2 (Revisi)</div>
                                <div className="font-mono text-xs text-tech-black">
                                    Proyek ini harus selesai hari <span className="bg-emerald-100 text-emerald-700 px-1 rounded">Rabu</span>.
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-xs text-tech-dim font-sans italic">Klik tombol "Merge" setelah teks dimasukkan.</span>
                        </div>
                    </div>
                </section>

                {/* Step 2: Conflict Resolution */}
                <section className="relative pl-0 md:pl-20">
                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 rounded-full bg-tech-black text-white items-center justify-center font-bold text-xl border-4 border-white shadow-lg z-10">2</div>
                    <div className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-tech-black text-white font-bold mb-4">2</div>

                    <h2 className="text-2xl font-bold font-heading text-tech-black mb-4">Selesaikan Konflik</h2>
                    <p className="text-tech-dim mb-6 font-sans">
                        Aplikasi akan mendeteksi perbedaan dan menandainya sebagai <strong>Konflik</strong>. Tugas Anda adalah memilih mana yang benar.
                    </p>

                    {/* Visual Example: Conflict Card */}
                    <div className="bg-white rounded-xl border-2 border-amber-200 overflow-hidden shadow-sm max-w-lg">
                        <div className="bg-amber-50 p-2 px-4 border-b border-amber-100 flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-600" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Contoh Tampilan Konflik</span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            {/* Option A Mock */}
                            <div className="border border-tech-light/30 rounded-lg p-3 hover:border-tech-dim cursor-pointer transition-colors relative">
                                <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-tech-light font-bold">PILIHAN A</span>
                                <p className="font-mono text-sm">Senin</p>
                            </div>
                            {/* Option B Mock */}
                            <div className="border border-tech-light/30 rounded-lg p-3 hover:border-tech-dim cursor-pointer transition-colors relative">
                                <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-tech-light font-bold">PILIHAN B</span>
                                <p className="font-mono text-sm">Rabu</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 border-t border-tech-light/20 flex flex-wrap gap-2 justify-center">
                            <div className="px-2 py-1 bg-white border border-tech-light/30 rounded text-xs text-tech-dim font-mono">Merge (A+B)</div>
                            <div className="px-2 py-1 bg-white border border-tech-light/30 rounded text-xs text-tech-dim font-mono">Merge (B+A)</div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-gray-50 border border-tech-light/20">
                            <strong className="block text-tech-black mb-1 font-heading text-sm">Pilih Salah Satu (A atau B)</strong>
                            <p className="text-xs text-tech-dim">Jika salah satu versi salah, klik kotak versi yang benar.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 border border-tech-light/20">
                            <strong className="block text-tech-black mb-1 font-heading text-sm">Gabung Keduanya (Merge)</strong>
                            <p className="text-xs text-tech-dim">
                                Gunakan tombol panah bawah <ArrowDown size={10} className="inline"/> untuk menggabungkan kedua teks (A lalu B).
                            </p>
                        </div>
                    </div>
                </section>

                {/* Step 3: Result */}
                <section className="relative pl-0 md:pl-20">
                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 rounded-full bg-tech-black text-white items-center justify-center font-bold text-xl border-4 border-white shadow-lg z-10">3</div>
                    <div className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-tech-black text-white font-bold mb-4">3</div>

                    <h2 className="text-2xl font-bold font-heading text-tech-black mb-4">Lihat & Simpan Hasil</h2>
                    <p className="text-tech-dim mb-6 font-sans">
                        Setelah semua kotak konflik berubah menjadi hijau (Resolved), lihat hasil akhirnya.
                    </p>

                    <div className="bg-tech-black rounded-xl p-6 text-white shadow-xl max-w-lg">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                            <span className="text-xs font-mono text-gray-400">FINAL RESULT</span>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            </div>
                        </div>
                        <p className="font-mono text-sm leading-relaxed text-gray-300">
                            Proyek ini harus selesai hari Rabu.
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
                             <span className="inline-flex items-center px-3 py-1.5 rounded bg-white/10 text-xs font-medium text-white">
                                <Copy size={12} className="mr-2"/> Copy Text
                            </span>
                        </div>
                    </div>
                </section>

            </div>

            <div className="text-center mt-20 flex flex-col items-center gap-4">
                <Button onClick={onBack} className="px-10 py-4 text-lg shadow-xl hover:shadow-2xl transform transition hover:-translate-y-1">
                    Coba Sekarang
                </Button>
                <p className="text-xs text-tech-light">Ingin tahu cara kerjanya secara teknis? Lihat <span className="underline cursor-pointer hover:text-tech-black">Dokumentasi Teknis</span> di menu utama.</p>
            </div>
      </div>
    </div>
  );
};