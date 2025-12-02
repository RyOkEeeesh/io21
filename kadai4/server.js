import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ host: '0.0.0.0', port: 8080 });

wss.on('connection', (ws) => {
  ws.send('Welcome!');

  ws.on('message', msg => {
    const message = JSON.parse(msg);

    if (message.type === 'join') {
      console.log(`${message.data.name} joined the Game`);
      ws.name = message.data.name;
      ws.send(`Hi ${ws.name}`);
    } else if (message.type === 'msg') {
      console.log(`${ws.name}: ${message.data.message}`);
    }

  });

  ws.on("close", () => {
    console.log(`${ws.name} left the game.`);
  });
});
