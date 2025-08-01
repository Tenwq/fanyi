/**
 * 监听来自前端（popup.js）的消息。
 * 当接收到 'translate' 动作时，执行翻译逻辑。
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    translateText(request.text)
      .then(translatedText => sendResponse({ translatedText }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // 表示异步响应
  }
});

/**
 * 调用大模型 API 进行文本翻译。
 * @param {string} text - 需要翻译的文本。
 * @returns {Promise<string>} - 翻译后的文本。
 */
async function translateText(text) {
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
              content: `Translate the following text into Chinese: ${text}`
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