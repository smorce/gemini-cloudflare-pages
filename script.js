const promptInput = document.getElementById('promptInput');
const imageInput = document.getElementById('imageInput'); // 追加
const generateButton = document.getElementById('generateButton');
const resultOutput = document.getElementById('resultOutput');
const modelSelect = document.getElementById('modelSelect');
const temperatureInput = document.getElementById('temperatureInput');
const temperatureValue = document.getElementById('temperatureValue');
const maxTokensInput = document.getElementById('maxTokensInput');

// Temperature値の表示を更新
temperatureInput.addEventListener('input', () => {
    temperatureValue.textContent = temperatureInput.value;
});

generateButton.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    const imageFile = imageInput.files[0]; // 選択されたファイルを取得
    const selectedModel = modelSelect.value; // 選択されたモデル
    const temperature = parseFloat(temperatureInput.value); // Temperature値
    const maxOutputTokens = parseInt(maxTokensInput.value); // 最大トークン数

    if (!prompt) {
        resultOutput.textContent = 'プロンプトを入力してください。';
        return;
    }
    if (!imageFile) { // ファイル選択チェックを追加
        resultOutput.textContent = '画像ファイルを選択してください。';
        return;
    }

    // ボタンを無効化し、ローディング表示
    generateButton.disabled = true;
    resultOutput.textContent = '生成中です... (画像処理には時間がかかることがあります)';

    // FormDataオブジェクトを作成してデータを追加
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('image', imageFile); // ファイルをそのまま追加
    formData.append('model', selectedModel); // モデル選択
    formData.append('temperature', temperature); // Temperature
    formData.append('maxOutputTokens', maxOutputTokens); // 最大トークン数

    try {
        // Cloudflare Functionsのエンドポイントを呼び出す
        // multipart/form-data で送信する場合、Content-Typeヘッダーは
        // fetchが自動的に設定するため、手動で設定しないこと！
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData, // FormDataオブジェクトをbodyに設定
            // headers: { 'Content-Type': 'multipart/form-data' } // これは不要！
        });

        // レスポンスのステータスコードを確認
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `サーバーエラー: ${response.status}` })); // JSON解析失敗時のフォールバック
            throw new Error(errorData.error || `サーバーエラー: ${response.status}`);
        }

        const data = await response.json();
        resultOutput.textContent = data.text; // 結果を表示

    } catch (error) {
        console.error('エラー:', error);
        resultOutput.textContent = `エラーが発生しました: ${error.message}`;
    } finally {
        // ボタンを再度有効化
        generateButton.disabled = false;
    }
});