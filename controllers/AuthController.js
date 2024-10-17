const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');
const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const basicAuth = require('basic-auth');

class AuthController {
  // Method to log the user in and generate a token
  static async getConnect(req, res) {
    const credentials = basicAuth(req); // Decode Basic Auth credentials (email:password)
    
    if (!credentials || !credentials.name || !credentials.pass) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const email = credentials.name;
    const password = sha1(credentials.pass); // Hash the password using SHA1

    const user = await dbClient.usersCollection.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4(); // Generate a new token
    const key = `auth_${token}`;
    
    // Store user ID in Redis for 24 hours
    await redisClient.set(key, String(user._id), 60 * 60 * 24);
    
    return res.status(200).json({ token });
  }

  // Method to log the user out and delete the token
  static async getDisconnect(req, res) {
    const token = req.headers['x-token']; // Get the token from the request headers
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Remove the token from Redis
    await redisClient.del(key);
    
    return res.status(204).send();
  }
}

module.exports = AuthController;

