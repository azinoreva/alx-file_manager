import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class DBClient {
  constructor() {
    // Retrieve MongoDB connection parameters from environment variables or use defaults
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // MongoDB URI
    const uri = `mongodb://${host}:${port}/${database}`;
    
    // Create MongoDB client
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    
    // Connect to MongoDB and handle promise rejection
    this.client.connect()
      .then(() => {
        console.log('Connected successfully to MongoDB');
      })
      .catch((err) => {
        console.error(`MongoDB connection error: ${err.message}`);
      });
  }

  // Check if MongoDB connection is alive using readyState
  isAlive() {
    return this.client.topology && this.client.topology.isConnected();
  }

  // Asynchronously return the number of documents in the 'users' collection
  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  // Asynchronously return the number of documents in the 'files' collection
  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;

