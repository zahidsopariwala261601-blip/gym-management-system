# 🏋️ Gym Fee & Membership Management System — Fresh PC Setup Guide

This guide explains how to install and run the **Gym Fee & Membership Management System** on a brand-new or fresh computer (Windows / Mac / Linux).

---

## 📋 System Requirements

Before running the setup, ensure the computer has:

1. **Node.js** (Version 18.x, 20.x, or higher)
   * Download & Install from: [https://nodejs.org/](https://nodejs.org/) (Choose the LTS version)
   * Verify by opening terminal/command prompt and typing:
     ```bash
     node -v
     npm -v
     ```
2. **Web Browser** (Google Chrome, Microsoft Edge, Mozilla Firefox, or Brave)
3. **Git** *(Optional, if cloning repository)*: [https://git-scm.com/](https://git-scm.com/)

---

## ⚡ Quick 1-Click Setup (Windows)

If you are on Windows:

1. Copy or extract the **Gym Management System** project folder to your computer (e.g. `C:\GymApp` or `D:\The GYM`).
2. Double-click the file **`setup.bat`**.
   * It will automatically install dependencies (`npm install`).
   * Initialize the database (`dev.db`).
   * Seed the default plans, WhatsApp templates, and demo accounts.
   * Build the project and open **http://localhost:3000/login** in your browser.
3. Daily usage: In the future, just double-click **`start.bat`** to start the app instantly!

---

## 💻 Manual Setup Instructions (Terminal / PowerShell / Command Prompt)

If you prefer setting up via terminal:

### Step 1: Open Terminal in Project Directory
```powershell
cd "d:\Antigravity\The GYM"
```

### Step 2: Create `.env` Configuration
Create a `.env` file in the root folder with:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="gym_management_super_secure_jwt_secret_key_2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Setup Database & Seed Initial Data
```bash
npx prisma db push
node prisma/seed.js
```

### Step 5: Build & Start the Production Server
```bash
npm run build
npm start
```

Your system is now active at: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Default Login Credentials

| Role | Email | Password | What They Can Do |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@gym.com` | `admin123` | Full access to Backups, Restore, Settings, Staff Users, Reports & Ledgers |
| **Staff / Receptionist** | `staff@gym.com` | `staff123` | Member enrollment, Fee collections, Due queues, WhatsApp reminders |

---

## 🛡️ Backup & Security Highlights

* **Local Snapshots**: Automatic and manual backups saved in `backups/local/`.
* **Google Drive Sync**: Remote backup redundancy configured in **Settings**.
* **Master Excel Export**: Download full system tables into Excel from **Backup & Restore** or **Reports**.
* **Safe Restore**: Every restore operation automatically creates a safety snapshot before restoring.
