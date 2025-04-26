import type {NextConfig} from 'next';
import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
   webpack: (config, { isServer }) => {
      // Ensure pdfjs worker is copied to static directory
      if (!isServer) { // Only apply this configuration for the client-side bundle
          // Get the path to the pdf.js worker file within node_modules
          const pdfWorkerPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
          const pdfWorkerFile = path.join(pdfWorkerPath, 'build', 'pdf.worker.min.mjs'); // Use .mjs for modern JS

          // Add the CopyPlugin to copy the worker file
          config.plugins.push(
            new CopyPlugin({
              patterns: [
                {
                  from: pdfWorkerFile,
                   // Copies to .next/static/chunks/pdf.worker.min.mjs in development
                   // Copies to .next/static/media/pdf.worker.min.mjs.[hash].mjs in production
                  to: path.join('static', 'chunks', path.basename(pdfWorkerFile)), // Adjust destination as needed
                },
              ],
            })
          );
      }

      // Important: return the modified config
      return config;
    },
};

export default nextConfig;
