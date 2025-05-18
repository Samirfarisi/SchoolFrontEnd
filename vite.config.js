import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { splitVendorChunkPlugin } from 'vite'
import { compression } from 'vite-plugin-compression2'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5174, // Specify a different port
  },
  // Enable faster builds with esbuild
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/, /\.(png|jpe?g|gif|svg|webp|ico)$/i],
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/, /\.(png|jpe?g|gif|svg|webp|ico)$/i],
    }),
  ],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    open: true,

    // <-- HMR configuration to fix the origin mismatch warning: -->
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
    },

    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/sanctum/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Optimize bundle size with advanced settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,
        ecma: 2020,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // Enhanced chunk splitting for better caching and parallel loading
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          ui: ['react-icons'],
          alerts: ['sweetalert2'],
          player: ['react-player'],
        },
        // Ensure smaller chunk sizes with hashed content
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
            return 'assets/images/[name].[hash][extname]';
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(name ?? '')) {
            return 'assets/fonts/[name].[hash][extname]';
          }
          return 'assets/[ext]/[name].[hash][extname]';
        },
      },
    },
    
    // Set target to newer browsers for smaller bundle size
    target: 'es2020',
    
    // Ensure assets are optimally processed
    assetsInlineLimit: 4096, // 4kb
    // Enable source maps for production to help with debugging
    sourcemap: true,
    // Generate preload directives in HTML
    modulePreload: {
      polyfill: true,
    },
  },
  // Enhanced CSS optimization
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        charset: false,
        quietDeps: true,
      },
    },
    // Enable CSS code splitting
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  
  // Optimize asset processing with broader support
  assetsInclude: ['**/*.woff2', '**/*.webp', '**/*.avif', '**/*.mp4', '**/*.pdf'],
  
  // Improve dev server performance
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    exclude: ['react-player'],
  },
})