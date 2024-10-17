const RedisClient = require('../utils/redis');
const DBClient = require('../utils/db');

class AppController {
  // GET /status
  static getStatus(req, res) {
    res.status(200).json({
      redis: RedisClient.isAlive(),
      db: DBClient.isAlive(),
    });
  }

  // GET /stats
  static async getStats(req, res) {
    const usersCount = await DBClient.nbUsers();
    const filesCount = await DBClient.nbFiles();

    res.status(200).json({ users: usersCount, files: filesCount });
  }
}

module.exports = AppController;

