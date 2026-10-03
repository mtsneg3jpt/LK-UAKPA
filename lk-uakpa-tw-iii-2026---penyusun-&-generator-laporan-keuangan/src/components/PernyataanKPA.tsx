import React from 'react';
import { SatkerProfile } from '../types/financial';
import { KpaSignatureBlock } from './KpaSignatureBlock';
import { Shield } from 'lucide-react';

interface PernyataanKPAProps {
  satker: SatkerProfile;
  showDigitalStamp: boolean;
}

export const PernyataanKPA: React.FC<PernyataanKPAProps> = ({
  satker,
  showDigitalStamp,
}) => {
  return (
    <div className="bg-white p-6 sm:p-12 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-none print:p-0">
      {/* Official Kop Surat with Synchronized Logo */}
      <div className="pb-6 border-b-2 border-slate-900 mb-8">
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

        <div className="text-center mt-4">
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-950 uppercase">
            PERNYATAAN TANGGUNG JAWAB
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            LAPORAN KEUANGAN UAKPA TRIWULAN III TAHUN ANGGARAN 2026
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 text-justify">
        <p>
          Laporan Keuangan Unit Akuntansi Kuasa Pengguna Anggaran (UAKPA){' '}
          <strong>{satker.namaSatker} ({satker.kodeSatker})</strong> untuk periode
          yang berakhir pada tanggal <strong>30 September 2026</strong> yang terdiri
          dari:
        </p>

        <ol className="list-decimal list-inside pl-4 space-y-1 font-medium text-slate-900">
          <li>Laporan Realisasi Anggaran (LRA);</li>
          <li>Laporan Operasional (LO);</li>
          <li>Laporan Perubahan Ekuitas (LPE); dan</li>
          <li>Neraca,</li>
        </ol>

        <p>
          beserta <strong>Lampiran II (Informasi Keuangan Tertentu dan Informasi Penting Lainnya)</strong> serta{' '}
          <strong>Lampiran III (Data Informasi Kinerja Capaian Output Per Fungsi dan 8 Prioritas Nasional RKP 2026)</strong> sebagaimana diatur dalam Surat Kepala {satker.kppnMitra || 'KPPN Tipe A1 Bantaeng'} Nomor {satker.nomorSuratEdaran || 'S-374/KPN.2505/2026'} tanggal {satker.tanggalSuratEdaran || '30 September 2026'}, adalah merupakan tanggung jawab kami selaku Kuasa Pengguna Anggaran (KPA).
        </p>

        <p>
          Laporan Keuangan tersebut telah disusun berdasarkan sistem pengendalian intern yang memadai dan isinya telah menyajikan informasi pelaksanaan anggaran dan posisi keuangan yang handal sesuai dengan Standar Akuntansi Pemerintahan (SAP) berbasis akrual sebagaimana diatur dalam Peraturan Pemerintah Nomor 71 Tahun 2010 dan PMK Nomor 232/PMK.05/2022 tentang Sistem Akuntansi dan Pelaporan Keuangan Instansi.
        </p>

        <p>
          Laporan Keuangan Triwulan III ini disusun <strong>tanpa CaLK</strong> dan seluruh data transaksi keuangan telah direkonsiliasikan dengan data Kantor Pelayanan Perbendaharaan Negara ({satker.kppnMitra || 'KPPN Tipe A1 Bantaeng'}) melalui Aplikasi SAKTI dan Aplikasi Monitoring Pengelolaan APBN Terintegrasi (<strong>MyIntress</strong>) dengan status <strong>Telah Terbit SHR (Surat Hasil Rekonsiliasi)</strong>, tanpa TDK Rupiah, tanpa TDK Chart of Account (CoA), serta seluruh To Do List telah ditindaklanjuti tuntas.
        </p>
      </div>

      <KpaSignatureBlock satker={satker} showDigitalStamp={showDigitalStamp} />
    </div>
  );
};
