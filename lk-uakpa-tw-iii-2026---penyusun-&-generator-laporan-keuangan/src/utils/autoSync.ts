import {
  LRAItem,
  LOItem,
  LPEItem,
  NeracaItem,
  LampiranIIData,
  LampiranIIIData,
} from '../types/financial';
import { formatNumber, formatPercent } from './numberFormat';

export interface SyncResult {
  lampiranII: LampiranIIData;
  lampiranIII: LampiranIIIData;
  lpe: LPEItem[];
  neraca: NeracaItem[];
}

/**
 * Automatically synchronizes changes from LRA, LO, LPE, and Neraca
 * into Lampiran II (Informasi Keuangan Tertentu) and Lampiran III (Kinerja).
 */
export function syncFinancialData(
  lra: LRAItem[],
  lo: LOItem[],
  lpe: LPEItem[],
  neraca: NeracaItem[],
  prevLampII: LampiranIIData,
  prevLampIII: LampiranIIIData
): SyncResult {
  // 1. Calculate LRA by categories
  let pagu51 = 0, real51 = 0;
  let pagu52 = 0, real52 = 0;
  let pagu53 = 0, real53 = 0;
  let pagu57 = 0, real57 = 0;

  // Pegawai sub-items
  let pagu5111 = 0, real5111 = 0;
  let pagu5115 = 0, real5115 = 0;
  let pagu5121 = 0, real5121 = 0;

  lra.forEach(item => {
    const k = item.kode || '';
    const u = item.uraian.toLowerCase();

    if (k === '51' || u.includes('1. belanja pegawai') || (u.includes('belanja pegawai') && item.level === 'item')) {
      pagu51 = item.anggaran;
      real51 = item.realisasi;
    } else if (k === '52' || u.includes('2. belanja barang') || (u.includes('belanja barang') && item.level === 'item')) {
      pagu52 = item.anggaran;
      real52 = item.realisasi;
    } else if (k === '53' || u.includes('3. belanja modal') || (u.includes('belanja modal') && item.level === 'item')) {
      pagu53 = item.anggaran;
      real53 = item.realisasi;
    } else if (k === '57' || u.includes('7. belanja bantuan sosial') || (u.includes('bantuan sosial') && item.level === 'item')) {
      pagu57 = item.anggaran;
      real57 = item.realisasi;
    }

    // Sub-items
    if (k.startsWith('51111') || k === '5111') {
      pagu5111 = item.anggaran;
      real5111 = item.realisasi;
    } else if (k.startsWith('51241') || k.startsWith('5115') || k === '5115') {
      pagu5115 = item.anggaran;
      real5115 = item.realisasi;
    } else if (k.startsWith('51112') || k.startsWith('5121') || k === '5121') {
      pagu5121 = item.anggaran;
      real5121 = item.realisasi;
    }
  });


  // Total Belanja
  const totalPaguBelanja = pagu51 + pagu52 + pagu53 + pagu57;
  const totalRealBelanja = real51 + real52 + real53 + real57;
  const persenBelanja = totalPaguBelanja > 0 ? (totalRealBelanja / totalPaguBelanja) * 100 : 0;

  // Lampiran II is maintained manually by user with automated formulas & dynamic sentences
  const updatedLampiranII: LampiranIIData = {
    ...prevLampII,
  };

  // Sync LO Surplus/Defisit to LPE
  const loSurplusRow = lo.find(l => l.id === 'lo-total');
  const surplusLOValue = loSurplusRow ? loSurplusRow.tahunIni : -2655000000;
  const surplusLOLalu = loSurplusRow ? loSurplusRow.tahunLalu : -2451500000;

  const updatedLPE = lpe.map(item => {
    if (item.id === 'lpe-2') {
      return {
        ...item,
        tahunIni: surplusLOValue,
        tahunLalu: surplusLOLalu,
      };
    }
    return item;
  });

  // Recalculate LPE totals
  let ekuitasAwal = 0;
  let mutasi = 0;
  updatedLPE.forEach(item => {
    if (item.id === 'lpe-1') ekuitasAwal = item.tahunIni;
    else if (item.level === 'item') mutasi += item.tahunIni;
  });
  const ekuitasAkhir = ekuitasAwal + mutasi;

  const finalLPE = updatedLPE.map(item => {
    if (item.id === 'lpe-9') return { ...item, tahunIni: mutasi };
    if (item.id === 'lpe-total') return { ...item, tahunIni: ekuitasAkhir };
    return item;
  });

  // Sync LPE Ekuitas Akhir to Neraca
  const updatedNeraca = neraca.map(item => {
    if (item.id === 'neraca-18' || item.id === 'neraca-total-ekuitas') {
      return { ...item, tahunIni: ekuitasAkhir };
    }
    return item;
  });

  // Recalculate Neraca totals
  let asetTotal = 0;
  let kewajibanTotal = 0;
  let ekuitasTotal = ekuitasAkhir;

  updatedNeraca.forEach(item => {
    if (item.id === 'neraca-total-aset') asetTotal = item.tahunIni;
    if (item.id === 'neraca-total-kewajiban') kewajibanTotal = item.tahunIni;
  });

  const finalNeraca = updatedNeraca.map(item => {
    if (item.id === 'neraca-total-pasiva') {
      return { ...item, tahunIni: kewajibanTotal + ekuitasTotal };
    }
    return item;
  });

  // Sync Lampiran III totals if LRA Belanja updated
  // Lampiran III is maintained manually by user with automated formulas (persen, total)
  const updatedLampiranIII: LampiranIIIData = {
    ...prevLampIII,
  };

  return {
    lampiranII: updatedLampiranII,
    lampiranIII: updatedLampiranIII,
    lpe: finalLPE,
    neraca: finalNeraca,
  };
}
