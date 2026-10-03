import * as XLSX from 'xlsx';
import { LRAItem, LOItem, LPEItem, NeracaItem } from '../types/financial';
import { parseIndonesianNumber } from './numberFormat';

export interface ParseResult {
  detectedType: 'lra' | 'lo' | 'lpe' | 'neraca' | 'multisheet' | 'unknown';
  lra?: LRAItem[];
  lo?: LOItem[];
  lpe?: LPEItem[];
  neraca?: NeracaItem[];
  summaryMessage: string;
  sheetNames?: string[];
}

/**
 * Smart file parser for SAKTI exports, Excel sheets, and CSV/Text
 */
export async function parseFinancialFile(
  file: File,
  expectedType?: 'lra' | 'lo' | 'lpe' | 'neraca'
): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();

  // If JSON
  if (fileName.endsWith('.json')) {
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (data.lra || data.lo || data.lpe || data.neraca) {
        return {
          detectedType: 'multisheet',
          lra: data.lra,
          lo: data.lo,
          lpe: data.lpe,
          neraca: data.neraca,
          summaryMessage: 'Berhasil memuat seluruh paket Laporan Keuangan dari berkas JSON SAKTI.',
        };
      }
    } catch {
      throw new Error('Format JSON tidak valid.');
    }
  }

  // If Excel or CSV
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  // If explicit expectedType requested by a specific report tab (LRA, LO, LPE, Neraca)
  if (expectedType) {
    // Find matching sheet name if available, otherwise use active/first sheet
    let targetSheet = workbook.Sheets[sheetNames[0]];
    for (const name of sheetNames) {
      const lower = name.toLowerCase();
      if (
        (expectedType === 'lra' && (lower.includes('lra') || lower.includes('realisasi'))) ||
        (expectedType === 'lo' && (lower.includes('lo') || lower.includes('operasional'))) ||
        (expectedType === 'lpe' && (lower.includes('lpe') || lower.includes('ekuitas'))) ||
        (expectedType === 'neraca' && (lower.includes('neraca') || lower.includes('posisi')))
      ) {
        targetSheet = workbook.Sheets[name];
        break;
      }
    }

    const rows: any[][] = XLSX.utils.sheet_to_json(targetSheet, { header: 1 });

    if (expectedType === 'lra') {
      const lra = parseLRARows(rows);
      return {
        detectedType: 'lra',
        lra,
        summaryMessage: `Berhasil mengekstrak ${lra.length} baris LRA dari berkas SAKTI.`,
      };
    } else if (expectedType === 'lo') {
      const lo = parseLORows(rows);
      return {
        detectedType: 'lo',
        lo,
        summaryMessage: `Berhasil mengekstrak ${lo.length} baris LO dari berkas SAKTI.`,
      };
    } else if (expectedType === 'lpe') {
      const lpe = parseLPERows(rows);
      return {
        detectedType: 'lpe',
        lpe,
        summaryMessage: `Berhasil mengekstrak ${lpe.length} baris LPE dari berkas SAKTI.`,
      };
    } else if (expectedType === 'neraca') {
      const neraca = parseNeracaRows(rows);
      return {
        detectedType: 'neraca',
        neraca,
        summaryMessage: `Berhasil mengekstrak ${neraca.length} baris Neraca dari berkas SAKTI.`,
      };
    }
  }

  // Check if multi-sheet contains LRA, LO, LPE, Neraca
  let hasLRA = false;
  let hasLO = false;
  let hasLPE = false;
  let hasNeraca = false;

  let parsedLRA: LRAItem[] | undefined;
  let parsedLO: LOItem[] | undefined;
  let parsedLPE: LPEItem[] | undefined;
  let parsedNeraca: NeracaItem[] | undefined;

  for (const name of sheetNames) {
    const lowerName = name.toLowerCase();
    const sheet = workbook.Sheets[name];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (lowerName.includes('lra') || lowerName.includes('realisasi')) {
      parsedLRA = parseLRARows(rows);
      hasLRA = true;
    } else if (lowerName.includes('lo') || lowerName.includes('operasional')) {
      parsedLO = parseLORows(rows);
      hasLO = true;
    } else if (lowerName.includes('lpe') || lowerName.includes('ekuitas')) {
      parsedLPE = parseLPERows(rows);
      hasLPE = true;
    } else if (lowerName.includes('neraca') || lowerName.includes('posisi')) {
      parsedNeraca = parseNeracaRows(rows);
      hasNeraca = true;
    }
  }

  if (hasLRA || hasLO || hasLPE || hasNeraca) {
    return {
      detectedType: 'multisheet',
      lra: parsedLRA,
      lo: parsedLO,
      lpe: parsedLPE,
      neraca: parsedNeraca,
      sheetNames,
      summaryMessage: `Ditemukan ${[
        hasLRA ? 'LRA' : '',
        hasLO ? 'LO' : '',
        hasLPE ? 'LPE' : '',
        hasNeraca ? 'Neraca' : '',
      ]
        .filter(Boolean)
        .join(', ')} dari lembar kerja Excel.`,
    };
  }

  // Single sheet detection based on content
  const firstSheet = workbook.Sheets[sheetNames[0]];
  const allRows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
  const textContent = allRows
    .slice(0, 15)
    .map(r => r.join(' '))
    .join(' ')
    .toLowerCase();

  if (textContent.includes('realisasi anggaran') || textContent.includes('lra') || textContent.includes('belanja pegawai')) {
    const lra = parseLRARows(allRows);
    return {
      detectedType: 'lra',
      lra,
      summaryMessage: `Berhasil mengekstrak ${lra.length} baris komponen LRA secara otomatis.`,
    };
  }

  if (textContent.includes('laporan operasional') || textContent.includes('beban pegawai') || textContent.includes('surplus / (defisit) - lo')) {
    const lo = parseLORows(allRows);
    return {
      detectedType: 'lo',
      lo,
      summaryMessage: `Berhasil mengekstrak ${lo.length} baris komponen LO secara otomatis.`,
    };
  }

  if (textContent.includes('perubahan ekuitas') || textContent.includes('lpe') || textContent.includes('ekuitas awal')) {
    const lpe = parseLPERows(allRows);
    return {
      detectedType: 'lpe',
      lpe,
      summaryMessage: `Berhasil mengekstrak ${lpe.length} baris komponen LPE secara otomatis.`,
    };
  }

  if (textContent.includes('neraca') || textContent.includes('aset lancar') || textContent.includes('kas di bendahara')) {
    const neraca = parseNeracaRows(allRows);
    return {
      detectedType: 'neraca',
      neraca,
      summaryMessage: `Berhasil mengekstrak ${neraca.length} baris komponen Neraca secara otomatis.`,
    };
  }

  // Default fallback: parse as general table
  const lraFallback = parseLRARows(allRows);
  return {
    detectedType: 'lra',
    lra: lraFallback,
    summaryMessage: `Berhasil membaca berkas tabular dan memetakannya ke LRA (${lraFallback.length} baris).`,
  };
}

