import { promises as fs } from 'fs';
import EscPosEncoder from 'esc-pos-encoder';
import { spawn } from 'child_process';
import { Canvas, loadImage } from 'canvas';
import { join } from 'path';

// 区間 [0, max) の中の整数をランダムで返す
function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

// ランダムで1コマ選んでそのファイル名を返す
async function randomKomaName(komaDir: string) {
  const fileNames = await fs.readdir(komaDir);

  // .gitkeep や pad-shaved なコマ画像を除外
  const filteredFileNames = fileNames.filter((fileName) =>
    /\d\d-\d\d\d-\d.jpg/.test(fileName),
  );

  // ランダムで1コマ選ぶ
  return filteredFileNames[getRandomInt(filteredFileNames.length)];
}

(async () => {
  if (process.env.KOMA_DIR === undefined) {
    throw new Error('環境変数 `KOMA_DIR` を指定して下さい.');
  }
  if (process.env.PRINTER === undefined) {
    throw new Error('環境変数 `PRINTER` を指定して下さい.');
  }

  // ランダムで1コマ選ぶ
  const komaName = await randomKomaName(process.env.KOMA_DIR);
  const komaImg = await loadImage(join(process.env.KOMA_DIR, komaName));
  console.log(`Printing: ${komaName}`);

  const komaScale = 0.4;
  console.log(komaImg.width, komaImg.height);
  const komaWidth = Math.ceil((komaImg.width * komaScale) / 8) * 8;
  const komaHeight = Math.ceil((komaImg.height * komaScale) / 8) * 8;

  const encoder = new EscPosEncoder();
  // prettier-ignore
  const result = encoder
    .initialize()
    .charcode('jis')
    .kanjiCodeSystem('sjis')
    .kanjiMode(true)
    .align('center').jtext('(c) 三上小又・芳文社').newline()
    .align('center').image(Canvas, komaImg, komaWidth, komaHeight, 'atkinson').newline()
    .cut()
    .encode();

  const lp = spawn('lp', ['-d', process.env.PRINTER]);
  lp.stdin.write(result);
  lp.stdin.end();
  lp.stdout.pipe(process.stdout);
})().catch(console.error);
