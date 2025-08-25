# S2S Tracker - Affiliate Postback Tracking System

An affiliate postback tracking system built with Node.js/Express backend, PostgreSQL database, and Next.js frontend with shadcn/ui components.

## Features

- **Click Tracking**: Track affiliate clicks with unique click IDs
- **Postback Tracking**: Receive and validate conversion postbacks
- **Dashboard**: View conversion data for each affiliate
- **Postback URL Generator**: Generate postback URLs for affiliates

## Screenshots

### Home Page
<img width="1891" height="828" alt="Screenshot 2025-08-25 190405" src="https://github.com/user-attachments/assets/bfe6a2d7-ea44-4291-a008-ce540e246c39" />


### Postback URL Generator
<img width="1898" height="830" alt="Screenshot 2025-08-25 190455" src="https://github.com/user-attachments/assets/63adcbc8-77c8-46e1-84d2-e8c27c3ca8cf" />


### Dashboard View
<img width="1900" height="819" alt="Screenshot 2025-08-25 190428" src="https://github.com/user-attachments/assets/a59af3a3-95a5-48e8-9e0e-ab42fe8c2d8f" />


## Tech Stack

- **Backend**: Node.js + Express
- **Database**: NeonDB (Serverless PostgreSQL)
- **Frontend**: Next.js 14 + shadcn/ui + Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+
- NeonDB account (free tier available)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Setup NeonDB Database**:
   
   a. Create a free account at [NeonDB](https://neon.tech/)
   
   b. Create a new project and get your connection string
   
   c. Run the schema using NeonDB's SQL Editor:
      - Copy contents of `backend/database/schema.sql`
      - Paste and run in NeonDB console
   
   See `backend/database/neon-setup.md` for detailed instructions.

3. **Configure Backend**:
   ```bash
   # Copy environment file
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your NeonDB connection string
   DATABASE_URL=postgresql://username:password@your-endpoint.neon.tech/neondb?sslmode=require
   PORT=3001
   ```

4. **Start Development Servers**:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend
   
   # Terminal 2 - Frontend  
   npm run dev:frontend
   ```

5. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## API Endpoints

### Click Tracking
```
GET /click?affiliate_id=1&click_id=abc123
```
Records a click for tracking.

### Postback Tracking
```
GET /postback?affiliate_id=1&click_id=abc123&amount=100&currency=USD
```
Records a conversion if the click ID is valid for the affiliate.

### Affiliate Conversions
```
GET /affiliate/:id/conversions
```
Returns all conversions for a specific affiliate.

### List Affiliates
```
GET /affiliates
```
Returns all available affiliates.

## Database Schema

```sql
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
```

## Frontend Pages

1. **Homepage** (`/`): Select affiliate and navigate to dashboard or postback URL
2. **Dashboard** (`/dashboard?affiliate_id=1`): View conversions table with stats
3. **Postback URL** (`/postback-url?affiliate_id=1`): Display postback URL template

## Usage Flow

1. **Track Clicks**: Send GET request to `/click` endpoint with affiliate_id and unique click_id
2. **User Converts**: When user completes desired action, fire postback
3. **Send Postback**: Make GET request to `/postback` endpoint with conversion data
4. **View Results**: Check dashboard to see recorded conversions

## Example Integration

```javascript
// 1. Track click
fetch('/api/click?affiliate_id=1&click_id=user123_' + Date.now())

// 2. On conversion, send postback
fetch('/api/postback?affiliate_id=1&click_id=user123_1234567890&amount=99.99&currency=USD')
```

## Error Handling

- **404**: Click ID not found for affiliate
- **409**: Duplicate click ID or conversion already recorded
- **400**: Missing required parameters
- **500**: Server errors

## Development

- Backend runs on port 3001
- Frontend runs on port 3000
- API calls are proxied from frontend to backend via Next.js rewrites
- Hot reloading enabled for both frontend and backend

## Production Deployment

1. Set production NeonDB connection string in backend/.env
2. Ensure NODE_ENV=production for proper SSL handling
3. Build both applications:
   ```bash
   npm run build
   ```
4. Start production servers or deploy to your preferred platform

### NeonDB Production Notes
- NeonDB automatically handles SSL in production
- Free tier includes 3 GiB storage and 100 hours compute/month
- Scales to zero when not in use (cost-effective)
- Built-in connection pooling and backup

## Contributing

This is a minimal implementation. Feel free to extend with additional features like:
- Authentication
- Rate limiting
- Webhook signatures
- Real-time dashboard updates
- Advanced reporting
