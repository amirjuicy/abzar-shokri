import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:/Users/INO/Desktop/project/abzar-shokri/abzar-shokri/data/abzar-shokri.db', { readOnly: true });
const s = db.prepare("SELECT token FROM customer_sessions WHERE user_id = 'u_muo7ndx5ryvip' AND expires_at > datetime('now')").get();
console.log(s.token);
