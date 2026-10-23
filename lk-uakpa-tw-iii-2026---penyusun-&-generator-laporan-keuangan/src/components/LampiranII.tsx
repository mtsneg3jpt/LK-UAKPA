import React, { useRef, useState } from 'react';
import { LampiranIIData, LRAItem, SatkerProfile } from '../types/financial';
import { KpaSignatureBlock } from './KpaSignatureBlock';
import { formatNumber, formatPercent } from '../utils/numberFormat';
import {
  Edit3,
  Check,
  Info,
  Shield,
  RotateCcw,
  Calculator,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  RefreshCw,
} from 'lucide-react';

interface LampiranIIProps {
  satker: SatkerProfile;
  lampiranII: LampiranIIData;
  onUpdateLampiranII: (data: LampiranIIData) => void;
  showDigitalStamp: boolean;
  lra?: LRAItem[];
  onUploadLRAFile?: (file: File) => Promise<void>;
  onSyncFromLRA?: () => void;
}

export const LampiranII: React.FC<LampiranIIProps> = ({
  satker,
  lampiranII,
  onUpdateLampiranII,
  showDigitalStamp,
  lra,
  onUploadLRAFile,
  onSyncFromLRA,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<LampiranIIData>({ ...lampiranII });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal state when prop changes while not editing
  React.useEffect(() => {
    if (!isEditing) {
      setFormData({ ...lampiranII });
    }
  }, [lampiranII, isEditing]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      if (onUploadLRAFile) {
        await onUploadLRAFile(file);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ========================================================
  // PERHITUNGAN RUMUS OTOMATIS (Penjumlahan, Pengurangan, Total)
  // ========================================================

  // 1.a Estimasi Belanja
  const totalPagu1a = formData.estimasiBelanja.reduce((acc, i) => acc + (Number(i.pagu) || 0), 0);
  const totalRealTW3_1a = formData.estimasiBelanja.reduce((acc, i) => acc + (Number(i.realisasiTW3) || 0), 0);
  const totalRealLalu_1a = formData.estimasiBelanja.reduce((acc, i) => acc + (Number(i.realisasiLalu) || 0), 0);
  const totalSisaTW3_1a = totalPagu1a - totalRealTW3_1a;
  const totalRencanaTW4_1a = formData.estimasiBelanja.reduce((acc, i) => acc + (Number(i.rencanaTW4) || 0), 0);
  const totalEstimasiTotal_1a = totalRealTW3_1a + totalRencanaTW4_1a;
  const totalTidakTerealisasi_1a = totalPagu1a - totalEstimasiTotal_1a;
  const persenReal1a = totalPagu1a > 0 ? (totalRealTW3_1a / totalPagu1a) * 100 : 0;
  const persenEstTotal1a = totalPagu1a > 0 ? (totalEstimasiTotal_1a / totalPagu1a) * 100 : 0;

  // 1.b Pagu Minus Pegawai
  const totalPaguPegawai = formData.paguMinusPegawai.reduce((acc, i) => acc + (Number(i.pagu) || 0), 0);
  const totalRealPegawai = formData.paguMinusPegawai.reduce((acc, i) => acc + (Number(i.realisasiTW3) || 0), 0);
  const totalTW4Pegawai = formData.paguMinusPegawai.reduce((acc, i) => acc + (Number(i.rencanaTW4) || 0), 0);
  const totalEstPegawai = totalRealPegawai + totalTW4Pegawai;
  const totalSisaMinusPegawai = totalPaguPegawai - totalEstPegawai;
  const persenRealPegawai = totalPaguPegawai > 0 ? (totalRealPegawai / totalPaguPegawai) * 100 : 0;

  // 1.c Pagu Blokir
  const totalPaguBlokir = formData.paguBlokir.reduce((acc, i) => acc + (Number(i.pagu) || 0), 0);
  const totalNilaiBlokir = formData.paguBlokir.reduce((acc, i) => acc + (Number(i.blokirPagu) || 0), 0);
  const totalBukaBlokir = formData.paguBlokir.reduce((acc, i) => acc + (Number(i.nilaiBukaBlokir) || 0), 0);

  // 2.a Outstanding Kontrak Eselon
  const totalJmlKontrak2a = formData.outstandingKontrakEselon.reduce((acc, i) => acc + (Number(i.jumlahKontrak) || 0), 0);
  const totalNilaiKontrak2a = formData.outstandingKontrakEselon.reduce((acc, i) => acc + (Number(i.nilaiTotalKontrak) || 0), 0);
  const totalRealKontrak2a = formData.outstandingKontrakEselon.reduce((acc, i) => acc + (Number(i.realisasi) || 0), 0);
  const totalSisaKontrak2a = totalNilaiKontrak2a - totalRealKontrak2a;

  // 2.b Outstanding Kontrak Signifikan
  const totalNilaiKontrak2b = formData.outstandingKontrakSignifikan.reduce((acc, i) => acc + (Number(i.nilaiKontrak) || 0), 0);
  const totalRealKontrak2b = formData.outstandingKontrakSignifikan.reduce((acc, i) => acc + (Number(i.realisasi) || 0), 0);
  const totalSisaKontrak2b = totalNilaiKontrak2b - totalRealKontrak2b;

  // 4. Mutasi Piutang
  const totalSaldoAwal4 = formData.mutasiPiutang.reduce((acc, i) => acc + (Number(i.saldoNeraca2025) || 0), 0);
  const totalBaru4 = formData.mutasiPiutang.reduce((acc, i) => acc + (Number(i.baru) || 0), 0);
  const totalKoreksiTambah4 = formData.mutasiPiutang.reduce((acc, i) => acc + (Number(i.koreksiTambah) || 0), 0);
  const totalLainnyaTambah4 = formData.mutasiPiutang.reduce((acc, i) => acc + (Number(i.lainnyaTambah) || 0), 0);
  const totalPelunasan4 = formData.mutasiPiutang.reduce((acc, i) => acc + (Number(i.pelunasan) || 0), 0);
  const totalPenghapusan4 = formData.mutasiPiutang.reduce((acc, i) => acc + (Number(i.penghapusan) || 0), 0);
  const totalKoreksiKurang4 = formData.mutasiPiutang.reduce((acc, i) => acc + (Number(i.koreksiKurang) || 0), 0);
  const totalLainnyaKurang4 = formData.mutasiPiutang.reduce((acc, i) => acc + (Number(i.lainnyaKurang) || 0), 0);
  const totalTambah4 = totalBaru4 + totalKoreksiTambah4 + totalLainnyaTambah4;
  const totalKurang4 = totalPelunasan4 + totalPenghapusan4 + totalKoreksiKurang4 + totalLainnyaKurang4;
  const totalSaldoAkhir4 = totalSaldoAwal4 + totalTambah4 - totalKurang4;

  // 6. Transaksi Pertukaran
  const totalPertukaran6 = formData.transaksiPertukaran.reduce((acc, i) => acc + (Number(i.pertukaran) || 0), 0);
  const totalNonPertukaran6 = formData.transaksiPertukaran.reduce((acc, i) => acc + (Number(i.nonPertukaran) || 0), 0);
  const totalPendapatan6 = totalPertukaran6 + totalNonPertukaran6;

  // ========================================================
  // GENERATOR KALIMAT PENJELASAN OTOMATIS (ATAS & BAWAH TABEL)
  // ========================================================

  const narasi1aAtas = `Sampai dengan triwulan III tahun 2026, realisasi belanja telah mencapai sebesar Rp ${formatNumber(
    totalRealTW3_1a
  )} (${formatPercent(persenReal1a)} dari total pagu DIPA sebesar Rp ${formatNumber(
    totalPagu1a
  )}). Realisasi tersebut ${
    persenReal1a >= 70 ? 'telah memenuhi' : 'sedang dipacu untuk mendekati'
  } target penyerapan triwulan III (≥ 70%). Atas sisa pagu sebesar Rp ${formatNumber(
    totalSisaTW3_1a
  )} direncanakan akan direalisasikan optimal pada triwulan IV tahun 2026.${
    totalRealLalu_1a > 0
      ? ` Sebagai perbandingan kinerja, realisasi pada periode yang sama TA 2025 tercatat sebesar Rp ${formatNumber(
          totalRealLalu_1a
        )}.`
      : ''
  }`;

  const narasi1aBawah = `Dengan demikian, diperkirakan sampai dengan akhir tahun 2026 total realisasi adalah sebesar Rp ${formatNumber(
    totalEstimasiTotal_1a
  )} (${formatPercent(persenEstTotal1a)} dari total pagu) dan perkiraan pagu yang tidak terealisasi adalah sebesar Rp ${formatNumber(
    totalTidakTerealisasi_1a
  )} (efisiensi sisa tender dan penghematan belanja operasional).`;

  const narasi1b =
    totalSisaMinusPegawai < 0
      ? `Berdasarkan monitoring s.d. 30 September 2026, pada Satker ${satker.namaSatker} teridentifikasi potensi pagu minus belanja pegawai sebesar Rp ${formatNumber(
          Math.abs(totalSisaMinusPegawai)
        )} (total realisasi diproyeksikan Rp ${formatNumber(totalEstPegawai)} melampaui pagu Rp ${formatNumber(
          totalPaguPegawai
        )}). Terhadap potensi defisit tersebut, Satker telah menyusun langkah mitigasi berupa usulan revisi pergeseran pagu anggaran antar-akun/kegiatan ke Kanwil DJPb/KPPN Mitra.`
      : `Sampai dengan triwulan III tahun 2026, pada satker ${satker.namaSatker} tidak terdapat pagu minus belanja pegawai (Rp0,- / Nihil). Total pagu belanja pegawai sebesar Rp ${formatNumber(
          totalPaguPegawai
        )} dengan realisasi s.d. TW III sebesar Rp ${formatNumber(
          totalRealPegawai
        )} (${formatPercent(persenRealPegawai)}), rencana TW IV Rp ${formatNumber(
          totalTW4Pegawai
        )}, dan estimasi sisa pagu akhir tahun sebesar Rp ${formatNumber(
          totalSisaMinusPegawai
        )} (berada dalam batas pagu DIPA yang memadai).`;

  const narasi1c =
    totalNilaiBlokir > 0
      ? `Pada Satker ${satker.namaSatker} per 30 September 2026 terdapat pagu yang diblokir sebesar Rp ${formatNumber(
          totalNilaiBlokir
        )} dari total pagu Rp ${formatNumber(totalPaguBlokir)}. Atas pagu blokir tersebut telah direncanakan pembukaan blokir sebesar Rp ${formatNumber(
          totalBukaBlokir
        )} yang proses pembukaannya dikoordinasikan dengan Kementerian/Lembaga pembina dan DJA.`
      : `Pada tahun 2026 seluruh alokasi DIPA ${satker.namaSatker} berstatus terbuka (tidak terdapat pagu yang diblokir oleh DJA/Kanwil DJPb). Nilai pagu blokir adalah Rp0,- (Nihil).`;

  const narasi2 =
    totalJmlKontrak2a > 0 || totalNilaiKontrak2a > 0 || totalNilaiKontrak2b > 0
      ? `Sampai dengan triwulan III tahun 2026, pada satker ${satker.namaSatker} tercatat sebanyak ${
          totalJmlKontrak2a || 1
        } kontrak dengan total nilai kontrak sebesar Rp ${formatNumber(
          totalNilaiKontrak2a || totalNilaiKontrak2b
        )}, realisasi pembayaran sebesar Rp ${formatNumber(
          totalRealKontrak2a || totalRealKontrak2b
        )}, dan sisa nilai kontrak sebesar Rp ${formatNumber(
          totalSisaKontrak2a || totalSisaKontrak2b
        )} yang akan diselesaikan pembayarannya pada Triwulan IV tahun 2026.`
      : `Sampai dengan triwulan III tahun 2026, pada satker ${satker.namaSatker} tidak terdapat outstanding kontrak belanja modal/signifikan yang menunggak atau seluruh kontrak berjalan sesuai jadwal termin pelaksanaan pekerjaan (Nihil).`;

  const narasi4 =
    totalSaldoAwal4 > 0 || totalTambah4 > 0 || totalSaldoAkhir4 > 0
      ? `Sampai dengan triwulan III tahun 2026, terdapat mutasi piutang dengan saldo awal audited 2025 sebesar Rp ${formatNumber(
          totalSaldoAwal4
        )}, penambahan mutasi sebesar Rp ${formatNumber(
          totalTambah4
        )}, dan pengurangan mutasi sebesar Rp ${formatNumber(
          totalKurang4
        )}, sehingga saldo piutang per 30 September 2026 adalah sebesar Rp ${formatNumber(
          totalSaldoAkhir4
        )} (kolektibilitas lancar). Satker tidak memiliki piutang TP/TGR bermasalah.`
      : `Sampai dengan triwulan III tahun 2026, Satker ${satker.namaSatker} tidak memiliki saldo piutang macet/signifikan (saldo nihil) dan seluruh penerimaan PNBP telah disetor langsung ke Kas Negara.`;

  const narasi6 =
    totalPendapatan6 > 0
      ? `Per 30 September 2026, realisasi pendapatan Satker ${satker.namaSatker} terdiri dari transaksi pertukaran sebesar Rp ${formatNumber(
          totalPertukaran6
        )} dan transaksi nonpertukaran sebesar Rp ${formatNumber(
          totalNonPertukaran6
        )}, sehingga total pendapatan adalah sebesar Rp ${formatNumber(totalPendapatan6)}.`
      : `Per 30 September 2026, realisasi pendapatan Satker ${satker.namaSatker} tercatat sebesar Rp0,- (Nihil) baik dari transaksi pertukaran maupun nonpertukaran.`;

  // ========================================================
  // ACTIONS: RESET, SAVE, CANCEL
  // ========================================================

  const handleResetToZero = () => {
    const zeroData: LampiranIIData = {
      ...formData,
      narasiRealisasiBelanja: `Sampai dengan triwulan III tahun 2026, realisasi belanja telah mencapai sebesar Rp 0 (0,00% dari total pagu DIPA sebesar Rp 0). Realisasi tersebut sedang dipacu untuk mendekati target penyerapan triwulan III (≥ 70%). Atas sisa pagu sebesar Rp 0 direncanakan akan direalisasikan optimal pada triwulan IV tahun 2026.`,
      estimasiBelanja: formData.estimasiBelanja.map(b => ({
        ...b,
        pagu: 0,
        realisasiTW3: 0,
        sisaPaguTW3: 0,
        rencanaTW4: 0,
        estimasiTotal: 0,
        estimasiTidakTerealisasi: 0,
      })),
      narasiPaguMinusPegawai: `Sampai dengan triwulan III tahun 2026, pada satker ${satker.namaSatker} tidak terdapat pagu minus belanja pegawai (Rp0,- / Nihil).`,
      paguMinusPegawai: formData.paguMinusPegawai.map(p => ({
        ...p,
        pagu: 0,
        realisasiTW3: 0,
        rencanaTW4: 0,
        totalRealisasi: 0,
        estimasiSisaMinus: 0,
      })),
      narasiPaguBlokir: `Pada tahun 2026 seluruh alokasi DIPA ${satker.namaSatker} berstatus terbuka (tidak terdapat pagu yang diblokir oleh DJA/Kanwil DJPb). Nilai pagu blokir adalah Rp0,- (Nihil).`,
      paguBlokir: formData.paguBlokir.map(pb => ({
        ...pb,
        pagu: 0,
        blokirPagu: 0,
        nilaiBukaBlokir: 0,
        tanggalRencanaBuka: '-',
      })),
      narasiOutstandingKontrak: `Sampai dengan triwulan III tahun 2026, pada satker ${satker.namaSatker} tidak terdapat outstanding kontrak belanja modal/signifikan yang menunggak (Nihil).`,
      outstandingKontrakEselon: formData.outstandingKontrakEselon.map(k => ({
        ...k,
        jumlahKontrak: 0,
        nilaiTotalKontrak: 0,
        realisasi: 0,
        sisaNilaiKontrak: 0,
      })),
      outstandingKontrakSignifikan: formData.outstandingKontrakSignifikan.map(k => ({
        ...k,
        nilaiKontrak: 0,
        realisasi: 0,
        sisa: 0,
      })),
      narasiMutasiPiutang: `Sampai dengan triwulan III tahun 2026, Satker ${satker.namaSatker} tidak memiliki saldo piutang macet/signifikan (saldo nihil).`,
      mutasiPiutang: formData.mutasiPiutang.map(m => ({
        ...m,
        saldoNeraca2025: 0,
        baru: 0,
        koreksiTambah: 0,
        lainnyaTambah: 0,
        pelunasan: 0,
        penghapusan: 0,
        koreksiKurang: 0,
        lainnyaKurang: 0,
        saldoNeracaTW3_2026: 0,
      })),
      narasiPertukaran: `Per 30 September 2026, realisasi pendapatan Satker ${satker.namaSatker} tercatat sebesar Rp0,- (Nihil).`,
      transaksiPertukaran: formData.transaksiPertukaran.map(t => ({
        ...t,
        pertukaran: 0,
        nonPertukaran: 0,
        nilaiTotal: 0,
      })),
    };
    setFormData(zeroData);
  };

  const handleSave = () => {
    // When saving, package data with latest calculated values and narratives
    const savedData: LampiranIIData = {
      ...formData,
      narasiRealisasiBelanja: narasi1aAtas,
      narasiPaguMinusPegawai: narasi1b,
      narasiPaguBlokir: narasi1c,
      narasiOutstandingKontrak: narasi2,
      narasiMutasiPiutang: narasi4,
      narasiPertukaran: narasi6,
      estimasiBelanja: formData.estimasiBelanja.map(b => {
        const p = Number(b.pagu) || 0;
        const r = Number(b.realisasiTW3) || 0;
        const tw4 = Number(b.rencanaTW4) || 0;
        const estTotal = r + tw4;
        return {
          ...b,
          pagu: p,
          realisasiTW3: r,
          sisaPaguTW3: p - r,
          rencanaTW4: tw4,
          estimasiTotal: estTotal,
          estimasiTidakTerealisasi: p - estTotal,
        };
      }),
      paguMinusPegawai: formData.paguMinusPegawai.map(p => {
        const pagu = Number(p.pagu) || 0;
        const r = Number(p.realisasiTW3) || 0;
        const tw4 = Number(p.rencanaTW4) || 0;
        const tot = r + tw4;
        return {
          ...p,
          pagu,
          realisasiTW3: r,
          rencanaTW4: tw4,
          totalRealisasi: tot,
          estimasiSisaMinus: pagu - tot,
        };
      }),
      outstandingKontrakEselon: formData.outstandingKontrakEselon.map(k => {
        const n = Number(k.nilaiTotalKontrak) || 0;
        const r = Number(k.realisasi) || 0;
        return {
          ...k,
          nilaiTotalKontrak: n,
          realisasi: r,
          sisaNilaiKontrak: n - r,
        };
      }),
      outstandingKontrakSignifikan: formData.outstandingKontrakSignifikan.map(k => {
        const n = Number(k.nilaiKontrak) || 0;
        const r = Number(k.realisasi) || 0;
        return {
          ...k,
          nilaiKontrak: n,
          realisasi: r,
          sisa: n - r,
        };
      }),
      mutasiPiutang: formData.mutasiPiutang.map(m => {
        const sa = Number(m.saldoNeraca2025) || 0;
        const b = Number(m.baru) || 0;
        const kt = Number(m.koreksiTambah) || 0;
        const lt = Number(m.lainnyaTambah) || 0;
        const pel = Number(m.pelunasan) || 0;
        const peng = Number(m.penghapusan) || 0;
        const kk = Number(m.koreksiKurang) || 0;
        const lk = Number(m.lainnyaKurang) || 0;
        const akhir = sa + b + kt + lt - (pel + peng + kk + lk);
        return {
          ...m,
          saldoNeraca2025: sa,
          baru: b,
          koreksiTambah: kt,
          lainnyaTambah: lt,
          pelunasan: pel,
          penghapusan: peng,
          koreksiKurang: kk,
          lainnyaKurang: lk,
          saldoNeracaTW3_2026: akhir,
        };
      }),
      transaksiPertukaran: formData.transaksiPertukaran.map(t => {
        const p = Number(t.pertukaran) || 0;
        const np = Number(t.nonPertukaran) || 0;
        return {
          ...t,
          pertukaran: p,
          nonPertukaran: np,
          nilaiTotal: p + np,
        };
      }),
    };

    onUpdateLampiranII(savedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...lampiranII });
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-6 sm:p-10 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-none print:p-0">
      {/* Official Header per Surat Kepala KPPN Bantaeng */}
      <div className="relative text-right pb-3 mb-2 text-xs font-mono text-slate-800 avoid-break">
        <p className="font-bold text-slate-900">LAMPIRAN II</p>
        <p>Surat Kepala {satker.kppnMitra || 'KPPN Tipe A1 Bantaeng'}</p>
        <p>Nomor : {satker.nomorSuratEdaran || 'S-374/KPN.2505/2026'}</p>
        <p>Tanggal : {satker.tanggalSuratEdaran || '30 September 2026'}</p>
      </div>

      {/* Kop Surat with Synchronized Logo */}
      <div className="pb-4 mb-6 border-b-2 border-slate-900 avoid-break">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 text-center">
          {satker.customLogoUrl ? (
            <img
              src={satker.customLogoUrl}
              alt="Logo Resmi"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border border-slate-900 flex items-center justify-center bg-slate-50 shrink-0 print:border-black">
              <Shield className="w-6 h-6 text-slate-800 print:text-black" />
            </div>
          )}

          <div>
            <p className="text-xs sm:text-sm font-bold tracking-wider text-slate-800 uppercase">
              {satker.namaKementerian}
            </p>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700 uppercase">
              {satker.namaEselon1}
            </p>
            <p className="text-xs sm:text-sm font-medium text-slate-600 uppercase">
              SATUAN KERJA: {satker.namaSatker} ({satker.kodeSatker})
            </p>
          </div>
        </div>

        <div className="text-center mt-3">
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-950 uppercase">
            INFORMASI KEUANGAN TERTENTU DAN INFORMASI PENTING LAINNYA
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 uppercase mt-1">
            TRIWULAN III TAHUN ANGGARAN 2026
          </p>
          <p className="text-xs text-slate-600 italic mt-0.5">
            (Sebagai Penjelasan Pengganti CaLK pada Laporan Keuangan Triwulan III 2026)
          </p>
        </div>
      </div>

      {/* Editing Toolbar */}
      <div className="no-print mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-700">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium">
              Mode Edit Manual: Kolom rumus (penjumlahan, pengurangan, & total) dihitung otomatis dan tersinkron ke kalimat penjelasan.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isEditing ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium shadow-2xs transition-colors cursor-pointer"
                  title="Unggah berkas SAKTI LRA (Excel) langsung ke Lampiran II"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Menyusun...' : 'Upload SAKTI LRA'}</span>
                </button>

                {onSyncFromLRA && (
                  <button
                    onClick={onSyncFromLRA}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded font-medium shadow-2xs transition-colors cursor-pointer"
                    title="Perbarui angka belanja dan pagu minus dari LRA saat ini (2026 & 2025)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sinkronkan dari LRA</span>
                  </button>
                )}

                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Manual Nilai Tabel</span>
                </button>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleResetToZero}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-medium transition-colors cursor-pointer"
                  title="Kosongkan seluruh nilai tabel ke Rp 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kosongkan Semua (Reset Rp 0)</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded border border-emerald-200">
            <Calculator className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              <strong>Petunjuk:</strong> Masukkan angka pada kolom bernomor/input. Kolom hasil seperti <em>Sisa Pagu</em>, <em>Estimasi Total</em>, <em>Estimasi Tidak Terealisasi</em>, dan <em>Baris TOTAL</em> terkunci karena dihitung otomatis oleh sistem rumus.
            </span>
          </div>
        )}
      </div>

      <div className="space-y-8 print:space-y-3 text-xs leading-relaxed text-slate-800">
        {/* ======================================================== */}
        {/* A. INFORMASI KEUANGAN TERTENTU */}
        {/* ======================================================== */}
        <div>
          <h2 className="text-sm font-bold text-slate-950 uppercase border-b border-slate-900 pb-1 mb-4">
            A. INFORMASI KEUANGAN TERTENTU
          </h2>

          {/* 1. Informasi Pagu dan Realisasi Anggaran s.d. 30 September 2026 */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              1. Informasi Pagu dan Realisasi Anggaran s.d. 30 September 2026
            </h3>
            <p className="text-slate-700 text-justify">
              Kementerian/Lembaga diharapkan dapat memberikan informasi tambahan berupa penyebab, kendala, atau penjelasan lain terkait realisasi belanja dan estimasi realisasi, pagu minus belanja, serta rencana mitigasi pagu minus belanja pegawai.
            </p>

            {/* 1.a Realisasi Belanja & Estimasi */}
            <div className="p-4 border border-slate-300 rounded bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">
                  a. Informasi Realisasi Belanja dan Estimasi Realisasi
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  {isEditing ? 'Sinkron otomatis dengan angka tabel' : 'Tersinkron'}
                </span>
              </div>

              {/* Kalimat Penjelasan DI ATAS Tabel 1.a */}
              <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 italic leading-relaxed">
                &ldquo;{narasi1aAtas}&rdquo;
              </div>

              <p className="font-medium text-slate-800">
                Kementerian/Lembaga / Satker: <strong>{satker.namaSatker}</strong>
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
                      <th className="py-2 px-2 border-r border-slate-900 w-16">Jenis Belanja</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-left">Uraian</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-right w-28">Pagu</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-right w-28">Realisasi s.d. 30 Sep 2026</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-right w-28 bg-emerald-50/50">
                        Sisa Pagu s.d. 30 Sep 2026 <span className="text-[9px] font-normal block">(Rumus)</span>
                      </th>
                      <th className="py-2 px-2 border-r border-slate-900 text-right w-28">Rencana Realisasi TW IV</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-right w-28 bg-emerald-50/50">
                        Estimasi Total Realisasi <span className="text-[9px] font-normal block">(Rumus)</span>
                      </th>
                      <th className="py-2 px-2 border-r border-slate-900 text-right w-28 bg-emerald-50/50">
                        Estimasi Pagu Tidak Terealisasi <span className="text-[9px] font-normal block">(Rumus)</span>
                      </th>
                      <th className="py-2 px-2 text-right w-28 bg-slate-100 font-bold">
                        Realisasi s.d. 30 Sep 2025 <span className="text-[9px] font-normal block text-slate-600">(Komparatif TA Lalu)</span>
                      </th>
                    </tr>
                    <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-900 text-center font-mono">
                      <td className="py-0.5 border-r border-slate-900">1</td>
                      <td className="py-0.5 border-r border-slate-900">-</td>
                      <td className="py-0.5 border-r border-slate-900">2 (Input)</td>
                      <td className="py-0.5 border-r border-slate-900">3 (Input)</td>
                      <td className="py-0.5 border-r border-slate-900 bg-emerald-50/30">4 (2 - 3)</td>
                      <td className="py-0.5 border-r border-slate-900">5 (Input)</td>
                      <td className="py-0.5 border-r border-slate-900 bg-emerald-50/30">6 (3 + 5)</td>
                      <td className="py-0.5 border-r border-slate-900 bg-emerald-50/30">7 (2 - 6)</td>
                      <td className="py-0.5 bg-slate-100">8 (Komparasi 2025)</td>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.estimasiBelanja.map((row, idx) => {
                      const p = Number(row.pagu) || 0;
                      const r = Number(row.realisasiTW3) || 0;
                      const tw4 = Number(row.rencanaTW4) || 0;
                      const sisa = p - r;
                      const estTotal = r + tw4;
                      const sisaTakReal = p - estTotal;

                      return (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="py-1.5 px-2 border-r border-slate-900 font-mono text-center font-semibold">
                            {row.jenisBelanja}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-900 font-medium">
                            {row.uraian}
                          </td>

                          {/* Pagu (Input Manual) */}
                          <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.pagu || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.estimasiBelanja];
                                  updated[idx] = {
                                    ...updated[idx],
                                    pagu: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, estimasiBelanja: updated });
                                }}
                                className="w-full p-1 border border-slate-300 rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                              />
                            ) : (
                              formatNumber(p)
                            )}
                          </td>

                          {/* Realisasi TW 3 (Input Manual) */}
                          <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.realisasiTW3 || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.estimasiBelanja];
                                  updated[idx] = {
                                    ...updated[idx],
                                    realisasiTW3: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, estimasiBelanja: updated });
                                }}
                                className="w-full p-1 border border-slate-300 rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                              />
                            ) : (
                              formatNumber(r)
                            )}
                          </td>

                          {/* Sisa Pagu (Rumus Pengurangan: 2 - 3) */}
                          <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono font-medium bg-slate-50/50">
                            {formatNumber(sisa)}
                          </td>

                          {/* Rencana TW IV (Input Manual) */}
                          <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.rencanaTW4 || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.estimasiBelanja];
                                  updated[idx] = {
                                    ...updated[idx],
                                    rencanaTW4: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, estimasiBelanja: updated });
                                }}
                                className="w-full p-1 border border-slate-300 rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                              />
                            ) : (
                              formatNumber(tw4)
                            )}
                          </td>

                          {/* Estimasi Total Realisasi (Rumus Penjumlahan: 3 + 5) */}
                          <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono font-medium bg-slate-50/50">
                            {formatNumber(estTotal)}
                          </td>

                          {/* Estimasi Pagu Tidak Terealisasi (Rumus Pengurangan: 2 - 6) */}
                          <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono font-medium bg-slate-50/50">
                            {formatNumber(sisaTakReal)}
                          </td>

                          {/* Realisasi 2025 (Komparatif) */}
                          <td className="py-1.5 px-2 text-right font-mono bg-slate-50/70">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.realisasiLalu || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.estimasiBelanja];
                                  updated[idx] = {
                                    ...updated[idx],
                                    realisasiLalu: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, estimasiBelanja: updated });
                                }}
                                className="w-full p-1 border border-slate-300 rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                              />
                            ) : (
                              row.realisasiLalu ? formatNumber(row.realisasiLalu) : '-'
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Baris Total (Rumus Total Otomatis) */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                      <td colSpan={2} className="py-2 px-3 border-r border-slate-900 text-center">
                        TOTAL
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalPagu1a)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalRealTW3_1a)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalSisaTW3_1a)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalRencanaTW4_1a)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalEstimasiTotal_1a)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalTidakTerealisasi_1a)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono bg-slate-100">
                        {formatNumber(totalRealLalu_1a)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Kalimat Penjelasan DI BAWAH Tabel 1.a */}
              <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 italic leading-relaxed">
                &ldquo;{narasi1aBawah}&rdquo;
              </div>
            </div>

            {/* 1.b Pagu Minus Belanja Pegawai */}
            <div className="p-4 border border-slate-300 rounded bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">
                  b. Informasi Pagu Minus Belanja Pegawai serta Rencana Mitigasi
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  {isEditing ? 'Sinkron otomatis dengan angka tabel' : 'Tersinkron'}
                </span>
              </div>

              {/* Kalimat Penjelasan DI ATAS Tabel 1.b */}
              <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 italic leading-relaxed">
                &ldquo;{narasi1b}&rdquo;
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
                      <th className="py-2 px-2 border-r border-slate-900 w-16">Jenis Belanja</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-left">Uraian</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-right w-28">Pagu</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-right w-28">Realisasi s.d. 30 Sep 2026</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-right w-28">Rencana TW IV</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-right w-28 bg-emerald-50/50">
                        Total Realisasi <span className="text-[9px] font-normal block">(Rumus: 4 + 5)</span>
                      </th>
                      <th className="py-2 px-2 text-right w-28 bg-emerald-50/50">
                        Estimasi Sisa Pagu / Minus <span className="text-[9px] font-normal block">(Rumus: 3 - 6)</span>
                      </th>
                    </tr>
                    <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-900 text-center font-mono">
                      <td className="py-0.5 border-r border-slate-900">1</td>
                      <td className="py-0.5 border-r border-slate-900">2</td>
                      <td className="py-0.5 border-r border-slate-900">3 (Input)</td>
                      <td className="py-0.5 border-r border-slate-900">4 (Input)</td>
                      <td className="py-0.5 border-r border-slate-900">5 (Input)</td>
                      <td className="py-0.5 border-r border-slate-900 bg-emerald-50/30">6 (4 + 5)</td>
                      <td className="py-0.5 bg-emerald-50/30">7 (3 - 6)</td>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.paguMinusPegawai.map((row, idx) => {
                      const p = Number(row.pagu) || 0;
                      const r = Number(row.realisasiTW3) || 0;
                      const tw4 = Number(row.rencanaTW4) || 0;
                      const totReal = r + tw4;
                      const sisaMinus = p - totReal;

                      return (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="py-1.5 px-2 border-r border-slate-900 font-mono text-center font-semibold">
                            {row.kodeAkun}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-900">
                            {row.uraian}
                          </td>

                          {/* Pagu */}
                          <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.pagu || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.paguMinusPegawai];
                                  updated[idx] = {
                                    ...updated[idx],
                                    pagu: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, paguMinusPegawai: updated });
                                }}
                                className="w-full p-1 border border-slate-300 rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                              />
                            ) : (
                              formatNumber(p)
                            )}
                          </td>

                          {/* Realisasi TW 3 */}
                          <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.realisasiTW3 || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.paguMinusPegawai];
                                  updated[idx] = {
                                    ...updated[idx],
                                    realisasiTW3: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, paguMinusPegawai: updated });
                                }}
                                className="w-full p-1 border border-slate-300 rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                              />
                            ) : (
                              formatNumber(r)
                            )}
                          </td>

                          {/* Rencana TW 4 */}
                          <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.rencanaTW4 || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.paguMinusPegawai];
                                  updated[idx] = {
                                    ...updated[idx],
                                    rencanaTW4: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, paguMinusPegawai: updated });
                                }}
                                className="w-full p-1 border border-slate-300 rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                              />
                            ) : (
                              formatNumber(tw4)
                            )}
                          </td>

                          {/* Total Realisasi (Rumus Penjumlahan: 4 + 5) */}
                          <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono font-medium bg-slate-50/50">
                            {formatNumber(totReal)}
                          </td>

                          {/* Estimasi Sisa Pagu / Minus (Rumus Pengurangan: 3 - 6) */}
                          <td
                            className={`py-1.5 px-2 text-right font-mono font-medium bg-slate-50/50 ${
                              sisaMinus < 0 ? 'text-rose-700 font-bold bg-rose-50/50' : ''
                            }`}
                          >
                            {formatNumber(sisaMinus)}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Baris Total Belanja Pegawai (Rumus Total) */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                      <td colSpan={2} className="py-2 px-3 border-r border-slate-900 text-center">
                        TOTAL BELANJA PEGAWAI
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalPaguPegawai)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalRealPegawai)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalTW4Pegawai)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalEstPegawai)}
                      </td>
                      <td
                        className={`py-2 px-2 text-right font-mono ${
                          totalSisaMinusPegawai < 0 ? 'text-rose-700' : ''
                        }`}
                      >
                        {formatNumber(totalSisaMinusPegawai)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 1.c Informasi Pagu Blokir */}
            <div className="p-4 border border-slate-300 rounded bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">
                  c. Informasi Pagu Blokir
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  {isEditing ? 'Sinkron otomatis dengan angka tabel' : 'Tersinkron'}
                </span>
              </div>

              {/* Kalimat Penjelasan DI ATAS Tabel 1.c */}
              <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 italic leading-relaxed">
                &ldquo;{narasi1c}&rdquo;
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
                      <th className="py-2 px-2 border-r border-slate-900 w-12">No.</th>
                      <th className="py-2 px-2 border-r border-slate-900 w-24">Kode Belanja</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-right w-36">Pagu</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-right w-36">Blokir Pagu</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-right w-36">Rencana Buka Blokir (Nilai)</th>
                      <th className="py-2 px-3 text-center w-36">Rencana Tanggal Buka Blokir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.paguBlokir.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-300 text-center">
                        <td className="py-1.5 px-2 border-r border-slate-900 font-mono">{row.no}</td>
                        <td className="py-1.5 px-2 border-r border-slate-900 font-mono font-semibold">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.kodeBelanja}
                              onChange={e => {
                                const updated = [...formData.paguBlokir];
                                updated[idx] = { ...updated[idx], kodeBelanja: e.target.value };
                                setFormData({ ...formData, paguBlokir: updated });
                              }}
                              className="w-full p-1 border rounded text-center text-xs"
                            />
                          ) : (
                            row.kodeBelanja
                          )}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.pagu || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.paguBlokir];
                                updated[idx] = { ...updated[idx], pagu: Number(e.target.value) || 0 };
                                setFormData({ ...formData, paguBlokir: updated });
                              }}
                              className="w-full p-1 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(row.pagu)
                          )}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.blokirPagu || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.paguBlokir];
                                updated[idx] = {
                                  ...updated[idx],
                                  blokirPagu: Number(e.target.value) || 0,
                                };
                                setFormData({ ...formData, paguBlokir: updated });
                              }}
                              className="w-full p-1 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(row.blokirPagu)
                          )}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.nilaiBukaBlokir || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.paguBlokir];
                                updated[idx] = {
                                  ...updated[idx],
                                  nilaiBukaBlokir: Number(e.target.value) || 0,
                                };
                                setFormData({ ...formData, paguBlokir: updated });
                              }}
                              className="w-full p-1 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(row.nilaiBukaBlokir)
                          )}
                        </td>
                        <td className="py-1.5 px-3 font-mono">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.tanggalRencanaBuka}
                              onChange={e => {
                                const updated = [...formData.paguBlokir];
                                updated[idx] = {
                                  ...updated[idx],
                                  tanggalRencanaBuka: e.target.value,
                                };
                                setFormData({ ...formData, paguBlokir: updated });
                              }}
                              className="w-full p-1 border rounded text-center text-xs"
                            />
                          ) : (
                            row.tanggalRencanaBuka
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Baris Total (Rumus Total) */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                      <td colSpan={2} className="py-2 px-3 border-r border-slate-900 text-center">
                        TOTAL
                      </td>
                      <td className="py-2 px-3 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalPaguBlokir)}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalNilaiBlokir)}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalBukaBlokir)}
                      </td>
                      <td className="py-2 px-3 text-center">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. Informasi Outstanding Kontrak Signifikan */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              2. Informasi Outstanding Kontrak Signifikan
            </h3>

            {/* Kalimat Penjelasan DI ATAS Tabel 2 */}
            <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 italic leading-relaxed">
              &ldquo;{narasi2}&rdquo;
            </div>

            {/* 2.a Outstanding Kontrak */}
            <div className="p-4 border border-slate-300 rounded bg-slate-50/40 space-y-3">
              <h4 className="font-semibold text-slate-900">
                a. Informasi Outstanding Kontrak (Sumber: Aplikasi MyIntress per 30 September 2026)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
                      <th className="py-2 px-2 border-r border-slate-900 w-12">No.</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-left">Eselon I</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-center w-28">Jumlah Kontrak</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-right w-36">Nilai Total Kontrak</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-right w-36">Realisasi</th>
                      <th className="py-2 px-3 text-right w-36 bg-emerald-50/50">
                        Sisa Nilai Kontrak <span className="text-[9px] font-normal block">(Rumus)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.outstandingKontrakEselon.map((row, idx) => {
                      const totalNilai = Number(row.nilaiTotalKontrak) || 0;
                      const real = Number(row.realisasi) || 0;
                      const sisa = totalNilai - real;

                      return (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="py-1.5 px-2 border-r border-slate-900 text-center font-mono">{row.no}</td>
                          <td className="py-1.5 px-3 border-r border-slate-900 font-medium">
                            {isEditing ? (
                              <input
                                type="text"
                                value={row.eselon1}
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakEselon];
                                  updated[idx] = { ...updated[idx], eselon1: e.target.value };
                                  setFormData({ ...formData, outstandingKontrakEselon: updated });
                                }}
                                className="w-full p-1 border rounded text-xs"
                              />
                            ) : (
                              row.eselon1
                            )}
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-900 text-center font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.jumlahKontrak || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakEselon];
                                  updated[idx] = {
                                    ...updated[idx],
                                    jumlahKontrak: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, outstandingKontrakEselon: updated });
                                }}
                                className="w-full p-1 border rounded text-center text-xs font-mono"
                              />
                            ) : (
                              row.jumlahKontrak
                            )}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.nilaiTotalKontrak || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakEselon];
                                  updated[idx] = {
                                    ...updated[idx],
                                    nilaiTotalKontrak: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, outstandingKontrakEselon: updated });
                                }}
                                className="w-full p-1 border rounded text-right text-xs font-mono"
                              />
                            ) : (
                              formatNumber(totalNilai)
                            )}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.realisasi || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakEselon];
                                  updated[idx] = {
                                    ...updated[idx],
                                    realisasi: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, outstandingKontrakEselon: updated });
                                }}
                                className="w-full p-1 border rounded text-right text-xs font-mono"
                              />
                            ) : (
                              formatNumber(real)
                            )}
                          </td>
                          {/* Sisa Nilai Kontrak (Rumus Pengurangan) */}
                          <td className="py-1.5 px-3 text-right font-mono font-medium bg-slate-50/50">
                            {formatNumber(sisa)}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Baris Total (Rumus Total) */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                      <td colSpan={2} className="py-2 px-3 border-r border-slate-900 text-center">
                        TOTAL
                      </td>
                      <td className="py-2 px-2 border-r border-slate-900 text-center font-mono">
                        {totalJmlKontrak2a}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalNilaiKontrak2a)}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalRealKontrak2a)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {formatNumber(totalSisaKontrak2a)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2.b Outstanding Kontrak Signifikan */}
            <div className="p-4 border border-slate-300 rounded bg-slate-50/40 space-y-3">
              <h4 className="font-semibold text-slate-900">
                b. Rincian Kontrak Signifikan Satker
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
                      <th className="py-2 px-2 border-r border-slate-900 w-10">No.</th>
                      <th className="py-2 px-2 border-r border-slate-900 w-20">Kode Satker</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-left w-36">No Kontrak</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-left">Uraian Pekerjaan Kontrak</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-center w-24">Tgl Mulai</th>
                      <th className="py-2 px-2 border-r border-slate-900 text-center w-24">Tgl Akhir</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-right w-28">Nilai Kontrak</th>
                      <th className="py-2 px-3 border-r border-slate-900 text-right w-28">Realisasi</th>
                      <th className="py-2 px-3 text-right w-24 bg-emerald-50/50">
                        Sisa <span className="text-[9px] font-normal block">(Rumus)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.outstandingKontrakSignifikan.map((row, idx) => {
                      const nilai = Number(row.nilaiKontrak) || 0;
                      const real = Number(row.realisasi) || 0;
                      const sisa = nilai - real;

                      return (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="py-1.5 px-2 border-r border-slate-900 text-center font-mono">{row.no}</td>
                          <td className="py-1.5 px-2 border-r border-slate-900 text-center font-mono">
                            {isEditing ? (
                              <input
                                type="text"
                                value={row.kodeSatker}
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakSignifikan];
                                  updated[idx] = { ...updated[idx], kodeSatker: e.target.value };
                                  setFormData({ ...formData, outstandingKontrakSignifikan: updated });
                                }}
                                className="w-full p-1 border rounded text-center text-xs"
                              />
                            ) : (
                              row.kodeSatker
                            )}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-900 font-mono text-[11px]">
                            {isEditing ? (
                              <input
                                type="text"
                                value={row.noKontrak}
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakSignifikan];
                                  updated[idx] = { ...updated[idx], noKontrak: e.target.value };
                                  setFormData({ ...formData, outstandingKontrakSignifikan: updated });
                                }}
                                className="w-full p-1 border rounded text-xs"
                              />
                            ) : (
                              row.noKontrak
                            )}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-900">
                            {isEditing ? (
                              <input
                                type="text"
                                value={row.uraianKontrak}
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakSignifikan];
                                  updated[idx] = { ...updated[idx], uraianKontrak: e.target.value };
                                  setFormData({ ...formData, outstandingKontrakSignifikan: updated });
                                }}
                                className="w-full p-1 border rounded text-xs"
                              />
                            ) : (
                              row.uraianKontrak
                            )}
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-900 text-center font-mono text-[11px]">
                            {isEditing ? (
                              <input
                                type="text"
                                value={row.tanggalMulai}
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakSignifikan];
                                  updated[idx] = { ...updated[idx], tanggalMulai: e.target.value };
                                  setFormData({ ...formData, outstandingKontrakSignifikan: updated });
                                }}
                                className="w-full p-1 border rounded text-center text-xs"
                              />
                            ) : (
                              row.tanggalMulai
                            )}
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-900 text-center font-mono text-[11px]">
                            {isEditing ? (
                              <input
                                type="text"
                                value={row.tanggalAkhir}
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakSignifikan];
                                  updated[idx] = { ...updated[idx], tanggalAkhir: e.target.value };
                                  setFormData({ ...formData, outstandingKontrakSignifikan: updated });
                                }}
                                className="w-full p-1 border rounded text-center text-xs"
                              />
                            ) : (
                              row.tanggalAkhir
                            )}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.nilaiKontrak || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakSignifikan];
                                  updated[idx] = {
                                    ...updated[idx],
                                    nilaiKontrak: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, outstandingKontrakSignifikan: updated });
                                }}
                                className="w-full p-1 border rounded text-right text-xs font-mono"
                              />
                            ) : (
                              formatNumber(nilai)
                            )}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.realisasi || ''}
                                placeholder="0"
                                onChange={e => {
                                  const updated = [...formData.outstandingKontrakSignifikan];
                                  updated[idx] = {
                                    ...updated[idx],
                                    realisasi: Number(e.target.value) || 0,
                                  };
                                  setFormData({ ...formData, outstandingKontrakSignifikan: updated });
                                }}
                                className="w-full p-1 border rounded text-right text-xs font-mono"
                              />
                            ) : (
                              formatNumber(real)
                            )}
                          </td>
                          {/* Sisa (Rumus Pengurangan) */}
                          <td className="py-1.5 px-3 text-right font-mono font-medium bg-slate-50/50">
                            {formatNumber(sisa)}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Baris Total (Rumus Total) */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                      <td colSpan={6} className="py-2 px-3 border-r border-slate-900 text-center">
                        TOTAL
                      </td>
                      <td className="py-2 px-3 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalNilaiKontrak2b)}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-900 text-right font-mono">
                        {formatNumber(totalRealKontrak2b)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {formatNumber(totalSisaKontrak2b)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3. Informasi Kejadian Bencana Alam */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              3. Informasi Kejadian Bencana Alam dan Penanggulangan yang Berdampak pada LK
            </h3>
            {isEditing ? (
              <textarea
                rows={2}
                value={formData.narasiBencanaAlam}
                onChange={e => setFormData({ ...formData, narasiBencanaAlam: e.target.value })}
                className="w-full p-2.5 border rounded text-xs bg-white"
              />
            ) : (
              <p className="text-slate-700 bg-slate-50 p-3 border border-slate-200 rounded">
                {formData.narasiBencanaAlam}
              </p>
            )}
          </div>

          {/* 4. Mutasi Piutang Perpajakan, PNBP, TP/TGR */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                4. Mutasi Piutang Perpajakan, PNBP, TP/TGR, dan Piutang Lainnya
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {isEditing ? 'Sinkron otomatis dengan angka tabel' : 'Tersinkron'}
              </span>
            </div>

            {/* Kalimat Penjelasan DI ATAS Tabel 4 */}
            <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 italic leading-relaxed">
              &ldquo;{narasi4}&rdquo;
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
                    <th rowSpan={2} className="py-2 px-2 border-r border-slate-900 w-16">Akun</th>
                    <th rowSpan={2} className="py-2 px-3 border-r border-slate-900 text-left">Uraian Piutang</th>
                    <th rowSpan={2} className="py-2 px-2 border-r border-slate-900 text-right w-24">Saldo Neraca Audited 2025</th>
                    <th colSpan={3} className="py-1 px-2 border-r border-slate-900 text-center">Mutasi Bertambah</th>
                    <th colSpan={4} className="py-1 px-2 border-r border-slate-900 text-center">Mutasi Berkurang</th>
                    <th rowSpan={2} className="py-2 px-2 text-right w-28 bg-emerald-50/50">
                      Saldo Neraca 30 Sep 2026 <span className="text-[9px] font-normal block">(Rumus)</span>
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-[10px] text-slate-700 border-b border-slate-900 text-center">
                    <th className="py-1 px-1 border-r border-slate-900 w-20">Baru</th>
                    <th className="py-1 px-1 border-r border-slate-900 w-16">Koreksi</th>
                    <th className="py-1 px-1 border-r border-slate-900 w-16">Lainnya</th>
                    <th className="py-1 px-1 border-r border-slate-900 w-20">Pelunasan</th>
                    <th className="py-1 px-1 border-r border-slate-900 w-16">Penghapusan</th>
                    <th className="py-1 px-1 border-r border-slate-900 w-16">Koreksi</th>
                    <th className="py-1 px-1 border-r border-slate-900 w-16">Lainnya</th>
                  </tr>
                  <tr className="bg-slate-50 text-[9px] text-slate-500 border-b border-slate-900 text-center font-mono">
                    <td className="border-r border-slate-900">1</td>
                    <td className="border-r border-slate-900">2</td>
                    <td className="border-r border-slate-900">3 (Input)</td>
                    <td className="border-r border-slate-900">4 (Input)</td>
                    <td className="border-r border-slate-900">5 (Input)</td>
                    <td className="border-r border-slate-900">6 (Input)</td>
                    <td className="border-r border-slate-900">7 (Input)</td>
                    <td className="border-r border-slate-900">8 (Input)</td>
                    <td className="border-r border-slate-900">9 (Input)</td>
                    <td className="border-r border-slate-900">10 (Input)</td>
                    <td className="bg-emerald-50/30">(3+4+5+6-7-8-9-10)</td>
                  </tr>
                </thead>
                <tbody>
                  {formData.mutasiPiutang.map((row, idx) => {
                    const sa = Number(row.saldoNeraca2025) || 0;
                    const b = Number(row.baru) || 0;
                    const kt = Number(row.koreksiTambah) || 0;
                    const lt = Number(row.lainnyaTambah) || 0;
                    const pel = Number(row.pelunasan) || 0;
                    const peng = Number(row.penghapusan) || 0;
                    const kk = Number(row.koreksiKurang) || 0;
                    const lk = Number(row.lainnyaKurang) || 0;
                    const saldoAkhir = sa + b + kt + lt - (pel + peng + kk + lk);

                    return (
                      <tr key={idx} className="border-b border-slate-300">
                        <td className="py-1.5 px-2 border-r border-slate-900 font-mono text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.akun}
                              onChange={e => {
                                const updated = [...formData.mutasiPiutang];
                                updated[idx] = { ...updated[idx], akun: e.target.value };
                                setFormData({ ...formData, mutasiPiutang: updated });
                              }}
                              className="w-full p-0.5 border rounded text-center text-xs"
                            />
                          ) : (
                            row.akun
                          )}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.uraian}
                              onChange={e => {
                                const updated = [...formData.mutasiPiutang];
                                updated[idx] = { ...updated[idx], uraian: e.target.value };
                                setFormData({ ...formData, mutasiPiutang: updated });
                              }}
                              className="w-full p-0.5 border rounded text-xs"
                            />
                          ) : (
                            row.uraian
                          )}
                        </td>
                        {/* Saldo Awal 2025 */}
                        <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.saldoNeraca2025 || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.mutasiPiutang];
                                updated[idx] = { ...updated[idx], saldoNeraca2025: Number(e.target.value) || 0 };
                                setFormData({ ...formData, mutasiPiutang: updated });
                              }}
                              className="w-full p-0.5 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(sa)
                          )}
                        </td>
                        {/* Baru */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.baru || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.mutasiPiutang];
                                updated[idx] = { ...updated[idx], baru: Number(e.target.value) || 0 };
                                setFormData({ ...formData, mutasiPiutang: updated });
                              }}
                              className="w-full p-0.5 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(b)
                          )}
                        </td>
                        {/* Koreksi Tambah */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.koreksiTambah || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.mutasiPiutang];
                                updated[idx] = { ...updated[idx], koreksiTambah: Number(e.target.value) || 0 };
                                setFormData({ ...formData, mutasiPiutang: updated });
                              }}
                              className="w-full p-0.5 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(kt)
                          )}
                        </td>
                        {/* Lainnya Tambah */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.lainnyaTambah || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.mutasiPiutang];
                                updated[idx] = { ...updated[idx], lainnyaTambah: Number(e.target.value) || 0 };
                                setFormData({ ...formData, mutasiPiutang: updated });
                              }}
                              className="w-full p-0.5 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(lt)
                          )}
                        </td>
                        {/* Pelunasan */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.pelunasan || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.mutasiPiutang];
                                updated[idx] = { ...updated[idx], pelunasan: Number(e.target.value) || 0 };
                                setFormData({ ...formData, mutasiPiutang: updated });
                              }}
                              className="w-full p-0.5 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(pel)
                          )}
                        </td>
                        {/* Penghapusan */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.penghapusan || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.mutasiPiutang];
                                updated[idx] = { ...updated[idx], penghapusan: Number(e.target.value) || 0 };
                                setFormData({ ...formData, mutasiPiutang: updated });
                              }}
                              className="w-full p-0.5 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(peng)
                          )}
                        </td>
                        {/* Koreksi Kurang */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.koreksiKurang || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.mutasiPiutang];
                                updated[idx] = { ...updated[idx], koreksiKurang: Number(e.target.value) || 0 };
                                setFormData({ ...formData, mutasiPiutang: updated });
                              }}
                              className="w-full p-0.5 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(kk)
                          )}
                        </td>
                        {/* Lainnya Kurang */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.lainnyaKurang || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.mutasiPiutang];
                                updated[idx] = { ...updated[idx], lainnyaKurang: Number(e.target.value) || 0 };
                                setFormData({ ...formData, mutasiPiutang: updated });
                              }}
                              className="w-full p-0.5 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(lk)
                          )}
                        </td>
                        {/* Saldo Akhir (Rumus Penjumlahan & Pengurangan) */}
                        <td className="py-1.5 px-2 text-right font-mono font-semibold bg-slate-50/50">
                          {formatNumber(saldoAkhir)}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Baris Total (Rumus Total) */}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                    <td colSpan={2} className="py-2 px-3 border-r border-slate-900 text-center">
                      TOTAL
                    </td>
                    <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalSaldoAwal4)}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalBaru4)}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalKoreksiTambah4)}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalLainnyaTambah4)}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalPelunasan4)}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalPenghapusan4)}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalKoreksiKurang4)}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalLainnyaKurang4)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {formatNumber(totalSaldoAkhir4)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. KDP yang Dihentikan Penggunaannya */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              5. KDP yang Dihentikan Penggunaannya (Juknis Akuntansi 25 - S-221/PB/2024)
            </h3>
            {isEditing ? (
              <textarea
                rows={2}
                value={formData.narasiKdp}
                onChange={e => setFormData({ ...formData, narasiKdp: e.target.value })}
                className="w-full p-2.5 border rounded text-xs bg-white"
              />
            ) : (
              <p className="text-slate-700 bg-slate-50 p-3 border border-slate-200 rounded">
                {formData.narasiKdp}
              </p>
            )}
          </div>

          {/* 6. Pendapatan dari Transaksi Pertukaran dan Nonpertukaran */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                6. Pendapatan dari Transaksi Pertukaran dan Nonpertukaran
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {isEditing ? 'Sinkron otomatis dengan angka tabel' : 'Tersinkron'}
              </span>
            </div>

            {/* Kalimat Penjelasan DI ATAS Tabel 6 */}
            <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 italic leading-relaxed">
              &ldquo;{narasi6}&rdquo;
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
                    <th className="py-2 px-2 border-r border-slate-900 w-20">Akun</th>
                    <th className="py-2 px-3 border-r border-slate-900 text-left">Uraian Akun Pendapatan</th>
                    <th className="py-2 px-3 border-r border-slate-900 text-right w-36">Pertukaran (Rp)</th>
                    <th className="py-2 px-3 border-r border-slate-900 text-right w-36">Nonpertukaran (Rp)</th>
                    <th className="py-2 px-3 text-right w-36 bg-emerald-50/50">
                      Nilai Total (Rp) <span className="text-[9px] font-normal block">(Rumus: Pertukaran + Nonpertukaran)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.transaksiPertukaran.map((row, idx) => {
                    const p = Number(row.pertukaran) || 0;
                    const np = Number(row.nonPertukaran) || 0;
                    const total = p + np;

                    return (
                      <tr key={idx} className="border-b border-slate-300">
                        <td className="py-1.5 px-2 border-r border-slate-900 font-mono text-center font-semibold">
                          {row.akun}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-900">{row.uraian}</td>
                        {/* Pertukaran */}
                        <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.pertukaran || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.transaksiPertukaran];
                                updated[idx] = {
                                  ...updated[idx],
                                  pertukaran: Number(e.target.value) || 0,
                                };
                                setFormData({ ...formData, transaksiPertukaran: updated });
                              }}
                              className="w-full p-1 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(p)
                          )}
                        </td>
                        {/* Nonpertukaran */}
                        <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.nonPertukaran || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.transaksiPertukaran];
                                updated[idx] = {
                                  ...updated[idx],
                                  nonPertukaran: Number(e.target.value) || 0,
                                };
                                setFormData({ ...formData, transaksiPertukaran: updated });
                              }}
                              className="w-full p-1 border rounded text-right text-xs font-mono"
                            />
                          ) : (
                            formatNumber(np)
                          )}
                        </td>
                        {/* Nilai Total (Rumus Penjumlahan) */}
                        <td className="py-1.5 px-3 text-right font-mono font-semibold bg-slate-50/50">
                          {formatNumber(total)}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Baris Total (Rumus Total) */}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                    <td colSpan={2} className="py-2 px-3 border-r border-slate-900 text-center">
                      TOTAL
                    </td>
                    <td className="py-2 px-3 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalPertukaran6)}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalNonPertukaran6)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {formatNumber(totalPendapatan6)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 7 & 8 Khusus BA 015 */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              7 & 8. Deposit Pajak & Penyesuaian PSAP 18 (Khusus BA 015 - Kementerian Keuangan)
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600">
              {formData.infoKhususBA015.keterangan}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* B. INFORMASI PENTING LAINNYA */}
        {/* ======================================================== */}
        <div className="pt-8 border-t-2 border-slate-900">
          <h2 className="text-sm font-bold text-slate-950 uppercase border-b border-slate-900 pb-1 mb-4">
            B. INFORMASI PENTING LAINNYA
          </h2>

          <div className="space-y-4">
            <div className="p-4 border border-slate-300 rounded bg-slate-50/40 avoid-break">
              <h3 className="font-bold text-slate-900 mb-1.5">
                1. Kondisi Organisasi dan Kelembagaan
              </h3>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={formData.infoPentingLainnya.kondisiOrganisasi}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      infoPentingLainnya: {
                        ...formData.infoPentingLainnya,
                        kondisiOrganisasi: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded text-xs bg-white"
                />
              ) : (
                <p className="text-slate-700 text-justify">
                  {formData.infoPentingLainnya.kondisiOrganisasi}
                </p>
              )}
            </div>

            <div className="p-4 border border-slate-300 rounded bg-slate-50/40 avoid-break">
              <h3 className="font-bold text-slate-900 mb-1.5">
                2. Hal Khusus Menyangkut Program Strategis / Prioritas Nasional / Program Utama
              </h3>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={formData.infoPentingLainnya.halKhususProgramStrategis}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      infoPentingLainnya: {
                        ...formData.infoPentingLainnya,
                        halKhususProgramStrategis: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded text-xs bg-white"
                />
              ) : (
                <p className="text-slate-700 text-justify">
                  {formData.infoPentingLainnya.halKhususProgramStrategis}
                </p>
              )}
            </div>

            <div className="p-4 border border-slate-300 rounded bg-slate-50/40 avoid-break">
              <h3 className="font-bold text-slate-900 mb-1.5">
                3. Kondisi Keuangan yang Memerlukan Perhatian Khusus K/L
              </h3>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={formData.infoPentingLainnya.kondisiKeuanganPerhatianKhusus}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      infoPentingLainnya: {
                        ...formData.infoPentingLainnya,
                        kondisiKeuanganPerhatianKhusus: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded text-xs bg-white"
                />
              ) : (
                <p className="text-slate-700 text-justify">
                  {formData.infoPentingLainnya.kondisiKeuanganPerhatianKhusus}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Signature block of KPA */}
      <KpaSignatureBlock satker={satker} showDigitalStamp={showDigitalStamp} />
    </div>
  );
};
