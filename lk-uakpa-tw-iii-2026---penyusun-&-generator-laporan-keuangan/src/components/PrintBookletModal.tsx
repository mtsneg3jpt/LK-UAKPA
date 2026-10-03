import React from 'react';
import { FullFinancialData } from '../types/financial';
import { CoverBukuLK } from './CoverBukuLK';
import { PernyataanKPA } from './PernyataanKPA';
import { FaceLRA } from './FaceLRA';
import { FaceLO } from './FaceLO';
import { FaceLPE } from './FaceLPE';
import { FaceNeraca } from './FaceNeraca';
import { LampiranII } from './LampiranII';
import { LampiranIII } from './LampiranIII';
import { Printer, X, FileText } from 'lucide-react';

interface PrintBookletModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FullFinancialData;
  showDigitalStamp: boolean;
}

export const PrintBookletModal: React.FC<PrintBookletModalProps> = ({
  isOpen,
  onClose,
  data,
  showDigitalStamp,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center p-2 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto print:block">
      {/* Floating control bar */}
      <div className="no-print sticky top-4 z-50 w-full max-w-5xl bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center justify-between mb-6 border border-slate-700">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold">
              Buku Lengkap LK UAKPA TW III 2026
            </h2>
            <p className="text-[11px] text-slate-400">
              {data.satker.namaSatker} · Sesuai SE KPPN Bantaeng S-374/KPN.2505/2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Document Container */}
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-lg p-4 sm:p-10 space-y-12 print:shadow-none print:p-0 print:max-w-none print:w-full print:space-y-0 print:overflow-visible print:block mx-auto">
        {/* 1. Cover */}
        <div className="page-break-after">
          <CoverBukuLK satker={data.satker} />
        </div>

        {/* 2. Pernyataan Tanggung Jawab KPA */}
        <div className="page-break-after pt-8 print:pt-0">
          <PernyataanKPA
            satker={data.satker}
            showDigitalStamp={showDigitalStamp}
          />
        </div>

        {/* 3. Daftar Isi */}
        <div className="page-break-after pt-8 print:pt-0">
          <div className="bg-white p-6 sm:p-12 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-none print:p-0">
            <div className="text-center pb-4 border-b-2 border-slate-900 mb-8">
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-950">
                DAFTAR ISI
              </h2>
              <p className="text-xs text-slate-700">
                LAPORAN KEUANGAN UAKPA TRIWULAN III TAHUN 2026
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-800">
              <div className="flex items-center justify-between border-b border-dotted border-slate-400 pb-1">
                <span>Pernyataan Tanggung Jawab Kuasa Pengguna Anggaran (KPA)</span>
                <span className="font-mono">i</span>
              </div>
              <div className="flex items-center justify-between border-b border-dotted border-slate-400 pb-1 font-semibold text-slate-950">
                <span>I. LEMBAR FACE LAPORAN KEUANGAN POKOK</span>
                <span></span>
              </div>
              <div className="flex items-center justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                <span>1. Laporan Realisasi Anggaran (LRA)</span>
                <span className="font-mono">1</span>
              </div>
              <div className="flex items-center justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                <span>2. Laporan Operasional (LO)</span>
                <span className="font-mono">2</span>
              </div>
              <div className="flex items-center justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                <span>3. Laporan Perubahan Ekuitas (LPE)</span>
                <span className="font-mono">3</span>
              </div>
              <div className="flex items-center justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                <span>4. Neraca</span>
                <span className="font-mono">4</span>
              </div>
              <div className="flex items-center justify-between border-b border-dotted border-slate-400 pb-1 font-semibold text-slate-950">
                <span>II. LAMPIRAN PENJELASAN (SURAT EDARAN KPPN BANTAENG)</span>
                <span></span>
              </div>
              <div className="flex items-center justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                <span>Lampiran II: Informasi Keuangan Tertentu & Informasi Penting Lainnya</span>
                <span className="font-mono">5</span>
              </div>
              <div className="flex items-center justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                <span>Lampiran III: Mekanisme & Format Penyajian Data Informasi Kinerja (11 Fungsi & 8 Prioritas Nasional)</span>
                <span className="font-mono">8</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Face LRA */}
        <div className="page-break-after pt-8 print:pt-0">
          <FaceLRA
            satker={data.satker}
            lra={data.lra}
            onUpdateLRA={() => {}}
            showDigitalStamp={showDigitalStamp}
          />
        </div>

        {/* 5. Face LO */}
        <div className="page-break-after pt-8 print:pt-0">
          <FaceLO
            satker={data.satker}
            lo={data.lo}
            onUpdateLO={() => {}}
            showDigitalStamp={showDigitalStamp}
          />
        </div>

        {/* 6. Face LPE */}
        <div className="page-break-after pt-8 print:pt-0">
          <FaceLPE
            satker={data.satker}
            lpe={data.lpe}
            onUpdateLPE={() => {}}
            showDigitalStamp={showDigitalStamp}
          />
        </div>

        {/* 7. Face Neraca */}
        <div className="page-break-after pt-8 print:pt-0">
          <FaceNeraca
            satker={data.satker}
            neraca={data.neraca}
            onUpdateNeraca={() => {}}
            showDigitalStamp={showDigitalStamp}
          />
        </div>

        {/* 8. Lampiran II (Official) */}
        <div className="page-break-after pt-8 print:pt-0">
          <LampiranII
            satker={data.satker}
            lampiranII={data.lampiranIIOfficial}
            onUpdateLampiranII={() => {}}
            showDigitalStamp={showDigitalStamp}
          />
        </div>

        {/* 9. Lampiran III (Official) */}
        <div className="pt-8 print:pt-0">
          <LampiranIII
            satker={data.satker}
            lampiranIII={data.lampiranIIIOfficial}
            onUpdateLampiranIII={() => {}}
            showDigitalStamp={showDigitalStamp}
          />
        </div>
      </div>
    </div>
  );
};
