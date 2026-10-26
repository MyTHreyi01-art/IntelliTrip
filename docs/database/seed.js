import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Destination from '../backend/models/Destination.js';
import Hotel from '../backend/models/Hotel.js';
import Experience from '../backend/models/Experience.js';
import User from '../backend/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intellitrip';

import('../backend/seed.js');
