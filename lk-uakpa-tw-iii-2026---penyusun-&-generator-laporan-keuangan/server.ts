import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProd) {
    // In development: mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // Serve index.html for all requests in dev
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LK UAKPA TW III 2026 - Penyusun & Generator Laporan Keuangan</title>
    <meta name="description" content="Aplikasi Penyusunan Laporan Keuangan UAKPA Triwulan III Tahun 2026: Lembar Face LRA, LO, LPE, Neraca dengan tanda tangan KPA, fitur upload dan penyusunan otomatis, Lampiran II, dan Lampiran III." />
    <meta property="og:title" content="LK UAKPA TW III 2026 - Penyusun & Generator Laporan Keuangan" />
    <meta property="og:description" content="Aplikasi Penyusunan Laporan Keuangan UAKPA Triwulan III Tahun 2026: Lembar Face LRA, LO, LPE, Neraca dengan tanda tangan KPA, fitur upload dan penyusunan otomatis, Lampiran II, dan Lampiran III." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#0f172a" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="LK UAKPA" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='128' fill='%230f172a'/%3E%3Cpath d='M128 160h256v48H128zM128 240h256v48H128zM128 320h176v48H128z' fill='%2310b981'/%3E%3Ccircle cx='384' cy='344' r='40' fill='%2338bdf8'/%3E%3C/svg%3E" />
    <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='128' fill='%230f172a'/%3E%3Cpath d='M128 160h256v48H128zM128 240h256v48H128zM128 320h176v48H128z' fill='%2310b981'/%3E%3Ccircle cx='384' cy='344' r='40' fill='%2338bdf8'/%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // In production: serve built static files from dist directory
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    // Fallback all GET requests to dist/index.html to support SPA routing
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer();
