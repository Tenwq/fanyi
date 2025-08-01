# API配置指南

## 问题分析
你遇到的404错误 `"Not Found. Please check the configuration."` 表明API配置存在问题。这通常由以下原因导致：

1. **API Endpoint地址错误** - 最常见原因
2. **模型名称不存在** - 使用了不支持的模型
3. **服务商地址已变更** - API地址已更新
4. **API Key与服务商不匹配** - 使用了错误的服务商配置

## 🔧 快速解决工具

### 方法一：使用配置验证工具
1. 在插件设置页面点击 **"🔧 打开配置验证工具"**
2. 填入你的API配置信息
3. 点击 **"🔍 验证配置"** 检查配置是否正确
4. 点击 **"🌐 测试翻译"** 验证功能是否正常

### 方法二：使用快速修复脚本
1. 打开Chrome扩展管理页面 `chrome://extensions/`
2. 找到翻译插件，点击 **"Service Worker"**
3. 在控制台中粘贴并运行 `quick-fix.js` 脚本
4. 根据诊断结果选择相应的修复命令

以下是详细的配置说明：

## 主流服务商配置示例

### 1. OpenAI (推荐)
- **API Key**: 从 https://platform.openai.com/api-keys 获取
- **API Endpoint**: 留空（使用默认值）
- **格式**: 无需修改Endpoint

### 2. Azure OpenAI
- **API Key**: 从Azure门户获取
- **API Endpoint**: `https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/chat/completions?api-version=2023-05-15`
- **示例**: `https://myai.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-05-15`

### 3. 智谱AI (GLM)
- **API Key**: 从 https://open.bigmodel.cn/ 获取
- **API Endpoint**: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- **模型名称**: glm-4, glm-3-turbo 等

### 4. 百度千帆
- **API Key**: 格式为 `{API_KEY}|{SECRET_KEY}`
- **API Endpoint**: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions`
- **模型名称**: ernie-bot-4, ernie-bot-turbo 等

### 5. 阿里通义
- **API Key**: 从 https://dashscope.console.aliyun.com/ 获取
- **API Endpoint**: `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`
- **模型名称**: qwen-turbo, qwen-plus 等

## 故障排除步骤

1. **检查API Key是否有效**
   - 在设置页面确认已保存API Key
   - 确保Key格式正确，无多余空格

2. **验证Endpoint**
   - 在浏览器中直接访问Endpoint，看是否返回JSON响应
   - 对于OpenAI，访问 `https://api.openai.com/v1/models` 应该返回模型列表

3. **查看控制台日志**
   - 打开插件的background页面控制台查看详细错误
   - 路径：chrome://extensions → 找到插件 → 点击"背景页" → Console

4. **测试连接**
   ```bash
   # 使用curl测试OpenAI API
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        https://api.openai.com/v1/models
   ```

## 常见问题

### 404错误
- **原因**: Endpoint错误或模型不存在
- **解决**: 检查Endpoint拼写，确认模型名称

### 401错误
- **原因**: API Key无效或权限不足
- **解决**: 重新生成API Key，检查账户余额

### 429错误
- **原因**: 请求频率过高
- **解决**: 降低请求频率，升级套餐

### 500错误
- **原因**: 服务端内部错误
- **解决**: 稍后重试，联系服务商

## 配置验证

完成配置后，建议使用以下测试文本：
```
Hello, how are you?
```

预期中文翻译结果：
```
你好，你怎么样？
```