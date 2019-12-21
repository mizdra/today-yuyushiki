import EscPosEncoder from 'esc-pos-encoder';
import { Canvas } from 'canvas';
import { lp, randomKoma } from './util';

const 漢字のサイズ変更を有効化 = [0x1c, 0x21, 0b0001100]; // (FS !)
const 白黒反転を有効化 = [0x1d, 0x42, 1]; // (GS B)
const 白黒反転を解除 = [0x1d, 0x42, 0]; // (GS B)
const 文字サイズを4倍に = [0x1d, 0x21, 0b00110011]; // (GS !)
const 文字サイズを1倍に = [0x1d, 0x21, 0b00000000]; // (GS !)
const 右に少しずらす = [0x1b, 0x5c, 30, 0]; // (ESC \)

(async () => {
  if (process.env.KOMA_DIR === undefined) {
    throw new Error('環境変数 `KOMA_DIR` を指定して下さい.');
  }
  if (process.env.PRINTER === undefined) {
    throw new Error('環境変数 `PRINTER` を指定して下さい.');
  }

  // ランダムで1コマ選ぶ
  const koma = await randomKoma(process.env.KOMA_DIR);

  const encoder = new EscPosEncoder();
  // prettier-ignore
  const result = encoder
    .initialize()
    .charcode('jis')
    .kanjiCodeSystem('sjis')
    .kanjiMode(true)
    // 「今日のゆゆ式」ヘッダ
    .raw(漢字のサイズ変更を有効化)
    .raw(白黒反転を有効化)
    .raw(文字サイズを4倍に)
    .align('center').raw(右に少しずらす).jtext('　　今日のゆゆ式　　').newline()
    .raw(文字サイズを1倍に)
    .raw(白黒反転を解除)
    .newline()
    // コマ画像
    .align('center').raw(右に少しずらす).image(Canvas, koma.img, koma.width, koma.height, 'atkinson').newline()
    // コマの説明
    .align('center').raw(右に少しずらす).jtext(koma.description).newline()
    .newline()
    .newline()
    .newline()
    // コピーライト
    .align('right').jtext(`(c) 三上小又『ゆゆ式 第${koma.annotation.kanji}巻』芳文社`).newline()
    .cut()
    .encode();

  lp(process.env.PRINTER, result);

  process.stdout.write(
    JSON.stringify({
      fulfillmentText: koma.description,
      fulfillmentMessages: [
        {
          text: {
            text: [koma.description],
          },
        },
      ],
    }),
  );
})().catch(console.error);
