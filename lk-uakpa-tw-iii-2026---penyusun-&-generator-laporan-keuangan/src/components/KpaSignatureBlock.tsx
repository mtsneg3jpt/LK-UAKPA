import React from 'react';
import { SatkerProfile } from '../types/financial';
import { CheckCircle2, QrCode } from 'lucide-react';

interface KpaSignatureBlockProps {
  satker: SatkerProfile;
  showDigitalStamp?: boolean;
}

export const KpaSignatureBlock: React.FC<KpaSignatureBlockProps> = ({
  satker,
  showDigitalStamp = true,
}) => {
  return (
    <div className="mt-8 pt-4 avoid-break flex flex-col md:flex-row justify-between items-start md:items-end text-xs sm:text-sm">
      <div className="hidden sm:block text-slate-500 text-xs">
        <p className="font-mono text-[11px] text-slate-600">Dokumen Sah LK UAKPA TW III 2026</p>
        <p className="text-[10px] text-slate-600">Kementerian Keuangan RI · Ditjen Perbendaharaan</p>
        <p className="text-[10px] text-slate-600">Terintegrasi Sistem SAKTI & MonSAKTI SPAN</p>
      </div>

      <div className="w-full sm:w-80 text-center flex flex-col items-center ml-auto">
        <p className="text-slate-800">
          {satker.kotaPenetapan}, {satker.tanggalLaporan}
        </p>
        <p className="font-semibold text-slate-900 mt-1 uppercase tracking-wide text-xs">
          {satker.jabatanKPA}
        </p>

        {/* Signature Area with optional official stamp */}
        {showDigitalStamp ? (
          <div className="relative my-3 h-24 w-52 flex items-center justify-center border border-dashed border-slate-300 rounded bg-slate-50/50 print:border-none print:bg-transparent">
            <div className="relative flex flex-col items-center">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[11px] font-medium print:border-slate-800 print:text-black">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 print:text-black shrink-0" />
                <span>Terverifikasi KPA</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-600 font-mono">
                <QrCode className="w-3 h-3 text-slate-600" />
                <span>SAKTI-VAL-2026-TW3</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="my-3 h-20" /> // Clean spacer for physical/wet signature
        )}

        <p className="font-bold text-slate-900 underline underline-offset-4 tracking-wide text-xs sm:text-sm">
          {satker.namaKPA}
        </p>
        <p className="text-slate-700 font-mono text-xs mt-0.5">
          NIP. {satker.nipKPA}
        </p>
      </div>
    </div>
  );
};
