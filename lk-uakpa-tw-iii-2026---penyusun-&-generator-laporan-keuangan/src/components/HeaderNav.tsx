import React from 'react';
import { Upload, Printer, Download, Settings, Share2 } from 'lucide-react';

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenPrint: () => void;
  onOpenConfig: () => void;
  onOpenShare: () => void;
  onExportExcel: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenPrint,
  onOpenConfig,
  onOpenShare,
  onExportExcel,
}) => {
  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan' },
    { id: 'lra', label: 'LRA' },
    { id: 'lo', label: 'LO' },
    { id: 'lpe', label: 'LPE' },
    { id: 'neraca', label: 'Neraca' },
    { id: 'lampiran-ii', label: 'Lampiran II' },
    { id: 'lampiran-iii', label: 'Lampiran III' },
  ];

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={e => {
              e.preventDefault();
              setActiveTab('ringkasan');
            }}
            className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-slate-800 transition-colors"
          >
            LK UAKPA TW III 2026
          </a>
        </div>

        {/* Zone 2: Clean text navigation links / segmented controls */}
        <nav className="hidden lg:flex items-center gap-1.5 font-sans">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {/* Quick Save PDF button next to Lampiran III */}
          <button
            onClick={onOpenPrint}
            className="ml-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-md text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Cetak & Simpan Semua Laporan Keuangan ke PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-700" />
            <span>Simpan Dokumen (PDF)</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            title="Bagikan & Salin Tautan Aplikasi"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Bagikan Link</span>
          </button>

          <button
            onClick={onOpenConfig}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Pengaturan Satker & KPA"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="no-print lg:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-200 gap-1 bg-slate-50/50 items-center">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer border transition-all ${
                isActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                  : 'text-slate-600 hover:text-slate-950 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {/* Quick Save PDF button next to Lampiran III on mobile */}
        <button
          onClick={onOpenPrint}
          className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-xs font-bold whitespace-nowrap cursor-pointer"
        >
          <Printer className="w-3 h-3 text-blue-700" />
          <span>Simpan Dokumen (PDF)</span>
        </button>
      </div>
    </header>
  );
};
