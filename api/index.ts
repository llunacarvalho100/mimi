import app from '../src/serverApp';

export default function handler(req: any, res: any) {
  // Ensure req.url starts with /api so it routes correctly through Express on Vercel
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
