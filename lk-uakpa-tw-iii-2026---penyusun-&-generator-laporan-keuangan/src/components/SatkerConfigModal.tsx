import React, { useState } from 'react';
import { SatkerProfile } from '../types/financial';
import { Building2, X, Check, RotateCcw } from 'lucide-react';
import { initialFinancialData } from '../data/defaultData';

interface SatkerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  satker: SatkerProfile;
  onSaveSatker: (newProfile: SatkerProfile) => void;
}

export const SatkerConfigModal: React.FC<SatkerConfigModalProps> = ({
  isOpen,
  onClose,
  satker,
  onSaveSatker,
}) => {
  const [formData, setFormData] = useState<SatkerProfile>({ ...satker });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSatker(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData({ ...initialFinancialData.satker });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Profil Satuan Kerja & Pejabat KPA
              </h2>
              <p className="text-xs text-slate-500">
                Pengaturan identitas resmi lembar face dan lembar pengesahan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Logo Upload Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {formData.customLogoUrl ? (
                <img
                  src={formData.customLogoUrl}
                  alt="Logo Preview"
                  className="w-12 h-12 object-contain rounded border border-slate-300 p-1 bg-white shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded border border-dashed border-slate-300 flex items-center justify-center bg-white text-slate-400 shrink-0">
                  Logo
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">
                  Logo Resmi Satker / Kementerian
                </p>
                <p className="text-[11px] text-slate-500">
                  Sinkron otomatis ke Cover Buku dan seluruh Kop Surat lembar face
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded font-medium cursor-pointer shadow-2xs transition-colors">
                <span>Pilih Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => {
                        setFormData({
                          ...formData,
                          customLogoUrl: ev.target?.result as string,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {formData.customLogoUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, customLogoUrl: undefined })}
                  className="px-2 py-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Nama Kementerian / Lembaga:
              </label>
              <input
                type="text"
                required
                value={formData.namaKementerian}
                onChange={e =>
                  setFormData({ ...formData, namaKementerian: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Kode K/L:
              </label>
              <input
                type="text"
                value={formData.kodeKementerian}
                onChange={e =>
                  setFormData({ ...formData, kodeKementerian: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Kode Unit Eselon I:
              </label>
              <input
                type="text"
                value={formData.kodeEselon1}
                onChange={e =>
                  setFormData({ ...formData, kodeEselon1: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Unit Eselon I:
              </label>
              <input
                type="text"
                required
                value={formData.namaEselon1}
                onChange={e =>
                  setFormData({ ...formData, namaEselon1: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Nama Satuan Kerja (Satker):
              </label>
              <input
                type="text"
                required
                value={formData.namaSatker}
                onChange={e =>
                  setFormData({ ...formData, namaSatker: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Kode Satker (SAKTI):
              </label>
              <input
                type="text"
                required
                value={formData.kodeSatker}
                onChange={e =>
                  setFormData({ ...formData, kodeSatker: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Kota / Kabupaten Penetapan:
              </label>
              <input
                type="text"
                required
                value={formData.kotaPenetapan}
                onChange={e =>
                  setFormData({ ...formData, kotaPenetapan: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Alamat Satuan Kerja:
              </label>
              <input
                type="text"
                value={formData.alamatSatker}
                onChange={e =>
                  setFormData({ ...formData, alamatSatker: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="sm:col-span-2 pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">
                Data Kuasa Pengguna Anggaran (KPA) Penandatangan Lembar Face
              </h3>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Nama Lengkap KPA (dengan Gelar):
              </label>
              <input
                type="text"
                required
                value={formData.namaKPA}
                onChange={e =>
                  setFormData({ ...formData, namaKPA: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                NIP KPA:
              </label>
              <input
                type="text"
                required
                value={formData.nipKPA}
                onChange={e =>
                  setFormData({ ...formData, nipKPA: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Jabatan Resmi KPA:
              </label>
              <input
                type="text"
                required
                value={formData.jabatanKPA}
                onChange={e =>
                  setFormData({ ...formData, jabatanKPA: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Tanggal Penandatanganan:
              </label>
              <input
                type="text"
                value={formData.tanggalLaporan}
                onChange={e =>
                  setFormData({ ...formData, tanggalLaporan: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset MTsN 3 Jeneponto</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
