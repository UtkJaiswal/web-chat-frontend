// src/services/websocketService.js

import { w3cwebsocket as W3CWebSocket } from 'websocket';

const client = new W3CWebSocket('ws://localhost:1337/websocket');

client.onopen = () => {
  console.log('WebSocket Client Connected');
};

client.onclose = () => {
  console.log('WebSocket Client Disconnected');
};

export default client;
