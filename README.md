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
   # Create .env file with your environment variables
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create .env file with your environment variables
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

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT_SECRET (minimum 32 characters)
- Use MongoDB Atlas with proper IP whitelisting
- Enable 2FA on your MongoDB Atlas account

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
