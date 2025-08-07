import { build } from 'vite';
import { copyFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Chrome扩展构建脚本
 * 处理vite构建后的文件复制和整理
 */
async function buildExtension() {
  console.log('🚀 开始构建Chrome扩展...');
  
  try {
    // 执行vite构建
    await build();
    
    console.log('📦 Vite构建完成，开始处理扩展文件...');
    
    // 确保dist目录存在
    const distDir = resolve(__dirname, 'dist');
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
    }
    
    // 移动HTML文件到dist根目录
    const htmlFiles = ['popup.html', 'options.html', 'config-validator.html'];
    htmlFiles.forEach(htmlFile => {
      const srcPath = resolve(distDir, 'src', htmlFile);
      const destPath = resolve(distDir, htmlFile);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath);
        console.log(`✅ 移动 ${htmlFile} 到根目录`);
      }
    });
    
    // 删除空的src目录
    const srcDir = resolve(distDir, 'src');
    if (existsSync(srcDir)) {
      rmSync(srcDir, { recursive: true, force: true });
      console.log('✅ 清理临时src目录');
    }
    
    // 复制manifest.json
    copyFileSync(
      resolve(__dirname, 'manifest.json'),
      resolve(distDir, 'manifest.json')
    );
    console.log('✅ 复制 manifest.json');
    
    // 复制icons目录
    const iconsDir = resolve(distDir, 'icons');
    if (!existsSync(iconsDir)) {
      mkdirSync(iconsDir, { recursive: true });
    }
    
    const iconFiles = ['icon16.png', 'icon48.png', 'icon128.png', 'icon256.png', 'icon512.png'];
    iconFiles.forEach(iconFile => {
      const srcPath = resolve(__dirname, 'icons', iconFile);
      const destPath = resolve(iconsDir, iconFile);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath);
        console.log(`✅ 复制 icons/${iconFile}`);
      }
    });
    
    // 复制其他必要文件
    const otherFiles = [
      'API配置指南.md',
      'README.md',
      'quick-fix.js',
      'test-config.js'
    ];
    
    otherFiles.forEach(file => {
      const srcPath = resolve(__dirname, file);
      const destPath = resolve(distDir, file);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath);
        console.log(`✅ 复制 ${file}`);
      }
    });
    
    console.log('🎉 Chrome扩展构建完成！');
    console.log(`📁 输出目录: ${distDir}`);
    
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 执行构建
buildExtension();