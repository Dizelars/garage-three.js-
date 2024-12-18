// export default {
//     root: 'src/',
//     publicDir: '../static/',
//     base: './',
//     server:
//     {
//         host: true, // Open to local network and display URL
//         open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
//     },
//     build:
//     {
//         outDir: '../dist', // Output in the dist/ folder
//         emptyOutDir: true, // Empty the folder first
//         sourcemap: true // Add sourcemap
//     },
// }


import { defineConfig } from 'vite';

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
    rollupOptions: {
      input: {
        main: 'src/index.html',
        moto: 'src/moto.html',
        amarok: 'src/amarok.html',
        bus: 'src/bus.html',
        ford: 'src/ford.html',
        kamaz: 'src/kamaz.html',
        kater: 'src/kater.html',
        moskvich: 'src/moskvich.html',
        velo: 'src/velo.html',
        // police: 'src/police.html',
        // muslCar: 'src/muslCar.html',
        // solaris: 'src/solaris.html',
        // test_page: 'src/test_page.html',
        // pageAR: 'src/pageAR.html'
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
    }
  }
});

// import { defineConfig } from 'vite';
// import ViteHtmlPlugin from 'vite-plugin-html'; // Убедитесь, что импорт правильный

// export default defineConfig({
//   root: 'src/',
//   publicDir: '../static/',
//   base: './',
//   server: {
//     host: true,
//     open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env),
//   },
//   build: {
//     outDir: '../dist',
//     emptyOutDir: true,
//     sourcemap: true,
//     rollupOptions: {
//       input: {
//         main: 'src/index.html',
//         moto: 'src/moto.html',
//         amarok: 'src/amarok.html',
//         bus: 'src/bus.html',
//         ford: 'src/ford.html',
//         kamaz: 'src/kamaz.html',
//         kater: 'src/kater.html',
//         moskvich: 'src/moskvich.html',
//         velo: 'src/velo.html',
//       },
//       output: {
//         assetFileNames: (assetInfo) => {
//           let extType = assetInfo.name.split('.').pop();
//           if (/css|scss/.test(extType)) {
//             return 'assets/style/[name][extname]';
//           } else if (/js/.test(extType)) {
//             return 'assets/js/[name][extname]';
//           } else if (/ttf|otf|woff|woff2/.test(extType)) {
//             return 'assets/fonts/[name][extname]';
//           } else {
//             return 'assets/images/[name][extname]';
//           }
//         },
//         chunkFileNames: 'assets/js/[name].js',
//         entryFileNames: 'assets/js/[name].js',
//       },
//     },
//     plugins: [
//       ViteHtmlPlugin({
//         minify: {
//           collapseWhitespace: true,
//           removeComments: true,
//           removeRedundantAttributes: true,
//           removeScriptTypeAttributes: true,
//           removeStyleLinkTypeAttributes: true,
//           minifyJS: true,
//           minifyCSS: true,
//         },
//       }),
//     ],
//   },
// });