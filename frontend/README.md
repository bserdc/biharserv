# BSEDRC frontend

React/Vite client for the Student Zone. In local development, the Vite dev server proxies `/api` to `http://localhost:3000`, so the frontend and backend can run as separate repos without extra wiring. For production, set `VITE_API_BASE_URL` to the backend origin.

```text
npm run dev
npm run lint
npm run build
```

## Local connection setup

1. Start the backend from `backend/` on port `3000`.
1. Start the frontend from `frontend/`.
1. If you deploy the frontend separately, set `VITE_API_BASE_URL` to the deployed backend URL.
