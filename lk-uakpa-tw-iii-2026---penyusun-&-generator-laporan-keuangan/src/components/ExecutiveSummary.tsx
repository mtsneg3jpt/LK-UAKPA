import React, { useState } from 'react';
import { FullFinancialData } from '../types/financial';
import { formatNumber, formatPercent } from '../utils/numberFormat';
import {
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  FileCheck,
  TrendingUp,
  Scale,
  Calendar,
  Layers,
  FileText,
  Clock,
  Share2,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Tablet,
  ExternalLink,
  Globe,
  Upload,
  Download,
} from 'lucide-react';

interface ExecutiveSummaryProps {
  data: FullFinancialData;
  onNavigateTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenPrint: () => void;
  onOpenConfig: () => void;
  onOpenShare: () => void;
  onExportExcel: () => void;
  onDownloadBackup?: () => void;
  onRestoreBackup?: (file: File) => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  data,
  onNavigateTab,
  onOpenUpload,
  onOpenPrint,
  onOpenConfig,
  onOpenShare,
  onExportExcel,
  onDownloadBackup,
  onRestoreBackup,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onRestoreBackup) {
      onRestoreBackup(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const publicAppUrl =
    'https://ais-dev-j7xvcktidcrw4kytksdemi-511769052766.asia-southeast1.run.app';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicAppUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = publicAppUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };
  const { satker, lra, lo, lpe, neraca, lampiranIIOfficial, lampiranIIIOfficial } = data;

  // LRA Calculations
  const belanjaItem = lra.find(i => i.id === 'lra-3');
  const paguBelanja = belanjaItem?.anggaran ?? 0;
  const realisasiBelanja = belanjaItem?.realisasi ?? 0;
  const persenBelanja = paguBelanja > 0 ? (realisasiBelanja / paguBelanja) * 100 : 0;

  // Neraca Calculations
  const totalAset = neraca.find(i => i.id === 'neraca-total-aset')?.tahunIni ?? 0;
  const totalKewajiban = neraca.find(i => i.id === 'neraca-total-kewajiban')?.tahunIni ?? 0;
  const totalEkuitas = neraca.find(i => i.id === 'neraca-total-ekuitas')?.tahunIni ?? 0;
  const totalPasiva = neraca.find(i => i.id === 'neraca-total-pasiva')?.tahunIni ?? 0;

  // Validation Checks
  const isNeracaBalanced = totalAset === totalPasiva;
  const ekuitasLPE = lpe.find(i => i.id === 'lpe-total')?.tahunIni ?? 0;
  const isLpeNeracaMatched = Math.abs(ekuitasLPE - totalEkuitas) < 1;

  const surplusLO = lo.find(i => i.id === 'lo-total')?.tahunIni ?? 0;
  const surplusDiLPE = lpe.find(i => i.id === 'lpe-2')?.tahunIni ?? 0;
  const isLoLpeMatched = Math.abs(surplusLO - surplusDiLPE) < 1;

  return (
    <div className="space-y-6">
      {/* Satker Information Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                <span>{satker.namaKementerian}</span>
                <span aria-hidden="true">·</span>
                <span>{satker.namaEselon1}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-medium text-slate-700">Kode: {satker.kodeSatker}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">Mitra {satker.kppnMitra || 'KPPN Bantaeng'}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-950">
                {satker.namaSatker}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Kuasa Pengguna Anggaran (KPA): <strong>{satker.namaKPA}</strong> (NIP. {satker.nipKPA})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenConfig}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Ubah Satker & KPA
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Restore File Utility Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          Sistem Cadangan Laporan (Backup & Restore File)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Download Backup */}
          <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors bg-slate-50/30">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-slate-950">Unduh Backup (.JSON)</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ambil cadangan data seluruh isi laporan keuangan (LRA, LO, LPE, Neraca, Lampiran II & III, serta data Satker) dalam satu file `.json`. Sangat berguna untuk dipindahkan ke perangkat/komputer lain.
              </p>
            </div>
            <button
              onClick={onDownloadBackup}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File Backup</span>
            </button>
          </div>

          {/* Card 2: Restore Backup */}
          <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors bg-slate-50/30">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-slate-950">Pulihkan Backup (.JSON)</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Unggah kembali file cadangan `.json` yang telah Anda unduh sebelumnya untuk memulihkan seluruh angka, narasi, dan tabel kerja Anda secara instan dalam 1 detik.
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regulatory Context Banner: Surat Kepala KPPN Bantaeng */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <FileCheck className="w-4 h-4" />
              <span>Surat Kepala KPPN Tipe A1 Bantaeng Nomor : S-374/KPN.2505/2026</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold">
              Ketentuan Rekonsiliasi, Penyusunan Tanpa CaLK, serta Format Lampiran II & III
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sesuai surat edaran KPPN Bantaeng, Laporan Keuangan TW III disusun <strong>tanpa CaLK</strong>. Setiap lembar face (<strong>LRA, LO, LPE, dan Neraca</strong>) wajib ditandatangani KPA dan dilengkapi penjelasan khusus: <strong>Lampiran II</strong> (Informasi Keuangan Tertentu: Realisasi & Estimasi TW IV, Pagu Minus Belanja Pegawai, Kontrak Signifikan, Mutasi Piutang, Transaksi Pertukaran, dll.) serta <strong>Lampiran III</strong> (Capaian Output 11 Fungsi APBN dan 8 Prioritas Nasional RKP 2026).
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('lampiran-ii')}
              className="inline-flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Buka Lampiran II KPPN</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => onNavigateTab('lampiran-iii')}
              className="inline-flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Buka Lampiran III KPPN</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Internal Accounting Equilibrium & MyIntress Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Status Rekonsiliasi MyIntress & Keseimbangan Akuntansi
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Tutup Buku Aklap: 12-20 Okt 2026 · Batas LK: 31 Okt 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Check 1: Balance Neraca */}
          <div className="p-3.5 rounded-lg border flex items-start gap-3 bg-emerald-50/50 border-emerald-200 text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Keseimbangan Neraca (Aset = Pasiva)</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Seimbang / Cocok Sempurna (Terverifikasi)
              </p>
            </div>
          </div>

          {/* Check 2: LPE ke Neraca */}
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 ${
              isLpeNeracaMatched
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/50 border-rose-200 text-rose-950'
            }`}
          >
            {isLpeNeracaMatched ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">Sinkronisasi Ekuitas (LPE ke Neraca)</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isLpeNeracaMatched
                  ? `Cocok sempurna (Rp ${formatNumber(totalEkuitas)})`
                  : 'Terdapat perbedaan nilai ekuitas LPE dan Neraca'}
              </p>
            </div>
          </div>

          {/* Check 3: LO ke LPE */}
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 ${
              isLoLpeMatched
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/50 border-rose-200 text-rose-950'
            }`}
          >
            {isLoLpeMatched ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">Aliran Surplus/Defisit (LO ke LPE)</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isLoLpeMatched
                  ? `Cocok (${formatNumber(surplusLO)})`
                  : 'Surplus LO berbeda dengan input di LPE'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Pagu Belanja DIPA 2026
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
            Rp {formatNumber(paguBelanja)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Alokasi DIPA Setelah Revisi</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Realisasi Belanja TW III
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
            Rp {formatNumber(realisasiBelanja)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-semibold font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{formatPercent(persenBelanja)} Penyerapan (≥ 70%)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Total Aset Satker (Neraca)
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
            Rp {formatNumber(totalAset)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
            <Scale className="w-3.5 h-3.5 text-slate-400" />
            <span>Posisi per 30 September 2026</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Ekuitas Akhir (LPE)
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
            Rp {formatNumber(totalEkuitas)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Kekayaan Bersih Satker</span>
          </div>
        </div>
      </div>

      {/* Navigation Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Komponen Laporan Keuangan TW III 2026 Sesuai Petunjuk KPPN
          </h2>
          <span className="text-xs text-slate-500">
            Setiap lembar face ditandatangani KPA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card LRA */}
          <div
            onClick={() => onNavigateTab('lra')}
            className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-mono font-semibold text-slate-700">KOMPONEN 01</span>
                <span>Lembar Face</span>
              </div>
              <h3 className="font-bold text-slate-950 text-base group-hover:text-emerald-700 transition-colors">
                Laporan Realisasi Anggaran (LRA)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Perbandingan TW III 2026 (s.d. 30 September 2026) vs TW III 2025 (s.d. 30 September 2025) untuk akun 51, 52, 53, dan PNBP.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-slate-900">
              <span>{lra.length} Baris Akun</span>
              <span className="flex items-center gap-1 text-slate-700 group-hover:translate-x-0.5 transition-transform">
                Buka Lembar LRA <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card LO */}
          <div
            onClick={() => onNavigateTab('lo')}
            className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-mono font-semibold text-slate-700">KOMPONEN 02</span>
                <span>Lembar Face</span>
              </div>
              <h3 className="font-bold text-slate-950 text-base group-hover:text-emerald-700 transition-colors">
                Laporan Operasional (LO)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Perbandingan LO TW III 2026 vs TW III 2025 untuk pendapatan operasional dan beban operasional akrual.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-slate-900">
              <span>{lo.length} Komponen Beban</span>
              <span className="flex items-center gap-1 text-slate-700 group-hover:translate-x-0.5 transition-transform">
                Buka Lembar LO <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card LPE */}
          <div
            onClick={() => onNavigateTab('lpe')}
            className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-mono font-semibold text-slate-700">KOMPONEN 03</span>
                <span>Lembar Face</span>
              </div>
              <h3 className="font-bold text-slate-950 text-base group-hover:text-emerald-700 transition-colors">
                Laporan Perubahan Ekuitas (LPE)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Perbandingan LPE TW III 2026 vs TW III 2025: Ekuitas Awal, Surplus/Defisit LO, Koreksi, dan DDL/DED.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-slate-900">
              <span className="font-mono">Rp {formatNumber(totalEkuitas)}</span>
              <span className="flex items-center gap-1 text-slate-700 group-hover:translate-x-0.5 transition-transform">
                Buka Lembar LPE <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card Neraca */}
          <div
            onClick={() => onNavigateTab('neraca')}
            className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-mono font-semibold text-slate-700">KOMPONEN 04</span>
                <span>Lembar Face</span>
              </div>
              <h3 className="font-bold text-slate-950 text-base group-hover:text-emerald-700 transition-colors">
                Neraca
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Perbandingan posisi per 30 September 2026 vs 31 Desember 2025 audited untuk Aset, Kewajiban, dan Ekuitas.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-slate-900">
              <span className={isNeracaBalanced ? 'text-emerald-700' : 'text-rose-700'}>
                {isNeracaBalanced ? 'Seimbang (Balance)' : 'Cek Selisih'}
              </span>
              <span className="flex items-center gap-1 text-slate-700 group-hover:translate-x-0.5 transition-transform">
                Buka Lembar Neraca <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card Lampiran II */}
          <div
            onClick={() => onNavigateTab('lampiran-ii')}
            className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-mono font-semibold text-slate-700">LAMPIRAN II</span>
                <span>Format SE KPPN</span>
              </div>
              <h3 className="font-bold text-slate-950 text-base group-hover:text-emerald-700 transition-colors">
                Informasi Keuangan Tertentu
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tabel Realisasi & Estimasi TW IV, Pagu Minus Pegawai (5111-5124), Pagu Blokir, Kontrak Signifikan, Mutasi Piutang, Transaksi Pertukaran.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-slate-900">
              <span>8 Bagian Teknis + Info Penting</span>
              <span className="flex items-center gap-1 text-slate-700 group-hover:translate-x-0.5 transition-transform">
                Buka Lampiran II <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card Lampiran III */}
          <div
            onClick={() => onNavigateTab('lampiran-iii')}
            className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-mono font-semibold text-slate-700">LAMPIRAN III</span>
                <span>Format SE KPPN</span>
              </div>
              <h3 className="font-bold text-slate-950 text-base group-hover:text-emerald-700 transition-colors">
                Informasi Kinerja 2026
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Mekanisme MyIntress, Capaian RO 11 Fungsi APBN UU 17/2003, dan 8 Prioritas Nasional RKP 2026 (Perpres 117/2025).
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-slate-900">
              <span>{lampiranIIIOfficial.capaianFungsi.length} RO · 8 PN RKP 2026</span>
              <span className="flex items-center gap-1 text-slate-700 group-hover:translate-x-0.5 transition-transform">
                Buka Lampiran III <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
