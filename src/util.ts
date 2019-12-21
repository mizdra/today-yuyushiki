import { spawn } from 'child_process';
import { promises as fs, readFileSync } from 'fs';
import { loadImage, Image } from 'canvas';
import { join } from 'path';
import parse from 'csv-parse/lib/sync';

type Koma = {
  path: string;
  annotation: KomaAnnotation;
  img: Image;
  description: string;
};

type KomaAnnotation = {
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
const komaAnnotations: KomaAnnotation[] = parse(buffer, {
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
export async function randomKoma(komaDir: string): Promise<Koma> {
  const basenames = await fs.readdir(komaDir);

  while (true) {
    // ランダムで1コマ選ぶ
    const basename = basenames[getRandomInt(basenames.length)];
    const path = join(komaDir, basename);
    const annotation = komaAnnotations.find(
      (item) => `${item.koma_id}.jpg` === basename,
    );

    // コマに対応するアノテーションデータが見つからない場合は再抽選する
    // NOTE: 10巻のコマはアノテーションデータが無いので, 必ず再抽選になる
    // NOTE: .gitkeep や pad-shaved なコマ画像もここで再抽選になる
    if (annotation === undefined) {
      continue;
    }

    const img = await loadImage(path);
    const description = `${annotation.kanji}巻 ${annotation.page}ページ, ${
      annotation.grade
    }年生${annotation.month.replace(/^0/, '')}の1コマです.`;
    return { path, annotation, img, description };
  }
}
