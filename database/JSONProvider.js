const DataProvider = require('./DataProvider');
const fs = require('fs').promises;
const path = require('path');

class JSONProvider extends DataProvider {
  constructor() {
    super();
    this.dataDir = path.join(__dirname, '../data');
    this.cache = new Map();
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      global.logger.success('JSON Database initialized');
    } catch (error) {
      global.logger.error('Failed to initialize JSON database', error);
      throw error;
    }
  }

  getFilePath(collection) {
    return path.join(this.dataDir, `${collection}.json`);
  }

  async loadCollection(collection) {
    if (this.cache.has(collection)) {
      return this.cache.get(collection);
    }

    const filePath = this.getFilePath(collection);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);
      this.cache.set(collection, parsed);
      return parsed;
    } catch (error) {
      if (error.code === 'ENOENT') {
        const newData = {};
        this.cache.set(collection, newData);
        return newData;
      }
      throw error;
    }
  }

  async saveCollection(collection, data) {
    const filePath = this.getFilePath(collection);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    this.cache.set(collection, data);
  }

  async get(collection, id, key = null) {
    const data = await this.loadCollection(collection);
    const record = data[id];
    
    if (!record) return null;
    if (key === null) return record;
    
    return record[key] !== undefined ? record[key] : null;
  }

  async set(collection, id, updates) {
    const data = await this.loadCollection(collection);
    
    if (!data[id]) {
      data[id] = { id };
    }
    
    Object.assign(data[id], updates);
    await this.saveCollection(collection, data);
    
    return data[id];
  }

  async delete(collection, id) {
    const data = await this.loadCollection(collection);
    delete data[id];
    await this.saveCollection(collection, data);
  }

  async getAll(collection) {
    const data = await this.loadCollection(collection);
    return Object.values(data);
  }

  async find(collection, query) {
    const data = await this.loadCollection(collection);
    return Object.values(data).filter(record => {
      return Object.keys(query).every(key => record[key] === query[key]);
    });
  }
}

module.exports = JSONProvider;
