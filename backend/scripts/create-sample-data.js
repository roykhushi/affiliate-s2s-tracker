const pool = require('../database/db');

async function createSampleData() {
  console.log('Creating sample conversion data...\n');
  
  try {
    const client = await pool.connect();
    console.log('Connected to database');
    
    const sampleData = [
      { affiliate_id: 1, click_id: 'aff1_click_003', amount: 125.75, currency: 'USD' },
      { affiliate_id: 1, click_id: 'aff1_click_004', amount: 89.99, currency: 'USD' },
      { affiliate_id: 1, click_id: 'aff1_click_005', amount: 250.00, currency: 'USD' },
      { affiliate_id: 1, click_id: 'aff1_click_006', amount: 45.50, currency: 'USD' },
      
      { affiliate_id: 2, click_id: 'aff2_click_004', amount: 175.25, currency: 'USD' },
      { affiliate_id: 2, click_id: 'aff2_click_005', amount: 95.00, currency: 'USD' },
      
      { affiliate_id: 3, click_id: 'aff3_click_001', amount: 299.99, currency: 'USD' },
      { affiliate_id: 3, click_id: 'aff3_click_002', amount: 78.50, currency: 'USD' },
      { affiliate_id: 3, click_id: 'aff3_click_003', amount: 156.75, currency: 'USD' },
      { affiliate_id: 3, click_id: 'aff3_click_004', amount: 212.00, currency: 'USD' },
      { affiliate_id: 3, click_id: 'aff3_click_005', amount: 89.25, currency: 'USD' }
    ];
    
    let clicksCreated = 0;
    let conversionsCreated = 0;
    
    for (const data of sampleData) {
      try {
        console.log(`Creating click: ${data.click_id} for affiliate ${data.affiliate_id}`);
        await client.query(
          'INSERT INTO clicks (affiliate_id, click_id) VALUES ($1, $2)',
          [data.affiliate_id, data.click_id]
        );
        clicksCreated++;
        
        console.log(`Creating conversion: $${data.amount} ${data.currency}`);
        await client.query(
          'INSERT INTO conversions (click_id, amount, currency) VALUES ($1, $2, $3)',
          [data.click_id, data.amount, data.currency]
        );
        conversionsCreated++;
        
      } catch (error) {
        if (error.code === '23505') { 
          console.log(`${data.click_id} already exists, skipping`);
        } else {
          console.error(`Error: ${error.message}`);
        }
      }
    }
    
    // console.log(`\n Sample data creation completed:`);
    // console.log(`Clicks created: ${clicksCreated}`);
    // console.log(`Conversions created: ${conversionsCreated}`);
    console.log(`\n Final conversion counts per affiliate:`);
    const countResult = await client.query(`
      SELECT 
        a.id,
        a.name,
        COUNT(conv.id) as conversion_count,
        COALESCE(SUM(conv.amount), 0) as total_revenue
      FROM affiliates a
      LEFT JOIN clicks c ON a.id = c.affiliate_id
      LEFT JOIN conversions conv ON c.click_id = conv.click_id
      GROUP BY a.id, a.name
      ORDER BY a.id
    `);
    
    countResult.rows.forEach(row => {
      console.log(`   - ${row.name}: ${row.conversion_count} conversions, $${parseFloat(row.total_revenue).toFixed(2)} revenue`);
    });
    
    client.release();
    console.log('\n Sample data creation completed successfully!');
    
  } catch (error) {
    console.error('Sample data creation failed:');
    console.error(`Error: ${error.message}`);
  } finally {
    await pool.end();
  }
}

createSampleData();
