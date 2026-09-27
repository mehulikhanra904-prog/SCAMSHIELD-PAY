# 🛡️ ScamShield Pay

> **Pause. Check. Stay protected.** ScamShield Pay helps people inspect suspicious messages before they click a link, share account details, or send money.

ScamShield Pay is a React web app backed by an Express API. Its rule-based analysis looks for scam signals in text and URLs, explains the evidence it finds, assigns a risk score and category, and offers practical safety steps. When MongoDB is connected, scans are saved for history and repeated-campaign analysis.

## 🌐 Live app

- **Frontend:** [Open ScamShield Pay](https://scamshield-pay-one.vercel.app/)
- **Backend API:** [Open the API](https://scamshield-pay.onrender.com/api)
- **Health check:** [Check API and database status](https://scamshield-pay.onrender.com/api/health)

The frontend is deployed on Vercel. The Express API is deployed on Render.

## ✨ Features

- **Message risk analysis** — Analyze a text message, email, job offer, payment request, or other suspicious communication.
- **Risk score and level** — Get a score from 0 to 100 with a Low, Moderate, High, or Critical label.
- **Explainable signals** — Review matched signals such as urgency, payment requests, credential requests, threats, reward bait, and suspicious links.
- **Scam category suggestions** — Check for patterns related to bank/KYC, UPI/payment, account takeover, job, reward/cashback, investment, delivery, loan, tech support, and government impersonation scams.
- **URL inspection** — Flags indicators such as unencrypted HTTP, raw IP addresses, URL shorteners, punycode, suspicious URL structure, redirect parameters, and sensitive-action terms.
- **Brand impersonation clues** — Compares recognized organization names in the message with domains in its links.
- **Campaign fingerprints** — Groups messages with similar categories and observable tactics under a repeatable campaign ID.
- **Threat context** — Presents a matching threat profile, possible target, explanation, and related campaign context.
- **Recommended next steps** — Shows risk-based advice and protection actions.
- **Scan history and campaign counts** — Stored scans can be viewed and compared when the MongoDB connection is available.
- **Emergency-response guidance and protection mode** — The interface includes additional guidance to help users respond cautiously.

The analyzer uses transparent text and URL heuristics. It is decision support, not a guarantee that a message is safe or fraudulent.

## 🧭 How to use it

1. Open ScamShield Pay.
2. Paste the suspicious message into the scanner.
3. Select the analyze action.
4. Review the score, category, explanations, links, and protection recommendations.
5. Verify important requests through an official app, website, or known contact method before acting.

The API accepts message text up to **5,000 characters**.

## 🧰 Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, CSS |
| Backend | Node.js, Express 5 |
| Database and history | MongoDB with Mongoose |
| HTTP client | Axios |
| Hosting | Vercel (frontend), Render (backend) |

## 📁 Project structure

```text
.
├── backend/
│   ├── controllers/scanController.js
│   ├── models/Scan.js
│   ├── routes/scanRoutes.js
│   ├── services/
│   │   ├── scamEngine.js
│   │   └── threatIntelligence.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/Home.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── package.json
└── package-lock.json
```

## ⚙️ Run locally

### Prerequisites

- Node.js and npm
- MongoDB connection string for persistent scan history (optional for message analysis)

### 1. Start the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
CLIENT_URL=http://localhost:5173
```

Then start the API:

```bash
npm run dev
```

The API listens on `http://localhost:5000`. Its health endpoint is `http://localhost:5000/api/health`.

MongoDB is optional for core message analysis. If it is disconnected, the API can return a result but will not save the scan or provide database-backed campaign counts.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## 🔌 API reference

### Health

```http
GET /api/health
```

Returns whether the API is responding and whether MongoDB is connected.

### Analyze a message

```http
POST /api/scan/analyze
Content-Type: application/json
```

Request:

```json
{
  "message": "Your bank account is blocked. Verify your details at http://example.test within 2 hours."
}
```

Successful response (shape):

```json
{
  "success": true,
  "data": {
    "riskScore": 75,
    "riskLevel": "High",
    "category": "Bank / KYC Scam",
    "signals": [],
    "urlAnalysis": {},
    "impersonation": {},
    "campaignAnalysis": {},
    "riskSummary": "Detected measurable warning signals.",
    "recommendation": "Verify the sender independently.",
    "protectionActions": []
  },
  "database": "connected"
}
```

When MongoDB is unavailable, the API can still return an analysis with `database: "disconnected"` and a warning that the scan was not saved. Invalid or empty messages are rejected; messages longer than 5,000 characters are rejected.

The older `/api/scans/analyze` route is also mounted as a compatibility alias.

## 🚀 Deployment

### Render backend

The existing Render web service is connected to this repository's `main` branch.

- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Required for persistent history:** set `MONGO_URI` in the Render service's environment variables.
- **Optional CORS configuration:** set `CLIENT_URL` to the deployed frontend origin.

Keep database credentials in Render environment settings. Never commit a real `MONGO_URI` or other secrets.

### Vercel frontend

The frontend is in the `frontend` directory.

- **Framework preset:** Vite
- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **API environment variable:** `VITE_API_URL=https://scamshield-pay.onrender.com/api`

The frontend also uses the Render API URL as its default if `VITE_API_URL` is not set. Vercel can build the frontend from its own package manifest and lockfile.

### Free-tier note

Render free web services can spin down when idle. The first request after inactivity may take longer while the backend starts.

## 🔐 Privacy and safe use

When MongoDB is connected, the current backend stores the submitted message, analysis, and timestamps in the `Scan` collection so the interface can provide history and campaign aggregation. Do not paste passwords, OTPs, payment PINs, or private information into the scanner.

ScamShield Pay can miss scams or flag legitimate messages. Verify unexpected requests independently, and do not use an automated score as the only basis for a financial or security decision.

## 🧪 Development scripts

- Backend: `npm run dev` starts the API with Nodemon; `npm start` starts it normally.
- Frontend: `npm run dev` starts Vite; `npm run build` creates the production bundle; `npm run lint` runs ESLint; `npm run preview` previews a local production build.
- The root package contains project dependencies; run frontend and backend commands from their own directories.

## 📄 License

The root `package.json` declares the ISC license. See the repository's licensing files and package metadata for applicable terms.
