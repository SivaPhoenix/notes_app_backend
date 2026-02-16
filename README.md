# Notes App Backend

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file:
   ```bash
   ACCESS_TOKEN_SECRET=your-jwt-secret
   MONGO_URI=your-mongodb-connection-string
   PORT=8080
   ```
3. Start server:
   ```bash
   npm start
   ```

## Deployment checklist

- Set `ACCESS_TOKEN_SECRET` in your hosting environment.
- Set `MONGO_URI` in your hosting environment (recommended over hardcoded values).
- Set `PORT` only if your platform requires a fixed port; otherwise most platforms inject this automatically.
- Verify deployment health with:
  - `GET /health` should return `200` and `{ status: "ok", database: "connected" }`.

## Login timeout troubleshooting

If login shows a timeout in the client:

- Check `GET /health`.
- If database is disconnected, verify the `MONGO_URI` value and network/IP allowlist on MongoDB Atlas.
- Review backend logs for `MongoDB connection failed` or `MongoDB runtime error` messages.
