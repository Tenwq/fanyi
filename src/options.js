document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const apiEndpointInput = document.getElementById('apiEndpoint');
  const modelNameInput = document.getElementById('modelName');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  /**
   * 从 Chrome 存储中加载 API Key、Endpoint 和模型名称，并填充到输入框中。
   */
  function loadSettings() {
    chrome.storage.sync.get(['apiKey', 'apiEndpoint', 'modelName'], (result) => {
      apiKeyInput.value = result.apiKey || '';
      apiEndpointInput.value = result.apiEndpoint || '';
      modelNameInput.value = result.modelName || 'gpt-3.5-turbo';
    });
  }

  /**
   * 保存用户输入的 API Key、Endpoint 和模型名称到 Chrome 存储中。
   * 并在保存成功后显示状态信息。
   */
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const apiEndpoint = apiEndpointInput.value;
    const modelName = modelNameInput.value || 'gpt-3.5-turbo';
    chrome.storage.sync.set({ 
      apiKey: apiKey, 
      apiEndpoint: apiEndpoint, 
      modelName: modelName 
    }, () => {
      statusDiv.textContent = '设置已保存！';
      setTimeout(() => { statusDiv.textContent = ''; }, 2000);
    });
  });

  loadSettings();
});