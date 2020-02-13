const winston = require('winston');

class LogManager{

    constructor () {
        this._logger = winston.createLogger({
            exitOnError: false
        });
        this.enable = false
    }

    set(config) {
        this.enable = config.allowAuditLog;
        this.transports = config.auditLog;
        for (const idx in config.auditLog) {
            const transport = config.auditLog[idx];
            if (this.transports[transport]) {
                continue;
            }
            if (config[transport]) {
                this["_" + transport] = config[transport]
            }
            this[transport]();
        }
    }

    console() {
        const consoleTransport = new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.splat(),
                winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
            )
        })
        this._logger.add(consoleTransport)
    }

    logAnalytics() {
        if ( !this._logAnalytics) {
            throw new Error("logAnalytics not found");
        }
        if ( !this._logAnalytics.workspaceID) {
            throw new Error("logAnalytics.WorkspaceID not found");
        }
        if ( !this._logAnalytics.sharedKey) {
            throw new Error("logAnalytics.shaerdKey not found");
        }
        if ( !this._logAnalytics.logType) {
            throw new Error("logAnalytics.logType not found");
        }
        const LogAnalysticsTransport = require('winston-azure-loganalytics');
        this._logAnalytics.format = winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
        const logAnalytics = new LogAnalysticsTransport(this._logAnalytics);
        this._logger.add(logAnalytics);
    }

    put(data) {
        var record;
        if (typeof(data) == "string"){
            record = JSON.parse(data)
        } else {
            record = data
        }
        this._logger.info(JSON.stringify(record))
    };

    write (message, encoding) {
        this._logger.info(message)
    }
}

module.exports = LogManager;
