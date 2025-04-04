import { GoogleGenerativeAI } from "@google/generative-ai";

// この関数が POST リクエストを処理します
 export async function onRequestPost(context) {
   try {
     // 1. 環境変数からAPIキーを取得
     //    Cloudflare Pagesのダッシュボードで `GEMINI_API_KEY` を設定します
     const apiKey = context.env.GEMINI_API_KEY;
     if (!apiKey) {
       return new Response(JSON.stringify({ error: 'APIキーが設定されていません。' }), {
         status: 500,
         headers: { 'Content-Type': 'application/json' },
       });
     }

     // 2. リクエストボディからプロンプトを取得
     let prompt;
     try {
       const requestData = await context.request.json();
       prompt = requestData.prompt;
     } catch (e) {
       return new Response(JSON.stringify({ error: 'リクエストボディの形式が正しくありません。' }), {
         status: 400,
         headers: { 'Content-Type': 'application/json' },
       });
     }


     if (!prompt) {
       return new Response(JSON.stringify({ error: 'プロンプトが指定されていません。' }), {
         status: 400,
         headers: { 'Content-Type': 'application/json' },
       });
     }

     // 3. Gemini APIクライアントを初期化
     const genAI = new GoogleGenerativeAI(apiKey);
     // 使用するモデルを指定 (例: gemini-1.5-flash)
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

     // 4. Gemini APIを呼び出してコンテンツを生成
     const result = await model.generateContent(prompt);
     const response = await result.response;
     const text = response.text();

     // 5. 結果をJSON形式でフロントエンドに返す
     return new Response(JSON.stringify({ text: text }), {
       headers: { 'Content-Type': 'application/json' },
     });

   } catch (error) {
     console.error("Functions Error:", error);
     // エラー発生時はエラーメッセージを返す
     return new Response(JSON.stringify({ error: 'コンテンツの生成中にエラーが発生しました。' }), {
       status: 500,
       headers: { 'Content-Type': 'application/json' },
     });
   }
 }

 // オプション: GETリクエストなど他のメソッドに対応する場合は、
 // export async function onRequestGet(context) { ... } のように関数を追加します。
 // この例ではPOSTのみ対応します。
 export async function onRequest(context) {
   // POST以外のメソッドを拒否
   if (context.request.method !== 'POST') {
     return new Response('許可されていないメソッドです', { status: 405 });
   }
   // POSTリクエストの場合はonRequestPostを呼び出す
   return await onRequestPost(context);
}