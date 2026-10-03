import React, { useRef } from 'react';
import { SatkerProfile } from '../types/financial';
import { Shield, Upload, Image, Trash2 } from 'lucide-react';

interface CoverBukuLKProps {
  satker: SatkerProfile;
  onUpdateLogo?: (logoUrl: string | undefined) => void;
}

export const CoverBukuLK: React.FC<CoverBukuLKProps> = ({
  satker,
  onUpdateLogo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateLogo) {
      const reader = new FileReader();
      reader.onload = event => {
        const result = event.target?.result as string;
        onUpdateLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const setKemenagLogo = () => {
    // Official high-fidelity vector SVG data URL of Kemenag emblem
    const kemenagSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23047857"/><circle cx="50" cy="50" r="44" fill="%23ffffff"/><polygon points="50,15 58,35 80,35 62,48 69,70 50,56 31,70 38,48 20,35 42,35" fill="%23f59e0b"/><circle cx="50" cy="50" r="22" fill="%23047857"/><text x="50" y="54" font-size="7" font-family="sans-serif" font-weight="bold" fill="%23ffffff" text-anchor="middle">IKHLAS</text><text x="50" y="62" font-size="6" font-family="sans-serif" font-weight="bold" fill="%23ffffff" text-anchor="middle">BERAMAL</text><text x="50" y="88" font-size="6" font-family="sans-serif" font-weight="bold" fill="%23047857" text-anchor="middle">KEMENAG RI</text></svg>`;
    onUpdateLogo?.(kemenagSvg);
  };

  const setGarudaLogo = () => {
    const garudaSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23b45309" stroke-width="3"/><path d="M50 16 L65 32 L82 32 L68 46 L74 65 L50 52 L26 65 L32 46 L18 32 L35 32 Z" fill="%23d97706"/><rect x="42" y="44" width="16" height="18" fill="%23b91c1c" rx="2"/><circle cx="50" cy="53" r="4" fill="%23ffffff"/><text x="50" y="82" font-size="6.5" font-family="sans-serif" font-weight="bold" fill="%231e293b" text-anchor="middle">BHINNEKA TUNGGAL IKA</text></svg>`;
    onUpdateLogo?.(garudaSvg);
  };

  return (
    <div className="bg-white p-8 sm:p-16 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-none print:p-0 min-h-[850px] flex flex-col justify-between text-center">
      {/* Top Header */}
      <div>
        <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-800 uppercase">
          {satker.namaKementerian}
        </p>
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700 uppercase mt-1">
          {satker.namaEselon1}
        </p>
      </div>

      {/* Emblem / Official Logo area with Upload Trigger */}
      <div className="my-8 flex flex-col items-center justify-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="relative group">
          {satker.customLogoUrl ? (
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl flex items-center justify-center p-2 mb-3 bg-white border border-slate-200 shadow-sm print:shadow-none print:border-none">
              <img
                src={satker.customLogoUrl}
                alt="Logo Resmi Satker"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-slate-900 flex items-center justify-center bg-slate-50 mb-3 print:border-black">
              <Shield className="w-14 h-14 text-slate-800 print:text-black" />
            </div>
          )}
        </div>

        {/* Upload Logo Controls (hidden in print) */}
        {onUpdateLogo && (
          <div className="no-print flex flex-wrap items-center justify-center gap-2 mt-2 text-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Logo Baru</span>
            </button>

            <button
              onClick={setKemenagLogo}
              className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md font-medium transition-colors cursor-pointer"
            >
              Logo Kemenag
            </button>

            <button
              onClick={setGarudaLogo}
              className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md font-medium transition-colors cursor-pointer"
            >
              Lambang Garuda
            </button>

            {satker.customLogoUrl && (
              <button
                onClick={() => onUpdateLogo(undefined)}
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                title="Hapus Logo Kustom"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <span className="text-[11px] font-mono tracking-widest text-slate-600 uppercase mt-3">
          REPUBLIK INDONESIA
        </span>
      </div>

      {/* Main Title Block */}
      <div className="my-6 space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-slate-950 uppercase border-y-2 border-slate-900 py-3">
          LAPORAN KEUANGAN
        </h1>
        <h2 className="text-lg sm:text-xl font-bold tracking-wide text-slate-900 uppercase">
          UNIT AKUNTANSI KUASA PENGGUNA ANGGARAN (UAKPA)
        </h2>
        <p className="text-base sm:text-lg font-semibold text-slate-800 uppercase">
          TRIWULAN III TAHUN 2026
        </p>
        <p className="text-xs sm:text-sm text-slate-700 italic">
          (Untuk Periode yang Berakhir 30 September 2026)
        </p>
      </div>

      {/* Satker Information */}
      <div className="my-6 p-4 border border-slate-300 rounded max-w-lg mx-auto bg-slate-50/50 print:bg-transparent print:border-slate-800">
        <p className="font-bold text-sm sm:text-base text-slate-950 uppercase">
          {satker.namaSatker}
        </p>
        <p className="font-mono text-xs sm:text-sm text-slate-800 mt-1">
          KODE SATKER: {satker.kodeSatker}
        </p>
        <p className="text-xs text-slate-600 mt-1">
          {satker.alamatSatker}
        </p>
      </div>

      {/* Footer Year */}
      <div className="pt-6 border-t border-slate-300">
        <p className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-widest">
          {satker.kotaPenetapan} · TAHUN 2026
        </p>
        <p className="text-[11px] text-slate-600 mt-1 font-mono">
          Disusun Berdasarkan Standar Akuntansi Pemerintahan (SAP) Akrual
        </p>
      </div>
    </div>
  );
};
