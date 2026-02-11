import { defineConfig } from 'vite';
import htmlMinifier from 'vite-plugin-html-minifier-terser'; // плагин для минимизации HTML

export default defineConfig({
  root: 'src/',
  publicDir: '../static/',
  base: './',
  server: {
    host: true,
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',  // Минификация с использованием Terser для JS
    terserOptions: {
      compress: {
        drop_console: true, // Убираем консольные логи
      },
      output: {
        comments: false, // Убираем комментарии из JS
      },
    },
    rollupOptions: {
      input: {
        main: 'src/index.html',
        moto: 'src/moto.html',
        amarok: 'src/amarok.html',
        bus: 'src/bus.html',
        kamaz: 'src/kamaz.html',
        kater: 'src/kater.html',
        moskvich: 'src/moskvich.html',
        velo: 'src/velo.html',
        // ford: 'src/ford.html',
        // solaris: 'src/solaris.html',
      },
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').pop();
          if (/css|scss/.test(extType)) {
            return 'assets/style/[name][extname]';
          } else if (/js/.test(extType)) {
            return 'assets/js/[name][extname]';
          } else if (/ttf|otf|woff|woff2/.test(extType)) {
            return 'assets/fonts/[name][extname]';
          } else {
            return 'assets/images/[name][extname]';
          }
        },
        chunkFileNames: 'assets/js/[name].js',
        entryFileNames: 'assets/js/[name].js'
      }
    },
    css: {
      minify: true,  // Минификация CSS, включая удаление комментариев
    }
  },
  plugins: [
    htmlMinifier({
      minify: true,    // Минификация HTML
      removeComments: true,  // Убираем комментарии в HTML
    }),
  ]
});