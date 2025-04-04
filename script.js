const promptInput = document.getElementById('promptInput');
const imageInput = document.getElementById('imageInput'); // 追加
const generateButton = document.getElementById('generateButton');
const resultOutput = document.getElementById('resultOutput');
const modelSelect = document.getElementById('modelSelect');
const temperatureInput = document.getElementById('temperatureInput');
const temperatureValue = document.getElementById('temperatureValue');
const maxTokensInput = document.getElementById('maxTokensInput');
const dropzone = document.getElementById('dropzone');
const filePreview = document.getElementById('filePreview');
const previewImage = document.getElementById('previewImage');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFile = document.getElementById('removeFile');

// Temperature値の表示を更新
temperatureInput.addEventListener('input', () => {
    temperatureValue.textContent = temperatureInput.value;
});

// ドラッグ＆ドロップ関連のイベントリスナー
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// ドラッグ状態のスタイル変更
['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
        dropzone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
        dropzone.classList.remove('dragover');
    }, false);
});

// ドロップ時の処理
dropzone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        imageInput.files = files;
        handleFileSelect();
    }
}

// 通常のファイル選択時の処理
imageInput.addEventListener('change', handleFileSelect, false);

function handleFileSelect() {
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        
        // ファイルタイプの検証
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
        if (!validTypes.includes(file.type)) {
            alert('対応していないファイル形式です。JPG、PNG、WebP、HEIC、HEIFのいずれかをアップロードしてください。');
            return;
        }
        
        // プレビュー表示
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            filePreview.style.display = 'flex';
            dropzone.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// ファイルサイズのフォーマット
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 削除ボタンのイベント
removeFile.addEventListener('click', () => {
    imageInput.value = '';
    filePreview.style.display = 'none';
    dropzone.style.display = 'block';
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