# 项目构建指南

## 项目结构

```
fanyi/
├── src/                    # 源代码目录
│   ├── popup.html         # 弹窗页面
│   ├── popup.css          # 弹窗样式
│   ├── popup.js           # 弹窗逻辑
│   ├── options.html       # 选项页面
│   ├── options.css        # 选项样式
│   ├── options.js         # 选项逻辑
│   ├── config-validator.html  # 配置验证页面
│   └── config-validator.js    # 配置验证逻辑
├── icons/                 # 图标文件
├── dist/                  # 构建输出目录
├── manifest.json          # 扩展清单文件
├── background.js          # 后台脚本
├── package.json           # npm配置
├── vite.config.js         # Vite构建配置
├── build.js               # 自定义构建脚本
└── extension.zip          # 打包后的扩展文件
```

## 构建命令

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 监听模式构建
```bash
npm run build:watch
```

### 打包扩展
```bash
npm run package
```

### 清理构建文件
```bash
npm run clean
```

## 构建流程说明

1. **Vite构建**: 使用Vite对src目录下的文件进行构建，支持ES模块、CSS处理等
2. **文件移动**: 将HTML文件从dist/src移动到dist根目录
3. **资源复制**: 复制manifest.json、图标、文档等必要文件到dist目录
4. **打包**: 将dist目录压缩为extension.zip，可直接上传到Chrome Web Store

## 技术栈

- **构建工具**: Vite 4.5.3
- **模块系统**: ES Modules
- **样式**: 原生CSS
- **脚本**: 原生JavaScript
- **目标平台**: Chrome Extension Manifest V3

## 开发注意事项

1. 所有HTML文件中的script标签必须包含`type="module"`属性
2. 使用ES模块语法进行模块导入导出
3. 构建后的文件会自动优化和压缩
4. 开发时修改src目录下的文件，构建时会自动处理依赖关系