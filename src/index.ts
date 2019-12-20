import { promises as fs } from 'fs';
import EscPosEncoder from 'esc-pos-encoder';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

(async () => {
  if (process.env.KOMA_DIR === undefined) {
    throw new Error('環境変数 `KOMA_DIR` を指定して下さい.');
  }

  const fileNames = await fs.readdir(process.env.KOMA_DIR);

  // .gitkeep や pad-shaved なコマ画像を除外
  const filteredFileNames = fileNames.filter((fileName) =>
    /\d\d-\d\d\d-\d.jpg/.test(fileName),
  );

  // ランダムで1コマ選ぶ
  const targetFileName =
    filteredFileNames[getRandomInt(filteredFileNames.length)];

  console.log(targetFileName);
})();
