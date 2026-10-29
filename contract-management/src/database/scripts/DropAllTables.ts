import { Pool } from 'pg';
import { db } from '../../config/EnvVariables';

const pool = new Pool({
  user: db.USERNAME!,
  host: db.HOST!,
  database: db.DATABASE,
  password: db.PASSWORD,
  port: db.PORT,
  ssl: {
    rejectUnauthorized: false, // ✅ Needed for Azure Postgres
  },
});

(async () => {
  try {
    // Terminate all other sessions connected to the DB
    await pool.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid <> pg_backend_pid();
    `);
    console.log("✅ Terminated all other sessions.");

    // Drop all tables using cascade
    await pool.query(`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `);

    console.log("✅ All tables dropped successfully.");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await pool.end();
  }
})();
