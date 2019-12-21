import EscPosEncoder from 'esc-pos-encoder';
import { Canvas } from 'canvas';
import { lp, randomKoma } from './util';

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
    .raw([0x1C, 0x21, 0b0001100]) // 漢字のサイズ変更を有効化 (FS !)
    .raw([0x1D, 0x42, 1]) // 白黒反転を有効化 (GS B)
    .raw([0x1D, 0x21, 0b00110011]) // 文字サイズを4倍に (GS !)
    .align('center').raw([0x1C, 0x21, 0b0001100]).jtext('　　今日のゆゆ式　　').newline()
    .raw([0x1D, 0x21, 0b00000000]) // 文字サイズを1倍に戻す (GS !)
    .raw([0x1D, 0x42, 0]) // 白黒反転を解除 (GS B)
    .newline()
    // コマ画像
    .align('center').image(Canvas, koma.img, koma.width, koma.height, 'atkinson').newline()
    // コマの説明
    .align('center').jtext(koma.description).newline()
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
