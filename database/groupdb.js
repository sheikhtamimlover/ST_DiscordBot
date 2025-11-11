class ThreadsData {
  constructor(provider) {
    this.provider = provider;
    this.collection = 'threads';
  }

  async get(threadId, key = null) {
    let thread = await this.provider.get(this.collection, threadId, key);
    
    if (!thread && key === null) {
      thread = {
        id: threadId,
        name: 'Unknown Thread',
        prefix: null,
        members: [],
        banned: [],
        settings: {
          welcomeMessage: true,
          leaveMessage: true,
          antiSpam: false
        },
        createdAt: Date.now()
      };
      await this.provider.set(this.collection, threadId, thread);
    }
    
    return thread;
  }

  async set(threadId, data) {
    return await this.provider.set(this.collection, threadId, data);
  }

  async delete(threadId) {
    return await this.provider.delete(this.collection, threadId);
  }

  async getAll() {
    return await this.provider.getAll(this.collection);
  }

  async find(query) {
    return await this.provider.find(this.collection, query);
  }

  async addMember(threadId, userId) {
    const thread = await this.get(threadId);
    if (!thread.members.includes(userId)) {
      thread.members.push(userId);
      await this.set(threadId, { members: thread.members });
    }
  }

  async removeMember(threadId, userId) {
    const thread = await this.get(threadId);
    thread.members = thread.members.filter(id => id !== userId);
    await this.set(threadId, { members: thread.members });
  }

  async banMember(threadId, userId, reason = 'No reason provided') {
    const thread = await this.get(threadId);
    if (!thread.banned) thread.banned = [];
    thread.banned.push({ userId, reason, bannedAt: Date.now() });
    await this.set(threadId, { banned: thread.banned });
  }

  async unbanMember(threadId, userId) {
    const thread = await this.get(threadId);
    if (thread.banned) {
      thread.banned = thread.banned.filter(b => b.userId !== userId);
      await this.set(threadId, { banned: thread.banned });
    }
  }

  async isBanned(threadId, userId) {
    const thread = await this.get(threadId);
    if (!thread.banned) return false;
    return thread.banned.some(b => b.userId === userId);
  }
}

module.exports = ThreadsData;
