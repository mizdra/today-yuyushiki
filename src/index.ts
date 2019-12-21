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
  const { komaImg, komaData } = await randomKoma(process.env.KOMA_DIR);

  const komaScale = 0.39;
  const komaWidth = Math.ceil((komaImg.width * komaScale) / 8) * 8;
  const komaHeight = Math.ceil((komaImg.height * komaScale) / 8) * 8;

  const description = `${komaData.kanji}巻 ${komaData.page}ページ, ${
    komaData.grade
  }年生${komaData.month.replace(/^0/, '')}の1コマです.`;

  const encoder = new EscPosEncoder();
  // prettier-ignore
  const result = encoder
    .initialize()
    .charcode('jis')
    .kanjiCodeSystem('sjis')
    .kanjiMode(true)
    .align('center').image(Canvas, komaImg, komaWidth, komaHeight, 'atkinson').newline()
    .align('center').jtext(description).newline()
    .newline()
    .newline()
    .newline()
    .align('right').jtext(`(c) 三上小又『ゆゆ式 第${komaData.kanji}巻』芳文社`).newline()
    .cut()
    .encode();

  lp(process.env.PRINTER, result);

  process.stdout.write(
    JSON.stringify({
      fulfillmentText: description,
      fulfillmentMessages: [
        {
          text: {
            text: [description],
          },
        },
      ],
    }),
  );
})().catch(console.error);
