import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables immediately
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Adjust path: src/config -> src -> backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
