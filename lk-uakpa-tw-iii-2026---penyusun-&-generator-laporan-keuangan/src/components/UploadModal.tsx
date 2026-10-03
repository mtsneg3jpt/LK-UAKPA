import React, { useState, useRef } from 'react';
import { parseFinancialFile, ParseResult } from '../utils/parser';
import { downloadExcelTemplate } from '../utils/excelExport';
import { initialFinancialData } from '../data/defaultData';
import { LRAItem, LOItem, LPEItem, NeracaItem } from '../types/financial';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, RefreshCw, X, ArrowRight } from 'lucide-react';
import { formatNumber } from '../utils/numberFormat';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (result: ParseResult) => void;
  onResetToDefault: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
  onResetToDefault,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setParseResult(null);

    try {
      const result = await parseFinancialFile(file);
      setParseResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses berkas laporan keuangan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleApply = () => {
    if (parseResult) {
      onApplyParsedData(parseResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Unggah Berkas Laporan Keuangan UAKPA
              </h2>
              <p className="text-xs text-slate-500">
                Penyusun otomatis LRA, LO, LPE, dan Neraca TW III 2026
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick template actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <div>
              <p className="font-semibold text-slate-900">
                Perlu Format Excel Standar SAKTI?
              </p>
              <p className="text-slate-600 mt-0.5">
                Unduh template resmi dengan 4 lembar kerja (LRA, LO, LPE, Neraca)
              </p>
            </div>
            <button
              onClick={downloadExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-md font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/30 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.json"
              onChange={onFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {isProcessing
                ? 'Memproses dan menyusun berkas...'
                : 'Klik untuk memilih berkas atau seret ke area ini'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Mendukung berkas Excel (.xlsx, .xls), CSV, Text SAKTI, dan JSON
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parseResult && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-950">
                    Analisis Berkas Berhasil!
                  </p>
                  <p className="text-emerald-800 mt-0.5">
                    {parseResult.summaryMessage}
                  </p>
                </div>
              </div>

              {/* Breakdown count */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/80">
                <div className="p-2 bg-white rounded border border-emerald-100">
                  <span className="text-[10px] text-slate-500 uppercase">LRA</span>
                  <p className="font-mono font-semibold text-slate-900">
                    {parseResult.lra ? `${parseResult.lra.length} Baris` : 'Nihil'}
                  </p>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-100">
                  <span className="text-[10px] text-slate-500 uppercase">LO</span>
                  <p className="font-mono font-semibold text-slate-900">
                    {parseResult.lo ? `${parseResult.lo.length} Baris` : 'Nihil'}
                  </p>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-100">
                  <span className="text-[10px] text-slate-500 uppercase">LPE</span>
                  <p className="font-mono font-semibold text-slate-900">
                    {parseResult.lpe ? `${parseResult.lpe.length} Baris` : 'Nihil'}
                  </p>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-100">
                  <span className="text-[10px] text-slate-500 uppercase">Neraca</span>
                  <p className="font-mono font-semibold text-slate-900">
                    {parseResult.neraca ? `${parseResult.neraca.length} Baris` : 'Nihil'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick preset restore */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Kembalikan ke data standar bawaan MTsN 3 Jeneponto?</span>
            <button
              onClick={() => {
                onResetToDefault();
                onClose();
              }}
              className="inline-flex items-center gap-1 text-slate-800 hover:text-slate-950 font-medium cursor-pointer underline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Muat Sampel Asli</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleApply}
            disabled={!parseResult}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              parseResult
                ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Terapkan ke Laporan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
