import app from './app';
import { env } from './config/env';

const PORT = env.port;

// Chỉ chạy app.listen nếu không phải môi trường Vercel Serverless
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('');
    console.log('🏪 ====================================');
    console.log('   Sora POS API Server');
    console.log('====================================');
    console.log(`🚀 Server:  http://localhost:${PORT}`);
    console.log(`📡 API:     http://localhost:${PORT}/api`);
    console.log(`❤️  Health:  http://localhost:${PORT}/api/health`);
    console.log(`🌍 Env:     ${env.nodeEnv}`);
    console.log('====================================');
    console.log('');
  });
}

export default app;
