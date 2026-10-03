import React, { useRef, useState } from 'react';
import { LRAItem, SatkerProfile } from '../types/financial';
import { OfficialReportHeader } from './OfficialReportHeader';
import { KpaSignatureBlock } from './KpaSignatureBlock';
import { formatNumber, formatPercent } from '../utils/numberFormat';
import { parseFinancialFile } from '../utils/parser';
import { Upload } from 'lucide-react';

interface FaceLRAProps {
  satker: SatkerProfile;
  lra: LRAItem[];
  onUpdateLRA: (newLRA: LRAItem[]) => void;
  onUploadLRAFile?: (file: File) => Promise<void>;
  showDigitalStamp: boolean;
}

export const FaceLRA: React.FC<FaceLRAProps> = ({
  satker,
  lra,
  onUpdateLRA,
  onUploadLRAFile,
  showDigitalStamp,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (onUploadLRAFile) {
        await onUploadLRAFile(file);
      } else {
        const result = await parseFinancialFile(file);
        if (result.lra && result.lra.length > 0) {
          onUpdateLRA(result.lra);
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 sm:p-10 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-none print:p-0">
      <OfficialReportHeader
        satker={satker}
        title="LAPORAN REALISASI ANGGARAN (LRA)"
        subtitle="UNTUK PERIODE YANG BERAKHIR 30 SEPTEMBER 2026 DAN 2025"
      />

      {/* Toolbar with Upload SAKTI LRA (Aksi column removed per user instruction) */}
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">
            Format Standar SAP Laporan Realisasi Anggaran (LRA)
          </span>
          <span className="text-slate-500">· Ditandatangani KPA</span>
        </div>

        <div className="flex items-center gap-2">
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
            title="Unggah berkas ekspor LRA dari SAKTI (Excel/CSV/Text)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Menyusun LRA...' : 'Upload SAKTI LRA'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
          <thead>
            {/* Header Level 1 */}
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
              <th rowSpan={2} className="py-2.5 px-4 border-r border-slate-900 text-center w-72 sm:w-80">
                URAIAN
              </th>
              <th colSpan={4} className="py-2 px-2 border-r border-slate-900 text-center">
                2026
              </th>
              <th colSpan={4} className="py-2 px-2 text-center">
                2025
              </th>
            </tr>

            {/* Header Level 2 */}
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center text-[11px]">
              {/* 2026 */}
              <th className="py-2 px-2 border-r border-slate-900 text-right w-28">
                ANGGARAN
              </th>
              <th className="py-2 px-2 border-r border-slate-900 text-right w-28">
                REALISASI
              </th>
              <th className="py-2 px-2 border-r border-slate-900 text-right w-32 leading-tight">
                REALISASI DI ATAS<br />(BAWAH) ANGGARAN
              </th>
              <th className="py-2 px-1 border-r border-slate-900 text-right w-14">
                %
              </th>

              {/* 2025 */}
              <th className="py-2 px-2 border-r border-slate-900 text-right w-28">
                ANGGARAN
              </th>
              <th className="py-2 px-2 border-r border-slate-900 text-right w-28">
                REALISASI
              </th>
              <th className="py-2 px-2 border-r border-slate-900 text-right w-32 leading-tight">
                REALISASI DI ATAS<br />(BAWAH) ANGGARAN
              </th>
              <th className="py-2 px-1 text-right w-14">
                %
              </th>
            </tr>

            {/* Header Level 3 - Official Column Numbering */}
            <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-900 text-center font-mono">
              <td className="py-1 border-r border-slate-900">1</td>
              <td className="py-1 border-r border-slate-900">2</td>
              <td className="py-1 border-r border-slate-900">4</td>
              <td className="py-1 border-r border-slate-900">5</td>
              <td className="py-1 border-r border-slate-900">6</td>
              <td className="py-1 border-r border-slate-900">7</td>
              <td className="py-1 border-r border-slate-900">8</td>
              <td className="py-1 border-r border-slate-900">9</td>
              <td className="py-1">10</td>
            </tr>
          </thead>

          <tbody>
            {lra.map((row, idx) => {
              const isHeader = row.level === 'header';
              const isGroup = row.level === 'group';
              const isTotal = row.level === 'total';
              const isSubgroup = row.level === 'subgroup';
              const isItem = row.level === 'item';

              // Indentation matching standard layout
              let indentClass = '';
              if (isGroup) indentClass = 'pl-4';
              else if (isSubgroup) indentClass = 'pl-6';
              else if (isItem && (row.uraian.startsWith('a.') || row.uraian.startsWith('b.') || row.uraian.startsWith('c.'))) {
                indentClass = 'pl-10';
              } else if (isItem) {
                indentClass = 'pl-8';
              }

              // Values
              const ang26 = row.anggaran || 0;
              const real26 = row.realisasi || 0;
              const selisih26 = row.selisih !== undefined ? row.selisih : real26 - ang26;
              const pct26 = row.persentase !== undefined ? row.persentase : (ang26 > 0 ? (real26 / ang26) * 100 : 0);

              const ang25 = row.anggaranLalu || 0;
              const real25 = row.realisasiLalu || 0;
              const selisih25 = row.selisihLalu !== undefined ? row.selisihLalu : real25 - ang25;
              const pct25 = row.persenLalu !== undefined ? row.persenLalu : (ang25 > 0 ? (real25 / ang25) * 100 : 0);

              const isEmptyRow = isGroup && ang26 === 0 && real26 === 0 && !row.uraian.includes('II.');
              const isSectionHeader = isHeader && ang26 === 0 && real26 === 0;

              return (
                <tr
                  key={row.id || idx}
                  className={`border-b border-slate-300 hover:bg-slate-50/70 transition-colors ${
                    isTotal
                      ? 'bg-slate-100 font-bold border-t-2 border-b-2 border-slate-900 text-slate-950'
                      : isHeader
                      ? 'font-bold bg-slate-50/90 text-slate-950'
                      : isGroup
                      ? 'font-semibold text-slate-900 bg-slate-50/30'
                      : isSubgroup
                      ? 'font-semibold text-slate-800'
                      : ''
                  }`}
                >
                  {/* Kolom 1: Uraian */}
                  <td className={`py-1.5 px-3 border-r border-slate-900 ${indentClass}`}>
                    {row.uraian}
                  </td>

                  {/* 2026: Kolom 2 - ANGGARAN */}
                  <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                    {isSectionHeader || isEmptyRow || (ang26 === 0 && !isTotal)
                      ? ''
                      : formatNumber(ang26)}
                  </td>

                  {/* 2026: Kolom 4 - REALISASI */}
                  <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                    {isSectionHeader || isEmptyRow || (real26 === 0 && !isTotal)
                      ? ''
                      : formatNumber(real26)}
                  </td>

                  {/* 2026: Kolom 5 - REALISASI DI ATAS (BAWAH) ANGGARAN */}
                  <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                    {isSectionHeader || isEmptyRow || (ang26 === 0 && real26 === 0 && !isTotal)
                      ? ''
                      : formatNumber(selisih26)}
                  </td>

                  {/* 2026: Kolom 6 - % */}
                  <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono">
                    {isSectionHeader || isEmptyRow || ang26 === 0
                      ? ''
                      : formatPercent(pct26)}
                  </td>

                  {/* 2025: Kolom 7 - ANGGARAN */}
                  <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                    {isSectionHeader || isEmptyRow || (ang25 === 0 && !isTotal)
                      ? ''
                      : formatNumber(ang25)}
                  </td>

                  {/* 2025: Kolom 8 - REALISASI */}
                  <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                    {isSectionHeader || isEmptyRow || (real25 === 0 && !isTotal)
                      ? ''
                      : formatNumber(real25)}
                  </td>

                  {/* 2025: Kolom 9 - REALISASI DI ATAS (BAWAH) ANGGARAN */}
                  <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                    {isSectionHeader || isEmptyRow || (ang25 === 0 && real25 === 0 && !isTotal)
                      ? ''
                      : formatNumber(selisih25)}
                  </td>

                  {/* 2025: Kolom 10 - % */}
                  <td className="py-1.5 px-1 text-right font-mono">
                    {isSectionHeader || isEmptyRow || ang25 === 0
                      ? ''
                      : formatPercent(pct25)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Official Signature block of KPA */}
      <KpaSignatureBlock satker={satker} showDigitalStamp={showDigitalStamp} />
    </div>
  );
};
