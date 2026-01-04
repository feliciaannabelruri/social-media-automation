const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogFilePath() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${date}.log`);
  }

  formatMessage(message, level) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  writeToFile(message) {
    try {
      const logFile = this.getLogFilePath();
      fs.appendFileSync(logFile, message + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(message, level = 'INFO') {
    const formattedMessage = this.formatMessage(message, level);
    
    // Console output with colors
    const colors = {
      INFO: '\x1b[36m',     // Cyan
      SUCCESS: '\x1b[32m',  // Green
      WARNING: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m',    // Red
      DEBUG: '\x1b[35m'     // Magenta
    };
    
    const reset = '\x1b[0m';
    const color = colors[level] || colors.INFO;
    
    console.log(`${color}${formattedMessage}${reset}`);
    
    // Write to file
    this.writeToFile(formattedMessage);
  }

  info(message) {
    this.log(message, 'INFO');
  }

  success(message) {
    this.log(message, 'SUCCESS');
  }

  warning(message) {
    this.log(message, 'WARNING');
  }

  error(message) {
    this.log(message, 'ERROR');
  }

  debug(message) {
    if (process.env.NODE_ENV === 'development') {
      this.log(message, 'DEBUG');
    }
  }

  // Clear old logs (optional)
  clearOldLogs(daysToKeep = 7) {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtime.getTime();

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error(`Failed to clear old logs: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new Logger();