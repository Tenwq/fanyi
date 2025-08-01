# 浏览器翻译插件

一个基于大模型API的浏览器翻译插件，支持多种AI提供商的翻译服务。

## 功能特点

- ✅ 支持多种大模型API（OpenAI、智谱AI、百度千帆、阿里通义等）
- ✅ 简洁的弹窗界面设计
- ✅ 可配置的API密钥、端点和模型
- ✅ 支持中英文互译
- ✅ 跨平台支持（Chrome、Edge、Firefox等基于Chromium的浏览器）

## 安装使用

### 1. 下载扩展

将本项目下载到本地文件夹。

### 2. 加载扩展

**Chrome浏览器：**
1. 打开 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目文件夹

**Edge浏览器：**
1. 打开 `edge://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目文件夹

### 3. 配置API

**首次使用必须配置API：**

1. 点击浏览器工具栏中的插件图标
2. 选择"选项"或"设置"
3. 在"API Key"输入框中填入你的API密钥
4. 在"API Endpoint"输入框中填入对应的API地址（可选，默认为OpenAI）
5. 在"模型名称"输入框中填入你要使用的模型名称（可选，默认为gpt-3.5-turbo）
6. 点击"保存设置"

### 4. 开始翻译

1. 点击浏览器工具栏中的插件图标
2. 在输入框中输入要翻译的文本
3. 点击"翻译"按钮
4. 查看翻译结果

## 支持的API提供商

### OpenAI
- **API Key**: 从 https://platform.openai.com/api-keys 获取
- **API Endpoint**: `https://api.openai.com/v1/chat/completions`
- **模型名称**: `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo` 等

### 智谱AI (Zhipu AI)
- **API Key**: 从 https://open.bigmodel.cn/ 获取
- **API Endpoint**: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- **模型名称**: `glm-4`, `glm-3-turbo` 等

### 百度千帆
- **API Key**: 格式为 `{API_KEY}|{SECRET_KEY}`
- **API Endpoint**: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions`
- **模型名称**: `ernie-bot-4`, `ernie-bot-turbo` 等

### 阿里通义
- **API Key**: 从 https://dashscope.console.aliyun.com/ 获取
- **API Endpoint**: `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`
- **模型名称**: `qwen-turbo`, `qwen-plus` 等

## 故障排除

### 常见问题

1. **翻译失败，显示404错误**
   - 检查API Endpoint是否正确
   - 确认API服务商是否支持该端点

2. **翻译失败，显示401错误**
   - 检查API Key是否正确
   - 确认API Key是否有效且未过期

3. **翻译失败，显示429错误**
   - API请求频率过高，请稍后再试
   - 检查API账户是否有足够额度

4. **中文显示乱码**
   - 重新加载扩展程序
   - 检查浏览器编码设置

### 调试步骤

1. 打开扩展管理页面
2. 找到本插件，点击"背景页"或"Service Worker"
3. 查看控制台输出的错误信息
4. 根据错误信息进行相应调整

## 开发说明

### 项目结构

```
├── manifest.json          # 插件配置文件
├── popup.html            # 弹窗页面
├── popup.js              # 弹窗逻辑
├── popup.css             # 弹窗样式
├── options.html          # 设置页面
├── options.js            # 设置逻辑
├── options.css           # 设置样式
├── background.js         # 后台服务
├── icons/                # 图标文件夹
└── API配置指南.md        # 详细配置说明
```

### 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **浏览器API**: Chrome Extension API
- **API**: RESTful API (OpenAI兼容格式)

## 更新日志

### v1.1.0
- 新增模型名称配置功能
- 优化错误提示信息
- 完善API配置指南

### v1.0.0
- 基础翻译功能
- 支持多种API提供商
- 简洁的用户界面

## 许可证

MIT License - 详见LICENSE文件

## 贡献

欢迎提交Issue和Pull Request来改进这个插件！