import React, { useState, useRef } from 'react';
import { NeracaItem, SatkerProfile } from '../types/financial';
import { OfficialReportHeader } from './OfficialReportHeader';
import { KpaSignatureBlock } from './KpaSignatureBlock';
import { formatNumber, formatPercent } from '../utils/numberFormat';
import { parseFinancialFile } from '../utils/parser';
import { Scale, Upload } from 'lucide-react';

interface FaceNeracaProps {
  satker: SatkerProfile;
  neraca: NeracaItem[];
  onUpdateNeraca: (newNeraca: NeracaItem[]) => void;
  onUploadNeracaFile?: (file: File) => Promise<void>;
  showDigitalStamp: boolean;
}

export const FaceNeraca: React.FC<FaceNeracaProps> = ({
  satker,
  neraca,
  onUpdateNeraca,
  onUploadNeracaFile,
  showDigitalStamp,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (onUploadNeracaFile) {
        await onUploadNeracaFile(file);
      } else {
        const result = await parseFinancialFile(file, 'neraca');
        if (result.neraca && result.neraca.length > 0) {
          onUpdateNeraca(recalculateNeracaTotals(result.neraca));
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalAsetRow = neraca.find(i => i.id === 'neraca-total-aset' || i.uraian === 'JUMLAH ASET');
  const totalPasivaRow = neraca.find(i => i.id === 'neraca-total-pasiva' || i.uraian === 'JUMLAH KEWAJIBAN DAN EKUITAS');
  const isBalanced2026 =
    (totalAsetRow?.tahunIni ?? 0) === (totalPasivaRow?.tahunIni ?? 0);

  return (
    <div className="bg-white p-6 sm:p-10 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-none print:p-0">
      <OfficialReportHeader
        satker={satker}
        title="NERACA"
        subtitle="PER 30 SEPTEMBER 2026 DAN 31 DESEMBER 2025"
      />

      {/* Toolbar with dedicated Upload Button */}
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">
            Format Standar SAP Neraca
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
            title="Unggah berkas ekspor Neraca dari SAKTI (Excel/CSV/Text)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Menyusun Neraca...' : 'Upload SAKTI Neraca'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
          <thead>
            {/* Header Baris 1 */}
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
              <th
                rowSpan={2}
                className="py-2.5 px-4 border-r border-slate-900 text-center w-80 sm:w-96 align-middle"
              >
                NAMA PERKIRAAN
              </th>
              <th
                colSpan={2}
                className="py-2 px-3 border-r border-slate-900 text-center"
              >
                JUMLAH
              </th>
              <th
                colSpan={2}
                className="py-2 px-3 text-center"
              >
                Kenaikan (Penurunan)
              </th>
            </tr>

            {/* Header Baris 2 */}
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center text-[11px]">
              <th className="py-2 px-3 border-r border-slate-900 text-center w-36">
                2026
              </th>
              <th className="py-2 px-3 border-r border-slate-900 text-center w-36">
                2025
              </th>
              <th className="py-2 px-3 border-r border-slate-900 text-center w-36">
                Jumlah
              </th>
              <th className="py-2 px-2 text-center w-20">
                %
              </th>
            </tr>

            {/* Header Baris 3 - Penomoran Kolom Resmi (1 s.d. 5) */}
            <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-900 text-center font-mono">
              <td className="py-1 border-r border-slate-900 text-center">1</td>
              <td className="py-1 border-r border-slate-900 text-center">2</td>
              <td className="py-1 border-r border-slate-900 text-center">3</td>
              <td className="py-1 border-r border-slate-900 text-center">4</td>
              <td className="py-1 text-center">5</td>
            </tr>
          </thead>
          <tbody>
            {neraca.map((row, idx) => {
              const u = row.uraian.trim();

              // Major Category headers: ASET, KEWAJIBAN, EKUITAS
              const isMajorCategoryHeader =
                (u === 'ASET' && row.level === 'header') ||
                (u === 'KEWAJIBAN' && row.level === 'header') ||
                (u === 'EKUITAS' && row.level === 'header');

              // Subgroup headers: ASET LANCAR, ASET TETAP, ASET LAINNYA, KEWAJIBAN JANGKA PENDEK, EKUITAS (subgroup)
              const isSubgroupHeader =
                u === 'ASET LANCAR' ||
                u === 'ASET TETAP' ||
                u === 'ASET LAINNYA' ||
                u === 'KEWAJIBAN JANGKA PENDEK' ||
                (u === 'EKUITAS' && row.level === 'subgroup');

              // Subtotals
              const isSubtotal =
                u === 'JUMLAH ASET LANCAR' ||
                u === 'JUMLAH ASET TETAP' ||
                u === 'JUMLAH ASET LAINNYA' ||
                u === 'JUMLAH KEWAJIBAN JANGKA PENDEK' ||
                (u === 'JUMLAH EKUITAS' && row.id === 'neraca-sub-ekuitas');

              // Main / Grand Totals
              const isMainTotal =
                u === 'JUMLAH ASET' ||
                u === 'JUMLAH KEWAJIBAN' ||
                (u === 'JUMLAH EKUITAS' && row.id === 'neraca-total-ekuitas');

              const isGrandTotal = u === 'JUMLAH KEWAJIBAN DAN EKUITAS';

              const hasNoValues = isMajorCategoryHeader || isSubgroupHeader;

              // Indentation class matching the sample image exactly
              let indentClass = 'pl-3';
              if (isMajorCategoryHeader) {
                indentClass = 'text-center font-bold tracking-wider uppercase';
              } else if (isSubgroupHeader) {
                indentClass = 'pl-3 font-bold uppercase';
              } else if (isSubtotal) {
                indentClass = 'pl-3 font-bold uppercase';
              } else if (isMainTotal) {
                indentClass = 'pl-3 font-bold uppercase';
              } else if (isGrandTotal) {
                indentClass = 'pl-3 font-bold uppercase';
              } else if (row.level === 'item') {
                indentClass = 'pl-6 text-slate-800';
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
                  key={row.id || `neraca-${idx}`}
                  className={`border-b border-slate-300 hover:bg-slate-50/70 transition-colors ${
                    isGrandTotal
                      ? 'bg-slate-100 font-bold border-t-2 border-b-2 border-slate-900 text-slate-950'
                      : isMainTotal
                      ? 'font-bold bg-slate-50/90 text-slate-950 border-t border-b border-slate-800'
                      : isMajorCategoryHeader
                      ? 'font-bold bg-slate-50/60 text-slate-950'
                      : isSubtotal
                      ? 'font-semibold bg-slate-50/30 text-slate-900'
                      : isSubgroupHeader
                      ? 'font-bold text-slate-900'
                      : ''
                  }`}
                >
                  {/* Kolom 1: NAMA PERKIRAAN */}
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

                  {/* Kolom 4: Jumlah (Kenaikan / Penurunan) */}
                  <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                    {hasNoValues ? '' : formatNumber(kenaikanPenurunan)}
                  </td>

                  {/* Kolom 5: % */}
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

export function recalculateNeracaTotals(items: NeracaItem[]): NeracaItem[] {
  let kasUP26 = 0, kasUP25 = 0;
  let tanah26 = 0, tanah25 = 0;
  let mesin26 = 0, mesin25 = 0;
  let gedung26 = 0, gedung25 = 0;
  let jalan26 = 0, jalan25 = 0;
  let tetapLain26 = 0, tetapLain25 = 0;
  let akPenyusutan26 = 0, akPenyusutan25 = 0;

  let asetLain26 = 0, asetLain25 = 0;
  let akAmortisasi26 = 0, akAmortisasi25 = 0;

  let uangMukaKppn26 = 0, uangMukaKppn25 = 0;
  let ekuitas26 = 0, ekuitas25 = 0;

  items.forEach(it => {
    const id = it.id;
    const u = it.uraian.toLowerCase().trim();

    // Aset Lancar
    if (id === 'neraca-1' || u.includes('kas di bendahara pengeluaran')) {
      kasUP26 = it.tahunIni;
      kasUP25 = it.tahunLalu;
    }
    // Aset Tetap
    else if (id === 'neraca-tanah' || u === 'tanah') {
      tanah26 = it.tahunIni;
      tanah25 = it.tahunLalu;
    } else if (id === 'neraca-peralatan-mesin' || u === 'peralatan dan mesin') {
      mesin26 = it.tahunIni;
      mesin25 = it.tahunLalu;
    } else if (id === 'neraca-gedung-bangunan' || u === 'gedung dan bangunan') {
      gedung26 = it.tahunIni;
      gedung25 = it.tahunLalu;
    } else if (id === 'neraca-jalan-irigasi' || u.includes('jalan, irigasi')) {
      jalan26 = it.tahunIni;
      jalan25 = it.tahunLalu;
    } else if (id === 'neraca-aset-tetap-lainnya' || u === 'aset tetap lainnya') {
      tetapLain26 = it.tahunIni;
      tetapLain25 = it.tahunLalu;
    } else if (id === 'neraca-akumulasi-penyusutan' || u === 'akumulasi penyusutan') {
      akPenyusutan26 = it.tahunIni;
      akPenyusutan25 = it.tahunLalu;
    }
    // Aset Lainnya
    else if (id === 'neraca-aset-lain-lain' || u === 'aset lain-lain') {
      asetLain26 = it.tahunIni;
      asetLain25 = it.tahunLalu;
    } else if (id === 'neraca-akumulasi-amortisasi' || u.includes('akumulasi penyusutan/amortisasi')) {
      akAmortisasi26 = it.tahunIni;
      akAmortisasi25 = it.tahunLalu;
    }
    // Kewajiban
    else if (id === 'neraca-uang-muka-kppn' || u.includes('uang muka dari kppn')) {
      uangMukaKppn26 = it.tahunIni;
      uangMukaKppn25 = it.tahunLalu;
    }
    // Ekuitas
    else if (id === 'neraca-18' || (u === 'ekuitas' && it.level === 'item')) {
      ekuitas26 = it.tahunIni;
      ekuitas25 = it.tahunLalu;
    }
  });

  const totAsetLancar26 = kasUP26;
  const totAsetLancar25 = kasUP25;

  const totAsetTetap26 = tanah26 + mesin26 + gedung26 + jalan26 + tetapLain26 + akPenyusutan26;
  const totAsetTetap25 = tanah25 + mesin25 + gedung25 + jalan25 + tetapLain25 + akPenyusutan25;

  const totAsetLain26 = asetLain26 + akAmortisasi26;
  const totAsetLain25 = asetLain25 + akAmortisasi25;

  const grandAset26 = totAsetLancar26 + totAsetTetap26 + totAsetLain26;
  const grandAset25 = totAsetLancar25 + totAsetTetap25 + totAsetLain25;

  const totKewajiban26 = uangMukaKppn26;
  const totKewajiban25 = uangMukaKppn25;

  const grandPasiva26 = totKewajiban26 + ekuitas26;
  const grandPasiva25 = totKewajiban25 + ekuitas25;

  return items.map(it => {
    const id = it.id;
    const u = it.uraian.trim();

    if (id === 'neraca-sub-al' || u === 'JUMLAH ASET LANCAR') {
      return { ...it, tahunIni: totAsetLancar26, tahunLalu: totAsetLancar25 };
    }
    if (id === 'neraca-sub-at' || u === 'JUMLAH ASET TETAP') {
      return { ...it, tahunIni: totAsetTetap26, tahunLalu: totAsetTetap25 };
    }
    if (id === 'neraca-sub-alain' || u === 'JUMLAH ASET LAINNYA') {
      return { ...it, tahunIni: totAsetLain26, tahunLalu: totAsetLain25 };
    }
    if (id === 'neraca-total-aset' || u === 'JUMLAH ASET') {
      return { ...it, tahunIni: grandAset26, tahunLalu: grandAset25 };
    }
    if (id === 'neraca-sub-kewajiban' || u === 'JUMLAH KEWAJIBAN JANGKA PENDEK') {
      return { ...it, tahunIni: totKewajiban26, tahunLalu: totKewajiban25 };
    }
    if (id === 'neraca-total-kewajiban' || u === 'JUMLAH KEWAJIBAN') {
      return { ...it, tahunIni: totKewajiban26, tahunLalu: totKewajiban25 };
    }
    if (id === 'neraca-sub-ekuitas' || id === 'neraca-total-ekuitas' || u === 'JUMLAH EKUITAS') {
      return { ...it, tahunIni: ekuitas26, tahunLalu: ekuitas25 };
    }
    if (id === 'neraca-total-pasiva' || u === 'JUMLAH KEWAJIBAN DAN EKUITAS') {
      return { ...it, tahunIni: grandPasiva26, tahunLalu: grandPasiva25 };
    }

    return it;
  });
}
