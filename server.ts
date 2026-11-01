import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Mock API for GCR Cloud Support
  const apiRouter = express.Router();

  apiRouter.get('/sync', (req, res) => {
    // Return dummy data to prevent the app from crashing with Network Error
    res.json({
      houses: [],
      residents: [],
      iplRates: [],
      invoices: [],
      paymentSubmissions: [],
      cashTransactions: [],
      announcements: [
        {
          id: '1',
          title: 'Selamat Datang di GCR Smart',
          content: 'Aplikasi Anda sudah terhubung ke backend proxy.',
          category: 'Informasi Umum',
          timestamp: new Date().toISOString(),
        }
      ],
      complaints: [],
      complaintUpdates: [],
      polls: [],
      pollVotes: [],
      events: [],
      eventRegistrations: [],
      settings: {
        communityName: 'Grand Ciledug Raya',
        locationName: 'Ciledug, Tangerang',
        defaultIplAmount: 150000,
        iplNominalOptions: [150000, 200000, 250000, 300000],
        dueDayOfMonth: 10,
        bankName: 'BCA',
        bankAccountNumber: '1234567890',
        bankAccountHolder: 'PT GCR TEKNO',
      },
      auditLogs: [],
      panicAlerts: [],
      latestAnnouncement: {
        id: '1',
        title: 'Selamat Datang di GCR Smart',
        category: 'Informasi Umum',
        timestamp: new Date().toISOString(),
      }
    });
  });

  // Handle other API routes with a 200 OK for now
  apiRouter.use((req, res) => {
    console.log(`API call to ${req.path}`);
    res.status(200).json({ success: true, message: 'Mock response from built-in proxy' });
  });

  app.use('/api', apiRouter);

  const distPath = path.join(__dirname, 'dist');
  const distIndexPath = path.join(distPath, 'index.html');
  const hasDist = fs.existsSync(distIndexPath);
  const isProduction = process.env.NODE_ENV === 'production' || hasDist;

  let viteDevServerLoaded = false;
  if (!isProduction) {
    try {
      const viteModule = 'vite';
      const { createServer: createViteServer } = await import(/* @vite-ignore */ viteModule);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      viteDevServerLoaded = true;
    } catch {
      viteDevServerLoaded = false;
    }
  }

  if (isProduction || !viteDevServerLoaded) {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(distIndexPath);
      });
    } else {
      app.get('*', (req, res) => {
        res.send('Build dist directory not found. Please run npm run build first.');
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch(console.error);
