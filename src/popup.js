import { detectLanguage, getLanguageName, getSupportedLanguages } from './language-detector.js';

document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const translateButton = document.getElementById('translateButton');
  const translationResult = document.getElementById('translationResult');
  const sourceLanguageSelect = document.getElementById('sourceLanguage');
  const targetLanguageSelect = document.getElementById('targetLanguage');
  const swapLanguagesButton = document.getElementById('swapLanguages');
  const detectedLanguageDiv = document.getElementById('detectedLanguage');

  let currentDetectedLanguage = 'auto';

  /**
   * 初始化语言选择器
   * 设置默认值并加载用户偏好设置
   */
  function initializeLanguageSelectors() {
    // 从存储中加载用户偏好
    chrome.storage.sync.get(['sourceLanguage', 'targetLanguage'], (result) => {
      sourceLanguageSelect.value = result.sourceLanguage || 'auto';
      targetLanguageSelect.value = result.targetLanguage || 'en';
    });
  }

  /**
   * 保存语言选择偏好
   */
  function saveLanguagePreferences() {
    chrome.storage.sync.set({
      sourceLanguage: sourceLanguageSelect.value,
      targetLanguage: targetLanguageSelect.value
    });
  }

  /**
   * 检测输入文本的语言
   * @param {string} text - 输入文本
   */
  function detectInputLanguage(text) {
    if (!text || text.trim().length === 0) {
      detectedLanguageDiv.classList.remove('show');
      return;
    }

    const detected = detectLanguage(text);
    currentDetectedLanguage = detected;

    if (detected !== 'auto' && sourceLanguageSelect.value === 'auto') {
      const languageName = getLanguageName(detected);
      detectedLanguageDiv.textContent = `检测到语言: ${languageName}`;
      detectedLanguageDiv.classList.add('show');
    } else {
      detectedLanguageDiv.classList.remove('show');
    }
  }

  /**
   * 交换源语言和目标语言
   */
  function swapLanguages() {
    const sourceValue = sourceLanguageSelect.value;
    const targetValue = targetLanguageSelect.value;

    // 如果源语言是自动检测，使用检测到的语言
    if (sourceValue === 'auto') {
      if (currentDetectedLanguage !== 'auto') {
        sourceLanguageSelect.value = currentDetectedLanguage;
      } else {
        // 如果没有检测到语言，不进行交换
        return;
      }
    } else {
      sourceLanguageSelect.value = targetValue;
    }

    targetLanguageSelect.value = sourceValue === 'auto' ? currentDetectedLanguage : sourceValue;
    saveLanguagePreferences();
  }

  /**
   * 处理翻译请求
   * 当用户点击翻译按钮时，获取输入文本和语言设置，并向后台服务发送翻译请求
   */
  async function handleTranslation() {
    const text = inputText.value;
    if (!text) {
      translationResult.textContent = '请输入要翻译的内容。';
      return;
    }

    const sourceLanguage = sourceLanguageSelect.value;
    const targetLanguage = targetLanguageSelect.value;

    // 确定实际的源语言
    let actualSourceLanguage = sourceLanguage;
    if (sourceLanguage === 'auto') {
      actualSourceLanguage = currentDetectedLanguage !== 'auto' ? currentDetectedLanguage : 'auto';
    }

    // 检查是否源语言和目标语言相同
    if (actualSourceLanguage === targetLanguage && actualSourceLanguage !== 'auto') {
      translationResult.textContent = '源语言和目标语言相同，无需翻译。';
      return;
    }

    // 开始loading状态
    translateButton.classList.add('loading');
    translationResult.textContent = '翻译中...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'translate',
        text,
        sourceLanguage: actualSourceLanguage,
        targetLanguage
      });

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
  }

  // 初始化
  initializeLanguageSelectors();

  // 事件监听器
  translateButton.addEventListener('click', handleTranslation);

  // 输入文本变化时检测语言
  inputText.addEventListener('input', (e) => {
    detectInputLanguage(e.target.value);
  });

  // 语言选择变化时保存偏好
  sourceLanguageSelect.addEventListener('change', () => {
    saveLanguagePreferences();
    // 重新检测语言显示
    if (sourceLanguageSelect.value === 'auto') {
      detectInputLanguage(inputText.value);
    } else {
      detectedLanguageDiv.classList.remove('show');
    }
  });

  targetLanguageSelect.addEventListener('change', saveLanguagePreferences);

  // 交换语言按钮
  swapLanguagesButton.addEventListener('click', swapLanguages);

  // 回车键翻译
  inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleTranslation();
    }
  });
});