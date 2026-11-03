# Kindred Server

This is the backend (REST API) for **Kindred**, a community event platform where people create, join and track social service events around them.

Built with Express, TypeScript and MongoDB. Login itself happens on the Next.js client with Better Auth, this server only checks the JWT that Better Auth gives.

- **Live site:** https://kindred-events.vercel.app
- **Live API:** https://kindred-server-nine.vercel.app (try [`/api/events`](https://kindred-server-nine.vercel.app/api/events))
- **Client repo:** https://github.com/Md-Foisal/kindred-client

## How auth works here

1. User logs in on the client (email/password, Google or GitHub).
2. Client asks Better Auth for a short JWT (`/api/auth/token`).
3. Client sends it as `Authorization: Bearer <token>`.
4. Server verifies the token with the client's public keys (`/api/auth/jwks`), no shared secret needed.

## API

| Method | Route | Auth | What it does |
| --- | --- | --- | --- |
| GET | `/api/events?search=&type=` | no | upcoming events, soonest first |
| GET | `/api/events/recent` | no | 6 upcoming events for the home page (`.limit(6)`) |
| GET | `/api/events/:id` | no | one event with joined count |
| POST | `/api/events` | yes | create event (date must be in future) |
| GET | `/api/events/mine` | yes | events I created |
| PATCH | `/api/events/:id` | yes (owner) | update my event |
| DELETE | `/api/events/:id` | yes (owner) | delete my event and its joins |
| GET | `/api/events/:id/join-status` | yes | did I join this one |
| POST | `/api/events/:id/join` | yes | join an event |
| DELETE | `/api/events/:id/join` | yes | leave an event |
| GET | `/api/joined` | yes | events I joined, sorted by event date |

## Run it locally

```bash
npm install
cp .env.example .env   # then fill the values
npm run dev
```

## Env variables

- `MONGODB_URI` - mongodb atlas connection string
- `DB_NAME` - database name (same db the client uses)
- `CLIENT_URL` - url of the next.js app, used for cors and for checking the jwt
- `PORT` - local port, default 5000

## Deploy

Deployed on Vercel as a normal Express app (`src/index.ts` exports the app).
