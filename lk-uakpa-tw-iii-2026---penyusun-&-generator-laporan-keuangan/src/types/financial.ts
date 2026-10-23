export interface SatkerProfile {
  namaKementerian: string;
  kodeKementerian: string;
  namaEselon1: string;
  kodeEselon1: string;
  namaSatker: string;
  kodeSatker: string;
  alamatSatker: string;
  kotaPenetapan: string;
  tanggalLaporan: string; // e.g. "02 Oktober 2026"
  namaKPA: string;
  nipKPA: string;
  jabatanKPA: string;
  namaPPK?: string;
  namaBendahara?: string;
  periodeLabel: string;
  kppnMitra?: string; // "KPPN Tipe A1 Bantaeng"
  nomorSuratEdaran?: string; // "S-374/KPN.2505/2026"
  tanggalSuratEdaran?: string; // "30 September 2026"
  customLogoUrl?: string; // Base64 data URL or image path for official logo
}

export interface LRAItem {
  id: string;
  kode?: string;
  uraian: string;
  anggaran: number; // Anggaran 2026 (Kolom 2)
  realisasi: number; // Realisasi 2026 (Kolom 4)
  selisih?: number; // Realisasi di atas (bawah) anggaran 2026 (Kolom 5 = 4 - 2)
  persentase?: number; // % 2026 (Kolom 6 = 4/2 * 100)
  anggaranLalu?: number; // Anggaran 2025 (Kolom 7)
  realisasiLalu: number; // Realisasi 2025 (Kolom 8)
  selisihLalu?: number; // Realisasi di atas (bawah) anggaran 2025 (Kolom 9 = 8 - 7)
  persenLalu?: number; // % 2025 (Kolom 10 = 8/7 * 100)
  sisaAnggaran?: number;
  level: 'header' | 'group' | 'subgroup' | 'item' | 'total';
  isBold?: boolean;
}


export interface LOItem {
  id: string;
  kode?: string;
  uraian: string;
  tahunIni: number;
  tahunLalu: number;
  level: 'header' | 'subgroup' | 'item' | 'total';
  isBold?: boolean;
}

export interface LPEItem {
  id: string;
  uraian: string;
  tahunIni: number;
  tahunLalu: number;
  isBold?: boolean;
  level: 'item' | 'total' | 'header' | 'subgroup';
}

export interface NeracaItem {
  id: string;
  kode?: string;
  uraian: string;
  tahunIni: number;
  tahunLalu: number;
  level: 'header' | 'subgroup' | 'item' | 'total';
  isBold?: boolean;
  category: 'aset' | 'kewajiban' | 'ekuitas';
}

// ==========================================
// LAMPIRAN II: INFORMASI KEUANGAN TERTENTU & INFORMASI PENTING LAINNYA
// Sesuai Surat Kepala KPPN Bantaeng No. S-374/KPN.2505/2026
// ==========================================

export interface EstimasiBelanjaItem {
  jenisBelanja: string; // '51', '52', '53', '57'
  uraian: string;
  pagu: number;
  realisasiTW3: number;
  sisaPaguTW3: number;
  rencanaTW4: number;
  estimasiTotal: number; // realisasiTW3 + rencanaTW4
  estimasiTidakTerealisasi: number; // pagu - estimasiTotal
  paguLalu?: number; // Pagu 2025 (Komparatif)
  realisasiLalu?: number; // Realisasi s.d. 30 September 2025 (Komparatif)
}

export interface PaguMinusPegawaiItem {
  kodeAkun: string; // '5111', '5112', '5113', '5114', '5115', '5116', '5121', '5124'
  uraian: string;
  pagu: number;
  realisasiTW3: number;
  rencanaTW4: number;
  totalRealisasi: number; // realisasiTW3 + rencanaTW4
  estimasiSisaMinus: number; // pagu - totalRealisasi
}

export interface PaguBlokirItem {
  no: number;
  kodeBelanja: string; // '51', '52', '53', dst
  pagu: number;
  blokirPagu: number;
  nilaiBukaBlokir: number;
  tanggalRencanaBuka: string;
}

export interface OutstandingKontrakEselon {
  no: number;
  eselon1: string;
  jumlahKontrak: number;
  nilaiTotalKontrak: number;
  realisasi: number;
  sisaNilaiKontrak: number;
}

export interface OutstandingKontrakSignifikan {
  no: number;
  kodeSatker: string;
  noKontrak: string;
  uraianKontrak: string;
  tanggalMulai: string;
  tanggalAkhir: string;
  nilaiKontrak: number;
  realisasi: number;
  sisa: number;
  statusSelesai?: 'Tepat Waktu' | 'Potensi Terlambat' | string;
}

export interface BencanaAlamItem {
  no: number;
  posLaporan: 'LRA' | 'Neraca' | 'LO' | 'LPE';
  kodeSatker: string;
  namaSatker: string;
  kodeAkun: string;
  uraianKeterangan: string;
  nilai: number;
  analisisDampak: string;
  tindakLanjut: string;
}

