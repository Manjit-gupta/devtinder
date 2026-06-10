# API Endpoints

## Auth APIs
- `POST /signup` — Register a new user
- `POST /login` — Login user

## Profile APIs
- `GET /profile/view` — View profile
- `PATCH /profile/edit` — Edit profile
- `PATCH /profile/password` — Change password

## User APIs
- `GET /user/requests/received` — Get received connection requests
- `GET /user/connections` — Get user connections
- `GET /feed` — Get user feed

## Request APIs
- `POST /request/send/:status/:toUserId` — Send connection request (status: Ignore/Interested)

---
**Note:** All endpoints except `/signup` and `/login` require authentication.
