/**
 * Utility functions for Indonesian Government Accounting (SAP/SAKTI)
 */

export function formatRupiah(amount: number | null | undefined, showSymbol = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absAmount);

  if (isNegative) {
    return showSymbol ? `(Rp ${formatted})` : `(${formatted})`;
  }
  return showSymbol ? `Rp ${formatted}` : formatted;
}

export function formatNumber(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  if (amount < 0) {
    return `(${Math.abs(amount).toLocaleString('id-ID')})`;
  }
  return amount.toLocaleString('id-ID');
}

export function formatPercent(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || isNaN(num)) return '0,00%';
  return `${num.toFixed(decimals).replace('.', ',')}%`;
}

export function parseIndonesianNumber(str: string | number): number {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  
  let clean = str.trim();
  const isNegative = clean.startsWith('(') && clean.endsWith(')') || clean.startsWith('-');
  clean = clean.replace(/[()Rp.\s]/gi, '').replace(',', '.');
  
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;
  return isNegative ? -Math.abs(parsed) : parsed;
}

/**
 * Terbilang function in Indonesian
 */
export function terbilang(angka: number): string {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan',
    'Sepuluh', 'Sebelas'
  ];
  
  const nominal = Math.floor(Math.abs(angka));
  if (nominal === 0) return 'Nol Rupiah';

  function konversi(n: number): string {
    if (n < 12) {
      return bilangan[n];
    } else if (n < 20) {
      return konversi(n - 10) + ' Belas';
    } else if (n < 100) {
      return konversi(Math.floor(n / 10)) + ' Puluh ' + konversi(n % 10);
    } else if (n < 200) {
      return 'Seratus ' + konversi(n - 100);
    } else if (n < 1000) {
      return konversi(Math.floor(n / 100)) + ' Ratus ' + konversi(n % 100);
    } else if (n < 2000) {
      return 'Seribu ' + konversi(n - 1000);
    } else if (n < 1000000) {
      return konversi(Math.floor(n / 1000)) + ' Ribu ' + konversi(n % 1000);
    } else if (n < 1000000000) {
      return konversi(Math.floor(n / 1000000)) + ' Juta ' + konversi(n % 1000000);
    } else if (n < 1000000000000) {
      return konversi(Math.floor(n / 1000000000)) + ' Miliar ' + konversi(n % 1000000000);
    } else if (n < 1000000000000000) {
      return konversi(Math.floor(n / 1000000000000)) + ' Triliun ' + konversi(n % 1000000000000);
    }
    return '';
  }

  const hasil = konversi(nominal).replace(/\s+/g, ' ').trim();
  return (angka < 0 ? 'Minus ' : '') + hasil + ' Rupiah';
}
