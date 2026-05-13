import { BODY_LIMIT } from './config.mjs';

export function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

export function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

export function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        reject(Object.assign(new Error('图片太大，当前上限约 28MB。'), { status: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(Object.assign(new Error('请求 JSON 无效。'), { status: 400 }));
      }
    });

    request.on('error', reject);
  });
}

export function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') {
    throw Object.assign(new Error('imageDataUrl is required.'), { status: 400 });
  }

  const match = dataUrl.match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/);
  if (!match) {
    throw Object.assign(new Error('只支持 PNG、JPEG 或 WebP 图片。'), { status: 400 });
  }

  const mime = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';

  if (buffer.length < 1024) {
    throw Object.assign(new Error('图片太小，Tripo 生成需要更清晰的参考图。'), { status: 400 });
  }

  return { mime, buffer, ext };
}

export function sanitizeFileName(fileName) {
  const baseName = String(fileName).split(/[\\/]/).pop() || '';
  return baseName.replace(/[^\w.\- ]+/g, '').replace(/^\.+/, '').trim() || 'animal-reference.png';
}
