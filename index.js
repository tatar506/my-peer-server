const express = require('express');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const app = express();
const port = process.env.PORT || 9000;

// Разрешаем запросы со всех адресов
app.use(cors());
// Включаем чтение JSON (вместо body-parser)
app.use(express.json());

// База данных в памяти
let globalNodes = {};

// Главная страница (чтобы видеть, что сервер работает)
app.get('/', (req, res) => {
    res.send('Mirix Aether Server is Running!');
});

// Получить список всех узлов
app.get('/nodes', (req, res) => {
    res.json(globalNodes);
});

// Сохранить позицию узла
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
        res.status(400).json({ error: 'Missing name' });
    }
});

// Запуск сервера
const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

// Подключение PeerJS как части сервера Express
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/myapp'
});

app.use('/', peerServer);

// Логика отключения
peerServer.on('disconnect', (client) => {
    const clientId = client.getId();
    Object.values(globalNodes).forEach(node => {
        if (node.id === clientId) {
            node.isOnline = false;
        }
    });
});