export interface MutasiPiutangItem {
  akun: string; // '1151xx', '1152xx'
  uraian: string;
  saldoNeraca2025: number;
  baru: number;
  koreksiTambah: number;
  lainnyaTambah: number;
  pelunasan: number;
  penghapusan: number;
  koreksiKurang: number;
  lainnyaKurang: number;
  saldoNeracaTW3_2026: number;
}

export interface KdpDihentikanItem {
  no: number;
  kodeSatker: string;
  namaSatker: string;
  namaPekerjaanPaket: string;
  nilaiKDP: number;
  tanggalMulai: string;
  tanggalDihentikan: string;
  persenFisik: number;
  statusPenghentian: 'Sementara' | 'Permanen';
  uraianAlasan: string;
}

export interface TransaksiPertukaranItem {
  akun: string; // '41', '4111', '42', '4211', '43', '4311', '49', '4911'
  uraian: string;
  pertukaran: number;
  nonPertukaran: number;
  nilaiTotal: number;
}

export interface InfoPentingLainnya {
  kondisiOrganisasi: string; // Reorganisasi, pimpinan, likuidasi
  halKhususProgramStrategis: string; // Program strategis / MBG / Koperasi / Sekolah Garuda / Madrasah Unggul
  kondisiKeuanganPerhatianKhusus: string; // Akun signifikan LRA, LO, LPE, Neraca
}

export interface LampiranIIData {
  narasiRealisasiBelanja: string;
  estimasiBelanja: EstimasiBelanjaItem[];
  narasiPaguMinusPegawai: string;
  paguMinusPegawai: PaguMinusPegawaiItem[];
  narasiPaguBlokir: string;
  paguBlokir: PaguBlokirItem[];
  narasiOutstandingKontrak: string;
  outstandingKontrakEselon: OutstandingKontrakEselon[];
  outstandingKontrakSignifikan: OutstandingKontrakSignifikan[];
  narasiBencanaAlam: string;
  bencanaAlam: BencanaAlamItem[];
  narasiMutasiPiutang: string;
  mutasiPiutang: MutasiPiutangItem[];
  narasiKdp: string;
  kdpDihentikan: KdpDihentikanItem[];
  narasiPertukaran: string;
  transaksiPertukaran: TransaksiPertukaranItem[];
  infoKhususBA015: {
    isRelevant: boolean;
    keterangan: string;
  };
  infoPentingLainnya: InfoPentingLainnya;
}

// ==========================================
// LAMPIRAN III: INFORMASI KINERJA (OUTPUT PER FUNGSI & 8 PRIORITAS NASIONAL 2026)
// Sesuai Surat Kepala KPPN Bantaeng No. S-374/KPN.2505/2026
// ==========================================

export interface CapaianFungsiApbn {
  no: number;
  kodeFungsi: string; // '01' s.d '11'
  namaFungsi: string; // Pelayanan Umum, Pertahanan, Ketertiban, Ekonomi, Lingkungan, Perumahan, Kesehatan, Pariwisata, Agama, Pendidikan, Perlindungan Sosial
  subfungsi: string;
  program: string;
  kegiatan: string;
  kodeKRO: string;
  kodeRO: string;
  uraianOutput: string;
  targetVolume: number;
  realisasiVolume: number;
  satuan: string;
  persenFisik: number;
  paguAnggaran: number;
  realisasiAnggaran: number;
  persenKeuangan: number;
  keterangan: string;
}

export interface PrioritasNasionalDetail {
  kodePN: string; // 'PN 1' s.d 'PN 8'
  namaPN: string;
  sektorFokus: string;
  jumlahProgramPrioritas: number;
  jumlahKegiatanPrioritas: number;
  jumlahProyekPrioritas: number;
  jumlahRO: number;
  jumlahSatkerPengampu: number;
  paguAnggaranRO: number;
  realisasiAnggaranRO: number;
  persenCapaian: number;
  deskripsiNarasi: string;
}

export interface TabelPrioritasNasionalRow {
  kodePN: string;
  kodeProgram: string;
  kodeKegiatan: string;
  kodeKRO: string;
  kodeRO: string;
  uraianOutput: string;
  pagu: number;
  realisasi: number;
  persenKeuangan: number;
  targetVolume: number;
  realisasiVolume: number;
  persenFisik: number;
  satuan: string;
}

export interface LampiranIIIData {
  mekanismeJuknis: string;
  capaianFungsi: CapaianFungsiApbn[];
  prioritasNasionalList: PrioritasNasionalDetail[];
  tabelPrioritasNasional: TabelPrioritasNasionalRow[];
}

export interface FullFinancialData {
  satker: SatkerProfile;
  lra: LRAItem[];
  lo: LOItem[];
  lpe: LPEItem[];
  neraca: NeracaItem[];
  lampiranIIOfficial: LampiranIIData;
  lampiranIIIOfficial: LampiranIIIData;
}
