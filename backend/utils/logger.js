const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(logMessage);
    
    const logFile = path.join(
      this.logDir,
      `${new Date().toISOString().split('T')[0]}.log`
    );
    
    fs.appendFileSync(logFile, logMessage);
  }

  info(message) {
    this.log(message, 'INFO');
  }

  error(message) {
    this.log(message, 'ERROR');
  }

  success(message) {
    this.log(message, 'SUCCESS');
  }

  warning(message) {
    this.log(message, 'WARNING');
  }
}

module.exports = new Logger();