/**
 * 语言检测工具模块
 * 提供自动检测文本语言和语言相关的工具函数
 */

/**
 * 支持的语言配置
 */
export const SUPPORTED_LANGUAGES = {
  'zh': {
    name: '中文',
    code: 'zh',
    patterns: [
      /[\u4e00-\u9fff]/,  // 中文字符
      /[\u3400-\u4dbf]/,  // 扩展A
      /[\u20000-\u2a6df]/ // 扩展B
    ]
  },
  'en': {
    name: 'English',
    code: 'en',
    patterns: [
      /^[a-zA-Z\s.,!?;:"'()\-]+$/,  // 英文字符和标点
      /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/i  // 常见英文单词
    ]
  },
  'ja': {
    name: '日本語',
    code: 'ja',
    patterns: [
      /[\u3040-\u309f]/,  // 平假名
      /[\u30a0-\u30ff]/,  // 片假名
      /[\u4e00-\u9faf]/   // 汉字（在日语中使用）
    ]
  }
};

/**
 * 自动检测文本语言
 * @param {string} text - 要检测的文本
 * @returns {string} 检测到的语言代码
 */
export function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return 'auto';
  }

  const cleanText = text.trim();
  const scores = {};

  // 为每种语言计算匹配分数
  Object.entries(SUPPORTED_LANGUAGES).forEach(([code, config]) => {
    scores[code] = calculateLanguageScore(cleanText, config.patterns);
  });

  // 找到得分最高的语言
  const detectedLanguage = Object.entries(scores).reduce((max, [code, score]) => {
    return score > max.score ? { code, score } : max;
  }, { code: 'auto', score: 0 });

  // 如果得分太低，返回自动检测
  return detectedLanguage.score > 0.3 ? detectedLanguage.code : 'auto';
}

/**
 * 计算文本与语言模式的匹配分数
 * @param {string} text - 文本内容
 * @param {RegExp[]} patterns - 语言模式数组
 * @returns {number} 匹配分数 (0-1)
 */
function calculateLanguageScore(text, patterns) {
  let totalMatches = 0;
  let totalChecks = 0;

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      totalMatches += matches.length;
    }
    totalChecks++;
  });

  // 特殊处理：检查字符类型分布
  const charTypeScore = calculateCharTypeScore(text);
  
  return Math.min(1, (totalMatches / Math.max(1, text.length)) + charTypeScore);
}

/**
 * 基于字符类型计算分数
 * @param {string} text - 文本内容
 * @returns {number} 字符类型分数
 */
function calculateCharTypeScore(text) {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const japaneseChars = (text.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
  
  const totalChars = text.length;
  
  if (chineseChars / totalChars > 0.3) return 0.8;
  if (englishChars / totalChars > 0.7) return 0.8;
  if (japaneseChars / totalChars > 0.3) return 0.8;
  
  return 0.1;
}

/**
 * 获取语言的显示名称
 * @param {string} languageCode - 语言代码
 * @returns {string} 语言显示名称
 */
export function getLanguageName(languageCode) {
  return SUPPORTED_LANGUAGES[languageCode]?.name || '自动检测';
}

/**
 * 获取所有支持的语言列表
 * @returns {Array} 语言列表
 */
export function getSupportedLanguages() {
  return Object.entries(SUPPORTED_LANGUAGES).map(([code, config]) => ({
    code,
    name: config.name
  }));
}

/**
 * 验证语言代码是否支持
 * @param {string} languageCode - 语言代码
 * @returns {boolean} 是否支持
 */
export function isLanguageSupported(languageCode) {
  return languageCode === 'auto' || Object.hasOwnProperty.call(SUPPORTED_LANGUAGES, languageCode);
}