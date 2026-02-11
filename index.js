const express = require('express');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

let globalNodes = {};

// База данных паутины
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

app.get('/', (req, res) => {
    res.send('Mirix Server Running');
});

const server = app.listen(port, () => {
    console.log(`Port: ${port}`);
});

const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/'
});

// Доступ к P2P будет по адресу: твой-сайт.render.com/peerjs
app.use('/peerjs', peerServer);

peerServer.on('disconnect', (client) => {
    const cid = client.getId();
    Object.values(globalNodes).forEach(n => {
        if (n.id === cid) n.isOnline = false;
    });
});
