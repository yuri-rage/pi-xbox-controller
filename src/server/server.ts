import express from 'express';
import ViteExpress from 'vite-express';
import { Server, Socket } from 'socket.io';
import http from 'http';
import os from 'os';
import cors from 'cors';
import { TriggerValue } from '@/types.js';
import { XboxController } from './xbox-controller.js';

const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const httpServer = http.createServer(app);
const connectedSockets = new Map<string, Set<Socket>>();
const xbox = new XboxController();

const eth0Interface = os.networkInterfaces().eth0;
const wlan0Interface = os.networkInterfaces().wlan0;

const ethIP = eth0Interface ? eth0Interface[0].address : '127.0.0.1';
const wifiIP = wlan0Interface ? wlan0Interface[0].address : '127.0.0.1';

const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (origin) {
                const ip = origin.split('//')[1];
                if (
                    ip.startsWith(ethIP.substring(0, ethIP.lastIndexOf('.'))) ||
                    ip.startsWith(wifiIP.substring(0, wifiIP.lastIndexOf('.'))) ||
                    os.hostname()
                ) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            } else {
                // callback(new Error('Origin is undefined'));
                // ! allow undefined origin for websocket requests
                callback(null, true);
            }
        },
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

xbox.on('button', (button, value) => {
    io.emit('button', button, value);
});

xbox.on('configSaved', () => {
    io.emit('configSaved');
});

xbox.on('actionProgress', (progress, total) => {
    io.emit('actionProgress', progress, total);
});

xbox.on('actionComplete', (success) => {
    io.emit('actionComplete', success);
});

xbox.on('actionRefused', () => {
    io.emit('actionRefused');
});

io.on('connection', (socket) => {
    const socketIP = socket.handshake.address;
    const connections = connectedSockets.get(socketIP) || new Set<Socket>();

    // limit to one websocket connection per client in dev mode
    if (!isProduction && connectedSockets.has(socketIP)) {
        try {
            connections?.forEach((existingSocket) => existingSocket.disconnect());
            console.log(`Dev mode - disconnected existing websocket ${socketIP}`);
        } catch (error) {
            console.error(`Dev mode - error disconnecting existing websocket ${socketIP}: ${error}`);
        }
        connectedSockets.delete(socketIP);
    }

    connections.add(socket);
    connectedSockets.set(socketIP, connections);
    console.log(
        `New websocket connection (${Array.from(connectedSockets.values()).reduce((acc, set) => acc + set.size, 0)} total)`,
    );

    socket.on('getConfig', () => {
        socket.emit('config', xbox.configObject);
    });

    socket.on('saveConfig', (data) => {
        xbox.configObject = { ...data };
        xbox.saveConfig();
    });

    socket.on('getActiveTriggers', () => {
        socket.emit('activeTriggers', Array.from(xbox.activeTriggers));
    });

    socket.on('setActiveTriggers', (data: Array<number>) => {
        xbox.activeTriggers = new Set(data);
    });

    socket.on('execute', (actionIndex, repeat) => {
        xbox.executeAction(actionIndex, repeat);
    });

    socket.on('buttonDown', (data) => {
        console.log('Button pressed:', data);
        xbox.pushButton(data);
    });

    socket.on('buttonUp', (data) => {
        console.log('Button released:', data);
        xbox.releaseButton(data);
    });

    socket.on('disconnect', () => {
        connections.delete(socket);
        socket.removeAllListeners();
        if (connections.size === 0) {
            connectedSockets.delete(socketIP);
        }
        console.log(
            `Lost websocket connection (${Array.from(connectedSockets.values()).reduce((acc, set) => acc + set.size, 0)} remain)`,
        );
    });
});

const port = parseInt(process.env.PORT || '3000');

httpServer.listen(port, () => console.log(`Server started on port ${port}`));

ViteExpress.bind(app, httpServer);
