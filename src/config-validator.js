/**
 * API配置验证工具的JavaScript代码
 * 解决Chrome扩展CSP内联脚本限制问题
 */

/**
 * 预设配置模板
 */
const presets = {
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  },
  zhipu: {
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4'
  },
  qwen: {
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    model: 'qwen-turbo'
  },
  baidu: {
    endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
    model: 'ernie-bot-turbo'
  }
};

/**
 * 应用预设配置
 * @param {string} presetName - 预设配置名称
 */
function applyPreset(presetName) {
  const preset = presets[presetName];
  if (preset) {
    document.getElementById('apiEndpoint').value = preset.endpoint;
    document.getElementById('modelName').value = preset.model;
    showResult('已应用 ' + presetName.toUpperCase() + ' 配置模板\n请填入对应的API Key', 'info');
  }
}

/**
 * 加载当前插件配置
 */
function loadCurrentConfig() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get(['apiKey', 'apiEndpoint', 'modelName'], (result) => {
      document.getElementById('apiKey').value = result.apiKey || '';
      document.getElementById('apiEndpoint').value = result.apiEndpoint || '';
      document.getElementById('modelName').value = result.modelName || 'gpt-3.5-turbo';
      showResult('已加载当前插件配置', 'info');
    });
  } else {
    showResult('无法访问Chrome存储，请在插件环境中使用', 'error');
  }
}

/**
 * 验证API配置
 */
async function validateConfig() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const apiEndpoint = document.getElementById('apiEndpoint').value.trim();
  const modelName = document.getElementById('modelName').value.trim();
  
  let result = '🔍 配置验证结果:\n\n';
  let hasError = false;
  
  // 验证API Key
  if (!apiKey) {
    result += '❌ API Key: 未填写\n';
    hasError = true;
  } else if (apiKey.length < 10) {
    result += '⚠️ API Key: 长度可能不正确\n';
    hasError = true;
  } else {
    result += '✅ API Key: 格式正确\n';
  }
  
  // 验证API Endpoint
  if (!apiEndpoint) {
    result += '⚠️ API Endpoint: 未填写，将使用默认OpenAI地址\n';
  } else {
    try {
      new URL(apiEndpoint);
      result += '✅ API Endpoint: URL格式正确\n';
    } catch (e) {
      result += '❌ API Endpoint: URL格式错误\n';
      hasError = true;
    }
  }
  
  // 验证模型名称
  if (!modelName) {
    result += '⚠️ 模型名称: 未填写，将使用默认gpt-3.5-turbo\n';
  } else {
    result += '✅ 模型名称: ' + modelName + '\n';
  }
  
  // 网络连通性测试
  if (apiEndpoint && !hasError) {
    result += '\n🌐 测试网络连通性...\n';
    try {
      const testUrl = new URL(apiEndpoint).origin;
      const response = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      result += '✅ 网络连通性: 正常\n';
    } catch (e) {
      result += '⚠️ 网络连通性: 无法访问 (可能是CORS限制)\n';
    }
  }
  
  showResult(result, hasError ? 'error' : 'success');
}

/**
 * 测试翻译功能
 */
async function testTranslation() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const apiEndpoint = document.getElementById('apiEndpoint').value.trim() || 'https://api.openai.com/v1/chat/completions';
  const modelName = document.getElementById('modelName').value.trim() || 'gpt-3.5-turbo';
  
  if (!apiKey) {
    showResult('❌ 请先填入API Key', 'error');
    return;
  }
  
  showResult('🌐 正在测试翻译功能...', 'info');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{
          role: 'user',
          content: 'Translate the following text into Chinese: Hello, how are you?'
        }],
        temperature: 0.7,
        max_tokens: 100
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: '无法解析错误响应' } }));
      let errorMsg = `❌ 翻译测试失败:\n\n状态码: ${response.status} ${response.statusText}\n`;
      
      if (response.status === 404) {
        errorMsg += '\n可能原因:\n• API Endpoint地址错误\n• 模型名称不存在\n• 服务商地址已变更\n';
      } else if (response.status === 401) {
        errorMsg += '\n可能原因:\n• API Key无效或已过期\n• 权限不足\n• 账户余额不足\n';
      } else if (response.status === 429) {
        errorMsg += '\n可能原因:\n• 请求频率过高\n• 配额已用完\n';
      }
      
      errorMsg += `\n错误详情: ${JSON.stringify(errorData, null, 2)}`;
      showResult(errorMsg, 'error');
      return;
    }
    
    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim() || '无法获取翻译结果';
    
    const successMsg = `✅ 翻译测试成功!\n\n原文: Hello, how are you?\n译文: ${translatedText}\n\n配置信息:\n• API Endpoint: ${apiEndpoint}\n• 模型: ${modelName}\n• 响应时间: ${Date.now() - startTime}ms`;
    
    showResult(successMsg, 'success');
    
  } catch (error) {
    showResult(`❌ 网络错误: ${error.message}\n\n请检查:\n• 网络连接是否正常\n• API地址是否可访问\n• 是否存在防火墙限制`, 'error');
  }
}

/**
 * 显示结果信息
 * @param {string} message - 要显示的消息
 * @param {string} type - 消息类型 (success, error, info)
 */
function showResult(message, type) {
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = message;
  resultDiv.className = `result ${type}`;
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
  // 绑定按钮事件
  document.getElementById('validateBtn').addEventListener('click', validateConfig);
  document.getElementById('testBtn').addEventListener('click', testTranslation);
  document.getElementById('loadBtn').addEventListener('click', loadCurrentConfig);
  
  // 绑定预设配置项点击事件
  document.querySelectorAll('.preset-item').forEach(item => {
    item.addEventListener('click', () => {
      const presetName = item.getAttribute('data-preset');
      if (presetName) {
        applyPreset(presetName);
      }
    });
  });
}

// 页面加载时初始化事件监听器并加载当前配置
window.addEventListener('load', () => {
  initEventListeners();
  setTimeout(loadCurrentConfig, 500);
});