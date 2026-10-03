import React, { useState, useRef } from 'react';
import { LOItem, SatkerProfile } from '../types/financial';
import { OfficialReportHeader } from './OfficialReportHeader';
import { KpaSignatureBlock } from './KpaSignatureBlock';
import { formatNumber, formatPercent } from '../utils/numberFormat';
import { parseFinancialFile } from '../utils/parser';
import { Upload } from 'lucide-react';

interface FaceLOProps {
  satker: SatkerProfile;
  lo: LOItem[];
  onUpdateLO: (newLO: LOItem[]) => void;
  onUploadLOFile?: (file: File) => Promise<void>;
  showDigitalStamp: boolean;
}

export const FaceLO: React.FC<FaceLOProps> = ({
  satker,
  lo,
  onUpdateLO,
  onUploadLOFile,
  showDigitalStamp,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (onUploadLOFile) {
        await onUploadLOFile(file);
      } else {
        const result = await parseFinancialFile(file, 'lo');
        if (result.lo && result.lo.length > 0) {
          onUpdateLO(recalculateLOTotals(result.lo));
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
        title="LAPORAN OPERASIONAL (LO)"
        subtitle="UNTUK PERIODE YANG BERAKHIR 30 SEPTEMBER 2026 DAN 2025"
      />

      {/* Toolbar with dedicated Upload Button */}
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">
            Format Standar SAP Laporan Operasional (LO)
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
            title="Unggah berkas ekspor LO dari SAKTI (Excel/CSV/Text)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Menyusun LO...' : 'Upload SAKTI LO'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
          <thead>
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
          </thead>
          <tbody>
            {lo.map((row, idx) => {
              const u = row.uraian.trim();

              const isSectionHeader =
                u === 'KEGIATAN OPERASIONAL' ||
                u === 'KEGIATAN NON OPERASIONAL' ||
                (u === 'POS LUAR BIASA' && row.level === 'header');

              const isSubSectionHeader =
                u === 'PENDAPATAN OPERASIONAL' ||
                u === 'BEBAN OPERASIONAL';

              const isGroupHeader =
                u === 'PENDAPATAN PERPAJAKAN' ||
                u === 'PENDAPATAN PENERIMAAN NEGARA BUKAN PAJAK' ||
                u === 'PENDAPATAN HIBAH';

              const isNonOpSubgroup =
                u === 'Surplus/Defisit Pelepasan Aset' ||
                u === 'Surplus/Defisit Penyelesaian Kewajiban Jangka Panjang' ||
                u === 'Surplus/Defisit dari Kegiatan Non Operasional Lainnya';

              const isSubtotal =
                u === 'Jumlah Pendapatan Perpajakan' ||
                u === 'Jumlah Pendapatan Negara Bukan Pajak' ||
                u === 'Jumlah Pendapatan Hibah' ||
                u === 'Jumlah Pendapatan' ||
                u === 'JUMLAH BEBAN' ||
                u === 'JUMLAH SURPLUS/DEFISIT DARI KEGIATAN NON OPERASIONAL' ||
                (u === 'POS LUAR BIASA' && row.level === 'total');

              const isGrandTotal =
                u === 'SURPLUS/DEFISIT DARI KEGIATAN OPERASIONAL' ||
                u === 'SURPLUS/DEFISIT SEBELUM POS LUAR BIASA' ||
                u === 'SURPLUS/DEFISIT - LO';

              const hasNoValues = isSectionHeader || isSubSectionHeader || isGroupHeader;

              // Indentation class
              let indentClass = 'pl-3';
              if (isSectionHeader) {
                indentClass = 'pl-3 font-bold uppercase';
              } else if (isSubSectionHeader) {
                indentClass = 'pl-4 font-bold uppercase';
              } else if (isGroupHeader) {
                indentClass = 'pl-6 font-semibold uppercase';
              } else if (isNonOpSubgroup) {
                indentClass = 'pl-6 font-semibold';
              } else if (isSubtotal) {
                indentClass = u.startsWith('Jumlah Pendapatan ') && u !== 'Jumlah Pendapatan'
                  ? 'pl-6 font-semibold'
                  : 'pl-4 font-bold';
              } else if (isGrandTotal) {
                indentClass = 'pl-3 font-bold uppercase';
              } else if (row.level === 'item') {
                if (u.includes('Pelepasan') || u.includes('Kewajiban') || u.includes('Non Operasional Lainnya')) {
                  indentClass = 'pl-10';
                } else if (u.startsWith('Beban Luar Biasa')) {
                  indentClass = 'pl-6';
                } else if (u.startsWith('Beban ')) {
                  indentClass = 'pl-8';
                } else {
                  indentClass = 'pl-8';
                }
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
                  key={row.id || `lo-${idx}`}
                  className={`border-b border-slate-300 hover:bg-slate-50/70 transition-colors ${
                    isGrandTotal
                      ? 'bg-slate-100 font-bold border-t-2 border-b-2 border-slate-900 text-slate-950'
                      : isSectionHeader
                      ? 'font-bold bg-slate-50 text-slate-950'
                      : isSubtotal
                      ? 'font-semibold bg-slate-50/40 text-slate-900'
                      : isSubSectionHeader
                      ? 'font-bold text-slate-900'
                      : isGroupHeader
                      ? 'font-semibold text-slate-900'
                      : isNonOpSubgroup
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

export function recalculateLOTotals(items: LOItem[]): LOItem[] {
  let sumPajak26 = 0, sumPajak25 = 0;
  let sumPnbp26 = 0, sumPnbp25 = 0;
  let sumHibah26 = 0, sumHibah25 = 0;
  let sumBeban26 = 0, sumBeban25 = 0;

  let sumPendPelepasan26 = 0, sumPendPelepasan25 = 0;
  let sumBebanPelepasan26 = 0, sumBebanPelepasan25 = 0;
  let sumPendKewajiban26 = 0, sumPendKewajiban25 = 0;
  let sumBebanKewajiban26 = 0, sumBebanKewajiban25 = 0;
  let sumPendNonOpLain26 = 0, sumPendNonOpLain25 = 0;
  let sumBebanNonOpLain26 = 0, sumBebanNonOpLain25 = 0;

  let sumBebanLuarBiasa26 = 0, sumBebanLuarBiasa25 = 0;

  items.forEach(it => {
    const u = it.uraian.toLowerCase();
    const id = it.id;

    // Pajak
    if (
      id.startsWith('lo-pajak') ||
      id.startsWith('lo-ppn') ||
      id.startsWith('lo-pbb') ||
      id.startsWith('lo-bphtb') ||
      id.startsWith('lo-cukai') ||
      id.startsWith('lo-bea')
    ) {
      sumPajak26 += it.tahunIni;
      sumPajak25 += it.tahunLalu;
    }
    // PNBP
    else if (
      id.startsWith('lo-pnbp') ||
      id === 'lo-3' ||
      u.includes('pnbp') ||
      u.includes('penerimaan negara bukan pajak lainnya') ||
      u.includes('badan layanan umum') ||
      u.includes('sumber daya alam') ||
      u.includes('knd')
    ) {
      sumPnbp26 += it.tahunIni;
      sumPnbp25 += it.tahunLalu;
    }
    // Hibah
    else if (id === 'lo-hibah-item' || (u.includes('pendapatan hibah') && it.level === 'item')) {
      sumHibah26 += it.tahunIni;
      sumHibah25 += it.tahunLalu;
    }
    // Beban Operasional
    else if (
      id.startsWith('lo-beban-') ||
      id === 'lo-6' ||
      id === 'lo-7' ||
      id === 'lo-8' ||
      id === 'lo-9' ||
      id === 'lo-10' ||
      id === 'lo-11'
    ) {
      if (
        id !== 'lo-beban-pelepasan-aset' &&
        id !== 'lo-beban-kewajiban-panjang' &&
        id !== 'lo-beban-non-operasional-lainnya' &&
        id !== 'lo-beban-luarbiasa-item'
      ) {
        sumBeban26 += it.tahunIni;
        sumBeban25 += it.tahunLalu;
      }
    }

    // Pelepasan Aset
    if (id === 'lo-pendapatan-pelepasan-aset') {
      sumPendPelepasan26 += it.tahunIni;
      sumPendPelepasan25 += it.tahunLalu;
    } else if (id === 'lo-beban-pelepasan-aset') {
      sumBebanPelepasan26 += it.tahunIni;
      sumBebanPelepasan25 += it.tahunLalu;
    }
    // Kewajiban Jangka Panjang
    else if (id === 'lo-pendapatan-kewajiban-panjang') {
      sumPendKewajiban26 += it.tahunIni;
      sumPendKewajiban25 += it.tahunLalu;
    } else if (id === 'lo-beban-kewajiban-panjang') {
      sumBebanKewajiban26 += it.tahunIni;
      sumBebanKewajiban25 += it.tahunLalu;
    }
    // Non Operasional Lainnya
    else if (id === 'lo-pendapatan-non-operasional-lainnya') {
      sumPendNonOpLain26 += it.tahunIni;
      sumPendNonOpLain25 += it.tahunLalu;
    } else if (id === 'lo-beban-non-operasional-lainnya') {
      sumBebanNonOpLain26 += it.tahunIni;
      sumBebanNonOpLain25 += it.tahunLalu;
    }
    // Pos Luar Biasa
    else if (id === 'lo-beban-luarbiasa-item') {
      sumBebanLuarBiasa26 += it.tahunIni;
      sumBebanLuarBiasa25 += it.tahunLalu;
    }
  });

  const totalPendapatan26 = sumPajak26 + sumPnbp26 + sumHibah26;
  const totalPendapatan25 = sumPajak25 + sumPnbp25 + sumHibah25;

  const surplusOperasional26 = totalPendapatan26 - sumBeban26;
  const surplusOperasional25 = totalPendapatan25 - sumBeban25;

  const surplusPelepasan26 = sumPendPelepasan26 - sumBebanPelepasan26;
  const surplusPelepasan25 = sumPendPelepasan25 - sumBebanPelepasan25;

  const surplusKewajiban26 = sumPendKewajiban26 - sumBebanKewajiban26;
  const surplusKewajiban25 = sumPendKewajiban25 - sumBebanKewajiban25;

  const surplusNonOpLain26 = sumPendNonOpLain26 - sumBebanNonOpLain26;
  const surplusNonOpLain25 = sumPendNonOpLain25 - sumBebanNonOpLain25;

  const totalNonOperasional26 = surplusPelepasan26 + surplusKewajiban26 + surplusNonOpLain26;
  const totalNonOperasional25 = surplusPelepasan25 + surplusKewajiban25 + surplusNonOpLain25;

  const surplusSebelumLB26 = surplusOperasional26 + totalNonOperasional26;
  const surplusSebelumLB25 = surplusOperasional25 + totalNonOperasional25;

  const posLuarBiasa26 = -sumBebanLuarBiasa26;
  const posLuarBiasa25 = -sumBebanLuarBiasa25;

  const surplusLOFinal26 = surplusSebelumLB26 + posLuarBiasa26;
  const surplusLOFinal25 = surplusSebelumLB25 + posLuarBiasa25;

  return items.map(it => {
    const id = it.id;
    const u = it.uraian.trim();

    if (id === 'lo-total-perpajakan' || u === 'Jumlah Pendapatan Perpajakan') {
      return { ...it, tahunIni: sumPajak26, tahunLalu: sumPajak25 };
    }
    if (id === 'lo-total-pnbp' || u === 'Jumlah Pendapatan Negara Bukan Pajak') {
      return { ...it, tahunIni: sumPnbp26, tahunLalu: sumPnbp25 };
    }
    if (id === 'lo-total-hibah' || u === 'Jumlah Pendapatan Hibah') {
      return { ...it, tahunIni: sumHibah26, tahunLalu: sumHibah25 };
    }
    if (id === 'lo-total-pendapatan' || u === 'Jumlah Pendapatan') {
      return { ...it, tahunIni: totalPendapatan26, tahunLalu: totalPendapatan25 };
    }
    if (id === 'lo-total-beban' || u === 'JUMLAH BEBAN') {
      return { ...it, tahunIni: sumBeban26, tahunLalu: sumBeban25 };
    }
    if (id === 'lo-surplus-operasional' || u === 'SURPLUS/DEFISIT DARI KEGIATAN OPERASIONAL') {
      return { ...it, tahunIni: surplusOperasional26, tahunLalu: surplusOperasional25 };
    }
    if (id === 'lo-subgroup-pelepasan-aset' || u === 'Surplus/Defisit Pelepasan Aset') {
      return { ...it, tahunIni: surplusPelepasan26, tahunLalu: surplusPelepasan25 };
    }
    if (id === 'lo-subgroup-kewajiban-panjang' || u === 'Surplus/Defisit Penyelesaian Kewajiban Jangka Panjang') {
      return { ...it, tahunIni: surplusKewajiban26, tahunLalu: surplusKewajiban25 };
    }
    if (id === 'lo-subgroup-non-operasional-lainnya' || u === 'Surplus/Defisit dari Kegiatan Non Operasional Lainnya') {
      return { ...it, tahunIni: surplusNonOpLain26, tahunLalu: surplusNonOpLain25 };
    }
    if (id === 'lo-total-non-operasional' || u === 'JUMLAH SURPLUS/DEFISIT DARI KEGIATAN NON OPERASIONAL') {
      return { ...it, tahunIni: totalNonOperasional26, tahunLalu: totalNonOperasional25 };
    }
    if (id === 'lo-surplus-sebelum-luarbiasa' || u === 'SURPLUS/DEFISIT SEBELUM POS LUAR BIASA') {
      return { ...it, tahunIni: surplusSebelumLB26, tahunLalu: surplusSebelumLB25 };
    }
    if (id === 'lo-total-pos-luarbiasa' || (u === 'POS LUAR BIASA' && it.level === 'total')) {
      return { ...it, tahunIni: posLuarBiasa26, tahunLalu: posLuarBiasa25 };
    }
    if (id === 'lo-total' || u === 'SURPLUS/DEFISIT - LO') {
      return { ...it, tahunIni: surplusLOFinal26, tahunLalu: surplusLOFinal25 };
    }

    return it;
  });
}
