import http from 'node:http';
import { API_HOST, API_PORT, TRIPO_API_KEY } from './server/config.mjs';
import { readJsonBody, sendJson, setCorsHeaders } from './server/http-utils.mjs';
import { proxyModel, serveLocalModel } from './server/model-store.mjs';
import { createTripoTask, getTripoHealth, getTripoTask } from './server/providers/tripo.mjs';

const server = http.createServer(async (request, response) => {
  try {
    setCorsHeaders(response);

    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === 'GET' && url.pathname === '/api/3d/health') {
      sendJson(response, 200, {
        ok: true,
        providers: {
          tripo: getTripoHealth(),
        },
      });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/3d/generate') {
      const payload = await readJsonBody(request);
      const task = await createTripoTask(payload);
      sendJson(response, 200, task);
      return;
    }

    if (request.method === 'GET' && url.pathname.startsWith('/api/3d/status/')) {
      const taskId = decodeURIComponent(url.pathname.replace('/api/3d/status/', ''));
      const task = await getTripoTask(taskId);
      sendJson(response, 200, task);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/3d/model') {
      await proxyModel(url, response);
      return;
    }

    if (request.method === 'GET' && url.pathname.startsWith('/api/3d/local-model/')) {
      await serveLocalModel(url, response);
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    if (response.headersSent) {
      response.destroy(error);
      return;
    }

    sendJson(response, error.status || 500, {
      error: error.message || 'Server error',
      detail: error.detail,
    });
  }
});

server.listen(API_PORT, API_HOST, () => {
  console.log(`Animal 3D API running at http://${API_HOST}:${API_PORT}`);
  console.log(TRIPO_API_KEY ? 'Tripo API key loaded.' : 'TRIPO_API_KEY is missing. Add it to .env.local.');
});
