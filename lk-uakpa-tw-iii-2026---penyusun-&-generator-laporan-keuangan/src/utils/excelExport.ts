import * as XLSX from 'xlsx';
import { FullFinancialData } from '../types/financial';

export function exportFullFinancialWorkbook(data: FullFinancialData): void {
  const wb = XLSX.utils.book_new();
  const { satker, lra, lo, lpe, neraca, lampiranIIOfficial, lampiranIIIOfficial } = data;

  // 1. Sheet LRA
  const lraRows: any[][] = [
    [satker.namaKementerian.toUpperCase()],
    [satker.namaEselon1.toUpperCase()],
    [`SATKER: ${satker.namaSatker.toUpperCase()} (${satker.kodeSatker})`],
    ['LAPORAN REALISASI ANGGARAN (LRA)'],
    [satker.periodeLabel],
    ['(Dalam Rupiah)'],
    [],
    [
      'KODE',
      'URAIAN',
      'ANGGARAN SETELAH REVISI (DIPA)',
      'REALISASI S.D. 30 SEP 2026',
      '%',
      'SISA ANGGARAN',
      'REALISASI S.D. 30 SEP 2025',
    ],
  ];

  lra.forEach(item => {
    lraRows.push([
      item.kode || '',
      item.uraian,
      item.anggaran,
      item.realisasi,
      item.persentase ? `${item.persentase}%` : '0%',
      item.sisaAnggaran ?? item.anggaran - item.realisasi,
      item.realisasiLalu,
    ]);
  });

  lraRows.push(
    [],
    [],
    ['', '', '', '', '', `${satker.kotaPenetapan}, ${satker.tanggalLaporan}`],
    ['', '', '', '', '', satker.jabatanKPA],
    [],
    [],
    [],
    ['', '', '', '', '', satker.namaKPA],
    ['', '', '', '', '', `NIP. ${satker.nipKPA}`]
  );

  const wsLRA = XLSX.utils.aoa_to_sheet(lraRows);
  XLSX.utils.book_append_sheet(wb, wsLRA, 'LRA TW III 2026');

  // 2. Sheet LO
  const loRows: any[][] = [
    [satker.namaKementerian.toUpperCase()],
    [satker.namaEselon1.toUpperCase()],
    [`SATKER: ${satker.namaSatker.toUpperCase()} (${satker.kodeSatker})`],
    ['LAPORAN OPERASIONAL (LO)'],
    [satker.periodeLabel],
    ['(Dalam Rupiah)'],
    [],
    ['URAIAN', '2026', '2025', 'KENAIKAN/ PENURUNAN', '(%)'],
  ];

  lo.forEach(item => {
    const u = item.uraian.trim();
    const isSectionHeader =
      u === 'KEGIATAN OPERASIONAL' ||
      u === 'KEGIATAN NON OPERASIONAL' ||
      (u === 'POS LUAR BIASA' && item.level === 'header') ||
      u === 'PENDAPATAN OPERASIONAL' ||
      u === 'BEBAN OPERASIONAL' ||
      u === 'PENDAPATAN PERPAJAKAN' ||
      u === 'PENDAPATAN PENERIMAAN NEGARA BUKAN PAJAK' ||
      u === 'PENDAPATAN HIBAH';

    if (isSectionHeader) {
      loRows.push([item.uraian, '', '', '', '']);
    } else {
      const v26 = item.tahunIni || 0;
      const v25 = item.tahunLalu || 0;
      const selisih = v26 - v25;
      const pct = v25 !== 0 ? (selisih / Math.abs(v25)) * 100 : (v26 !== 0 ? (v26 > 0 ? 100 : -100) : 0);
      const pctStr = `${pct.toFixed(2).replace('.', ',')}%`;
      loRows.push([item.uraian, v26, v25, selisih, pctStr]);
    }
  });

  loRows.push(
    [],
    [],
    ['', `${satker.kotaPenetapan}, ${satker.tanggalLaporan}`],
    ['', satker.jabatanKPA],
    [],
    [],
    [],
    ['', satker.namaKPA],
    ['', `NIP. ${satker.nipKPA}`]
  );

  const wsLO = XLSX.utils.aoa_to_sheet(loRows);
  XLSX.utils.book_append_sheet(wb, wsLO, 'LO TW III 2026');

  // 3. Sheet LPE
  const lpeRows: any[][] = [
    [satker.namaKementerian.toUpperCase()],
    [satker.namaEselon1.toUpperCase()],
    [`SATKER: ${satker.namaSatker.toUpperCase()} (${satker.kodeSatker})`],
    ['LAPORAN PERUBAHAN EKUITAS (LPE)'],
    [satker.periodeLabel],
    ['(Dalam Rupiah)'],
    [],
    ['URAIAN', '2026', '2025', 'KENAIKAN / PENURUNAN', '%'],
  ];

  lpe.forEach(item => {
    const isHeaderOnly =
      item.level === 'header' && item.tahunIni === 0 && item.tahunLalu === 0;
    if (isHeaderOnly) {
      lpeRows.push([item.uraian, '', '', '', '']);
    } else {
      const diff = item.tahunIni - item.tahunLalu;
      const pct =
        item.tahunLalu !== 0
          ? ((diff / Math.abs(item.tahunLalu)) * 100).toFixed(2) + '%'
          : item.tahunIni !== 0
          ? '100,00%'
          : '0,00%';
      lpeRows.push([item.uraian, item.tahunIni, item.tahunLalu, diff, pct]);
    }
  });

  lpeRows.push(
    [],
    [],
    ['', `${satker.kotaPenetapan}, ${satker.tanggalLaporan}`],
    ['', satker.jabatanKPA],
    [],
    [],
    [],
    ['', satker.namaKPA],
    ['', `NIP. ${satker.nipKPA}`]
  );

  const wsLPE = XLSX.utils.aoa_to_sheet(lpeRows);
  XLSX.utils.book_append_sheet(wb, wsLPE, 'LPE TW III 2026');

  // 4. Sheet Neraca
  const neracaRows: any[][] = [
    [satker.namaKementerian.toUpperCase()],
    [satker.namaEselon1.toUpperCase()],
    [`SATKER: ${satker.namaSatker.toUpperCase()} (${satker.kodeSatker})`],
    ['NERACA'],
    ['PER 30 SEPTEMBER 2026 DAN 31 DESEMBER 2025'],
    ['(Dalam Rupiah)'],
    [],
    ['NAMA PERKIRAAN', '2026', '2025', 'Jumlah', '%'],
  ];

  neraca.forEach(item => {
    const u = item.uraian.trim();
    const isMajorCategoryHeader =
      (u === 'ASET' && item.level === 'header') ||
      (u === 'KEWAJIBAN' && item.level === 'header') ||
      (u === 'EKUITAS' && item.level === 'header');

    const isSubgroupHeader =
      u === 'ASET LANCAR' ||
      u === 'ASET TETAP' ||
      u === 'ASET LAINNYA' ||
      u === 'KEWAJIBAN JANGKA PENDEK' ||
      (u === 'EKUITAS' && item.level === 'subgroup');

    if (isMajorCategoryHeader || isSubgroupHeader) {
      neracaRows.push([item.uraian, '', '', '', '']);
    } else {
      const v26 = item.tahunIni || 0;
      const v25 = item.tahunLalu || 0;
      const selisih = v26 - v25;
      const pct = v25 !== 0 ? (selisih / Math.abs(v25)) * 100 : (v26 !== 0 ? (v26 > 0 ? 100 : -100) : 0);
      const pctStr = `${pct.toFixed(2).replace('.', ',')}%`;
      neracaRows.push([item.uraian, v26, v25, selisih, pctStr]);
    }
  });

  neracaRows.push(
    [],
    [],
    ['', `${satker.kotaPenetapan}, ${satker.tanggalLaporan}`],
    ['', satker.jabatanKPA],
    [],
    [],
    [],
    ['', satker.namaKPA],
    ['', `NIP. ${satker.nipKPA}`]
  );

  const wsNeraca = XLSX.utils.aoa_to_sheet(neracaRows);
  XLSX.utils.book_append_sheet(wb, wsNeraca, 'NERACA TW III 2026');

  // 5. Sheet Lampiran II
  const lampIIRows: any[][] = [
    ['LAMPIRAN II'],
    [`Surat Kepala ${satker.kppnMitra || 'KPPN Tipe A1 Bantaeng'}`],
    [`Nomor : ${satker.nomorSuratEdaran || 'S-374/KPN.2505/2026'}`],
    ['INFORMASI KEUANGAN TERTENTU DAN INFORMASI PENTING LAINNYA'],
    [`SATUAN KERJA: ${satker.namaSatker.toUpperCase()}`],
    [],
    ['1.a INFORMASI REALISASI BELANJA DAN ESTIMASI REALISASI'],
    ['Jenis Belanja', 'Uraian', 'Pagu', 'Realisasi s.d. 30 Sep 2026', 'Sisa Pagu s.d. 30 Sep 2026', 'Rencana Realisasi TW IV', 'Estimasi Total Realisasi', 'Estimasi Pagu Tidak Terealisasi'],
  ];

  lampiranIIOfficial.estimasiBelanja.forEach(b => {
    lampIIRows.push([
      b.jenisBelanja,
      b.uraian,
      b.pagu,
      b.realisasiTW3,
      b.sisaPaguTW3,
      b.rencanaTW4,
      b.realisasiTW3 + b.rencanaTW4,
      b.pagu - (b.realisasiTW3 + b.rencanaTW4),
    ]);
  });

  lampIIRows.push(
    [],
    ['1.b INFORMASI PAGU MINUS BELANJA PEGAWAI SERTA RENCANA MITIGASI'],
    ['Kode Akun', 'Uraian', 'Pagu', 'Realisasi s.d. 30 Sep 2026', 'Rencana TW IV', 'Total Realisasi', 'Estimasi Sisa Pagu/Minus']
  );

  lampiranIIOfficial.paguMinusPegawai.forEach(p => {
    lampIIRows.push([
      p.kodeAkun,
      p.uraian,
      p.pagu,
      p.realisasiTW3,
      p.rencanaTW4,
      p.realisasiTW3 + p.rencanaTW4,
      p.pagu - (p.realisasiTW3 + p.rencanaTW4),
    ]);
  });

  lampIIRows.push(
    [],
    ['4. MUTASI PIUTANG PERPAJAKAN, PNBP, TP/TGR, DAN PIUTANG LAINNYA'],
    ['Akun', 'Uraian', 'Saldo 2025', 'Baru', 'Koreksi Tambah', 'Lainnya Tambah', 'Pelunasan', 'Penghapusan', 'Koreksi Kurang', 'Lainnya Kurang', 'Saldo 30 Sep 2026']
  );

  lampiranIIOfficial.mutasiPiutang.forEach(m => {
    lampIIRows.push([
      m.akun,
      m.uraian,
      m.saldoNeraca2025,
      m.baru,
      m.koreksiTambah,
      m.lainnyaTambah,
      m.pelunasan,
      m.penghapusan,
      m.koreksiKurang,
      m.lainnyaKurang,
      m.saldoNeracaTW3_2026,
    ]);
  });

  lampIIRows.push(
    [],
    ['6. PENDAPATAN DARI TRANSAKSI PERTUKARAN DAN NONPERTUKARAN'],
    ['Akun', 'Uraian', 'Pertukaran', 'Nonpertukaran', 'Total Nilai']
  );

  lampiranIIOfficial.transaksiPertukaran.forEach(t => {
    lampIIRows.push([t.akun, t.uraian, t.pertukaran, t.nonPertukaran, t.nilaiTotal]);
  });

  const wsLampII = XLSX.utils.aoa_to_sheet(lampIIRows);
  XLSX.utils.book_append_sheet(wb, wsLampII, 'Lampiran II KPPN');

  // 6. Sheet Lampiran III
  const lampIIIRows: any[][] = [
    ['LAMPIRAN III'],
    [`Surat Kepala ${satker.kppnMitra || 'KPPN Tipe A1 Bantaeng'}`],
    [`Nomor : ${satker.nomorSuratEdaran || 'S-374/KPN.2505/2026'}`],
    ['DATA INFORMASI KINERJA TAHUN 2026'],
    [`SATUAN KERJA: ${satker.namaSatker.toUpperCase()}`],
    [],
    ['B. PENYAJIAN DATA CAPAIAN RINCIAN OUTPUT PER FUNGSI APBN'],
    ['No', 'Fungsi', 'Program', 'Output (KRO/RO)', 'Pagu', 'Realisasi', '% Keu', 'Target Vol', 'Real Vol', 'Satuan', '% Fisik', 'Keterangan'],
  ];

  lampiranIIIOfficial.capaianFungsi.forEach(cf => {
    lampIIIRows.push([
      cf.no,
      cf.namaFungsi,
      cf.program,
      `${cf.uraianOutput} (${cf.kodeKRO} - ${cf.kodeRO})`,
      cf.paguAnggaran,
      cf.realisasiAnggaran,
      `${cf.persenKeuangan}%`,
      cf.targetVolume,
      cf.realisasiVolume,
      cf.satuan,
      `${cf.persenFisik}%`,
      cf.keterangan,
    ]);
  });

  lampIIIRows.push(
    [],
    ['C. PENYAJIAN DATA PROGRAM PRIORITAS NASIONAL (TABEL RESMI HALAMAN 15)'],
    ['Kode PN', 'Kode Program', 'Kode Kegiatan', 'Kode KRO', 'Kode RO', 'Uraian Output', 'Pagu', 'Realisasi', '% Keu', 'Target', 'Real Vol', '% Fisik', 'Satuan']
  );

  lampiranIIIOfficial.tabelPrioritasNasional.forEach(pn => {
    lampIIIRows.push([
      pn.kodePN,
      pn.kodeProgram,
      pn.kodeKegiatan,
      pn.kodeKRO,
      pn.kodeRO,
      pn.uraianOutput,
      pn.pagu,
      pn.realisasi,
      `${pn.persenKeuangan}%`,
      pn.targetVolume,
      pn.realisasiVolume,
      `${pn.persenFisik}%`,
      pn.satuan,
    ]);
  });

  const wsLampIII = XLSX.utils.aoa_to_sheet(lampIIIRows);
  XLSX.utils.book_append_sheet(wb, wsLampIII, 'Lampiran III KPPN');

  const fileName = `LK_UAKPA_TW_III_2026_${satker.kodeSatker}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function downloadExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  const lraTemplate = [
    ['TEMPLATE UNGGAH SAKTI - LRA TW III 2026'],
    ['KODE', 'URAIAN', 'ANGGARAN', 'REALISASI_TW3_2026', 'REALISASI_TW3_2025'],
    ['51', 'Belanja Pegawai', 2450000000, 1862000000, 1720000000],
    ['52', 'Belanja Barang', 980000000, 723600000, 665500000],
    ['53', 'Belanja Modal', 420000000, 260000000, 225000000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(lraTemplate), 'LRA');

  const loTemplate = [
    ['TEMPLATE UNGGAH SAKTI - LO TW III 2026'],
    ['URAIAN', 'TAHUN_2026', 'TAHUN_2025'],
    ['Beban Pegawai', 1862000000, 1720000000],
    ['Beban Persediaan', 228400000, 210000000],
    ['Beban Jasa', 198600000, 184500000],
    ['Beban Pemeliharaan', 148000000, 139000000],
    ['Beban Penyusutan', 112500000, 104200000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(loTemplate), 'LO');

  const lpeTemplate = [
    ['TEMPLATE UNGGAH SAKTI - LPE TW III 2026'],
    ['URAIAN', 'TAHUN_2026', 'TAHUN_2025'],
    ['EKUITAS AWAL', 4850000000, 4320000000],
    ['SURPLUS / (DEFISIT) - LO', -2655000000, -2451500000],
    ['Diterima dari Entitas Lain (DDL)', 2845600000, 2610500000],
    ['Ditagihkan ke Entitas Lain (DED)', -18500000, -16200000],
    ['EKUITAS AKHIR', 5049600000, 4471200000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(lpeTemplate), 'LPE');

  const neracaTemplate = [
    ['TEMPLATE UNGGAH SAKTI - NERACA TW III 2026'],
    ['URAIAN', 'PER_30_SEP_2026', 'PER_31_DES_2025'],
    ['Kas di Bendahara Pengeluaran', 15000000, 0],
    ['Piutang Bukan Pajak', 2500000, 1800000],
    ['Persediaan', 38400000, 24200000],
    ['Tanah', 2150000000, 2150000000],
    ['Peralatan dan Mesin', 1240000000, 980000000],
    ['Gedung dan Bangunan', 2850000000, 2850000000],
    ['Akumulasi Penyusutan', -1417500000, -1305000000],
    ['Uang Muka dari KPPN (UP)', 15000000, 0],
    ['Ekuitas', 5049600000, 4850000000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(neracaTemplate), 'Neraca');

  XLSX.writeFile(wb, 'Format_Template_LK_UAKPA_TW3.xlsx');
}
