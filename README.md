# AI Health Diagnosis Chatbot

A modern healthcare AI assistant built with React, Node.js, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SadiniWanniarachchi/HealthAIChatBot.git
   cd HealthAIChatBot
   ```

2. **Backend Setup**
   ```bash
   cd backend
   # Copy the environment template and fill in your actual values
   copy .env.example .env
   # Edit .env with your actual credentials (see Environment Variables section below)
   npm install
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend  # or open new terminal in frontend folder
   npm install
   npm run dev
   ```

## 🔧 Environment Variables

The backend uses its own `.env` file located in the `backend/` directory.

### Backend Environment Configuration (`backend/.env`)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database Configuration (CRITICAL: Use NEW password)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_NEW_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE

# JWT Authentication
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Setup Instructions:
1. Go to `backend/` directory: `cd backend`
2. Copy the example file: `copy .env.example .env`
3. Edit the `.env` file with your actual credentials
4. **IMPORTANT**: Use a NEW MongoDB password (not the exposed one)

## 🔒 Security Notes

⚠️ **CRITICAL SECURITY REMINDERS:**

- **NEVER commit `.env` files to version control** - They contain sensitive credentials
- Always use `.env.example` files as templates for other developers
- **Change all default passwords immediately** - Especially if you've accidentally exposed them
- Use strong, unique secrets for JWT_SECRET (minimum 32 characters) - Generate at https://generate-secret.vercel.app/32
- Use MongoDB Atlas with proper IP whitelisting and strong passwords
- Enable 2FA on your MongoDB Atlas account and all related services
- Regularly rotate your credentials as a security best practice

### Setting up Environment Variables

1. **Backend Setup**:
   - Navigate to backend: `cd backend`
   - Copy the example file: `copy .env.example .env`
   - Edit `backend/.env` with your actual credentials
   - **CRITICAL**: Change your MongoDB password first!

2. **Frontend Setup** (optional):
   - The frontend can use environment variables if needed
   - Create `frontend/.env` if you need custom API URLs

3. **Never commit actual `.env` files** - they're already in `.gitignore`

## 📁 Project Structure

```
HealthAIChatBot/
├── .env.example          # Environment variables template
├── .env                  # Your actual environment variables (never commit)
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## 🛠️ Technologies Used

- **Frontend**: React 19, Vite, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT with bcrypt
- **Email**: Nodemailer
- **Deployment**: Ready for Vercel/Netlify (frontend) and Heroku/Railway (backend)

## 📧 Contact

For questions or support, please contact: [your-email@domain.com]
