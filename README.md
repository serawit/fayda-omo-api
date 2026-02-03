# Fayda Connect | Omo Bank S.C.

A secure digital harmonization platform that links **Omo Bank S.C.** customer accounts with Ethiopia’s **Fayda National Digital ID**. The system enables identity verification, OTP-based authentication, and secure data synchronization with the National ID Program and the bank’s Core Banking System.

## ✨ Highlights

* 🔐 **Secure Account Verification** — Multi‑factor authentication with SMS OTP tied to Core Banking records
* 🪪 **Fayda OIDC Integration** — Standards‑compliant (OIDC + PKCE) identity harmonization
* 🏦 **Core Banking Sync** — Real‑time validation and profile lookups against **Oracle Flexcube**
* 🌍 **Multi‑language UI** — English & Amharic (i18n ready)
* 📱 **Progressive Web App (PWA)** — Installable, offline‑aware, mobile‑first
* 🛡️ **Bank‑Grade Security** — Secure sessions, rate limiting, JWT/JWE, full audit logging


## 🧭 Architecture Overview


[ User (Web / PWA) ]
        |
        v
[ React Frontend ]
        |
        v
[ Node.js / Express API ]
   |            |
   |            +--> Oracle Flexcube (Core Banking)
   |
   +--> MongoDB (Sessions, Users, Audit Logs)
   |
   +--> Fayda OIDC Provider (Auth + Identity)



## 🛠️ Tech Stack

### Frontend

* **Framework**: React (Vite)
* **Styling**: Tailwind CSS
* **Routing**: React Router DOM
* **State & i18n**: i18next
* **PWA**: Web Manifest & Service Worker

### Backend

* **Runtime**: Node.js (v18+), Express
* **Databases**:

  * MongoDB — session store, users, audit logs
  * Oracle DB — Core Banking (Flexcube) lookup
* **Validation**: Zod
* **Security**: Helmet, CORS, Express Rate Limit, JOSE (JWT/JWE)


## 📋 Prerequisites

* Node.js **v18+**
* MongoDB (Local or Atlas)
* Oracle Instant Client (for Flexcube connectivity)
* Network/VPN access to Core Banking DB
* Git


## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

bash
git clone https://github.com/serawit/fayda-omo-api.git
cd fayda-omo-api


### 2️⃣ Backend Setup

bash
cd backend
npm install


Create a `.env` file inside `backend/`:

env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DB_URI=mongodb://127.0.0.1:27017/fayda-omo-db

# Fayda OIDC Configuration
FAYDA_BASE_URL=https://auth.fayda.et
FAYDA_CLIENT_ID=your_client_id
FAYDA_CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://localhost:5000/auth/fayda/callback

# Oracle Core Banking (Flexcube)
ORACLE_USER=your_db_user
ORACLE_PASSWORD=your_db_password
ORACLE_CONNECT_STRING=10.10.x.x:1521/SERVICE_NAME
FORCE_MOCK_CBS=false

# Security
JWT_SECRET=your_super_secret_key


Run the backend server:

bash
npm run dev



### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Access the application at:

👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔒 Security Considerations

* ❗ **Never commit `.env` files** or secrets to version control
* 🔐 All authentication flows use **OIDC + PKCE**
* ⏱️ Rate limiting and session expiry are enforced
* 🧾 Sensitive operations (OTP, login, harmonization) are **audit‑logged**
* 🌐 Backend must run within a trusted network for Oracle access

---

## 📁 Project Structure (Simplified)

```
backend/
 ├─ src/
 │  ├─ auth/
 │  ├─ fayda/
 │  ├─ cbs/
 │  ├─ users/
 │  └─ audit/
 └─ server.ts

frontend/
 ├─ src/
 │  ├─ pages/
 │  ├─ components/
 │  ├─ i18n/
 │  └─ services/
 └─ main.tsx
```

---

## 🤝 Contributing

This repository follows internal banking security and compliance standards.

* Please read **CONTRIBUTING.md** before submitting any changes
* All pull requests require security review
* No production credentials or real customer data should ever be used

---

## 📄 License

© 2026 **Omo Bank S.C.**

This project is **proprietary and confidential** unless explicitly stated otherwise.
Unauthorized copying, modification, distribution, or use is strictly prohibited.

---

## 📬 Contact

For access requests or technical inquiries:

* **Omo Bank Digital Banking & Integration Team**
Senior Full Stack Developer Serawit Seba
Phone:0913996975
Email:serawit.info@gmail.com, serjo.info@gmail.com
---

> *Fayda Connect is part of Omo Bank’s digital identity harmonization initiative aligned with Ethiopia’s National ID Program.*
