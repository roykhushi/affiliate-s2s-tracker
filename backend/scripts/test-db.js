const pool = require('../database/db');

async function testConnection() {
  console.log('Testing database connection...\n');

  try {
    const client = await pool.connect();
    console.log('Successfully connected to NeonDB');

    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('Query execution successful');
    console.log(`Database time: ${result.rows[0].current_time}`);
    console.log(`PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]}`);

    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('affiliates', 'clicks', 'conversions')
      ORDER BY table_name;
    `;

    const tablesResult = await client.query(tablesQuery);
    console.log(`\nFound ${tablesResult.rows.length} application tables:`);

    if (tablesResult.rows.length === 0) {
      console.log('No application tables found. Run the seeding script to create them.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });

      console.log('\n Table data:');
      for (const table of tablesResult.rows) {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        console.log(`   - ${table.table_name}: ${countResult.rows[0].count} rows`);
      }
    }

    client.release();
    console.log('\n Database connection test completed successfully!');

  } catch (error) {
    console.error(' Database connection failed:');
    console.error(`   Error: ${error.message}`);

    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }

    if (error.message.includes('connect ENOTFOUND')) {
    } else if (error.message.includes('password authentication failed')) {
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
    }

  } finally {
    await pool.end();
  }
}

testConnection();