function parseLRARows(rows: any[][]): LRAItem[] {
  const items: LRAItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    // Filter out common header title strings
    const joined = row.join(' ').toLowerCase();
    if (
      joined.includes('kementerian') ||
      joined.includes('laporan realisasi') ||
      joined.includes('lembar kerja') ||
      joined.includes('anggaran setelah revisi')
    ) {
      continue;
    }

    // Find code, uraian, and numbers
    let kode = '';
    let uraian = '';
    const numbers: number[] = [];

    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (cell === null || cell === undefined || cell === '') continue;

      if (typeof cell === 'number') {
        numbers.push(cell);
      } else {
        const str = String(cell).trim();
        // check if this cell looks like an Indonesian formatted number
        if (/^[\d.,()\- ]+$/.test(str) && /[0-9]/.test(str)) {
          const num = parseIndonesianNumber(str);
          numbers.push(num);
        } else if (/^\d{1,6}$/.test(str) && !uraian) {
          kode = str;
        } else if (!uraian && str.length > 2) {
          uraian = str;
        }
      }
    }

    if (uraian) {
      const anggaran = numbers[0] || 0;
      const realisasi = numbers[1] || 0;
      const sisa = anggaran - realisasi;
      const pct = anggaran > 0 ? (realisasi / anggaran) * 100 : 0;
      const realisasiLalu = numbers[2] || 0;

      const isHeader = uraian === uraian.toUpperCase() && numbers.length <= 1;
      const isTotal = uraian.toLowerCase().includes('jumlah') || uraian.toLowerCase().includes('surplus') || uraian.toLowerCase().includes('total');

      items.push({
        id: `lra-row-${i}`,
        kode,
        uraian,
        anggaran,
        realisasi,
        persentase: Number(pct.toFixed(2)),
        sisaAnggaran: sisa,
        realisasiLalu,
        level: isTotal ? 'total' : isHeader ? 'header' : kode ? 'item' : 'subgroup',
        isBold: isHeader || isTotal,
      });
    }
  }

  return items.length > 0 ? items : [];
}

