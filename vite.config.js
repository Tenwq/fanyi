import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';

/**
 * Vite配置文件 - 专为Chrome扩展优化
 * 配置多入口构建，支持popup、options、background等页面
 */
export default defineConfig({
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 清空输出目录
    emptyOutDir: true,
    // 多入口配置
    rollupOptions: {
      input: {
        // popup页面
        popup: resolve(__dirname, 'src/popup.html'),
        // 设置页面
        options: resolve(__dirname, 'src/options.html'),
        // 配置验证工具
        'config-validator': resolve(__dirname, 'src/config-validator.html'),
        // background脚本
        background: resolve(__dirname, 'background.js')
      },
      output: {
        // 输出文件命名规则 - 简化命名避免hash问题
        entryFileNames: (chunkInfo) => {
          // background.js保持原名
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          return '[name].js';
        },
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          // CSS文件
          if (assetInfo.name?.endsWith('.css')) {
            return '[name].css';
          }
          return '[name][extname]';
        }
      },
      // 确保HTML文件输出到正确位置
      external: [],
      plugins: [
        createHtmlPlugin({
          minify: {
            collapseWhitespace: true,
            keepClosingSlash: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
            minifyCSS: true,
            minifyJS: true
          }
        }),
        {
          name: 'html-output-fix',
          generateBundle(options, bundle) {
            // 将HTML文件移动到根目录
            Object.keys(bundle).forEach(fileName => {
              if (fileName.includes('/') && fileName.endsWith('.html')) {
                const newFileName = fileName.split('/').pop();
                bundle[newFileName] = bundle[fileName];
                delete bundle[fileName];
              }
            });
          }
        }
      ]
    },
    // 生成source map用于调试
    sourcemap: false,
    // 启用代码压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: {
        toplevel: true
      }
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: false
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  // 公共基础路径
  base: './',
  
  // 定义全局变量
  define: {
    // 避免Node.js环境变量问题
    'process.env.NODE_ENV': '"production"'
  }
});