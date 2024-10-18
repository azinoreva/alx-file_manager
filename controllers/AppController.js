import redisClient from '../utils/redis';
import DBClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    try {
      const redis = redisClient.isAlive();
      const db = dbClient.isAlive();
      res.status(200).send({ redis, db });
    } catch (error) {
      console.log(error);
    }
  }

  static async getStats(req, res) {
    try {
      const users = await DBClient.nbUsers();
      const files = await DBClient.nbFiles();
      res.status(200).send({ users, files });
    } catch (error) {
      console.log(error);
    }
  }
}

export default AppController;
