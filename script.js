const promptInput = document.getElementById('promptInput');
const generateButton = document.getElementById('generateButton');
const resultOutput = document.getElementById('resultOutput');

generateButton.addEventListener('click', async () => {
     const prompt = promptInput.value.trim();
     if (!prompt) {
         resultOutput.textContent = 'プロンプトを入力してください。';
         return;
     }

     // ボタンを無効化し、ローディング表示
     generateButton.disabled = true;
     resultOutput.textContent = '生成中です...';

     try {
         // Cloudflare Functionsのエンドポイントを呼び出す
         // '/api/generate' は後で作成するFunctionsのパス
         const response = await fetch('/api/generate', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ prompt: prompt }), // プロンプトをJSONで送信
         });

         if (!response.ok) {
             const errorData = await response.json();
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