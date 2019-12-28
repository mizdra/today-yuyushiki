# today-yuyushiki

Google Assistant に「OK Google, 今日のゆゆ式」と話しかけるとゆゆ式の 1 コマが印刷される IoT「今日のゆゆ式」の Webhook サーバです.

- 解説: [OK Google, 今日のゆゆ式 - mizdra's blog](https://www.mizdra.net/entry/2019/12/22/002822)

<center>

![アーキテクチャ図](static/architecture-figure.svg)

</center>

## Requirements

- [Node.js](https://nodejs.org)
- [yarn](https://yarnpkg.com)
- [adnanh/webhook](https://github.com/adnanh/webhook)
- `lp` コマンド
- ゆゆ式のコマ画像が格納されたディレクトリ
  - コマ画像のファイル名は「1 巻 9 ページ目 5 コマ目」なら `01-009-5.jpg` のようにしておくこと
- ESC/POS コマンドをサポートしていて, 紙幅 80mm のロール紙を印刷できるレシートプリンタ
- 紙幅 80 mm の感熱ロール紙

## Usage

```console
$ git clone https://github.com/mizdra/today-yuyushiki
$ cd today-yuyushiki
$ yarn install
$ yarn run build

$ # localhost に 8000 番ポートで Webhook サーバを立てる
$ PORT=8000 KOMA_DIR=path/to/koma_jpgs PRINTER=tm_l90 yarn run start
```

## How to dev

- `yarn run start`: Run for production
- `yarn run build`: Build for production
- `yarn run dev`: Run for development
- `yarn run check`: Try static-checking

## License

MIT
