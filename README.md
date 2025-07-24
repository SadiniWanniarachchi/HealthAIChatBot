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
   npm install
   # Copy the environment template and fill in your actual values
   cp .env.example .env
   # Edit .env with your actual credentials (see Environment Variables section below)
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create .env file with your environment variables (optional)
   npm run dev
   ```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AI Health Diagnosis Chatbot
VITE_APP_VERSION=1.0.0
```

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

1. Copy the example file: `cp backend/.env.example backend/.env`
2. Fill in your actual values in the `.env` file
3. Never commit the actual `.env` file - it's already in `.gitignore`

## 📁 Project Structure

```
HealthAIChatBot/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
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
