const express = require('express');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const app = express();
const port = process.env.PORT || 9000;

// 1. Настройка CORS - разрешаем всё для всех
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. База данных
let globalNodes = {};

// 3. Маршруты API (Должны быть ВЫШЕ PeerServer)
app.get('/nodes', (req, res) => {
    console.log("Запрос списка узлов");
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
        res.status(400).json({ error: 'Invalid data' });
    }
});

app.get('/', (req, res) => {
    res.send('Mirix Server is Active');
});

// 4. Запуск сервера
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// 5. Настройка PeerServer на отдельный путь /peerjs
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/' 
});

// Монтируем PeerServer по пути /peerjs
app.use('/peerjs', peerServer);

peerServer.on('disconnect', (client) => {
    const clientId = client.getId();
    Object.values(globalNodes).forEach(node => {
        if (node.id === clientId) node.isOnline = false;
    });
});
