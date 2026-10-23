/**
 * Aplikasi Penyusun & Generator Laporan Keuangan LK UAKPA TW III 2026
 * Standar Akuntansi Pemerintahan (SAP) - Berdasarkan Surat Kepala KPPN Tipe A1 Bantaeng
 * Nomor : S-374/KPN.2505/2026 Tanggal 30 September 2026
 */

import React, { useState } from 'react';
import { initialFinancialData } from './data/defaultData';
import {
  FullFinancialData,
  SatkerProfile,
  LRAItem,
  LOItem,
  LPEItem,
  NeracaItem,
  LampiranIIData,
  LampiranIIIData,
} from './types/financial';
import { parseFinancialFile, ParseResult } from './utils/parser';
import { exportFullFinancialWorkbook } from './utils/excelExport';
import { syncFinancialData } from './utils/autoSync';

import { HeaderNav } from './components/HeaderNav';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { FaceLRA } from './components/FaceLRA';
import { FaceLO } from './components/FaceLO';
import { FaceLPE } from './components/FaceLPE';
import { FaceNeraca } from './components/FaceNeraca';
import { LampiranII } from './components/LampiranII';
import { LampiranIII } from './components/LampiranIII';
import { PernyataanKPA } from './components/PernyataanKPA';
import { CoverBukuLK } from './components/CoverBukuLK';
import { UploadModal } from './components/UploadModal';
import { SatkerConfigModal } from './components/SatkerConfigModal';
import { PrintBookletModal } from './components/PrintBookletModal';
import { ShareLinkModal } from './components/ShareLinkModal';

