const color = require('./color');

class Logger {
  constructor() {
    this.startTime = Date.now();
  }

  getTimestamp() {
    const now = new Date();
    return color.gray(`[${now.toLocaleTimeString()}]`);
  }

  log(message, type = 'INFO') {
    const timestamp = this.getTimestamp();
    console.log(`${timestamp} ${message}`);
  }

  info(message) {
    const timestamp = this.getTimestamp();
    console.log(`${timestamp} ${color.blue('[INFO]')} ${message}`);
  }

  success(message) {
    const timestamp = this.getTimestamp();
    console.log(`${timestamp} ${color.green('[SUCCESS]')} ${message}`);
  }

  warn(message) {
    const timestamp = this.getTimestamp();
    console.log(`${timestamp} ${color.yellow('[WARN]')} ${message}`);
  }

  error(message, error) {
    const timestamp = this.getTimestamp();
    console.log(`${timestamp} ${color.red('[ERROR]')} ${message}`);
    if (error) {
      console.log(color.red(error.stack || error.message || error));
    }
  }

  command(username, userId, commandName, threadId) {
    const timestamp = this.getTimestamp();
    console.log(
      `${timestamp} ${color.cyan('[COMMAND]')} ${color.bold(username)} (${userId}) ` +
      `used ${color.yellow(commandName)} in thread ${threadId}`
    );
  }

  processing(commandName) {
    const timestamp = this.getTimestamp();
    console.log(`${timestamp} ${color.magenta('[PROCESSING]')} ${commandName}`);
  }

  banner(text) {
    console.log(color.cyan(text));
  }

  getUptime() {
    const uptime = Date.now() - this.startTime;
    const seconds = Math.floor(uptime / 1000) % 60;
    const minutes = Math.floor(uptime / (1000 * 60)) % 60;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    return `${hours}h ${minutes}m ${seconds}s`;
  }
}

module.exports = new Logger();
