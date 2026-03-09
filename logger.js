const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    

    getLogFileName() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `log-${year}-${month}-${day}.log`;
    }

    formatMessage(level, message, context = {}) {
        const timestamp = new Date().toISOString();
        const contextStr = Object.keys(context).length > 0 ? ` | Context: ${JSON.stringify(context)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}\n`;
    }

    writeLog(level, message, context = {}) {
        const logFile = path.join(this.logDir, this.getLogFileName());
        const formattedMessage = this.formatMessage(level, message, context);
        
        fs.appendFileSync(logFile, formattedMessage);
        
        // También mostrar en consola con colores
        const colors = {
            error: '\x1b[31m',   // Rojo
            warning: '\x1b[33m', // Amarillo
            info: '\x1b[36m',    // Cian
            debug: '\x1b[37m',   // Blanco
            reset: '\x1b[0m'     // Reset
        };
        
        const color = colors[level] || colors.reset;
        console.log(`${color}${formattedMessage.trim()}${colors.reset}`);
    }

    error(message, context = {}) {
        this.writeLog('error', message, context);
    }

    warning(message, context = {}) {
        this.writeLog('warning', message, context);
    }

    info(message, context = {}) {
        this.writeLog('info', message, context);
    }

    debug(message, context = {}) {
        this.writeLog('debug', message, context);
    }

    // Métodos específicos para socket events
    socketConnection(socketId, totalClients) {
        this.info(`Cliente conectado - ID: ${socketId}`, { 
            total_clients: totalClients,
            event: 'connection'
        });
    }

    socketDisconnection(socketId, totalClients) {
        this.info(`Cliente desconectado - ID: ${socketId}`, { 
            total_clients: totalClients,
            event: 'disconnection'
        });
    }

    socketEmit(event, data) {
        this.info(`Emitiendo evento: ${event}`, { 
            event: event,
            data: data
        });
    }

    socketReceive(endpoint, data) {
        this.info(`Recibiendo solicitud: ${endpoint}`, { 
            endpoint: endpoint,
            data: data
        });
    }
}

module.exports = new Logger();
