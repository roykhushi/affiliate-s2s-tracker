const express = require('express');
const cors = require('cors');
const pool = require('./database/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/click', async (req, res) => {
  try {
    const { affiliate_id, click_id } = req.query;
    
    if (!affiliate_id || !click_id) {
      return res.status(400).json({ 
        error: 'Missing required parameters: affiliate_id and click_id' 
      });
    }
    const affiliateCheck = await pool.query(
      'SELECT id FROM affiliates WHERE id = $1',
      [affiliate_id]
    );

    if (affiliateCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }

    const result = await pool.query(
      'INSERT INTO clicks (affiliate_id, click_id) VALUES ($1, $2) RETURNING *',
      [affiliate_id, click_id]
    );

    res.json({ 
      success: true, 
      message: 'Click tracked successfully',
      click: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Click ID already exists' });
    }
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/postback', async (req, res) => {
  try {
    const { affiliate_id, click_id, amount, currency } = req.query;
    
    if (!affiliate_id || !click_id || !amount || !currency) {
      return res.status(400).json({ 
        error: 'Missing required parameters: affiliate_id, click_id, amount, currency' 
      });
    }
    const clickCheck = await pool.query(
      'SELECT c.click_id FROM clicks c WHERE c.click_id = $1 AND c.affiliate_id = $2',
      [click_id, affiliate_id]
    );

    if (clickCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Invalid click_id for this affiliate' 
      });
    }
    const conversionCheck = await pool.query(
      'SELECT id FROM conversions WHERE click_id = $1',
      [click_id]
    );

    if (conversionCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Conversion already recorded for this click_id' 
      });
    }

    const result = await pool.query(
      'INSERT INTO conversions (click_id, amount, currency) VALUES ($1, $2, $3) RETURNING *',
      [click_id, parseFloat(amount), currency.toUpperCase()]
    );

    res.json({ 
      success: true, 
      message: 'Conversion tracked successfully',
      conversion: result.rows[0]
    });
  } catch (error) {
    console.error('Error tracking conversion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/affiliate/:id/conversions', async (req, res) => {
  try {
    const { id } = req.params;

    const affiliateCheck = await pool.query(
      'SELECT name FROM affiliates WHERE id = $1',
      [id]
    );

    if (affiliateCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }
    const result = await pool.query(`
      SELECT 
        conv.id,
        conv.click_id,
        conv.amount,
        conv.currency,
        conv.created_at,
        c.created_at as click_created_at
      FROM conversions conv
      JOIN clicks c ON conv.click_id = c.click_id
      WHERE c.affiliate_id = $1
      ORDER BY conv.created_at DESC
    `, [id]);

    res.json({
      affiliate: affiliateCheck.rows[0],
      conversions: result.rows
    });
  } catch (error) {
    console.error('Error fetching conversions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/affiliates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM affiliates ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
