# today-yuyushiki

今日のゆゆ式

## Requirements

- [Node.js](https://nodejs.org)
- [yarn](https://yarnpkg.com)
- [adnanh/webhook](https://github.com/adnanh/webhook)
- `lp` command
- ゆゆ式のコマ画像が格納されたディレクトリ
  - コマ画像のファイル名は「1 巻 9 ページ目 5 コマ目」なら `01-009-5.jpg` のようにしておくこと

## Usage

```console
$ git clone https://github.com/mizdra/today-yuyushiki
$ cd today-yuyushiki
$ yarn install
$ yarn run build

$ # start webhook server
$ PORT=8000 KOMA_DIR=path/to/koma_jpgs PRINTER=tm_l90 yarn run start
```

## How to dev

- `yarn run start`: Run for production
- `yarn run build`: Build for production
- `yarn run dev`: Run for development
- `yarn run check`: Try static-checking

## License

MIT
