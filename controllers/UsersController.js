import sha1 from 'sha1'; // For password hashing
import DBClient from '../utils/db'; // Database client
const redisClient = require('../utils/redis');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email and password
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the user already exists
    const userExists = await DBClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password
    const hashedPassword = sha1(password);

    // Create new user
    const newUser = { email, password: hashedPassword };

    try {
      const result = await DBClient.db.collection('users').insertOne(newUser);
      const userId = result.insertedId;

      return res.status(201).json({ id: userId, email });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

// GET /users/me to get current user's data
  static async getMe(req, res) {
    const token = req.headers['x-token']; // Get the token from the request headers
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.usersCollection.findOne({ _id: dbClient.getObjectId(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return the user's ID and email
    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;