import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<FullFinancialData>(() => {
    try {
      const saved = localStorage.getItem('lk_uakpa_tw3_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.satker || parsed.lra)) {
          return {
            satker: parsed.satker || initialFinancialData.satker,
            lra: parsed.lra || initialFinancialData.lra,
            lo: parsed.lo || initialFinancialData.lo,
            lpe: parsed.lpe || initialFinancialData.lpe,
            neraca: parsed.neraca || initialFinancialData.neraca,
            lampiranIIOfficial: parsed.lampiranIIOfficial || parsed.lampiranII || initialFinancialData.lampiranIIOfficial,
            lampiranIIIOfficial: parsed.lampiranIIIOfficial || parsed.lampiranIII || initialFinancialData.lampiranIIIOfficial,
          };
        }
      }
    } catch (e) {
      console.error('Gagal memuat data dari localStorage', e);
    }
    return initialFinancialData;
  });

  const [activeTab, setActiveTab] = useState<string>('ringkasan');
  const [showDigitalStamp, setShowDigitalStamp] = useState<boolean>(true);

  React.useEffect(() => {
    try {
      localStorage.setItem('lk_uakpa_tw3_data', JSON.stringify(data));
    } catch (e) {
      console.error('Gagal menyimpan data ke localStorage', e);
    }
  }, [data]);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Notification banner
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  // Updaters with Automatic Data Syncing across Lampiran II & III
  const handleUpdateLRA = (newLRA: LRAItem[]) => {
    const sync = syncFinancialData(
      newLRA,
      data.lo,
      data.lpe,
      data.neraca,
      data.lampiranIIOfficial,
      data.lampiranIIIOfficial
    );
    setData(prev => ({
      ...prev,
      lra: newLRA,
      lampiranIIOfficial: sync.lampiranII,
      lampiranIIIOfficial: sync.lampiranIII,
    }));
  };

  const handleUpdateLO = (newLO: LOItem[]) => {
    const sync = syncFinancialData(
      data.lra,
      newLO,
      data.lpe,
      data.neraca,
      data.lampiranIIOfficial,
      data.lampiranIIIOfficial
    );
    setData(prev => ({
      ...prev,
      lo: newLO,
      lpe: sync.lpe,
      neraca: sync.neraca,
      lampiranIIOfficial: sync.lampiranII,
    }));
  };

  const handleUpdateLPE = (newLPE: LPEItem[]) => {
    const sync = syncFinancialData(
      data.lra,
      data.lo,
      newLPE,
      data.neraca,
      data.lampiranIIOfficial,
      data.lampiranIIIOfficial
    );
    setData(prev => ({
      ...prev,
      lpe: newLPE,
      neraca: sync.neraca,
    }));
  };

  const handleUpdateNeraca = (newNeraca: NeracaItem[]) => {
    const sync = syncFinancialData(
      data.lra,
      data.lo,
      data.lpe,
      newNeraca,
      data.lampiranIIOfficial,
      data.lampiranIIIOfficial
    );
    setData(prev => ({
      ...prev,
      neraca: newNeraca,
      lampiranIIOfficial: sync.lampiranII,
    }));
  };

  const handleUpdateLampiranII = (newLampII: LampiranIIData) => {
    setData(prev => ({ ...prev, lampiranIIOfficial: newLampII }));
  };

  const handleUpdateLampiranIII = (newLampIII: LampiranIIIData) => {
    setData(prev => ({ ...prev, lampiranIIIOfficial: newLampIII }));
  };

  const handleSaveSatker = (newProfile: SatkerProfile) => {
    setData(prev => ({ ...prev, satker: newProfile }));
    showToast('Profil Satker & KPA berhasil diperbarui.');
  };

  // Synchronized Logo Updater (Cover & All Kop Surat)
  const handleUpdateLogo = (logoUrl: string | undefined) => {
    setData(prev => ({
      ...prev,
      satker: {
        ...prev.satker,
        customLogoUrl: logoUrl,
      },
    }));
    showToast(
      logoUrl
        ? 'Logo resmi berhasil diperbarui dan disinkronkan ke seluruh Kop Surat!'
        : 'Logo resmi dikembalikan ke lambang default.'
    );
  };

  // Dedicated Upload Handlers per component
  const handleUploadLRAFile = async (file: File) => {
    const result = await parseFinancialFile(file, 'lra', data.lra);
    if (result.lra && result.lra.length > 0) {
      handleUpdateLRA(result.lra);
      showToast('Berhasil mengunggah LRA dari SAKTI! Anggaran & realisasi 2026 dan 2025 otomatis tersimpan dan tertuang pada Lampiran II & III.');
    } else {
      showToast('Gagal memetakan baris LRA dari berkas.');
    }
  };

  const handleUploadLOFile = async (file: File) => {
    const result = await parseFinancialFile(file);
    if (result.lo && result.lo.length > 0) {
      handleUpdateLO(result.lo);
      showToast('Berhasil mengunggah LO dari SAKTI! Surplus/Defisit otomatis sinkron ke LPE, Neraca, dan Lampiran II.');
    } else {
      showToast('Gagal memetakan baris LO dari berkas.');
    }
  };

  const handleUploadLPEFile = async (file: File) => {
    const result = await parseFinancialFile(file);
    if (result.lpe && result.lpe.length > 0) {
      handleUpdateLPE(result.lpe);
      showToast('Berhasil mengunggah LPE dari SAKTI! Ekuitas Akhir otomatis sinkron ke Neraca.');
    } else {
      showToast('Gagal memetakan baris LPE dari berkas.');
    }
  };

  const handleUploadNeracaFile = async (file: File) => {
    const result = await parseFinancialFile(file);
    if (result.neraca && result.neraca.length > 0) {
      handleUpdateNeraca(result.neraca);
      showToast('Berhasil mengunggah Neraca dari SAKTI! Data otomatis sinkron ke Lampiran II.');
    } else {
      showToast('Gagal memetakan baris Neraca dari berkas.');
    }
  };

  // Global Upload Modal handler
  const handleApplyParsedData = (result: ParseResult) => {
    // If it's a full JSON backup, restore EVERYTHING directly including Lampiran II & III without recalculating over them!
    if (result.isFullBackup || result.detectedType === 'backup') {
      const restoredLampII = result.lampiranIIOfficial || data.lampiranIIOfficial;
      const restoredLampIII = result.lampiranIIIOfficial || data.lampiranIIIOfficial;

      const restoredData: FullFinancialData = {
        satker: result.satker || data.satker,
        lra: result.lra && result.lra.length > 0 ? result.lra : data.lra,
        lo: result.lo && result.lo.length > 0 ? result.lo : data.lo,
        lpe: result.lpe && result.lpe.length > 0 ? result.lpe : data.lpe,
        neraca: result.neraca && result.neraca.length > 0 ? result.neraca : data.neraca,
        lampiranIIOfficial: restoredLampII,
        lampiranIIIOfficial: restoredLampIII,
      };

      setData(restoredData);
      showToast('Data & seluruh Lampiran II dan III berhasil dipulihkan persis sesuai editan terakhir Anda!');
      return;
    }

    const newLRA = result.lra && result.lra.length > 0 ? result.lra : data.lra;
    const newLO = result.lo && result.lo.length > 0 ? result.lo : data.lo;
    const newLPE = result.lpe && result.lpe.length > 0 ? result.lpe : data.lpe;
    const newNeraca = result.neraca && result.neraca.length > 0 ? result.neraca : data.neraca;

    const currentLampII = result.lampiranIIOfficial || data.lampiranIIOfficial;
    const currentLampIII = result.lampiranIIIOfficial || data.lampiranIIIOfficial;

    const sync = syncFinancialData(
      newLRA,
      newLO,
      newLPE,
      newNeraca,
      currentLampII,
      currentLampIII
    );

    setData(prev => ({
      ...prev,
      lra: newLRA,
      lo: newLO,
      lpe: sync.lpe,
      neraca: sync.neraca,
      lampiranIIOfficial: sync.lampiranII,
      lampiranIIIOfficial: sync.lampiranIII,
    }));

    if (result.detectedType === 'lra') setActiveTab('lra');
    else if (result.detectedType === 'lo') setActiveTab('lo');
    else if (result.detectedType === 'lpe') setActiveTab('lpe');
    else if (result.detectedType === 'neraca') setActiveTab('neraca');

    showToast(result.summaryMessage + ' Data otomatis disinkronkan ke Lampiran II & III!');
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem('lk_uakpa_tw3_data');
    } catch (e) {
      console.error(e);
    }
    setData({ ...initialFinancialData });
    showToast('Data dikembalikan ke standar resmi KPPN Bantaeng.');
  };

  const handleExportExcel = () => {
    exportFullFinancialWorkbook(data);
    showToast('Mengunduh berkas Excel LK UAKPA TW III 2026...');
  };

  const handleDownloadBackup = () => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_lk_tw3_${data.satker.kodeSatker || 'satker'}_2026.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Cadangan file (.json) berhasil diunduh!');
    } catch (err) {
      alert('Gagal membuat cadangan file!');
    }
  };

  const handleRestoreBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed && (parsed.satker || parsed.lra)) {
          const restoredLampII = parsed.lampiranIIOfficial || parsed.lampiranII || data.lampiranIIOfficial;
          const restoredLampIII = parsed.lampiranIIIOfficial || parsed.lampiranIII || data.lampiranIIIOfficial;

          const completeData: FullFinancialData = {
            satker: parsed.satker || data.satker,
            lra: parsed.lra || data.lra,
            lo: parsed.lo || data.lo,
            lpe: parsed.lpe || data.lpe,
            neraca: parsed.neraca || data.neraca,
            lampiranIIOfficial: restoredLampII,
            lampiranIIIOfficial: restoredLampIII,
          };

          setData(completeData);
          showToast('Data & seluruh Lampiran II dan III berhasil dipulihkan persis sesuai editan terakhir Anda!');
        } else {
          alert('Format file cadangan tidak valid!');
        }
      } catch (err) {
        alert('Gagal membaca berkas cadangan!');
      }
    };
    reader.readAsText(file);
  };

  if (isPrintModalOpen) {
    return (
      <PrintBookletModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={data}
        showDigitalStamp={showDigitalStamp}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onExportExcel={handleExportExcel}
      />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Secondary Sub-Bar (Controls & Status) */}
      <div className="no-print bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            {data.satker.customLogoUrl && (
              <img
                src={data.satker.customLogoUrl}
                alt="Logo"
                className="w-4 h-4 object-contain"
              />
            )}
            <span className="font-semibold text-slate-900">{data.satker.namaSatker}</span>
            <span aria-hidden="true">·</span>
            <span>Triwulan III 2026</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-700">Kode {data.satker.kodeSatker}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 font-mono">SE KPPN S-374/KPN.2505/2026</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick action buttons */}
            <button
              onClick={() => setActiveTab('pernyataan')}
              className={`hover:text-slate-900 cursor-pointer ${
                activeTab === 'pernyataan'
                  ? 'font-bold text-slate-950 underline underline-offset-4'
                  : 'text-slate-600'
              }`}
            >
              Pernyataan KPA
            </button>
            <button
              onClick={() => setActiveTab('cover')}
              className={`hover:text-slate-900 cursor-pointer ${
                activeTab === 'cover'
                  ? 'font-bold text-slate-950 underline underline-offset-4'
                  : 'text-slate-600'
              }`}
            >
              Cover Jilid & Logo
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'ringkasan' && (
          <ExecutiveSummary
            data={data}
            onNavigateTab={setActiveTab}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenPrint={() => setIsPrintModalOpen(true)}
            onOpenConfig={() => setIsConfigModalOpen(true)}
            onOpenShare={() => setIsShareModalOpen(true)}
            onExportExcel={handleExportExcel}
            onDownloadBackup={handleDownloadBackup}
            onRestoreBackup={handleRestoreBackup}
          />
        )}

        {activeTab === 'lra' && (
          <FaceLRA
            satker={data.satker}
            lra={data.lra}
            onUpdateLRA={handleUpdateLRA}
            onUploadLRAFile={handleUploadLRAFile}
            showDigitalStamp={showDigitalStamp}
          />
        )}

        {activeTab === 'lo' && (
          <FaceLO
            satker={data.satker}
            lo={data.lo}
            onUpdateLO={handleUpdateLO}
            onUploadLOFile={handleUploadLOFile}
            showDigitalStamp={showDigitalStamp}
          />
        )}

        {activeTab === 'lpe' && (
          <FaceLPE
            satker={data.satker}
            lpe={data.lpe}
            onUpdateLPE={handleUpdateLPE}
            onUploadLPEFile={handleUploadLPEFile}
            showDigitalStamp={showDigitalStamp}
          />
        )}

        {activeTab === 'neraca' && (
          <FaceNeraca
            satker={data.satker}
            neraca={data.neraca}
            onUpdateNeraca={handleUpdateNeraca}
            onUploadNeracaFile={handleUploadNeracaFile}
            showDigitalStamp={showDigitalStamp}
          />
        )}

        {activeTab === 'lampiran-ii' && (
          <LampiranII
            satker={data.satker}
            lampiranII={data.lampiranIIOfficial}
            onUpdateLampiranII={handleUpdateLampiranII}
            showDigitalStamp={showDigitalStamp}
            lra={data.lra}
            onUploadLRAFile={handleUploadLRAFile}
            onSyncFromLRA={() => {
              const sync = syncFinancialData(
                data.lra,
                data.lo,
                data.lpe,
                data.neraca,
                data.lampiranIIOfficial,
                data.lampiranIIIOfficial
              );
              setData(prev => ({
                ...prev,
                lampiranIIOfficial: sync.lampiranII,
                lampiranIIIOfficial: sync.lampiranIII,
              }));
              showToast('Lampiran II berhasil disinkronkan ulang dengan data LRA (Tahun 2026 & 2025)!');
            }}
          />
        )}

        {activeTab === 'lampiran-iii' && (
          <LampiranIII
            satker={data.satker}
            lampiranIII={data.lampiranIIIOfficial}
            onUpdateLampiranIII={handleUpdateLampiranIII}
            showDigitalStamp={showDigitalStamp}
          />
        )}

        {activeTab === 'pernyataan' && (
          <PernyataanKPA
            satker={data.satker}
            showDigitalStamp={showDigitalStamp}
          />
        )}

        {activeTab === 'cover' && (
          <CoverBukuLK
            satker={data.satker}
            onUpdateLogo={handleUpdateLogo}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <p>
              Sistem Laporan Keuangan UAKPA Triwulan III Tahun 2026 · Surat Kepala KPPN Tipe A1 Bantaeng S-374/KPN.2505/2026
            </p>
            <p className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase">
              PENGEMBANG : JEMI, ST (MTSN 3 JENEPONTO)
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-600 shrink-0">
            <span>KPA: {data.satker.namaKPA}</span>
            <span>·</span>
            <span>Kode Satker: {data.satker.kodeSatker}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyParsedData={handleApplyParsedData}
        onResetToDefault={handleResetToDefault}
      />

      <SatkerConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        satker={data.satker}
        onSaveSatker={handleSaveSatker}
      />

      <PrintBookletModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={data}
        showDigitalStamp={showDigitalStamp}
      />

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShowToast={showToast}
      />
    </div>
  );
}
