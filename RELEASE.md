# 版本发布指南

本文档详细说明了 Chrome 翻译扩展的版本发布流程和最佳实践。

## 🚀 快速发布

### 自动化发布（推荐）

```bash
# 发布补丁版本（1.0.0 -> 1.0.1）
npm run version:patch
npm run release

# 发布次要版本（1.0.0 -> 1.1.0）
npm run version:minor
npm run release

# 发布主要版本（1.0.0 -> 2.0.0）
npm run version:major
npm run release
```

### 手动发布

```bash
# 1. 更新版本号
npm version patch  # 或 minor/major
npm run sync-version

# 2. 构建和打包
npm run clean
npm run build
npm run package

# 3. 提交和标签
git add .
git commit -m "chore: release v1.0.1"
git tag -a v1.0.1 -m "Release v1.0.1"

# 4. 推送到远程
git push origin main
git push origin --tags
```

## 📋 发布流程详解

### 1. 版本号管理

项目使用语义化版本控制（SemVer）：
- **主版本号（Major）**: 不兼容的 API 修改
- **次版本号（Minor）**: 向下兼容的功能性新增
- **修订号（Patch）**: 向下兼容的问题修正

### 2. 版本同步

确保 `package.json` 和 `manifest.json` 中的版本号保持一致：

```bash
npm run sync-version
```

### 3. 构建优化

发布前会自动执行以下优化：
- JavaScript 代码压缩（Terser）
- CSS 代码压缩
- HTML 代码压缩
- 移除 console 和 debugger 语句
- 变量名混淆

### 4. 打包输出

构建完成后会生成：
- `dist/` 目录：包含所有构建文件
- `extension.zip`：可直接上传到 Chrome Web Store 的扩展包

## 🔧 可用命令

### 版本管理
```bash
npm run version:patch    # 升级补丁版本
npm run version:minor    # 升级次要版本
npm run version:major    # 升级主要版本
npm run sync-version     # 同步版本号到 manifest.json
```

### 构建和打包
```bash
npm run clean           # 清理构建文件
npm run build           # 构建项目
npm run package         # 构建并打包扩展
npm run release         # 完整发布流程
```

### 开发调试
```bash
npm run dev             # 开发模式
npm run build:watch     # 监听模式构建
npm run preview         # 预览构建结果
```

## 📦 发布到 Chrome Web Store

### 1. 准备工作

- 确保有 Chrome Web Store 开发者账号
- 准备扩展的宣传图片和描述
- 完成扩展的功能测试

### 2. 上传步骤

1. 访问 [Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole/)
2. 选择现有扩展或创建新扩展
3. 上传 `extension.zip` 文件
4. 填写扩展信息：
   - 详细描述
   - 屏幕截图
   - 分类和标签
   - 隐私政策（如需要）
5. 提交审核

### 3. 审核时间

- 首次提交：通常需要 1-3 个工作日
- 更新版本：通常需要几小时到 1 个工作日

## 🔍 发布检查清单

### 发布前检查
- [ ] 功能测试完成
- [ ] 代码审查通过
- [ ] 版本号已更新
- [ ] 更新日志已编写
- [ ] 构建无错误
- [ ] 扩展包大小合理

### 发布后检查
- [ ] GitHub Release 已创建
- [ ] 标签已推送
- [ ] Chrome Web Store 已更新
- [ ] 文档已更新
- [ ] 用户通知已发送（如需要）

## 🐛 常见问题

### Q: 版本号不一致怎么办？
A: 运行 `npm run sync-version` 同步版本号。

### Q: 构建失败怎么办？
A: 检查代码语法错误，运行 `npm run clean` 清理后重新构建。

### Q: 扩展包太大怎么办？
A: 检查是否包含了不必要的文件，确保 `.gitignore` 配置正确。

### Q: Chrome Web Store 审核被拒怎么办？
A: 仔细阅读拒绝原因，修复问题后重新提交。

## 📚 相关资源

- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store 政策](https://developer.chrome.com/docs/webstore/program-policies/)
- [语义化版本控制](https://semver.org/lang/zh-CN/)
- [项目构建文档](./BUILD.md)