const express = require('express');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const app = express();
const port = process.env.PORT || 9000;

// Настройка CORS: разрешаем запросы с любого домена (включая твой GitHub Pages)
app.use(cors());
app.use(express.json());

// Хранилище узлов в памяти сервера
let globalNodes = {};

// Главная страница для проверки
app.get('/', (req, res) => {
    res.send('Mirix Aether Server is Active');
});

// API для получения всех узлов (паутины)
app.get('/nodes', (req, res) => {
    res.json(globalNodes);
});

// API для сохранения позиции узла
app.post('/nodes', (req, res) => {
    const node = req.body;
    if (node && node.name) {
        globalNodes[node.name] = {
            id: node.id,
            name: node.name,
            x: node.x,
            y: node.y,
            isOnline: true,
            lastActive: Date.now()
        };
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ error: "Invalid data" });
    }
});

// Запуск сервера
const server = app.listen(port, () => {
    console.log(`[Mirix] Server started on port: ${port}`);
});

// Настройка PeerJS сервера
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/', // Внутренний путь должен быть корневым
    allow_discovery: true
});

// Монтируем PeerJS по пути /peerjs
app.use('/peerjs', peerServer);

// Обработка событий подключения
peerServer.on('connection', (client) => {
    console.log(`[Mirix] Игрок подключился: ${client.getId()}`);
});

// Обработка событий отключения
peerServer.on('disconnect', (client) => {
    const cid = client.getId();
    console.log(`[Mirix] Игрок отключился: ${cid}`);
    Object.values(globalNodes).forEach(n => {
        if (n.id === cid) {
            n.isOnline = false;
        }
    });
});
