import bcrypt from 'bcryptjs';
import pool from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  { email: 'admin@example.com', password: 'AdminPass123', name: 'Admin User' },
  { email: 'user@example.com', password: 'UserPass123', name: 'Regular User' },
];

async function seed() {
  const connection = await pool.getConnection();
  try {
    for (const u of users) {
      const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [u.email]);
      if (rows.length > 0) {
        console.log(`User already exists: ${u.email}`);
        continue;
      }

      const hash = await bcrypt.hash(u.password, 10);
      const [result] = await connection.execute(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        [u.email, hash, u.name]
      );
      console.log(`Inserted ${u.email} (id=${result.insertId})`);
    }
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().then(() => {
  console.log('Seeding complete');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
