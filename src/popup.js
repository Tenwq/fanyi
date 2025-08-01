document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const translateButton = document.getElementById('translateButton');
  const translationResult = document.getElementById('translationResult');

  /**
   * 处理翻译请求。
   * 当用户点击翻译按钮时，获取输入文本，并向后台服务发送翻译请求。
   * 根据翻译结果更新界面，同时显示loading状态。
   */
  translateButton.addEventListener('click', async () => {
    const text = inputText.value;
    if (!text) {
      translationResult.textContent = '请输入要翻译的内容。';
      return;
    }

    // 开始loading状态
    translateButton.classList.add('loading');
    translationResult.textContent = '翻译中...';

    try {
      const response = await chrome.runtime.sendMessage({ action: 'translate', text });
      if (response.error) {
        translationResult.textContent = `翻译失败: ${response.error}`;
      } else {
        translationResult.textContent = response.translatedText;
      }
    } catch (error) {
      translationResult.textContent = `请求失败: ${error.message}`;
      console.error('翻译请求失败:', error);
    } finally {
      // 结束loading状态
      translateButton.classList.remove('loading');
    }
  });
});