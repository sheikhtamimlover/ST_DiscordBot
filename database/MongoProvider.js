const DataProvider = require('./DataProvider');
const mongoose = require('mongoose');

class MongoProvider extends DataProvider {
  constructor(uri) {
    super();
    this.uri = uri || global.config?.databaseUrl || process.env.MONGODB_URI || 'mongodb://localhost:27017/st_discordbot';
    this.models = new Map();
  }

  async init() {
    try {
      await mongoose.connect(this.uri);
      global.logger.success('MongoDB Database connected');
    } catch (error) {
      global.logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  getModel(collection) {
    if (this.models.has(collection)) {
      return this.models.get(collection);
    }

    const schema = new mongoose.Schema({}, { strict: false, timestamps: true });
    const model = mongoose.model(collection, schema);
    this.models.set(collection, model);
    return model;
  }

  async get(collection, id, key = null) {
    const Model = this.getModel(collection);
    const record = await Model.findOne({ id });
    
    if (!record) return null;
    if (key === null) return record.toObject();
    
    return record[key] !== undefined ? record[key] : null;
  }

  async set(collection, id, updates) {
    const Model = this.getModel(collection);
    const record = await Model.findOneAndUpdate(
      { id },
      { $set: updates },
      { upsert: true, new: true }
    );
    
    return record.toObject();
  }

  async delete(collection, id) {
    const Model = this.getModel(collection);
    await Model.deleteOne({ id });
  }

  async getAll(collection) {
    const Model = this.getModel(collection);
    const records = await Model.find({});
    return records.map(r => r.toObject());
  }

  async find(collection, query) {
    const Model = this.getModel(collection);
    const records = await Model.find(query);
    return records.map(r => r.toObject());
  }
}

module.exports = MongoProvider;
