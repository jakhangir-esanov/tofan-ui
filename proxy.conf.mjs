// Dev server proxy: the app calls `/api/...` on its own origin, so the browser needs no CORS.
// Point it at a local backend with: TOFAN_API_URL=http://localhost:5179 npm start
const target = process.env.TOFAN_API_URL ?? 'https://api.157.90.117.20.sslip.io';

export default {
  '/api': {
    target,
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/api': '' },
  },
};
