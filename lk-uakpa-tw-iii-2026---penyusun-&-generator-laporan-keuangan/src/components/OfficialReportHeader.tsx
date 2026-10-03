import React from 'react';
import { SatkerProfile } from '../types/financial';
import { Shield } from 'lucide-react';

interface OfficialReportHeaderProps {
  satker: SatkerProfile;
  title: string;
  subtitle?: string;
  attachmentCode?: string;
}

export const OfficialReportHeader: React.FC<OfficialReportHeaderProps> = ({
  satker,
  title,
  subtitle,
  attachmentCode,
}) => {
  return (
    <div className="relative pb-4 mb-6 border-b-2 border-slate-900 avoid-break">
      {attachmentCode && (
        <div className="absolute right-0 top-0 text-right">
          <span className="font-mono text-xs font-bold px-2 py-0.5 border border-slate-900 text-slate-900">
            {attachmentCode}
          </span>
        </div>
      )}

      {/* Kop Surat with Logo synchronization */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-2 text-center">
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

      <div className="text-center my-3">
        <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-950 uppercase">
          {title}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
          {subtitle || satker.periodeLabel}
        </p>
        <p className="text-xs text-slate-600 italic mt-1">
          (Dalam Rupiah)
        </p>
      </div>
    </div>
  );
};
