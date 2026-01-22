export class Logger {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.level = options.level || 'info';
        this.prefix = options.prefix || '[ImageMetadata]';
        this.logs = [];
        this.maxLogs = options.maxLogs || 1000;
        
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
    }
    
    debug(...args) {
        this._log('debug', ...args);
    }
    
    info(...args) {
        this._log('info', ...args);
    }
    
    warn(...args) {
        this._log('warn', ...args);
    }
    
    error(...args) {
        this._log('error', ...args);
    }
    
    _log(level, ...args) {
        if (!this.enabled) return;
        
        if (this.levels[level] < this.levels[this.level]) return;
        
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message: args,
            stack: level === 'error' ? new Error().stack : null
        };
        
        this.logs.push(logEntry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        const style = this._getStyle(level);
        const prefix = `%c${this.prefix} [${level.toUpperCase()}]`;
        
        console[level === 'debug' ? 'log' : level](prefix, style, ...args);
    }
    
    _getStyle(level) {
        const styles = {
            debug: 'color: #9CA3AF; font-weight: bold;',
            info: 'color: #3B82F6; font-weight: bold;',
            warn: 'color: #F59E0B; font-weight: bold;',
            error: 'color: #EF4444; font-weight: bold;'
        };
        
        return styles[level] || styles.info;
    }
    
    getLogs(level = null) {
        if (level) {
            return this.logs.filter(log => log.level === level);
        }
        return this.logs;
    }
    
    clearLogs() {
        this.logs = [];
    }
    
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
    
    setLevel(level) {
        if (this.levels.hasOwnProperty(level)) {
            this.level = level;
        }
    }
    
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
    }
    
    group(label) {
        if (this.enabled) {
            console.group(`${this.prefix} ${label}`);
        }
    }
    
    groupEnd() {
        if (this.enabled) {
            console.groupEnd();
        }
    }
    
    table(data) {
        if (this.enabled) {
            console.table(data);
        }
    }
    
    time(label) {
        if (this.enabled) {
            console.time(`${this.prefix} ${label}`);
        }
    }
    
    timeEnd(label) {
        if (this.enabled) {
            console.timeEnd(`${this.prefix} ${label}`);
        }
    }
}