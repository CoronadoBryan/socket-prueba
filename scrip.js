const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const logger = require('./logger');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  logger.socketConnection(socket.id, io.engine.clientsCount);
  
  socket.on('join-user-room', (userId) => {
    if (userId) {
      const roomName = `user-${userId}`;
      socket.join(roomName);
      logger.info(`Cliente ${socket.id} se unió a la sala: ${roomName}`);
    }
  });
  
  socket.on('leave-user-room', (userId) => {
    if (userId) {
      const roomName = `user-${userId}`;
      socket.leave(roomName);
      logger.info(`Cliente ${socket.id} salió de la sala: ${roomName}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.socketDisconnection(socket.id, io.engine.clientsCount);
  });
});

app.post('/emitir-mensaje', (req, res) => {
  const { conversacion_id, mensaje, id_usuario } = req.body;
  logger.socketReceive('/emitir-mensaje', { conversacion_id, mensaje, id_usuario });
  
  if (id_usuario) {
    const roomName = `user-${id_usuario}`;
    io.to(roomName).emit('nuevo-mensaje', { conversacion_id, mensaje });
    logger.socketEmit('nuevo-mensaje', { conversacion_id, mensaje, room: roomName });
  } else {
    io.emit('nuevo-mensaje', { conversacion_id, mensaje });
    logger.socketEmit('nuevo-mensaje', { conversacion_id, mensaje, room: 'all' });
  }
  
  res.send({ ok: true });
});

app.post('/emitir-conversacion', (req, res) => {
  const conversacion = req.body;
  logger.socketReceive('/emitir-conversacion', conversacion);
  
  if (conversacion.id_usuario) {
    const roomName = `user-${conversacion.id_usuario}`;
    io.to(roomName).emit('nueva-conversacion', { conversacion });
    logger.socketEmit('nueva-conversacion', { conversacion, room: roomName });
  } else {
    io.emit('nueva-conversacion', { conversacion });
    logger.socketEmit('nueva-conversacion', { conversacion, room: 'all' });
  }
  
  res.send({ ok: true });
});

app.post('/emitir-actualizar-conversacion', (req, res) => {
  const conversacion = req.body;
  logger.socketReceive('/emitir-actualizar-conversacion', conversacion);
  
  if (conversacion.id_usuario) {
    const roomName = `user-${conversacion.id_usuario}`;
    io.to(roomName).emit('conversacion-actualizada', { conversacion });
    logger.socketEmit('conversacion-actualizada', { conversacion, room: roomName });
  } else {
    io.emit('conversacion-actualizada', { conversacion });
    logger.socketEmit('conversacion-actualizada', { conversacion, room: 'all' });
  }
  
  res.send({ ok: true });
});

app.post('/emitir-estado-mensaje', (req, res) => {
  const { mensaje_id, nuevo_estado, datos_mensaje } = req.body;
  logger.socketReceive('/emitir-estado-mensaje', { mensaje_id, nuevo_estado, datos_mensaje });
  io.emit('estado-mensaje-actualizado', { mensaje_id, nuevo_estado, datos_mensaje });
  logger.socketEmit('estado-mensaje-actualizado', { mensaje_id, nuevo_estado, datos_mensaje });
  res.send({ ok: true });
});

app.post('/emitir-actualizar-contadores', (req, res) => {
  const { conversacion_id, mensajes_no_leidos, ultimo_mensaje_no_leido_fecha, id_usuario } = req.body;
  logger.socketReceive('/emitir-actualizar-contadores', { conversacion_id, mensajes_no_leidos, ultimo_mensaje_no_leido_fecha, id_usuario });
  
  if (id_usuario) {
    const roomName = `user-${id_usuario}`;
    io.to(roomName).emit('contadores-actualizados', { 
      conversacion_id, 
      mensajes_no_leidos, 
      ultimo_mensaje_no_leido_fecha 
    });
    logger.socketEmit('contadores-actualizados', { conversacion_id, mensajes_no_leidos, ultimo_mensaje_no_leido_fecha, room: roomName });
  } else {
    io.emit('contadores-actualizados', { 
      conversacion_id, 
      mensajes_no_leidos, 
      ultimo_mensaje_no_leido_fecha 
    });
    logger.socketEmit('contadores-actualizados', { conversacion_id, mensajes_no_leidos, ultimo_mensaje_no_leido_fecha, room: 'all' });
  }
  
  res.send({ ok: true });
});

server.listen(4000, () => {
  logger.info('Socket.IO server iniciado en puerto 4000', { 
    port: 4000,
  });
});
