import { v4 as uuidv4 } from 'uuid'; // For generating unique file names
import fs from 'fs'; // To interact with the file system
import path from 'path'; // To manage file paths
import { promisify } from 'util'; // To convert callback-based methods to promises
import redisClient from '../utils/redis'; // Redis client
import DBClient from '../utils/db'; // DB client

const writeFileAsync = promisify(fs.writeFile); // Make writeFile async
const mkdirAsync = promisify(fs.mkdir); // Make mkdir async
const statAsync = promisify(fs.stat); // Make stat async

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager'; // Default file storage folder

class FilesController {
  static async postUpload(req, res) {
    const { name, type, parentId = 0, isPublic = false, data } = req.body;
    const token = req.headers['x-token']; // Retrieve the token from headers

    // Retrieve the user based on the token
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate the required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Handle parentId validation if set
    if (parentId !== 0) {
      const parentFile = await DBClient.db.collection('files').findOne({ _id: parentId });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Create the file document
    const fileDocument = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    // Handle folder creation
    if (type === 'folder') {
      const result = await DBClient.db.collection('files').insertOne(fileDocument);
      return res.status(201).json({ id: result.insertedId, ...fileDocument });
    }

    // Ensure the storage folder exists
    try {
      await statAsync(FOLDER_PATH);
    } catch (err) {
      await mkdirAsync(FOLDER_PATH, { recursive: true });
    }

    // Generate a unique file name and local path
    const fileName = uuidv4();
    const localPath = path.join(FOLDER_PATH, fileName);

    // Save the file data to disk (decoded from Base64)
    try {
      const fileData = Buffer.from(data, 'base64');
      await writeFileAsync(localPath, fileData);

      // Add localPath to the file document and save to the DB
      fileDocument.localPath = localPath;
      const result = await DBClient.db.collection('files').insertOne(fileDocument);

      return res.status(201).json({ id: result.insertedId, ...fileDocument });
    } catch (error) {
      return res.status(500).json({ error: 'Unable to save the file' });
    }
  }
}

export default FilesController;

