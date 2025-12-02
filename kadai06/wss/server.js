import { WebSocket, WebSocketServer } from 'ws';
import chokidar from "chokidar";

const wss = new WebSocketServer({ port: 3001 });

const CSV_PATH = '/data/kadai06.csv';

const watcher = chokidar.watch(CSV_PATH, {
  pewrsistent: true,
  ignoreInitial: true,
});

wss.on('listening', () => {
  console.log('WSS running on port 3001...');
});

wss.on('connection', (ws) => {
  console.log(`WSS: Client connected.`);

  ws.send(JSON.stringify({
    type: 'initial_connect',
    message: 'Connection successful. Please fetch initial data.'
  }));

  ws.on('close', () => {
    console.log(`WSS: Client disconnected.`);
  });
});

watcher.on('change', (path) => {
  console.log(`[File Watcher] CSV updated: ${path}`);

  wss.clients.forEach(client => {
    const message = JSON.stringify({
      type: 'data_updated',
      timestamp: new Date().toISOString()
    });
    client.send(message);
  });
});

watcher.on('error', err => {
  console.error(err);
})