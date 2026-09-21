import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function avatarUploadPlugin(): Plugin {
  return {
    name: 'avatar-upload-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-profile', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (data.profile) {
                if (data.profile.avatarUrl && data.profile.avatarUrl.startsWith('data:image')) {
                  const base64Data = data.profile.avatarUrl.replace(/^data:image\/\w+;base64,/, '');
                  const buffer = Buffer.from(base64Data, 'base64');
                  const outDir = path.resolve(process.cwd(), 'public/assets');
                  if (!fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir, { recursive: true });
                  }
                  fs.writeFileSync(path.resolve(outDir, 'hernan-profile.jpg'), buffer);
                  data.profile.avatarUrl = '/assets/hernan-profile.jpg';
                }
                const profilePath = path.resolve(process.cwd(), 'src/data/defaultProfile.ts');
                const fileContent = `import { ChefProfile } from '../types';\n\nexport const DEFAULT_CHEF_PROFILE: ChefProfile = ${JSON.stringify(data.profile, null, 2)};\n`;
                fs.writeFileSync(profilePath, fileContent, 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
                return;
              }
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'No profile provided' }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });

      server.middlewares.use('/api/save-photo', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (data.image) {
                const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const outDir = path.resolve(process.cwd(), 'public/assets');
                if (!fs.existsSync(outDir)) {
                  fs.mkdirSync(outDir, { recursive: true });
                }
                const outPath = path.resolve(outDir, 'hernan-profile.jpg');
                fs.writeFileSync(outPath, buffer);

                const profilePath = path.resolve(process.cwd(), 'src/data/defaultProfile.ts');
                if (fs.existsSync(profilePath)) {
                  let content = fs.readFileSync(profilePath, 'utf8');
                  content = content.replace(/"?avatarUrl"?:\s*['"][^'"]*['"]/, `avatarUrl: "/assets/hernan-profile.jpg"`);
                  fs.writeFileSync(profilePath, content);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, url: '/assets/hernan-profile.jpg' }));
                return;
              }
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'No image provided' }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), avatarUploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
