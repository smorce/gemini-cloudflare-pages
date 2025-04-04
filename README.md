# 🌟 gemini-cloudflare-pages 🌟
マジヤバイね〜💖 Cloudflare Pagesで動くGoogle GeminiのAPIを使った超イケてるマルチモーダルWebアプリだよ〜ん💅✨

## どんなかんじ？🤔
このアプリって超ベリーグッド✨なんだよね〜！Google Gemini APIでテキストも画像も両方バッチリ処理しちゃう優れモノ🎀 「神エクセル読み取る君」っていう名前で、エクセルとかの表を読み取ってHTMLとかに変換しちゃうんだよね〜マジ卍✌️

## 超ウケる機能たち💕
- 画像とテキストのプロンプト両方イケるし〜👍
- 色んなGeminiモデル使えちゃう（gemini-2.5-proとかgemini-2.0-flash-001とか）めっちゃ選べる〜🎯
- Temperature値とか最大トークン数とかも自分で決められちゃう🔥
- ファイルはドラッグ＆ドロップでラクラク〜♪簡単すぎ💫
- Cloudflare Pagesの超速グローバルCDNでマジ爆速配信⚡
- Cloudflare Functions使ってるからサーバーレスでめっちゃエコなの〜🌱

## 対応してる画像形式🖼️
- JPEG/JPG（定番だよね〜）📸
- PNG（透過もバッチリ）🎭
- WebP（軽くてGood）🚀
- HEIC/HEIF（iPhoneで撮った写真もOK〜）📱

## 使ってる技術とか🔧
- フロントエンド：HTML、CSS、JavaScript（バニラJSだけでシンプルに作ったの〜）💻
- バックエンド：Cloudflare Functions（サーバーレスで超簡単〜）☁️
- API：Google Gemini API (@google/genai)で最新AI使ってる〜🤖

## デプロイの仕方📲
1. Cloudflare Pagesにリポジトリを繋げるだけ〜超カンタン😉
2. 環境変数 `GEMINI_API_KEY` にGoogle AI StudioのAPIキー設定するだけ💯
3. ビルド設定なしでそのまま公開〜マジ楽チン🎶

## ローカルで開発する時は〜🏠
```bash
# 依存関係インストールしなきゃ〜
npm install

# ローカルでCloudflare Pagesのエミュレートするよ〜（wranglerが必要）
npx wrangler pages dev
```

## 環境変数とか🔐
- `GEMINI_API_KEY`：Google AI StudioのAPIキー（これないとダメだよ〜マストだよ〜）🔑

## ライセンス📜
このプロジェクトは、リポジトリにあるLICENSEファイルの通りだよ〜✨ 使うときは見てね〜😘
