import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import DBClient from '../utils/db';

class AuthController {
  static async getConnect (req, res) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const email = auth[0];
      const pass = sha1(auth[1]);

      const user = await DBClient.getUser({ email });
      // console.log('USER IN AUTH GETCONNECT()', user);

      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
      }

      if (pass !== user.password) {
        res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      const duration = (60 * 60 * 24);
      await redisClient.set(key, user._id.toString(), duration);

      response.status(200).json({ token });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getDisconnect (req, res) {
    try {
      const userToken = request.header('X-Token');
      // console.log('USER TOKEN DISCONNECT', userToken);
      const userKey = await redisClient.get(`auth_${userToken}`);
      // console.log('USER KEY DISCONNECT', userKey);
      if (!userKey) {
        res.status(401).json({ error: 'Unauthorized' });
      }
      await redisClient.del(`auth_${userToken}`);
      res.status(204).send('Disconnected');
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

export default AuthController;
