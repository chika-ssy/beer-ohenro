これは[Next.js](https://nextjs.org)プロジェクトで、[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)を使用して初期化されています。

## 開始手順
まず、開発サーバーを実行します:

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで[http://localhost:3000](http://localhost:3000)を開いて結果を確認してください。
ページを編集するには、`app/page.tsx`を修正してください。ファイルを編集すると、ページが自動的に更新されます。

このプロジェクトでは、Vercel用の新しいフォントファミリーである[Geist](https://vercel.com/font)を自動的に最適化して読み込むために、[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)を使用しています。


## 環境変数
このプロジェクトでは、**Google Maps JavaScript API** を使用して地図上にブルワリーの位置を表示しています。

プロジェクトをローカルで実行するには、`frontend/` ディレクトリに `.env.local` ファイルを作成し、以下の内容を入力します:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=あなたのAPIキー
```

## さらに詳しく
Next.js について詳しく知りたい場合は、以下のリソースを参照してください:

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.js の機能と API について学びます。
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブな Next.js チュートリアル。

[Next.js GitHub リポジトリ](https://github.com/vercel/next.js) を確認してください - フィードバックや貢献は歓迎です！

## Vercel へのデプロイ
Next.js アプリをデプロイする最も簡単な方法は、Next.js の開発者が提供する [Vercel プラットフォーム](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) を使用することです。

詳細については、当社の[Next.js デプロイメント ドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)をご確認ください。

DeepL.com（無料版）で翻訳しました。