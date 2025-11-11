class UsersData {
  constructor(provider) {
    this.provider = provider;
    this.collection = 'users';
  }

  async get(userId, key = null) {
    let user = await this.provider.get(this.collection, userId, key);
    
    if (!user && key === null) {
      user = {
        id: userId,
        name: 'Unknown User',
        avatar: '',
        username: '',
        money: 0,
        exp: 0,
        level: 1,
        banned: false,
        warnings: 0,
        messageCount: 0,
        createdAt: Date.now()
      };
      await this.provider.set(this.collection, userId, user);
    }
    
    return user;
  }

  async set(userId, data) {
    return await this.provider.set(this.collection, userId, data);
  }

  async delete(userId) {
    return await this.provider.delete(this.collection, userId);
  }

  async getAll() {
    return await this.provider.getAll(this.collection);
  }

  async find(query) {
    return await this.provider.find(this.collection, query);
  }

  async incrementMoney(userId, amount) {
    const user = await this.get(userId);
    const newMoney = (user.money || 0) + amount;
    await this.set(userId, { money: newMoney });
    return newMoney;
  }

  async incrementExp(userId, amount) {
    const user = await this.get(userId);
    const newExp = (user.exp || 0) + amount;
    await this.set(userId, { exp: newExp });
    return newExp;
  }

  async incrementWarnings(userId) {
    const user = await this.get(userId);
    const newWarnings = (user.warnings || 0) + 1;
    await this.set(userId, { warnings: newWarnings });
    return newWarnings;
  }

  async ban(userId, reason = 'No reason provided') {
    await this.set(userId, { banned: true, banReason: reason, bannedAt: Date.now() });
  }

  async unban(userId) {
    await this.set(userId, { banned: false, banReason: null, bannedAt: null });
  }

  async isBanned(userId) {
    const user = await this.get(userId);
    return user ? user.banned === true : false;
  }
}

module.exports = UsersData;
