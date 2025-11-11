class DataProvider {
  async init() {
    throw new Error('init() must be implemented');
  }

  async get(collection, id, key = null) {
    throw new Error('get() must be implemented');
  }

  async set(collection, id, data) {
    throw new Error('set() must be implemented');
  }

  async delete(collection, id) {
    throw new Error('delete() must be implemented');
  }

  async getAll(collection) {
    throw new Error('getAll() must be implemented');
  }

  async find(collection, query) {
    throw new Error('find() must be implemented');
  }
}

module.exports = DataProvider;
