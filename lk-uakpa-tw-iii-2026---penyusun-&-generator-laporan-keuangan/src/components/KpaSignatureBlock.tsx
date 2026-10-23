import React from 'react';
import { SatkerProfile } from '../types/financial';

interface KpaSignatureBlockProps {
  satker: SatkerProfile;
  showDigitalStamp?: boolean;
}

export const KpaSignatureBlock: React.FC<KpaSignatureBlockProps> = ({
  satker,
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

        {/* Area Tanda Tangan KPA - Dikosongkan bersih untuk tanda tangan basah & cap dinas */}
        <div className="my-3 h-20 sm:h-24" />

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
