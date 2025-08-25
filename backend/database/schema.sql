CREATE TABLE affiliates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE clicks (
  id SERIAL PRIMARY KEY,
  affiliate_id INT REFERENCES affiliates(id),
  click_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversions (
  id SERIAL PRIMARY KEY,
  click_id VARCHAR(255) REFERENCES clicks(click_id),
  amount FLOAT NOT NULL,
  currency VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO affiliates (name) VALUES 
  ('Affiliate One'),
  ('Affiliate Two'),
  ('Affiliate Three');
