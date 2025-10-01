# Finch HR Integration

A React frontend with Node.js backend that integrates with Finch's HR API to display company and employee data.

## Quick Start

### Prerequisites
- Node.js (v14+)
- Finch API credentials

### Setup

1. **Clone and install dependencies:**
```bash
# Backend
cd back-end
npm install

# Frontend  
cd ../my-app
npm install
```

2. **Environment setup:**
```bash
# In back-end/ directory, create .env file:
FINCH_CLIENT_ID=your_client_id
FINCH_CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://localhost:4000/finch/callback
```

3. **Start the servers:**
```bash
# Terminal 1 - Backend (port 4000)
cd back-end
nodemon server.js

# Terminal 2 - Frontend (port 3000)
cd my-app
npm start
```

4. **Open the app:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000

## Screenshots

![App Screenshot](screenshot.png)
*Main application interface showing company info and employee directory*

## How it works

1. Click "Connect with Finch" to start OAuth flow
2. Complete Finch Connect in popup window
3. App fetches and displays company info and employee directory
4. Click any employee to see detailed individual + employment data

## Important Notes

- **Customer ID**: The customer ID in `server.js` must be unique for each new authorization. Update the `customer_id` field in the Finch Connect session creation to avoid conflicts.
- **Production**: In production, customer IDs should be dynamically generated per user/company and stored in a database instead of hardcoded values.

## API Endpoints

- `GET /company` - Company information
- `GET /directory` - Employee directory
- `GET /employee/:id` - Individual employee details (parallel API calls)

## Tech Stack

- **Frontend:** React, Axios
- **Backend:** Node.js, Express, Finch API
- **Auth:** Finch OAuth 2.0