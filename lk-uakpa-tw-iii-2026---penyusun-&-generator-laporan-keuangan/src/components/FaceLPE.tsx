import React, { useState, useRef } from 'react';
import { LPEItem, SatkerProfile } from '../types/financial';
import { OfficialReportHeader } from './OfficialReportHeader';
import { KpaSignatureBlock } from './KpaSignatureBlock';
import { formatNumber, formatPercent } from '../utils/numberFormat';
import { parseFinancialFile } from '../utils/parser';
import { Upload, CheckCircle2 } from 'lucide-react';

interface FaceLPEProps {
  satker: SatkerProfile;
  lpe: LPEItem[];
  onUpdateLPE: (newLPE: LPEItem[]) => void;
  onUploadLPEFile?: (file: File) => Promise<void>;
  showDigitalStamp: boolean;
}

export const FaceLPE: React.FC<FaceLPEProps> = ({
  satker,
  lpe,
  onUpdateLPE,
  onUploadLPEFile,
  showDigitalStamp,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (onUploadLPEFile) {
        await onUploadLPEFile(file);
      } else {
        const result = await parseFinancialFile(file, 'lpe');
        if (result.lpe && result.lpe.length > 0) {
          onUpdateLPE(recalculateLPETotals(result.lpe));
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const ekuitasAkhirItem = lpe.find(
    i => i.id === 'lpe-total' || i.uraian.toLowerCase().includes('ekuitas akhir')
  );
  const totalEkuitasAkhir = ekuitasAkhirItem ? ekuitasAkhirItem.tahunIni : 0;

  return (
    <div className="bg-white p-6 sm:p-10 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-none print:p-0">
      <OfficialReportHeader
        satker={satker}
        title="LAPORAN PERUBAHAN EKUITAS (LPE)"
        subtitle="UNTUK PERIODE YANG BERAKHIR 30 SEPTEMBER 2026 DAN 2025"
      />

      {/* Toolbar with dedicated Upload Button */}
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">
            Format Standar SAP Laporan Perubahan Ekuitas (LPE)
          </span>
          <span className="text-slate-500">· Ditandatangani KPA</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekuitas Akhir: Rp {formatNumber(totalEkuitasAkhir)}</span>
          </div>

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
            title="Unggah berkas ekspor LPE dari SAKTI (Excel/CSV/Text)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Menyusun LPE...' : 'Upload SAKTI LPE'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
          <thead>
            {/* Baris Header Kolom */}
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
              <th className="py-2.5 px-4 border-r border-slate-900 text-center w-80 sm:w-96">
                URAIAN
              </th>
              <th className="py-2.5 px-3 border-r border-slate-900 text-center w-36">
                2026
              </th>
              <th className="py-2.5 px-3 border-r border-slate-900 text-center w-36">
                2025
              </th>
              <th className="py-2.5 px-2 border-r border-slate-900 text-center w-36 leading-tight">
                KENAIKAN/<br />PENURUNAN
              </th>
              <th className="py-2.5 px-2 text-center w-20">
                (%)
              </th>
            </tr>
            {/* Baris Penomoran Kolom Resmi (1) s.d. (5) */}
            <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-900 text-center font-mono">
              <td className="py-1 border-r border-slate-900 text-center">(1)</td>
              <td className="py-1 border-r border-slate-900 text-center">(2)</td>
              <td className="py-1 border-r border-slate-900 text-center">(3)</td>
              <td className="py-1 border-r border-slate-900 text-center">(4)</td>
              <td className="py-1 text-center">(5)</td>
            </tr>
          </thead>
          <tbody>
            {lpe.map((row, idx) => {
              const u = row.uraian.trim();
              const uLower = u.toLowerCase();

              const isSectionHeader =
                (row.level === 'header' && row.tahunIni === 0 && row.tahunLalu === 0) ||
                u.includes('DAMPAK KUMULATIF') ||
                u.includes('TRANSAKSI ANTAR ENTITAS');

              const isGrandTotal =
                row.level === 'total' || uLower.includes('ekuitas akhir');

              const isKenaikanPenurunanEkuitas =
                uLower.includes('kenaikan / (penurunan) ekuitas') ||
                uLower.includes('kenaikan/(penurunan) ekuitas') ||
                uLower.includes('kenaikan / penurunan ekuitas') ||
                row.id === 'lpe-9';

              const isEkuitasAwal =
                uLower.includes('ekuitas awal') || row.id === 'lpe-1';

              const hasNoValues = isSectionHeader;

              // Indentation class
              let indentClass = 'pl-3';
              if (isSectionHeader) {
                indentClass = 'pl-3 font-bold uppercase';
              } else if (isEkuitasAwal) {
                indentClass = 'pl-3 font-bold uppercase';
              } else if (isGrandTotal) {
                indentClass = 'pl-3 font-bold uppercase';
              } else if (isKenaikanPenurunanEkuitas) {
                indentClass = 'pl-3 font-bold uppercase';
              } else if (row.level === 'subgroup') {
                indentClass = 'pl-5 font-semibold';
              } else {
                // Regular items (Koreksi Nilai ..., DDL, DED, Surplus LO, dll)
                indentClass = 'pl-8 text-slate-800';
              }

              // Values
              const val26 = row.tahunIni || 0;
              const val25 = row.tahunLalu || 0;
              const kenaikanPenurunan = val26 - val25;

              let pctStr = '0,00%';
              if (val25 !== 0) {
                const pct = (kenaikanPenurunan / Math.abs(val25)) * 100;
                pctStr = formatPercent(pct);
              } else if (val26 !== 0) {
                pctStr = val26 > 0 ? '100,00%' : '(100,00%)';
              } else {
                pctStr = '0,00%';
              }

              return (
                <tr
                  key={row.id || `lpe-${idx}`}
                  className={`border-b border-slate-300 hover:bg-slate-50/70 transition-colors ${
                    isGrandTotal
                      ? 'bg-slate-100 font-bold border-t-2 border-b-2 border-slate-900 text-slate-950'
                      : isSectionHeader
                      ? 'font-bold bg-slate-50 text-slate-950'
                      : isKenaikanPenurunanEkuitas
                      ? 'font-bold bg-slate-50/60 border-t border-b border-slate-400 text-slate-900'
                      : isEkuitasAwal
                      ? 'font-semibold text-slate-900'
                      : ''
                  }`}
                >
                  {/* Kolom 1: URAIAN */}
                  <td className={`py-1.5 px-3 border-r border-slate-900 ${indentClass}`}>
                    {row.uraian}
                  </td>

                  {/* Kolom 2: 2026 */}
                  <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                    {hasNoValues ? '' : formatNumber(val26)}
                  </td>

                  {/* Kolom 3: 2025 */}
                  <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                    {hasNoValues ? '' : formatNumber(val25)}
                  </td>

                  {/* Kolom 4: KENAIKAN/ PENURUNAN */}
                  <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                    {hasNoValues ? '' : formatNumber(kenaikanPenurunan)}
                  </td>

                  {/* Kolom 5: (%) */}
                  <td className="py-1.5 px-2 text-right font-mono">
                    {hasNoValues ? '' : pctStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <KpaSignatureBlock satker={satker} showDigitalStamp={showDigitalStamp} />
    </div>
  );
};

export function recalculateLPETotals(items: LPEItem[]): LPEItem[] {
  let ekuitasAwal2026 = 0;
  let ekuitasAwal2025 = 0;

  let mutasi2026 = 0;
  let mutasi2025 = 0;

  items.forEach(item => {
    const uLower = item.uraian.toLowerCase();
    if (item.id === 'lpe-1' || uLower.includes('ekuitas awal')) {
      ekuitasAwal2026 = item.tahunIni;
      ekuitasAwal2025 = item.tahunLalu;
    } else if (
      item.level === 'item' &&
      !uLower.includes('kenaikan') &&
      !uLower.includes('ekuitas akhir')
    ) {
      mutasi2026 += item.tahunIni;
      mutasi2025 += item.tahunLalu;
    }
  });

  const ekuitasAkhir2026 = ekuitasAwal2026 + mutasi2026;
  const ekuitasAkhir2025 = ekuitasAwal2025 + mutasi2025;

  return items.map(item => {
    const uLower = item.uraian.toLowerCase();
    if (item.id === 'lpe-9' || uLower.includes('kenaikan / (penurunan) ekuitas')) {
      return {
        ...item,
        tahunIni: mutasi2026,
        tahunLalu: mutasi2025,
      };
    }
    if (item.id === 'lpe-total' || uLower.includes('ekuitas akhir')) {
      return {
        ...item,
        tahunIni: ekuitasAkhir2026,
        tahunLalu: ekuitasAkhir2025,
      };
    }
    return item;
  });
}
