export type Write = (height: number, base64String: string) => string;
export type WriteScore = (height: number, score: number, shirt: number, pant: number) => string;
export type Writer = {write: Write; writeScore: WriteScore};

export const playerColors = [
  '#FFFFFF',
  '#be9558',
  '#b8b8ed',
  '#8f8f24',
  '#ab0505',
  '#d0ab24',
  '#ffa287',
  '#ffbe9c',
  '#c38fa2',
  '#e2c3ab',
  '#80a28f',
  '#f8d624',
  '#8080ff',
  '#8080ff',
  '#8080ff',
];

export const createWriter = (): Promise<Writer> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('CANVAS') as HTMLCanvasElement;
  
    const charmap = new Image();
    charmap.onload = function () {
      resolve({
        writeScore: writeScore(canvas, charmap),
        write: write(canvas, charmap),
      });
    };
    charmap.onerror = reject;
    charmap.src = '/static/img/charset.png';
  });
};

const writeToCanvas = (
  charmap: HTMLImageElement,
  ctx: CanvasRenderingContext2D,
  height: number,
  stringToWrite: string,
) => {
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, 300, 300);
  // Characters across
  const hCh = 16;
  // Characters vertical
  const vCh = 16;

  const heightOfChars = height || 16;

  const origCharPxWidth = charmap.width / hCh;
  const origCharPxHeight = charmap.height / vCh;

  const scale = heightOfChars / origCharPxHeight;

  const hPx = heightOfChars;
  const wPx = scale * origCharPxWidth;

  const nameLength = stringToWrite.length;

  for (let i = 0; i < nameLength; i++) {
    const nameChar = stringToWrite.charCodeAt(i);

    const vCharOffset = nameChar >> 4; // eslint-disable-line
    const hCharOffset = nameChar & 0x0f; // eslint-disable-line

    //ctx.drawImage(charmap, sx, sy, sw, sh, dx, dy, dw, dh)
    ctx.drawImage(
      charmap,
      hCharOffset * origCharPxWidth,
      vCharOffset * origCharPxHeight,
      origCharPxWidth,
      origCharPxHeight,
      i * wPx,
      0,
      wPx,
      hPx,
    );
  }

  return {
    width: nameLength * wPx,
    height,
  };
};

const writeScore = (canvas: HTMLCanvasElement, charmap: HTMLImageElement) => (
  height: number,
  score: number,
  shirt: number,
  pant: number,
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }
  const width = 60;

  ctx.canvas.width = width;
  ctx.canvas.height = height;

  const halfHeight = height / 2;
  ctx.fillStyle = playerColors[shirt];
  ctx.fillRect(0, 0, width, halfHeight);
  ctx.fillStyle = playerColors[pant];
  ctx.fillRect(0, halfHeight, width, halfHeight);
  const strScore = score.toString();

  ctx.translate(width - strScore.length * height - 5, 0);
  writeToCanvas(charmap, ctx, height, strScore);
  ctx.restore();

  return canvas.toDataURL('image/png');
};

const write = (canvas: HTMLCanvasElement, charmap: HTMLImageElement) => (height: number, base64String: string) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  const strToWrite = atob(base64String) || ' ';

  ctx.canvas.width = strToWrite.length * height;
  ctx.canvas.height = height;

  writeToCanvas(charmap, ctx, height, strToWrite);

  return canvas.toDataURL('image/png');
  //Make background transparent
  //$chars->paintTransparentImage($chars->getImagePixelColor(0,0),0.0,0);
};
