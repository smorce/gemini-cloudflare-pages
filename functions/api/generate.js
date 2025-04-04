import { GoogleGenAI } from "@google/genai";

// ArrayBufferをBase64文字列に変換するヘルパー関数
// Cloudflare Workers環境では btoa が利用可能です
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// この関数が POST リクエストを処理します
export async function onRequestPost(context) {
  try {
    // --- 1. 環境変数からAPIキーを取得 ---
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Error: GEMINI_API_KEY environment variable not set.");
      return new Response(JSON.stringify({ error: 'APIキーが設定されていません。' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 2. multipart/form-data からプロンプトと画像を取得 ---
    let prompt;
    let imageFile;
    let mimeType;
    let imageBase64;

    try {
      const formData = await context.request.formData();
      prompt = formData.get('prompt'); // input name="prompt" の値
      imageFile = formData.get('image'); // input name="image" のファイル

      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        throw new Error('プロンプトが指定されていないか、形式が正しくありません。');
      }
      if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
        throw new Error('画像ファイルが指定されていないか、不正な形式です。');
      }

      // 画像をBase64に変換
      mimeType = imageFile.type; // ファイルのMIMEタイプを取得 (例: "image/png")
      if (!mimeType.startsWith('image/')) {
        throw new Error('アップロードされたファイルは画像ではありません。');
      }

      const imageBuffer = await imageFile.arrayBuffer();
      imageBase64 = arrayBufferToBase64(imageBuffer);

      console.log(`Received prompt: "${prompt}", image mimeType: ${mimeType}, size: ${imageFile.size} bytes`);

    } catch (e) {
      console.error("Form data parsing error:", e);
      return new Response(JSON.stringify({ error: `リクエストデータの解析に失敗しました: ${e.message}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 3. Gemini API クライアント初期化 & コンテンツ準備 ---
    const ai = new GoogleGenAI({ apiKey });

    // マルチモーダル対応モデルを選択
    // - gemini-1.5-flash-latest: 高速・低コスト・高性能 (推奨)
    // - gemini-1.5-pro-latest: より高性能だが、やや遅く高コスト
    // ※ "gemini-2.5-pro-exp-03-25" は実験的なモデルの可能性あり
    const modelName = "gemini-1.5-flash-latest";
    
    // 生成設定 (オプション)
    const generationConfig = {
      // temperature: 1.0, // 生成の多様性 (0.0-1.0)
      // maxOutputTokens: 8192, // 最大出力トークン数
      responseMimeType: "text/plain", // 応答形式をテキストに限定
    };

    // 画像データをインラインデータとして準備
    const inlineData = {
      mimeType: mimeType,
      data: imageBase64
    };

    // --- 4. Gemini API 呼び出し ---
    console.log(`Calling Gemini (${modelName}) API...`);
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: inlineData }
        ]
      }],
      generationConfig
    });

    // --- 5. 結果を処理して返す ---
    // レスポンスや候補が存在するかチェック
    if (!response) {
        console.error("Gemini API Error: Invalid response structure.", response);
        return new Response(JSON.stringify({ error: 'Gemini APIから無効な応答構造が返されました。' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // プロンプトフィードバックや候補の終了理由をチェック (セーフティなどによるブロック)
    if (response.promptFeedback?.blockReason) {
        console.warn(`Content blocked due to prompt feedback: ${response.promptFeedback.blockReason}`);
        return new Response(JSON.stringify({ error: `入力コンテンツがブロックされました: ${response.promptFeedback.blockReason}` }), {
          status: 400, // 不適切な入力とみなす場合は400 Bad Request
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // 生成されたテキストを取得
    let generatedText = '';
    try {
      generatedText = response.text();
    } catch (e) {
      console.error("Error extracting text from response:", e);
      
      // 候補から直接テキストを取得する代替方法
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          generatedText = candidate.content.parts[0].text || '';
        }
      }
      
      if (!generatedText) {
        return new Response(JSON.stringify({ error: 'Gemini APIからテキストを取得できませんでした。' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    console.log("Gemini response successfully processed.");

    // 結果をJSON形式でフロントエンドに返す
    return new Response(JSON.stringify({ text: generatedText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // 想定外のエラー処理
    console.error("Unhandled Functions Error:", error);
    // エラーオブジェクトの内容をログに出力するとデバッグに役立つ
    // console.error(error.stack);
    return new Response(JSON.stringify({ error: `サーバー内部エラーが発生しました: ${error.message || error}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 他のHTTPメソッド (GET, PUT, DELETEなど) を拒否するフォールバック関数
export async function onRequest(context) {
  // context.request.method でリクエストメソッドを取得
  if (context.request.method === 'POST') {
    // POSTリクエストの場合は onRequestPost を実行
    return await onRequestPost(context);
  }
  // POST以外は 405 Method Not Allowed を返す
  return new Response(`許可されていないメソッドです。許可されているのは POST のみです。 (Method: ${context.request.method})`, {
    status: 405,
    headers: {
      'Allow': 'POST', // 許可されているメソッドをヘッダーで示す
    },
  });
}