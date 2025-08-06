/**
 * 监听来自前端（popup.js）的消息。
 * 当接收到 'translate' 动作时，执行翻译逻辑。
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    translateText(request.text, request.sourceLanguage, request.targetLanguage)
      .then(translatedText => sendResponse({ translatedText }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // 表示异步响应
  }
});

/**
 * 语言代码映射表
 */
const LANGUAGE_NAMES = {
  'zh': '中文',
  'en': '英文',
  'ja': '日语',
  'auto': '自动检测'
};

/**
 * 生成翻译提示词
 * @param {string} text - 要翻译的文本
 * @param {string} sourceLanguage - 源语言代码
 * @param {string} targetLanguage - 目标语言代码
 * @returns {string} 翻译提示词
 */
function generateTranslationPrompt(text, sourceLanguage, targetLanguage) {
  const sourceLangName = LANGUAGE_NAMES[sourceLanguage] || sourceLanguage;
  const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
  
  let prompt = '';
  
  if (sourceLanguage === 'auto') {
    prompt = `请将以下文本翻译成${targetLangName}，保持原文的语气和风格：\n\n${text}`;
  } else {
    prompt = `请将以下${sourceLangName}文本翻译成${targetLangName}，保持原文的语气和风格：\n\n${text}`;
  }
  
  // 添加翻译质量要求
  prompt += '\n\n翻译要求：';
  prompt += '\n1. 保持原文的意思和语气';
  prompt += '\n2. 使用自然流畅的表达';
  prompt += '\n3. 如果是专业术语，请保持准确性';
  prompt += '\n4. 只返回翻译结果，不要包含其他解释';
  
  return prompt;
}

/**
 * 调用大模型 API 进行文本翻译。
 * @param {string} text - 需要翻译的文本
 * @param {string} sourceLanguage - 源语言代码
 * @param {string} targetLanguage - 目标语言代码
 * @returns {Promise<string>} - 翻译后的文本
 */
async function translateText(text, sourceLanguage = 'auto', targetLanguage = 'zh') {
  return new Promise(async (resolve, reject) => {
    const defaultEndpoint = 'https://api.openai.com/v1/chat/completions'; // 默认 OpenAI 兼容 API

    chrome.storage.sync.get(['apiKey', 'apiEndpoint', 'modelName'], async (result) => {
      const apiKey = result.apiKey;
      const apiEndpoint = result.apiEndpoint || defaultEndpoint;
      const modelName = result.modelName || 'gpt-3.5-turbo';

      if (!apiKey) {
        return reject(new Error('API Key 未设置，请在插件设置中配置。'));
      }

      try {
        console.log('正在请求API:', apiEndpoint);
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
              content: generateTranslationPrompt(text, sourceLanguage, targetLanguage)
            }],
            temperature: 0.7
          })
        });

        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData?.error?.message || JSON.stringify(errorData);
          } catch (parseError) {
            errorMessage = await response.text();
          }
          
          // 提供更有针对性的错误信息
          let detailedMessage = `API 请求失败: ${response.status} ${response.statusText}`;
          if (response.status === 404) {
            detailedMessage += '\n\n可能原因：';
            detailedMessage += '\n1. API Endpoint配置错误';
            detailedMessage += '\n2. 模型名称不存在';
            detailedMessage += '\n3. 服务商地址已变更';
            detailedMessage += '\n\n解决方案：';
            detailedMessage += '\n1. 检查插件设置中的API Endpoint';
            detailedMessage += '\n2. 查看项目根目录的API配置指南.md';
          } else if (response.status === 401) {
            detailedMessage += '\n\n可能原因：';
            detailedMessage += '\n1. API Key无效或已过期';
            detailedMessage += '\n2. 账户余额不足';
            detailedMessage += '\n3. 权限不足';
          } else if (response.status === 429) {
            detailedMessage += '\n\n可能原因：请求频率过高，请稍后重试';
          }
          
          throw new Error(`${detailedMessage}\n\n错误详情: ${errorMessage}`);
        }

        const data = await response.json();
        const translatedText = data.choices[0].message.content.trim();
        resolve(translatedText);
      } catch (error) {
        console.error('翻译过程中发生错误:', error);
        reject(new Error(`翻译服务出错: ${error.message}`));
      }
    });
  });
}