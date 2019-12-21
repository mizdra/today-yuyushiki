import { spawn } from 'child_process';
import { promises as fs, readFileSync } from 'fs';
import { loadImage } from 'canvas';
import { join } from 'path';
import parse from 'csv-parse/lib/sync';

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

const buffer = readFileSync('yonkoma2data/yuyu_data/yuyu_data.csv');
const komaDataList: KomaData[] = parse(buffer, {
  columns: true,
  skip_empty_lines: true,
});

// 区間 [0, max) の中の整数をランダムで返す
function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

export function lp(printer: string, binary: Uint8Array) {
  const lp = spawn('lp', ['-d', printer]);
  lp.stdin.write(binary);
  lp.stdin.end();
}

// ランダムで1コマ選んでそのファイル名を返す
export async function randomKoma(komaDir: string) {
  while (true) {
    const fileNames = await fs.readdir(komaDir);

    // .gitkeep や pad-shaved なコマ画像を除外
    const filteredFileNames = fileNames.filter((fileName) =>
      /\d\d-\d\d\d-\d.jpg/.test(fileName),
    );

    // ランダムで1コマ選ぶ
    const komaName = filteredFileNames[getRandomInt(filteredFileNames.length)];
    const komaImg = await loadImage(join(komaDir, komaName));
    const komaData = komaDataList.find(
      (item) => `${item.koma_id}.jpg` === komaName,
    );

    // コマに対応するアノテーションデータが見つからない場合は再抽選する
    // NOTE: 10巻のコマはアノテーションデータが無いので, 必ず再抽選になる
    if (komaData === undefined) {
      continue;
    }
    return { komaName, komaImg, komaData };
  }
}
