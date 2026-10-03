import React, { useState } from 'react';
import {
  LampiranIIIData,
  SatkerProfile,
  CapaianFungsiApbn,
  TabelPrioritasNasionalRow,
} from '../types/financial';
import { KpaSignatureBlock } from './KpaSignatureBlock';
import { formatNumber, formatPercent } from '../utils/numberFormat';
import {
  Shield,
  Edit3,
  Check,
  RotateCcw,
  Calculator,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';

interface LampiranIIIProps {
  satker: SatkerProfile;
  lampiranIII: LampiranIIIData;
  onUpdateLampiranIII: (data: LampiranIIIData) => void;
  showDigitalStamp: boolean;
}

export const LampiranIII: React.FC<LampiranIIIProps> = ({
  satker,
  lampiranIII,
  onUpdateLampiranIII,
  showDigitalStamp,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<LampiranIIIData>({ ...lampiranIII });

  React.useEffect(() => {
    if (!isEditing) {
      setFormData({ ...lampiranIII });
    }
  }, [lampiranIII, isEditing]);

  // ========================================================
  // PERHITUNGAN RUMUS OTOMATIS (TOTAL & PERSEN)
  // ========================================================

  // Totals for Capaian Fungsi
  const totalPaguFungsi = formData.capaianFungsi.reduce(
    (acc, i) => acc + (Number(i.paguAnggaran) || 0),
    0
  );
  const totalRealFungsi = formData.capaianFungsi.reduce(
    (acc, i) => acc + (Number(i.realisasiAnggaran) || 0),
    0
  );
  const totalPctKeuFungsi =
    totalPaguFungsi > 0 ? (totalRealFungsi / totalPaguFungsi) * 100 : 0;
  const totalTargetVolFungsi = formData.capaianFungsi.reduce(
    (acc, i) => acc + (Number(i.targetVolume) || 0),
    0
  );
  const totalRealVolFungsi = formData.capaianFungsi.reduce(
    (acc, i) => acc + (Number(i.realisasiVolume) || 0),
    0
  );
  const totalPctFisikFungsi =
    totalTargetVolFungsi > 0 ? (totalRealVolFungsi / totalTargetVolFungsi) * 100 : 0;

  // Totals for Prioritas Nasional
  const totalPaguPN = formData.tabelPrioritasNasional.reduce(
    (acc, i) => acc + (Number(i.pagu) || 0),
    0
  );
  const totalRealPN = formData.tabelPrioritasNasional.reduce(
    (acc, i) => acc + (Number(i.realisasi) || 0),
    0
  );
  const totalPctKeuPN =
    totalPaguPN > 0 ? (totalRealPN / totalPaguPN) * 100 : 0;
  const totalTargetVolPN = formData.tabelPrioritasNasional.reduce(
    (acc, i) => acc + (Number(i.targetVolume) || 0),
    0
  );
  const totalRealVolPN = formData.tabelPrioritasNasional.reduce(
    (acc, i) => acc + (Number(i.realisasiVolume) || 0),
    0
  );
  const totalPctFisikPN =
    totalTargetVolPN > 0 ? (totalRealVolPN / totalTargetVolPN) * 100 : 0;

  // ========================================================
  // ACTIONS: ADD ROW, DELETE ROW, RESET, SAVE
  // ========================================================

  const addFungsiRow = () => {
    const newRow: CapaianFungsiApbn = {
      no: formData.capaianFungsi.length + 1,
      kodeFungsi: '10',
      namaFungsi: 'Pendidikan',
      subfungsi: 'Pendidikan Madrasah',
      program: 'Program Pendidikan Islam',
      kegiatan: 'Operasional Belajar Mengajar',
      kodeKRO: '2133.XXX',
      kodeRO: '001',
      uraianOutput: 'Uraian Rincian Output Tambahan',
      targetVolume: 0,
      realisasiVolume: 0,
      satuan: 'Siswa',
      persenFisik: 0,
      paguAnggaran: 0,
      realisasiAnggaran: 0,
      persenKeuangan: 0,
      keterangan: 'Realisasi output diisi sesuai pelaporan MyIntress.',
    };
    setFormData({
      ...formData,
      capaianFungsi: [...formData.capaianFungsi, newRow],
    });
  };

  const deleteFungsiRow = (index: number) => {
    const updated = formData.capaianFungsi.filter((_, idx) => idx !== index);
    setFormData({ ...formData, capaianFungsi: updated });
  };

  const addPNRow = () => {
    const newRow: TabelPrioritasNasionalRow = {
      kodePN: 'PN 4',
      kodeProgram: 'WA',
      kodeKegiatan: '2133',
      kodeKRO: 'QEK',
      kodeRO: '001',
      uraianOutput: 'Output Tambahan Prioritas Nasional',
      pagu: 0,
      realisasi: 0,
      persenKeuangan: 0,
      targetVolume: 0,
      realisasiVolume: 0,
      persenFisik: 0,
      satuan: 'Siswa',
    };
    setFormData({
      ...formData,
      tabelPrioritasNasional: [...formData.tabelPrioritasNasional, newRow],
    });
  };

  const deletePNRow = (index: number) => {
    const updated = formData.tabelPrioritasNasional.filter((_, idx) => idx !== index);
    setFormData({ ...formData, tabelPrioritasNasional: updated });
  };

  const handleResetToZero = () => {
    setFormData({
      ...formData,
      capaianFungsi: formData.capaianFungsi.map(f => ({
        ...f,
        paguAnggaran: 0,
        realisasiAnggaran: 0,
        persenKeuangan: 0,
        targetVolume: 0,
        realisasiVolume: 0,
        persenFisik: 0,
      })),
      prioritasNasionalList: formData.prioritasNasionalList.map(pn => ({
        ...pn,
        jumlahProgramPrioritas: 0,
        jumlahKegiatanPrioritas: 0,
        jumlahProyekPrioritas: 0,
        jumlahRO: 0,
        jumlahSatkerPengampu: 0,
        paguAnggaranRO: 0,
        realisasiAnggaranRO: 0,
        persenCapaian: 0,
        deskripsiNarasi: `Tidak terdapat alokasi anggaran (Rp0,- / Nihil).`,
      })),
      tabelPrioritasNasional: formData.tabelPrioritasNasional.map(pn => ({
        ...pn,
        pagu: 0,
        realisasi: 0,
        persenKeuangan: 0,
        targetVolume: 0,
        realisasiVolume: 0,
        persenFisik: 0,
      })),
    });
  };

  const handleSave = () => {
    const savedData: LampiranIIIData = {
      ...formData,
      capaianFungsi: formData.capaianFungsi.map(f => {
        const pagu = Number(f.paguAnggaran) || 0;
        const real = Number(f.realisasiAnggaran) || 0;
        const target = Number(f.targetVolume) || 0;
        const realVol = Number(f.realisasiVolume) || 0;
        return {
          ...f,
          paguAnggaran: pagu,
          realisasiAnggaran: real,
          persenKeuangan: pagu > 0 ? Number(((real / pagu) * 100).toFixed(2)) : 0,
          targetVolume: target,
          realisasiVolume: realVol,
          persenFisik: target > 0 ? Number(((realVol / target) * 100).toFixed(2)) : 0,
        };
      }),
      tabelPrioritasNasional: formData.tabelPrioritasNasional.map(pn => {
        const pagu = Number(pn.pagu) || 0;
        const real = Number(pn.realisasi) || 0;
        const target = Number(pn.targetVolume) || 0;
        const realVol = Number(pn.realisasiVolume) || 0;
        return {
          ...pn,
          pagu,
          realisasi: real,
          persenKeuangan: pagu > 0 ? Number(((real / pagu) * 100).toFixed(2)) : 0,
          targetVolume: target,
          realisasiVolume: realVol,
          persenFisik: target > 0 ? Number(((realVol / target) * 100).toFixed(2)) : 0,
        };
      }),
    };

    onUpdateLampiranIII(savedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...lampiranIII });
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-6 sm:p-10 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-none print:p-0">
      {/* Official Header per Surat Edaran KPPN Bantaeng */}
      <div className="relative text-right pb-3 mb-2 text-xs font-mono text-slate-800 avoid-break">
        <p className="font-bold text-slate-900">LAMPIRAN III</p>
        <p>Surat Kepala {satker.kppnMitra || 'KPPN Tipe A1 Bantaeng'}</p>
        <p>Nomor : {satker.nomorSuratEdaran || 'S-374/KPN.2505/2026'}</p>
        <p>Tanggal : {satker.tanggalSuratEdaran || '30 September 2026'}</p>
      </div>

      {/* Kop Surat with Synchronized Logo */}
      <div className="pb-4 mb-6 border-b-2 border-slate-900 avoid-break">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 text-center">
          {satker.customLogoUrl ? (
            <img
              src={satker.customLogoUrl}
              alt="Logo Resmi"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border border-slate-900 flex items-center justify-center bg-slate-50 shrink-0 print:border-black">
              <Shield className="w-6 h-6 text-slate-800 print:text-black" />
            </div>
          )}

          <div>
            <p className="text-xs sm:text-sm font-bold tracking-wider text-slate-800 uppercase">
              {satker.namaKementerian}
            </p>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700 uppercase">
              {satker.namaEselon1}
            </p>
            <p className="text-xs sm:text-sm font-medium text-slate-600 uppercase">
              SATUAN KERJA: {satker.namaSatker} ({satker.kodeSatker})
            </p>
          </div>
        </div>

        <div className="text-center mt-3">
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-950 uppercase leading-snug">
            MEKANISME DAN FORMAT PENYAJIAN DATA INFORMASI KINERJA TAHUN 2026
            <br />
            PADA LAPORAN KEUANGAN KEMENTERIAN/LEMBAGA TRIWULAN III TAHUN 2026
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 uppercase mt-1">
            TAHUN ANGGARAN 2026
          </p>
          <p className="text-xs text-slate-600 italic mt-0.5">
            (Berdasarkan Aplikasi MyIntress & Aplikasi SAKTI)
          </p>
        </div>
      </div>

      {/* Editing Toolbar */}
      <div className="no-print mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-700">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium">
              Mode Edit Manual Lampiran III: Kolom persen (% Keu, % Fisik) dan baris TOTAL dihitung otomatis secara real-time.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Manual Nilai Tabel</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleResetToZero}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-medium transition-colors cursor-pointer"
                  title="Kosongkan seluruh nilai tabel ke Rp 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kosongkan Semua (Reset Rp 0)</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded border border-emerald-200">
            <Calculator className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              <strong>Petunjuk:</strong> Masukkan Pagu, Realisasi, Target Vol, dan Real Vol. Kolom <em>% Keu</em>, <em>% Fisik</em>, dan <em>Baris TOTAL</em> terkunci karena dihitung otomatis oleh rumus.
            </span>
          </div>
        )}
      </div>

      <div className="space-y-8 print:space-y-3 text-xs leading-relaxed text-slate-800">
        {/* ======================================================== */}
        {/* A. MEKANISME PELAPORAN */}
        {/* ======================================================== */}
        <div className="avoid-break p-4 bg-slate-50/70 border border-slate-300 rounded-lg">
          <h2 className="text-sm font-bold text-slate-950 uppercase border-b border-slate-900 pb-1 mb-3">
            A. Mekanisme Pelaporan Anggaran, Realisasi Anggaran, Target, dan Realisasi Rincian Output Triwulan III Tahun 2026
          </h2>
          <p className="text-slate-700 text-justify mb-2">
            Untuk memastikan keandalan pelaporan dan pengungkapan pada LKKL atas capaian Rincian Output Triwulan III Tahun 2026, satuan kerja telah melaksanakan mekanisme sebagai berikut:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-2">
            <li>Melakukan identifikasi atas setiap Rincian Output (RO) dan alokasinya dalam database RKA-K/L dan DIPA yang telah ditetapkan menjadi bagian dari Prioritas Nasional Tahun 2026.</li>
            <li>Melakukan proses tagging secara akurat atas anggaran pada satker pelaksana Prioritas Nasional sampai dengan Triwulan III Tahun 2026.</li>
            <li>Melakukan perekaman data target output dan capaian output secara akurat dan memvalidasinya melalui Aplikasi SAKTI dan Aplikasi MyIntress (https://myintress.kemenkeu.go.id).</li>
            <li>Memastikan tidak terdapat perbedaan data yang signifikan/anomali antara perbandingan target volume dengan realisasi volume, serta kesesuaian progres capaian fisik dengan persentase penyerapan anggaran.</li>
            <li>Melakukan rekonsiliasi dan verifikasi keselarasan antara realisasi pada LRA dan capaian output.</li>
          </ol>
        </div>

        {/* ======================================================== */}
        {/* B. PENYAJIAN DATA CAPAIAN RO PER FUNGSI APBN */}
        {/* ======================================================== */}
        <div className="avoid-break space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1">
            <h2 className="text-sm font-bold text-slate-950 uppercase">
              B. Penyajian Data Capaian Rincian Output Per Fungsi APBN pada Lampiran Laporan Keuangan
            </h2>
            {isEditing && (
              <button
                onClick={addFungsiRow}
                className="no-print inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Baris RO</span>
              </button>
            )}
          </div>

          <p className="text-slate-700 text-justify">
            Dalam penjelasan Undang-Undang Nomor 17 Tahun 2003 tentang Keuangan Negara, Klasifikasi Fungsi dirinci ke dalam 11 fungsi: (1) pelayanan umum, (2) pertahanan, (3) ketertiban dan keamanan, (4) ekonomi, (5) lingkungan hidup, (6) perumahan dan fasilitas umum, (7) kesehatan, (8) pariwisata dan budaya, (9) agama, (10) pendidikan, dan (11) perlindungan sosial.
          </p>

          <p className="font-semibold text-slate-900">
            Capaian Rincian Output menurut klasifikasi fungsi yang telah dicapai dalam pelaksanaan APBN Triwulan III Tahun 2026 pada <strong>{satker.namaSatker}</strong> adalah sebagai berikut:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
                  <th className="py-2 px-1 border-r border-slate-900 w-8">No</th>
                  <th className="py-2 px-2 border-r border-slate-900 w-24">Fungsi</th>
                  <th className="py-2 px-2 border-r border-slate-900 w-32">Program</th>
                  <th className="py-2 px-3 border-r border-slate-900 text-left">Rincian Output (KRO / RO)</th>
                  <th className="py-2 px-2 border-r border-slate-900 text-right w-28">Pagu (Rp)</th>
                  <th className="py-2 px-2 border-r border-slate-900 text-right w-28">Realisasi (Rp)</th>
                  <th className="py-2 px-1 border-r border-slate-900 text-right w-16 bg-emerald-50/50">
                    % Keu <span className="text-[9px] font-normal block">(Rumus)</span>
                  </th>
                  <th className="py-2 px-1 border-r border-slate-900 text-center w-16">Target Vol</th>
                  <th className="py-2 px-1 border-r border-slate-900 text-center w-16">Real Vol</th>
                  <th className="py-2 px-1 border-r border-slate-900 text-center w-14">Satuan</th>
                  <th className="py-2 px-1 border-r border-slate-900 text-right w-16 bg-emerald-50/50">
                    % Fisik <span className="text-[9px] font-normal block">(Rumus)</span>
                  </th>
                  <th className="py-2 px-3 border-r border-slate-900 text-left">Keterangan / Capaian</th>
                  {isEditing && <th className="py-2 px-1 no-print w-10">Aksi</th>}
                </tr>
                <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-900 text-center font-mono">
                  <td className="py-0.5 border-r border-slate-900">1</td>
                  <td className="py-0.5 border-r border-slate-900">2</td>
                  <td className="py-0.5 border-r border-slate-900">3</td>
                  <td className="py-0.5 border-r border-slate-900">4</td>
                  <td className="py-0.5 border-r border-slate-900">5 (Input)</td>
                  <td className="py-0.5 border-r border-slate-900">6 (Input)</td>
                  <td className="py-0.5 border-r border-slate-900 bg-emerald-50/30">7 (6/5)</td>
                  <td className="py-0.5 border-r border-slate-900">8 (Input)</td>
                  <td className="py-0.5 border-r border-slate-900">9 (Input)</td>
                  <td className="py-0.5 border-r border-slate-900">10</td>
                  <td className="py-0.5 border-r border-slate-900 bg-emerald-50/30">11 (9/8)</td>
                  <td className="py-0.5 border-r border-slate-900">12</td>
                  {isEditing && <td className="py-0.5 no-print">-</td>}
                </tr>
              </thead>
              <tbody>
                {formData.capaianFungsi.map((item, idx) => {
                  const pagu = Number(item.paguAnggaran) || 0;
                  const real = Number(item.realisasiAnggaran) || 0;
                  const pctKeu = pagu > 0 ? (real / pagu) * 100 : 0;

                  const targetVol = Number(item.targetVolume) || 0;
                  const realVol = Number(item.realisasiVolume) || 0;
                  const pctFisik = targetVol > 0 ? (realVol / targetVol) * 100 : 0;

                  return (
                    <tr key={idx} className="border-b border-slate-300 hover:bg-slate-50/70">
                      <td className="py-1.5 px-1 border-r border-slate-900 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-900 text-center font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.namaFungsi}
                            onChange={e => {
                              const updated = [...formData.capaianFungsi];
                              updated[idx] = { ...updated[idx], namaFungsi: e.target.value };
                              setFormData({ ...formData, capaianFungsi: updated });
                            }}
                            className="w-full p-0.5 border rounded text-center text-xs"
                          />
                        ) : (
                          `${item.namaFungsi} (${item.kodeFungsi})`
                        )}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-900 text-[11px] text-slate-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.program}
                            onChange={e => {
                              const updated = [...formData.capaianFungsi];
                              updated[idx] = { ...updated[idx], program: e.target.value };
                              setFormData({ ...formData, capaianFungsi: updated });
                            }}
                            className="w-full p-0.5 border rounded text-xs"
                          />
                        ) : (
                          item.program
                        )}
                      </td>
                      <td className="py-1.5 px-3 border-r border-slate-900">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={item.uraianOutput}
                              onChange={e => {
                                const updated = [...formData.capaianFungsi];
                                updated[idx] = { ...updated[idx], uraianOutput: e.target.value };
                                setFormData({ ...formData, capaianFungsi: updated });
                              }}
                              className="w-full p-0.5 border rounded text-xs font-semibold"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.kodeKRO}
                                placeholder="KRO"
                                onChange={e => {
                                  const updated = [...formData.capaianFungsi];
                                  updated[idx] = { ...updated[idx], kodeKRO: e.target.value };
                                  setFormData({ ...formData, capaianFungsi: updated });
                                }}
                                className="w-1/2 p-0.5 border rounded text-[10px] font-mono"
                              />
                              <input
                                type="text"
                                value={item.kodeRO}
                                placeholder="RO"
                                onChange={e => {
                                  const updated = [...formData.capaianFungsi];
                                  updated[idx] = { ...updated[idx], kodeRO: e.target.value };
                                  setFormData({ ...formData, capaianFungsi: updated });
                                }}
                                className="w-1/2 p-0.5 border rounded text-[10px] font-mono"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-semibold text-slate-900">{item.uraianOutput}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              KRO: {item.kodeKRO} · RO: {item.kodeRO}
                            </p>
                          </>
                        )}
                      </td>

                      {/* Pagu Anggaran (Input Manual) */}
                      <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.paguAnggaran || ''}
                            placeholder="0"
                            onChange={e => {
                              const updated = [...formData.capaianFungsi];
                              updated[idx] = {
                                ...updated[idx],
                                paguAnggaran: Number(e.target.value) || 0,
                              };
                              setFormData({ ...formData, capaianFungsi: updated });
                            }}
                            className="w-full p-1 border rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                          />
                        ) : (
                          formatNumber(pagu)
                        )}
                      </td>

                      {/* Realisasi Anggaran (Input Manual) */}
                      <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.realisasiAnggaran || ''}
                            placeholder="0"
                            onChange={e => {
                              const updated = [...formData.capaianFungsi];
                              updated[idx] = {
                                ...updated[idx],
                                realisasiAnggaran: Number(e.target.value) || 0,
                              };
                              setFormData({ ...formData, capaianFungsi: updated });
                            }}
                            className="w-full p-1 border rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                          />
                        ) : (
                          formatNumber(real)
                        )}
                      </td>

                      {/* % Keuangan (Rumus Otomatis: Realisasi / Pagu) */}
                      <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono font-semibold bg-slate-50/50">
                        {formatPercent(pctKeu)}
                      </td>

                      {/* Target Volume (Input Manual) */}
                      <td className="py-1.5 px-1 border-r border-slate-900 text-center font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.targetVolume || ''}
                            placeholder="0"
                            onChange={e => {
                              const updated = [...formData.capaianFungsi];
                              updated[idx] = {
                                ...updated[idx],
                                targetVolume: Number(e.target.value) || 0,
                              };
                              setFormData({ ...formData, capaianFungsi: updated });
                            }}
                            className="w-full p-1 border rounded text-center text-xs font-mono bg-white focus:bg-amber-50"
                          />
                        ) : (
                          targetVol
                        )}
                      </td>

                      {/* Realisasi Volume (Input Manual) */}
                      <td className="py-1.5 px-1 border-r border-slate-900 text-center font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.realisasiVolume || ''}
                            placeholder="0"
                            onChange={e => {
                              const updated = [...formData.capaianFungsi];
                              updated[idx] = {
                                ...updated[idx],
                                realisasiVolume: Number(e.target.value) || 0,
                              };
                              setFormData({ ...formData, capaianFungsi: updated });
                            }}
                            className="w-full p-1 border rounded text-center text-xs font-mono bg-white focus:bg-amber-50"
                          />
                        ) : (
                          realVol
                        )}
                      </td>

                      {/* Satuan */}
                      <td className="py-1.5 px-1 border-r border-slate-900 text-center text-[11px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.satuan}
                            onChange={e => {
                              const updated = [...formData.capaianFungsi];
                              updated[idx] = { ...updated[idx], satuan: e.target.value };
                              setFormData({ ...formData, capaianFungsi: updated });
                            }}
                            className="w-full p-0.5 border rounded text-center text-xs"
                          />
                        ) : (
                          item.satuan
                        )}
                      </td>

                      {/* % Fisik (Rumus Otomatis: Real Vol / Target Vol) */}
                      <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono font-semibold bg-slate-50/50">
                        {formatPercent(pctFisik)}
                      </td>

                      {/* Keterangan */}
                      <td className="py-1.5 px-3 border-r border-slate-900 text-[11px] text-slate-700">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={item.keterangan}
                            onChange={e => {
                              const updated = [...formData.capaianFungsi];
                              updated[idx] = { ...updated[idx], keterangan: e.target.value };
                              setFormData({ ...formData, capaianFungsi: updated });
                            }}
                            className="w-full p-1 border rounded text-xs"
                          />
                        ) : (
                          item.keterangan
                        )}
                      </td>

                      {isEditing && (
                        <td className="py-1.5 px-1 no-print text-center">
                          <button
                            onClick={() => deleteFungsiRow(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {/* Baris Total (Rumus Total & Persen Total) */}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                  <td colSpan={4} className="py-2 px-3 border-r border-slate-900 text-center">
                    TOTAL CAPAIAN FUNGSI
                  </td>
                  <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                    {formatNumber(totalPaguFungsi)}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                    {formatNumber(totalRealFungsi)}
                  </td>
                  <td className="py-2 px-1 border-r border-slate-900 text-right font-mono font-bold">
                    {formatPercent(totalPctKeuFungsi)}
                  </td>
                  <td className="py-2 px-1 border-r border-slate-900 text-center font-mono">
                    {totalTargetVolFungsi}
                  </td>
                  <td className="py-2 px-1 border-r border-slate-900 text-center font-mono">
                    {totalRealVolFungsi}
                  </td>
                  <td className="py-2 px-1 border-r border-slate-900 text-center text-[10px]">
                    Akumulasi
                  </td>
                  <td className="py-2 px-1 border-r border-slate-900 text-right font-mono font-bold">
                    {formatPercent(totalPctFisikFungsi)}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-900 text-left text-[11px] font-normal italic">
                    {totalPctKeuFungsi >= 70
                      ? 'Penyerapan anggaran dan target fisik memenuhi target triwulan III 2026.'
                      : 'Realisasi anggaran dan output fisik terus dioptimalkan s.d. triwulan IV.'}
                  </td>
                  {isEditing && <td className="py-2 px-1 no-print">-</td>}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            *Laporan rincian output per fungsi diunduh secara resmi melalui menu Pelaporan Output Anggaran pada Aplikasi MyIntress (https://myintress.kemenkeu.go.id).
          </p>
        </div>

        {/* ======================================================== */}
        {/* C. PENYAJIAN DATA PROGRAM PRIORITAS NASIONAL */}
        {/* ======================================================== */}
        <div className="avoid-break space-y-4 pt-6 border-t-2 border-slate-900">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1">
            <h2 className="text-sm font-bold text-slate-950 uppercase">
              C. Penyajian Data Program Prioritas Nasional pada Lampiran Laporan Keuangan
            </h2>
            {isEditing && (
              <button
                onClick={addPNRow}
                className="no-print inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Baris PN</span>
              </button>
            )}
          </div>

          <p className="text-slate-700 text-justify">
            Berdasarkan <strong>Rencana Kerja Pemerintah (RKP) Tahun 2026</strong> yang ditetapkan melalui <strong>Peraturan Presiden Republik Indonesia Nomor 117 Tahun 2025</strong> tentang Rencana Kerja Pemerintah Tahun 2026, pada <strong>{satker.namaSatker}</strong> terdapat Alokasi Anggaran untuk Prioritas Nasional (PN) dari 8 Prioritas Nasional yang ditetapkan dalam RKP sebagai berikut:
          </p>

          {/* 8 Prioritas Nasional Narasi List */}
          <div className="space-y-4 print:space-y-1.5">
            {formData.prioritasNasionalList.map((pn, pIdx) => (
              <div
                key={pIdx}
                className={`p-4 print:p-2 border print:border-none rounded-lg print:bg-transparent ${
                  pn.paguAnggaranRO > 0
                    ? 'border-slate-300 bg-slate-50/60'
                    : 'border-slate-200 bg-white opacity-85'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2 border-b border-slate-200 mb-2">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900 text-white rounded shrink-0">
                      {pn.kodePN}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                        Prioritas Nasional {pIdx + 1} – {pn.namaPN}
                      </h3>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Pelaksanaannya difokuskan pada sektor: <strong>{pn.sektorFokus}</strong>
                      </p>
                    </div>
                  </div>

                  {pn.paguAnggaranRO > 0 && (
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded shrink-0">
                      Capaian: {formatPercent(pn.persenCapaian)}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    rows={2}
                    value={pn.deskripsiNarasi}
                    onChange={e => {
                      const updated = [...formData.prioritasNasionalList];
                      updated[pIdx].deskripsiNarasi = e.target.value;
                      setFormData({ ...formData, prioritasNasionalList: updated });
                    }}
                    className="w-full p-2 border rounded text-xs bg-white"
                  />
                ) : (
                  <p className="text-slate-800 leading-relaxed text-justify">
                    {pn.deskripsiNarasi}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Format Tabel Resmi Halaman 15 */}
          <div className="pt-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase mb-2">
              Tabel Matriks Capaian Output Prioritas Nasional Tahun 2026 (Format Resmi MyIntress):
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-900 border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-semibold text-center">
                    <th className="py-2 px-1 border-r border-slate-900 w-16">Kode PN</th>
                    <th className="py-2 px-1 border-r border-slate-900 w-16">Kode Prog</th>
                    <th className="py-2 px-1 border-r border-slate-900 w-16">Kode Keg</th>
                    <th className="py-2 px-1 border-r border-slate-900 w-16">Kode KRO</th>
                    <th className="py-2 px-1 border-r border-slate-900 w-16">Kode RO</th>
                    <th className="py-2 px-3 border-r border-slate-900 text-left">Uraian Output</th>
                    <th className="py-2 px-2 border-r border-slate-900 text-right w-28">Pagu</th>
                    <th className="py-2 px-2 border-r border-slate-900 text-right w-28">Realisasi</th>
                    <th className="py-2 px-1 border-r border-slate-900 text-right w-16 bg-emerald-50/50">
                      % Keu <span className="text-[9px] font-normal block">(Rumus)</span>
                    </th>
                    <th className="py-2 px-1 border-r border-slate-900 text-center w-16">Target</th>
                    <th className="py-2 px-1 border-r border-slate-900 text-center w-16">Real Vol</th>
                    <th className="py-2 px-1 border-r border-slate-900 text-right w-16 bg-emerald-50/50">
                      % Fisik <span className="text-[9px] font-normal block">(Rumus)</span>
                    </th>
                    <th className="py-2 px-2 border-r border-slate-900 text-center w-16">Satuan</th>
                    {isEditing && <th className="py-2 px-1 no-print w-10">Aksi</th>}
                  </tr>
                  <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-900 text-center font-mono">
                    <td className="py-0.5 border-r border-slate-900">1</td>
                    <td className="py-0.5 border-r border-slate-900">2</td>
                    <td className="py-0.5 border-r border-slate-900">3</td>
                    <td className="py-0.5 border-r border-slate-900">4</td>
                    <td className="py-0.5 border-r border-slate-900">5</td>
                    <td className="py-0.5 border-r border-slate-900">6</td>
                    <td className="py-0.5 border-r border-slate-900">7 (Input)</td>
                    <td className="py-0.5 border-r border-slate-900">8 (Input)</td>
                    <td className="py-0.5 border-r border-slate-900 bg-emerald-50/30">9 (8/7)</td>
                    <td className="py-0.5 border-r border-slate-900">10 (Input)</td>
                    <td className="py-0.5 border-r border-slate-900">11 (Input)</td>
                    <td className="py-0.5 border-r border-slate-900 bg-emerald-50/30">12 (11/10)</td>
                    <td className="py-0.5 border-r border-slate-900">13</td>
                    {isEditing && <td className="py-0.5 no-print">-</td>}
                  </tr>
                </thead>
                <tbody>
                  {formData.tabelPrioritasNasional.map((row, idx) => {
                    const pagu = Number(row.pagu) || 0;
                    const real = Number(row.realisasi) || 0;
                    const pctKeu = pagu > 0 ? (real / pagu) * 100 : 0;

                    const target = Number(row.targetVolume) || 0;
                    const realVol = Number(row.realisasiVolume) || 0;
                    const pctFisik = target > 0 ? (realVol / target) * 100 : 0;

                    return (
                      <tr key={idx} className="border-b border-slate-300 hover:bg-slate-50/70">
                        <td className="py-1.5 px-1 border-r border-slate-900 font-mono text-center font-bold">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.kodePN}
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = { ...updated[idx], kodePN: e.target.value };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-0.5 border rounded text-center text-xs font-mono font-bold"
                            />
                          ) : (
                            row.kodePN
                          )}
                        </td>
                        <td className="py-1.5 px-1 border-r border-slate-900 font-mono text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.kodeProgram}
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = { ...updated[idx], kodeProgram: e.target.value };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-0.5 border rounded text-center text-xs font-mono"
                            />
                          ) : (
                            row.kodeProgram
                          )}
                        </td>
                        <td className="py-1.5 px-1 border-r border-slate-900 font-mono text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.kodeKegiatan}
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = { ...updated[idx], kodeKegiatan: e.target.value };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-0.5 border rounded text-center text-xs font-mono"
                            />
                          ) : (
                            row.kodeKegiatan
                          )}
                        </td>
                        <td className="py-1.5 px-1 border-r border-slate-900 font-mono text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.kodeKRO}
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = { ...updated[idx], kodeKRO: e.target.value };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-0.5 border rounded text-center text-xs font-mono"
                            />
                          ) : (
                            row.kodeKRO
                          )}
                        </td>
                        <td className="py-1.5 px-1 border-r border-slate-900 font-mono text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.kodeRO}
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = { ...updated[idx], kodeRO: e.target.value };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-0.5 border rounded text-center text-xs font-mono"
                            />
                          ) : (
                            row.kodeRO
                          )}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-900 font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.uraianOutput}
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = { ...updated[idx], uraianOutput: e.target.value };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-1 border rounded text-xs"
                            />
                          ) : (
                            row.uraianOutput
                          )}
                        </td>

                        {/* Pagu (Input Manual) */}
                        <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.pagu || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = {
                                  ...updated[idx],
                                  pagu: Number(e.target.value) || 0,
                                };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-1 border rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                            />
                          ) : (
                            formatNumber(pagu)
                          )}
                        </td>

                        {/* Realisasi (Input Manual) */}
                        <td className="py-1.5 px-2 border-r border-slate-900 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.realisasi || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = {
                                  ...updated[idx],
                                  realisasi: Number(e.target.value) || 0,
                                };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-1 border rounded text-right text-xs font-mono bg-white focus:bg-amber-50"
                            />
                          ) : (
                            formatNumber(real)
                          )}
                        </td>

                        {/* % Keuangan (Rumus Otomatis) */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono font-semibold bg-slate-50/50">
                          {formatPercent(pctKeu)}
                        </td>

                        {/* Target Volume (Input Manual) */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-center font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.targetVolume || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = {
                                  ...updated[idx],
                                  targetVolume: Number(e.target.value) || 0,
                                };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-1 border rounded text-center text-xs font-mono bg-white focus:bg-amber-50"
                            />
                          ) : (
                            target
                          )}
                        </td>

                        {/* Realisasi Volume (Input Manual) */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-center font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.realisasiVolume || ''}
                              placeholder="0"
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = {
                                  ...updated[idx],
                                  realisasiVolume: Number(e.target.value) || 0,
                                };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-1 border rounded text-center text-xs font-mono bg-white focus:bg-amber-50"
                            />
                          ) : (
                            realVol
                          )}
                        </td>

                        {/* % Fisik (Rumus Otomatis) */}
                        <td className="py-1.5 px-1 border-r border-slate-900 text-right font-mono font-semibold bg-slate-50/50">
                          {formatPercent(pctFisik)}
                        </td>

                        {/* Satuan */}
                        <td className="py-1.5 px-2 border-r border-slate-900 text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.satuan}
                              onChange={e => {
                                const updated = [...formData.tabelPrioritasNasional];
                                updated[idx] = { ...updated[idx], satuan: e.target.value };
                                setFormData({ ...formData, tabelPrioritasNasional: updated });
                              }}
                              className="w-full p-0.5 border rounded text-center text-xs"
                            />
                          ) : (
                            row.satuan
                          )}
                        </td>

                        {isEditing && (
                          <td className="py-1.5 px-1 no-print text-center">
                            <button
                              onClick={() => deletePNRow(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              title="Hapus baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  {/* Baris Total (Rumus Total & Persen Total) */}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                    <td colSpan={6} className="py-2 px-3 border-r border-slate-900 text-center">
                      TOTAL PRIORITAS NASIONAL
                    </td>
                    <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalPaguPN)}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-900 text-right font-mono">
                      {formatNumber(totalRealPN)}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-right font-mono font-bold">
                      {formatPercent(totalPctKeuPN)}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-center font-mono">
                      {totalTargetVolPN}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-center font-mono">
                      {totalRealVolPN}
                    </td>
                    <td className="py-2 px-1 border-r border-slate-900 text-right font-mono font-bold">
                      {formatPercent(totalPctFisikPN)}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-900 text-center text-[10px]">
                      Akumulasi
                    </td>
                    {isEditing && <td className="py-2 px-1 no-print">-</td>}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 italic mt-1.5">
              *Laporan yang digunakan sebagai lampiran Prioritas Nasional dapat diolah melalui menu Monitoring Capaian Kinerja pada Aplikasi MyIntress (https://myintress.kemenkeu.go.id).
            </p>
          </div>
        </div>
      </div>

      {/* Official Signature block of KPA */}
      <KpaSignatureBlock satker={satker} showDigitalStamp={showDigitalStamp} />
    </div>
  );
};
