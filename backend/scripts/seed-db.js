const pool = require('../database/db');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  console.log('Starting database seeding...\n');
  
  try {
    const client = await pool.connect();
    console.log('Connected to database');
    
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        if (!stmt || stmt === '') return false;
        if (stmt.startsWith('--') && !stmt.includes('INSERT') && !stmt.includes('CREATE')) return false;
        return true;
      })
      .map(stmt => {
        return stmt.split('\n')
          .filter(line => !line.trim().startsWith('--') || line.includes('INSERT') || line.includes('CREATE'))
          .join('\n')
          .trim();
      })
      .filter(stmt => stmt && stmt !== '');
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        if (statement.toLowerCase().includes('create database')) {
          console.log(`⏭Skipping database creation statement (${i + 1}/${statements.length})`);
          continue;
        }
        
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        if (statement.toLowerCase().includes('create table')) {
          const tableName = statement.match(/create table (\w+)/i)?.[1];
          console.log(`   Creating table: ${tableName}`);
        } else if (statement.toLowerCase().includes('insert into')) {
          const tableName = statement.match(/insert into (\w+)/i)?.[1];
          console.log(`   Inserting data into: ${tableName}`);
        }
        
        await client.query(statement);
        console.log(`Success`);
        
      } catch (error) {
        if (error.code === '42P07') { // Table already exists
          const tableName = statement.match(/create table (\w+)/i)?.[1];
          console.log(` Table '${tableName}' already exists, skipping`);
        } else if (error.code === '23505') { // Unique constraint violation
          console.log(` Data already exists, skipping duplicate insert`);
        } else {
          console.error(` Error in statement ${i + 1}:`);
          console.error(` ${error.message}`);
          throw error; // Re-throw unexpected errors
        }
      }
    }
    
    // Verify the seeding by checking table contents
    console.log('\n Verifying seeded data:');
    
    const tables = ['affiliates', 'clicks', 'conversions'];
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   - ${table}: ${result.rows[0].count} rows`);
        
        // Show sample data for affiliates
        if (table === 'affiliates' && parseInt(result.rows[0].count) > 0) {
          const sampleData = await client.query('SELECT id, name FROM affiliates LIMIT 3');
          console.log('   Sample affiliates:');
          sampleData.rows.forEach(row => {
            console.log(`     ${row.id}: ${row.name}`);
          });
        }
      } catch (error) {
        console.log(`   - ${table}: Table not found`);
      }
    }
    
    client.release();
    console.log('\n Database seeding completed successfully!');
    
  } catch (error) {
    console.error(' Database seeding failed:');
    console.error(` Error: ${error.message}`);
    
    if (error.code) {
      console.error(` Code: ${error.code}`);
    }
    
  } finally {
    await pool.end();
  }
}

seedDatabase();