function parseLORows(rows: any[][]): LOItem[] {
  const items: LOItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const joined = row.join(' ').toLowerCase();
    if (joined.includes('laporan operasional') || joined.includes('periode yang berakhir')) continue;

    let uraian = '';
    const numbers: number[] = [];

    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (cell === null || cell === undefined || cell === '') continue;

      if (typeof cell === 'number') {
        numbers.push(cell);
      } else {
        const str = String(cell).trim();
        if (/^[\d.,()\- ]+$/.test(str) && /[0-9]/.test(str)) {
          numbers.push(parseIndonesianNumber(str));
        } else if (!uraian && str.length > 2) {
          uraian = str;
        }
      }
    }

    if (uraian) {
      const tahunIni = numbers[0] || 0;
      const tahunLalu = numbers[1] || 0;
      const isHeader = uraian === uraian.toUpperCase();
      const isTotal = uraian.toLowerCase().includes('jumlah') || uraian.toLowerCase().includes('surplus / (defisit)');

      items.push({
        id: `lo-row-${i}`,
        uraian,
        tahunIni,
        tahunLalu,
        level: isTotal ? 'total' : isHeader ? 'header' : 'item',
        isBold: isHeader || isTotal,
      });
    }
  }

  return items;
}

function parseLPERows(rows: any[][]): LPEItem[] {
  const items: LPEItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    let uraian = '';
    const numbers: number[] = [];

    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (cell === null || cell === undefined || cell === '') continue;

      if (typeof cell === 'number') {
        numbers.push(cell);
      } else {
        const str = String(cell).trim();
        if (/^[\d.,()\- ]+$/.test(str) && /[0-9]/.test(str)) {
          numbers.push(parseIndonesianNumber(str));
        } else if (!uraian && str.length > 2) {
          uraian = str;
        }
      }
    }

    if (uraian) {
      const tahunIni = numbers[0] || 0;
      const tahunLalu = numbers[1] || 0;
      const isHeader = uraian === uraian.toUpperCase();
      const isTotal = uraian.toLowerCase().includes('ekuitas akhir');

      items.push({
        id: `lpe-row-${i}`,
        uraian,
        tahunIni,
        tahunLalu,
        level: isTotal ? 'total' : isHeader ? 'header' : 'item',
        isBold: isHeader || isTotal,
      });
    }
  }

  return items;
}

function parseNeracaRows(rows: any[][]): NeracaItem[] {
  const items: NeracaItem[] = [];
  let currentCategory: 'aset' | 'kewajiban' | 'ekuitas' = 'aset';

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    let uraian = '';
    const numbers: number[] = [];

    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (cell === null || cell === undefined || cell === '') continue;

      if (typeof cell === 'number') {
        numbers.push(cell);
      } else {
        const str = String(cell).trim();
        if (/^[\d.,()\- ]+$/.test(str) && /[0-9]/.test(str)) {
          numbers.push(parseIndonesianNumber(str));
        } else if (!uraian && str.length > 2) {
          uraian = str;
        }
      }
    }

    if (uraian) {
      const lower = uraian.toLowerCase();
      if (lower.includes('kewajiban')) currentCategory = 'kewajiban';
      if (lower.includes('ekuitas')) currentCategory = 'ekuitas';
      if (lower.includes('aset') && !lower.includes('kewajiban')) currentCategory = 'aset';

      const tahunIni = numbers[0] || 0;
      const tahunLalu = numbers[1] || 0;
      const isHeader = uraian === uraian.toUpperCase();
      const isTotal = lower.includes('jumlah') || lower.includes('total');

      items.push({
        id: `neraca-row-${i}`,
        uraian,
        tahunIni,
        tahunLalu,
        level: isTotal ? 'total' : isHeader ? 'header' : 'item',
        isBold: isHeader || isTotal,
        category: currentCategory,
      });
    }
  }

  return items;
}
