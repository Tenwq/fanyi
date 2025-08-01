/**
 * 测试配置文件 - 用于验证API配置
 * 在插件的options页面打开控制台，运行以下代码来测试配置
 */

// 测试配置是否正确保存
function testConfig() {
  chrome.storage.sync.get(['apiKey', 'apiEndpoint'], (result) => {
    console.log('当前配置:');
    console.log('API Key:', result.apiKey ? '已设置' : '未设置');
    console.log('API Endpoint:', result.apiEndpoint || '使用默认值');
    
    if (!result.apiKey) {
      console.warn('警告: API Key未设置，请先设置API Key');
      return;
    }
    
    // 测试一个简单的翻译请求
    console.log('正在测试API连接...');
    const testText = "Hello world";
    
    fetch(result.apiEndpoint || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Translate to Chinese: ${testText}`
        }],
        temperature: 0.7
      })
    })
    .then(response => {
      console.log('响应状态:', response.status);
      if (!response.ok) {
        return response.json().then(errorData => {
          console.error('错误详情:', errorData);
          throw new Error(`HTTP ${response.status}: ${errorData?.error?.message || JSON.stringify(errorData)}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('测试成功！翻译结果:', data.choices[0]?.message?.content);
    })
    .catch(error => {
      console.error('测试失败:', error.message);
    });
  });
}

// 使用方法：在options页面控制台中运行 testConfig()