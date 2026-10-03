import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  MessageCircle,
  ExternalLink,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const publicUrl =
    'https://ais-dev-j7xvcktidcrw4kytksdemi-511769052766.asia-southeast1.run.app';
  const devUrl =
    'https://ais-dev-j7xvcktidcrw4kytksdemi-511769052766.asia-southeast1.run.app';

  const handleCopyPublic = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedPublic(true);
      onShowToast('Tautan publik berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedPublic(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedPublic(true);
      onShowToast('Tautan publik berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedPublic(false), 2500);
    }
  };

  const handleCopyDev = async () => {
    try {
      await navigator.clipboard.writeText(devUrl);
      setCopiedDev(true);
      onShowToast('Tautan development berhasil disalin!');
      setTimeout(() => setCopiedDev(false), 2500);
    } catch {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2500);
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    publicUrl
  )}`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Aplikasi LK UAKPA TW III 2026 (Penyusun & Generator Laporan Keuangan): ${publicUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Tautan Akses Aplikasi Kapan Saja & di Mana Saja</h3>
              <p className="text-xs text-slate-300">
                Dapat diakses di Smartphone, Tablet, Laptop, maupun PC 24/7
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Main Public URL Box */}
          <div className="bg-slate-50 border-2 border-emerald-500/30 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Link Publik Aktif
                </span>
                <span className="text-xs text-slate-500">Akses Langsung Tanpa Login</span>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-xs text-slate-700 hover:text-emerald-700 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQR ? 'Sembunyikan QR' : 'Tampilkan QR'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 select-all break-all shadow-inner">
                {publicUrl}
              </div>
              <button
                onClick={handleCopyPublic}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {copiedPublic ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin</span>
                  </>
                )}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 p-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                title="Buka di Tab Baru"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Quick Share to WhatsApp */}
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-600">Bagikan cepat ke tim / pimpinan:</span>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim via WhatsApp</span>
              </a>
            </div>

            {/* QR Code expansion */}
            {showQR && (
              <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col items-center text-center animate-in fade-in">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Scan QR Code dengan kamera HP / Tablet untuk membuka langsung:
                </p>
                <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-xs">
                  <img
                    src={qrImageUrl}
                    alt="QR Code Akses Aplikasi LK UAKPA TW III"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Kamera iPhone / Android akan langsung menampilkan tombol buka website
                </p>
              </div>
            )}
          </div>

          {/* Panduan Akses di Semua Media */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Panduan Akses di Berbagai Perangkat:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Smartphone */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">HP / Smartphone</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Buka tautan di Chrome/Safari. Pilih menu browser lalu klik <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (Add to Home screen) agar menjadi ikon aplikasi.
                </p>
              </div>

              {/* Tablet */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Tablet className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Tablet / iPad</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tampilan tabel akuntansi otomatis responsif. Nyaman digunakan untuk review laporan saat rapat atau dinas luar.
                </p>
              </div>

              {/* Laptop / PC */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Laptop / PC Kantor</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Dapat disimpan di Bookmark (Ctrl+D). Cocok untuk cetak dokumen A4 tanpa tombol geser, impor SAKTI, dan ekspor Excel.
                </p>
              </div>
            </div>
          </div>

          {/* Keunggulan Cloud Access */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-bold">Aplikasi Cloud 24/7 Siap Akses</p>
              <p className="text-emerald-800 leading-relaxed">
                Tautan di atas disimpan di server cloud Google Cloud Run, sehingga dapat dibuka kapan pun tanpa bergantung pada perangkat lokal yang menyala.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            MTs Negeri 3 Jeneponto · LK UAKPA TW III 2026
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
