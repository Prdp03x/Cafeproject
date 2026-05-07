# SOS Cafe Ordering

Full-stack cafe ordering app with a React/Vite frontend and an Express/MongoDB backend.

## Project Structure

```text
sos/
  backend/                 Express API, MongoDB models, auth, Socket.IO
    config/                Database and Passport configuration
    controllers/           Route handlers and business logic
    middleware/            Express middleware
    models/                Mongoose schemas
    routes/                API route definitions
    server.js              Backend entry point
  frontend/                React customer/admin app
    public/                Static public assets
    src/
      api/                 Axios API client
      assets/              App images and sounds imported by React
      components/
        Admin/             Admin dashboard components
        Cart/              Cart and checkout components
        Common/            Shared app components
        Dashboard/         Dashboard components
        Loader/            Loading placeholders
        Menu/              Menu browsing and ordering components
      hooks/               Reusable React hooks
      pages/               Route-level screens
      App.jsx              Frontend route tree
```

## Development

Install dependencies once in each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create local env files from the examples:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Run the backend:

```bash
cd backend
npm start
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
