/**
 * 快速修复脚本 - 自动诊断和修复常见的API配置问题
 * 使用方法：在浏览器控制台中运行此脚本
 */

(function() {
  'use strict';
  
  /**
   * 常见API配置模板
   */
  const API_CONFIGS = {
    openai: {
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      keyPattern: /^sk-[a-zA-Z0-9]{48}$/
    },
    zhipu: {
      name: '智谱AI',
      endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      models: ['glm-4', 'glm-3-turbo'],
      keyPattern: /^[a-zA-Z0-9]{32}\.[a-zA-Z0-9]{32}$/
    },
    qwen: {
      name: '阿里通义',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
      keyPattern: /^sk-[a-zA-Z0-9]{32}$/
    },
    baidu: {
      name: '百度千帆',
      endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
      models: ['ernie-bot-4', 'ernie-bot-turbo'],
      keyPattern: /^[a-zA-Z0-9]{24}\|[a-zA-Z0-9]{32}$/
    }
  };
  
  /**
   * 诊断当前配置
   * @returns {Promise<Object>} 诊断结果
   */
  async function diagnoseConfig() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve({ error: '无法访问Chrome存储API，请在插件环境中运行' });
        return;
      }
      
      chrome.storage.sync.get(['apiKey', 'apiEndpoint', 'modelName'], (result) => {
        const diagnosis = {
          apiKey: result.apiKey || '',
          apiEndpoint: result.apiEndpoint || '',
          modelName: result.modelName || '',
          issues: [],
          suggestions: []
        };
        
        // 检查API Key
        if (!diagnosis.apiKey) {
          diagnosis.issues.push('API Key未设置');
          diagnosis.suggestions.push('请在插件设置中填入有效的API Key');
        } else {
          // 尝试识别API Key类型
          let keyType = 'unknown';
          for (const [type, config] of Object.entries(API_CONFIGS)) {
            if (config.keyPattern.test(diagnosis.apiKey)) {
              keyType = type;
              break;
            }
          }
          diagnosis.keyType = keyType;
        }
        
        // 检查API Endpoint
        if (!diagnosis.apiEndpoint) {
          diagnosis.suggestions.push('API Endpoint未设置，将使用默认OpenAI地址');
        } else {
          try {
            new URL(diagnosis.apiEndpoint);
          } catch (e) {
            diagnosis.issues.push('API Endpoint格式错误');
            diagnosis.suggestions.push('请检查API Endpoint的URL格式');
          }
        }
        
        // 检查模型名称
        if (!diagnosis.modelName) {
          diagnosis.suggestions.push('模型名称未设置，将使用默认gpt-3.5-turbo');
        }
        
        resolve(diagnosis);
      });
    });
  }
  
  /**
   * 自动修复配置
   * @param {string} providerType - 服务商类型
   * @param {string} apiKey - API Key
   */
  function autoFix(providerType, apiKey) {
    if (!API_CONFIGS[providerType]) {
      console.error('不支持的服务商类型:', providerType);
      return;
    }
    
    const config = API_CONFIGS[providerType];
    const fixedConfig = {
      apiKey: apiKey,
      apiEndpoint: config.endpoint,
      modelName: config.models[0]
    };
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set(fixedConfig, () => {
        console.log(`✅ 已自动修复${config.name}配置:`);
        console.log('API Endpoint:', fixedConfig.apiEndpoint);
        console.log('模型名称:', fixedConfig.modelName);
        console.log('请重新测试翻译功能');
      });
    } else {
      console.log('建议的配置:');
      console.log(JSON.stringify(fixedConfig, null, 2));
    }
  }
  
  /**
   * 测试API连接
   * @param {Object} config - API配置
   * @returns {Promise<Object>} 测试结果
   */
  async function testConnection(config) {
    const { apiKey, apiEndpoint, modelName } = config;
    
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
            content: 'Test connection'
          }],
          max_tokens: 10
        })
      });
      
      if (response.ok) {
        return { success: true, message: 'API连接测试成功' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          status: response.status,
          statusText: response.statusText,
          error: errorData
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '网络连接失败',
        error: error.message
      };
    }
  }
  
  /**
   * 主要的快速修复函数
   */
  async function quickFix() {
    console.log('🔧 开始快速诊断...');
    
    const diagnosis = await diagnoseConfig();
    
    if (diagnosis.error) {
      console.error('❌', diagnosis.error);
      return;
    }
    
    console.log('📊 当前配置:');
    console.log('API Key:', diagnosis.apiKey ? `${diagnosis.apiKey.substring(0, 10)}...` : '未设置');
    console.log('API Endpoint:', diagnosis.apiEndpoint || '未设置');
    console.log('模型名称:', diagnosis.modelName || '未设置');
    
    if (diagnosis.keyType !== 'unknown') {
      console.log('🎯 检测到API Key类型:', API_CONFIGS[diagnosis.keyType].name);
    }
    
    if (diagnosis.issues.length > 0) {
      console.log('⚠️ 发现问题:');
      diagnosis.issues.forEach(issue => console.log('  •', issue));
    }
    
    if (diagnosis.suggestions.length > 0) {
      console.log('💡 建议:');
      diagnosis.suggestions.forEach(suggestion => console.log('  •', suggestion));
    }
    
    // 如果检测到API Key类型，提供自动修复选项
    if (diagnosis.keyType !== 'unknown' && diagnosis.apiKey) {
      console.log(`\n🚀 是否自动修复${API_CONFIGS[diagnosis.keyType].name}配置？`);
      console.log(`运行: quickFixAuto('${diagnosis.keyType}', '${diagnosis.apiKey}')`);
    }
    
    // 提供手动修复选项
    console.log('\n📝 手动修复选项:');
    Object.entries(API_CONFIGS).forEach(([type, config]) => {
      console.log(`${config.name}: quickFixAuto('${type}', 'YOUR_API_KEY')`);
    });
  }
  
  // 将函数暴露到全局作用域
  window.quickFix = quickFix;
  window.quickFixAuto = autoFix;
  window.testAPIConnection = testConnection;
  window.diagnoseAPIConfig = diagnoseConfig;
  
  // 自动运行诊断
  quickFix();
  
  console.log('\n🛠️ 快速修复工具已加载！');
  console.log('可用命令:');
  console.log('• quickFix() - 重新运行诊断');
  console.log('• quickFixAuto(type, apiKey) - 自动修复配置');
  console.log('• testAPIConnection(config) - 测试API连接');
  console.log('• diagnoseAPIConfig() - 获取详细诊断信息');
  
})();

/**
 * 使用说明:
 * 
 * 1. 在Chrome中打开插件的background页面控制台
 *    (chrome://extensions/ → 找到插件 → 点击"Service Worker")
 * 
 * 2. 复制并粘贴此脚本到控制台中运行
 * 
 * 3. 根据诊断结果选择相应的修复命令
 * 
 * 4. 常用修复命令示例:
 *    quickFixAuto('openai', 'sk-your-api-key-here')
 *    quickFixAuto('zhipu', 'your-zhipu-api-key')
 *    quickFixAuto('qwen', 'sk-your-qwen-api-key')
 * 
 * 5. 修复后重新测试翻译功能
 */