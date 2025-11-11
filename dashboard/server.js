const express = require('express');
const path = require('path');
const os = require('os');

class DashboardServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  setupRoutes() {
    this.app.get('/api/stats', (req, res) => {
      try {
        const client = global.client;
        const ST = global.ST;
        
        if (!client || !client.user) {
          return res.status(503).json({ error: 'Bot not ready' });
        }

        const globalContext = require('../ST');
        const uptime = globalContext.getUptime();
        
        const memUsage = process.memoryUsage();
        const memoryUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
        const memoryTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2);

        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        res.json({
          uptime: uptime,
          commandsCount: ST.commands.size,
          eventsCount: ST.events.size,
          serversCount: client.guilds.cache.size,
          usersCount: totalUsers,
          memoryUsage: {
            used: memoryUsed,
            total: memoryTotal,
            percentage: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(1)
          },
          botName: client.user.tag,
          botId: client.user.id,
          status: 'online'
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/commands', (req, res) => {
      try {
        const ST = global.ST;
        const commands = [];

        ST.commands.forEach((cmd, name) => {
          commands.push({
            name: name,
            category: cmd.config.category || 'General',
            description: cmd.config.shortDescription || cmd.config.longDescription || 'No description',
            usage: cmd.config.guide ? cmd.config.guide.replace('{p}', global.config.prefix) : `${global.config.prefix}${name}`,
            permissions: cmd.config.role === 2 ? ['Admin'] : [],
            cooldown: cmd.config.countDown || 0
          });
        });

        res.json(commands);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/events', (req, res) => {
      try {
        const ST = global.ST;
        const events = [];

        ST.events.forEach((evt, name) => {
          events.push({
            name: name,
            eventType: evt.config.eventType || 'unknown',
            description: evt.config.shortDescription || evt.config.longDescription || 'No description'
          });
        });

        res.json(events);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/users', async (req, res) => {
      try {
        const usersData = global.usersData;
        const allUsers = await usersData.getAll();
        
        res.json({
          total: allUsers.length,
          users: allUsers.slice(0, 100)
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/system', (req, res) => {
      try {
        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        res.json({
          nodeVersion: process.version,
          platform: `${os.type()} ${os.release()}`,
          arch: os.arch(),
          cpu: {
            model: cpus[0].model,
            cores: cpus.length,
            speed: cpus[0].speed
          },
          memory: {
            total: (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            used: (usedMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            free: (freeMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            percentage: ((usedMem / totalMem) * 100).toFixed(1) + '%'
          },
          uptime: this.formatSystemUptime(os.uptime())
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  formatSystemUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  start(port) {
    this.server = this.app.listen(port, '0.0.0.0', () => {
      global.logger.success(`Dashboard started at http://0.0.0.0:${port}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      global.logger.info('Dashboard stopped');
    }
  }
}

const dashboard = new DashboardServer();

module.exports = dashboard;
