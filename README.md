# Bethel Gen Client Services Portal

**Digitizing Client Services: An Application Portal for Bethel General Insurance and Surety Corporation — Legazpi Branch**

> BSIT Capstone Project — Bicol University College of Science, Information Technology Department

---

## The Team

| Name | Role |
|---|---|
| Marco, Marjorie A. | Project Leader |
| Apin, Kimberly N. | Member |
| Camota, John Erick M. | Member |
| Manzanillo, Lance Gabriele M. | Member |

**Content Adviser:** Dr. Jayvee Christopher N. Vibar  
**Programming Adviser:** Dr. Franklin Miranda

---

## About the System

A full-stack web application that digitizes the client-facing services of the Bethel General Insurance and Surety Corporation — Legazpi Branch. Clients can apply for policies, file and track claims, upload and validate documents using AI, message branch staff, and receive notifications — all through a secure online portal.

**Tech Stack:**
- **Frontend:** React 18 + Vite 5 + Tailwind CSS
- **Backend:** Laravel 9 (PHP 8.2) REST API
- **Database:** MySQL 8.x
- **Auth:** Laravel Sanctum (token-based RBAC)
- **Real-time:** Interval-based polling (Axios)
- **AI:** LLM API — Groq (Llama 3.3) or Google Gemini Flash

---

## Prerequisites

Install these on your machine before setup:

| Software | Version | Download |
|---|---|---|
| XAMPP | 8.2+ | https://www.apachefriends.org |
| Composer | 2.x | https://getcomposer.org |
| Node.js | 20 LTS | https://nodejs.org |
| Git | Any | https://git-scm.com |

### PHP Extensions Required

Open `C:\xampp\php\php.ini` and make sure these lines are active (no leading semicolon):

```
extension_dir = "C:\xampp\php\ext"
extension=curl
extension=fileinfo
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=zip
```

---

## Getting Started

### Step 1 — Clone the repository

```bash
git clone https://github.com/gimbapp06/bethel-gen-portal.git
cd bethel-gen-portal
```

---

### Step 2 — Start XAMPP

1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL**
3. Open phpMyAdmin: `http://localhost/phpmyadmin`
4. Create a new database named: `bethel_portal`

---

### Step 3 — Backend Setup

Open a CMD window and navigate to the backend folder:

```bash
cd backend
```

**Install PHP dependencies:**
```bash
composer install --ignore-platform-reqs
```

**Copy and configure the environment file:**
```bash
copy .env.example .env
notepad .env
```

Fill in these values and save:
```
DB_DATABASE=bethel_portal
DB_USERNAME=root
DB_PASSWORD=           ← leave blank for default XAMPP
LLM_BASE_URL=          ← see AI Setup below
LLM_API_KEY=           ← see AI Setup below
LLM_MODEL=             ← see AI Setup below
FRONTEND_URL=http://localhost:5173
```

**Generate the application key:**
```bash
php artisan key:generate
```

**Run migrations and seed demo data:**
```bash
php artisan migrate --seed
```

> If you see a duplicate entry error, run instead:
> ```bash
> php artisan migrate:fresh --seed
> ```

**Create storage folders:**
```bash
mkdir storage\app\private
mkdir storage\app\private\documents
```

**Create the storage symlink:**
```bash
php artisan storage:link
```

**Start the backend server:**
```bash
php artisan serve
```

The API will run at: `http://localhost:8000` — keep this window open.

---

### Step 4 — Frontend Setup

Open a **second CMD window** and navigate to the frontend folder:

```bash
cd frontend
```

**Install Node.js dependencies:**
```bash
npm install
```

**Copy the environment file:**
```bash
copy .env.example .env
```

**Start the Vite development server:**
```bash
npm run dev
```

The portal will run at: `http://localhost:5173` — keep this window open.

---

### Step 5 — Open the System

Open your browser and go to: `http://localhost:5173`

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@bethelgen.com | Admin@1234 |
| Client | juan@gmail.com | Client@1234 |

Toggle between **Client** and **Admin** tabs on the login page before entering credentials.

---

## AI Setup (Optional)

The AI document validation and FAQ chatbot work with either of two free services.

### Option A — Groq (Free, no card required)

1. Go to `https://console.groq.com` and sign up
2. Create an API key
3. Set in `backend/.env`:

```
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=gsk_your-key-here
LLM_MODEL=llama-3.3-70b-versatile
```

### Option B — Google Gemini (Free, reads images — better validation)

1. Go to `https://aistudio.google.com/apikey` (use a personal Gmail)
2. Click **Create API key**
3. Set in `backend/.env`:

```
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
LLM_API_KEY=AIza-your-key-here
LLM_MODEL=gemini-2.0-flash
```

Then clear the config cache and restart:
```bash
php artisan config:clear
php artisan serve
```

> **Without an AI key:** documents show as "Pending Review" and all other features work normally.

---

## Quick Command Reference

| Command | What it does |
|---|---|
| `php artisan serve` | Start backend at localhost:8000 |
| `php artisan migrate --seed` | Create tables and insert demo data |
| `php artisan migrate:fresh --seed` | Drop all tables, recreate, reseed |
| `php artisan key:generate` | Generate APP_KEY in .env |
| `php artisan storage:link` | Create public storage symlink |
| `php artisan config:clear` | Clear cached config |
| `composer install --ignore-platform-reqs` | Install PHP dependencies |
| `npm install` | Install Node.js dependencies |
| `npm run dev` | Start Vite dev server at localhost:5173 |

---

## Access URLs

| URL | Description |
|---|---|
| `http://localhost:5173` | Landing Page (public) |
| `http://localhost:5173/login` | Login Page |
| `http://localhost:5173/client` | Client Portal (requires login) |
| `http://localhost:5173/admin` | Admin Portal (requires login) |
| `http://localhost:8000/api/products` | Test API is running |

---

## Accessing from a Phone (same WiFi)

1. Find your laptop IP: run `ipconfig`, look for **IPv4 Address**
2. Make sure `frontend/vite.config.js` has `host: true` in the server block
3. Allow ports `5173` and `8000` through Windows Firewall (Inbound Rules)
4. On your phone (same WiFi): open `http://192.168.x.x:5173`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `composer` not recognized | Install Composer from getcomposer.org, restart CMD |
| `npm` not recognized | Install Node.js from nodejs.org, restart CMD |
| PHP extension errors | Enable extensions in `php.ini`, set `extension_dir` |
| Access denied for root | Set `DB_PASSWORD=` (blank) in `.env` |
| Duplicate entry error | Run `php artisan migrate:fresh --seed` |
| 500 error on API calls | Check backend CMD for error details |
| CORS error in browser | Set `FRONTEND_URL=http://localhost:5173` in `.env`, restart server |
| AI always shows Pending Review | Check `LLM_API_KEY` in `.env`, run `php artisan config:clear` |
| Buttons not working on landing page | Hard refresh: Ctrl + Shift + R |

---

## Notes

- All data used in demos is simulated and anonymized
- The system runs entirely on localhost — no internet needed (except for AI features)
- Uploaded documents are stored in `backend/storage/app/private/documents/`
- Tested on PHP 8.2.x and Node.js 20 LTS on Windows

---

*Bicol University College of Science — Information Technology Department — Legazpi City, Albay*
