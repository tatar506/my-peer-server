const express = require('express');
const { PeerServer } = require('peer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 9000;

// Хранилище всех узлов паутины прямо в памяти сервера
let globalNodes = {};

// Маршрут для получения всех узлов
app.get('/nodes', (req, res) => {
  res.json(globalNodes);
});

// Маршрут для сохранения/обновления узла
app.post('/nodes', (req, res) => {
  const node = req.body;
  if (node.name) {
    globalNodes[node.name] = {
      id: node.id,
      name: node.name,
      x: node.x,
      y: node.y,
      isOnline: true,
      lastActive: Date.now()
    };
  }
  res.sendStatus(200);
});

const server = app.listen(port, () => {
  console.log(`Сервер mirix запущен на порту ${port}`);
});

// Запуск PeerJS на том же сервере
const peerServer = PeerServer({
  path: '/myapp',
  server: server
});

// Помечаем игроков оффлайн, когда они отключаются
peerServer.on('disconnect', (client) => {
  Object.values(globalNodes).forEach(node => {
    if (node.id === client.getId()) {
      node.isOnline = false;
    }
  });
});