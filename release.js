#!/usr/bin/env node

/**
 * 版本发布脚本
 * 自动化处理版本发布流程：构建、打包、创建标签、推送
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * 执行命令并输出结果
 * @param {string} command - 要执行的命令
 * @param {string} description - 命令描述
 */
function runCommand(command, description) {
  console.log(`🚀 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`✅ ${description}完成`);
    return result;
  } catch (error) {
    console.error(`❌ ${description}失败:`, error.message);
    process.exit(1);
  }
}

/**
 * 获取当前版本号
 * @returns {string} 版本号
 */
function getCurrentVersion() {
  const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
  return packageJson.version;
}

/**
 * 主发布流程
 */
async function release() {
  console.log('🎯 开始版本发布流程...');
  
  const version = getCurrentVersion();
  console.log(`📦 当前版本: v${version}`);
  
  // 1. 清理并构建
  runCommand('npm run clean', '清理构建文件');
  runCommand('npm run build', '构建项目');
  
  // 2. 打包扩展
  runCommand('npm run package', '打包扩展');
  
  // 3. 提交版本更新
  runCommand('git add .', '添加文件到暂存区');
  runCommand(`git commit -m "chore: release v${version}"`, '提交版本更新');
  
  // 4. 创建标签
  runCommand(`git tag -a v${version} -m "Release v${version}"`, '创建版本标签');
  
  // 5. 推送到远程仓库
  runCommand('git push origin main', '推送代码到远程仓库');
  runCommand('git push origin --tags', '推送标签到远程仓库');
  
  console.log('🎉 版本发布完成!');
  console.log(`📋 发布信息:`);
  console.log(`   版本号: v${version}`);
  console.log(`   扩展包: extension.zip`);
  console.log(`   GitHub: https://github.com/Tenwq/fanyi/releases/tag/v${version}`);
  console.log('');
  console.log('📝 下一步操作:');
  console.log('   1. 访问 GitHub 仓库创建 Release');
  console.log('   2. 上传 extension.zip 到 Chrome Web Store');
  console.log('   3. 更新项目文档和说明');
}

// 执行发布流程
release().catch(error => {
  console.error('❌ 发布失败:', error);
  process.exit(1);
});