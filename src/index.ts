import { promises as fs } from 'fs';
import EscPosEncoder from 'esc-pos-encoder';
import { spawn } from 'child_process';
import { Canvas, loadImage } from 'canvas';
import { join } from 'path';
import parse from 'csv-parse/lib/sync';

// 紙幅 80mm で印刷する際の横方向の総ドット数
const MAX_WIDTH_DOTS = 576;

type KomaData = {
  koma_id: string;
  kanji: string;
  page: string;
  position: string;
  koma: string;
  chara_num: string;
  whos: string;
  eyes: string;
  face_direction: string;
  eyes_num: string;
  page_id: string;
  four_komas_id: string;
  tobirae_page: string;
  wasuu: string;
  grade: string;
  month: string;
  wasuu_page: string;
};

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

  const buffer = await fs.readFile('yonkoma2data/yuyu_data/yuyu_data.csv');
  const komaDataList: KomaData[] = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
  });
  const komaData = komaDataList.find((item) => {
    return `${item.koma_id}.jpg` === komaName;
  });
  if (komaData === undefined) {
    throw new Error(
      `${komaData} のアノテーションデータが見つかりませんでした.`,
    );
  }
  console.log(komaData);

  const komaScale = 0.39;
  const komaWidth = Math.ceil((komaImg.width * komaScale) / 8) * 8;
  const komaHeight = Math.ceil((komaImg.height * komaScale) / 8) * 8;

  const encoder = new EscPosEncoder();
  // prettier-ignore
  const result = encoder
    .initialize()
    .charcode('jis')
    .kanjiCodeSystem('sjis')
    .kanjiMode(true)
    .align('center').image(Canvas, komaImg, komaWidth, komaHeight, 'atkinson').newline()
    .align('center').jtext(`${komaData.kanji}巻 ${komaData.page}ページ, ${komaData.grade}年生${komaData.month.replace(/^0/, '')}の1コマです.`).newline()
    .newline()
    .newline()
    .newline()
    .align('right').jtext(`(c) 三上小又『ゆゆ式 第${komaData.kanji}巻』芳文社`).newline()
    .cut()
    .encode();

  const lp = spawn('lp', ['-d', process.env.PRINTER]);
  lp.stdin.write(result);
  lp.stdin.end();
  lp.stdout.pipe(process.stdout);
})().catch(console.error);
