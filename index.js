const express = require('express');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const app = express();
const port = process.env.PORT || 9000;

// Разрешаем CORS для всех запросов
app.use(cors());
app.use(express.json());

// Временное хранилище узлов
let globalNodes = {};

// Маршруты для базы данных паутины
app.get('/nodes', (req, res) => {
    res.json(globalNodes);
});

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

// Простая проверка работы
app.get('/', (req, res) => {
    res.send('Mirix Aether Server Active');
});

// Запуск сервера
const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// Настройка PeerJS (будет доступен по пути /peerjs)
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/'
});

app.use('/peerjs', peerServer);

peerServer.on('disconnect', (client) => {
    const clientId = client.getId();
    Object.values(globalNodes).forEach(node => {
        if (node.id === clientId) node.isOnline = false;
    });
});
