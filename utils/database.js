import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db.json');

// Load database
let data = {};
try {
  const raw = fs.readFileSync(dbPath, 'utf-8');
  data = JSON.parse(raw);
} catch {
  // File belum ada, buat default
  data = {
    users: {},
    groups: {},
    games: {},
    premium: [],
    bans: [],
    warnings: {},
    daily: {},
    level: {},
    limit: {},
    afk: {},
    settings: {},
  };
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function save() {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const db = {
  data,
  save,
};

export default db;