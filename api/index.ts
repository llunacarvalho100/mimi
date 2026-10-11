import app from './serverApp';

export default function handler(req: any, res: any) {
  try {
    // Ensure req.url starts with /api so it routes correctly through Express on Vercel
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + req.url;
    }
    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel Serverless Function Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error?.message || 'Erro interno no servidor.',
        status: 500,
        service: 'PinTweet API Serverless'
      });
    }
  }
}

