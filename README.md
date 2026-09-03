# DYPConnect
**Connect. Collaborate. Grow Together.**

DYPConnect is a professional networking platform built exclusively for the D. Y. Patil College community — connecting **students**, **teachers/faculty**, and **alumni** in one place, similar in spirit to LinkedIn but focused on a single college ecosystem.

This project is being developed as a MERN Stack Lab mini-project, with the long-term goal of evolving it into a real, deployable platform.

---

## 🚀 Tech Stack

**Frontend**
- React.js (Vite)
- JavaScript
- HTML / CSS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Authentication** *(coming in a later phase)*
- bcrypt (password hashing)
- JWT (session tokens)

**Real-time Communication** *(coming in a later phase)*
- Socket.io

**Version Control**
- Git & GitHub

---

## 📂 Project Structure

```
DYPConnect/
├── client/              # React frontend (Vite)
│   ├── src/
│   ├── index.html
│   └── package.json
│
├── server/               # Node.js + Express backend
│   ├── server.js
│   ├── .env              # Environment variables (not committed)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ✨ Planned Features

- Professional profiles (skills, projects, achievements)
- Post creation, likes, and comments
- Connection requests & mutual connections
- People recommendations
- Search
- Real-time chat
- Internship & event discovery
- Alumni networking
- Notifications

> Features are being built incrementally, phase by phase — not all at once.

---

## 🧑‍🤝‍🧑 User Roles

DYPConnect supports three roles:

| Role | Description |
|---|---|
| **Student** | Department, Year |
| **Teacher** | Department, Designation |
| **Alumni** | Department, Graduation Year, Current Company & Role |

---

## 🛠️ Getting Started (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Sahilpatil2320/DYPConnect.git
cd DYPConnect
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```
PORT=5000
```

Run the backend:
```bash
npm run dev
```
Server will start at `http://localhost:5000`

### 3. Set up the frontend
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
Frontend will start at `http://localhost:5173`

### 4. Verify it's working
- Frontend: visit `http://localhost:5173`
- Backend test route: visit `http://localhost:5000/api/test` → should return:
```json
{ "message": "DYPConnect backend is working!" }
```

---

## 🗺️ Development Roadmap

| Phase | Focus |
|---|---|
| 1 | Foundation (MERN setup) |
| 2 | UI (Landing page, auth screens) |
| 3 | Authentication (Register/Login, JWT) |
| 4 | Profiles |
| 5 | Posts |
| 6 | Connections |
| 7 | Recommendations |
| 8 | Real-time Chat |
| 9 | Opportunities (Internships/Events) |
| 10 | Notifications |
| 11 | Admin Panel |
| 12 | Production & Scaling |

---

## 📌 Development Philosophy

```
Simple → Working → Tested → Git Commit → GitHub Push → Improve → Scale
```

Built one step at a time, with clean, understandable, and maintainable code — prioritizing correctness over premature complexity.

---

## 👤 Author

**Sahil Patil**
Final-year Computer Science student, D. Y. Patil College

---