# 🏥 AI Health Diagnosis Chatbot

<div align="center">

![Health AI Chatbot](https://img.shields.io/badge/Health-AI%20Chatbot-blue?style=for-the-badge&logo=healthcare&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, intelligent healthcare assistant that provides AI-powered medical consultations, health monitoring, and personalized health insights.**

[🚀 Live Demo](#-live-demo) • [📖 Documentation](#-documentation) • [🛠️ Installation](#️-installation) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 Features

### 🤖 **AI-Powered Health Assistant**
- **Intelligent Diagnosis**: Advanced AI chatbot for symptom analysis and health guidance
- **Real-time Consultation**: Instant medical advice and health recommendations
- **Multi-symptom Analysis**: Comprehensive health assessment based on multiple symptoms

### 📊 **Health Dashboard**
- **Visual Health Metrics**: Modern circular progress charts for BMI, blood pressure, cholesterol, and diabetes status
- **Real-time Monitoring**: Live health data visualization and tracking
- **Personalized Insights**: Customized health recommendations based on user profile

### 👤 **User Management**
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Health Profile Management**: Comprehensive user health data management
- **Consultation History**: Complete record of past medical consultations

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with seamless cross-device experience
- **Smooth Animations**: Framer Motion powered animations for enhanced user experience
- **Clean Interface**: Modern, intuitive design with TailwindCSS styling

---

## 🏗️ Architecture

```mermaid
graph TB
    A[React Frontend] --> B[Express.js API]
    B --> C[MongoDB Database]
    B --> D[AI Health Engine]
    B --> E[JWT Authentication]
    B --> F[Email Service]
    
    A --> G[TailwindCSS Styling]
    A --> H[Framer Motion Animations]
    A --> I[React Router Navigation]
```

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - Modern UI library with latest features
- **Vite** - Lightning-fast build tool and development server
- **TailwindCSS 4.1** - Utility-first CSS framework
- **Framer Motion 12** - Production-ready motion library
- **React Router 7** - Declarative routing for React
- **Lucide React** - Beautiful, customizable SVG icons
- **Axios** - Promise-based HTTP client

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB Atlas** - Cloud-native database service
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - Secure token-based authentication
- **bcryptjs** - Password hashing and security
- **Nodemailer** - Email sending capabilities

### **Development & Security**
- **ESLint** - Code linting and quality assurance
- **Helmet.js** - Security middleware for Express
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection against abuse
- **Environment Variables** - Secure configuration management

---

## 🚀 Quick Start

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn**
- **MongoDB Atlas** account
- **Git** for version control

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SadiniWanniarachchi/HealthAIChatBot.git
   cd HealthAIChatBot
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Install dependencies
   npm install
   
   # Setup environment variables
   copy .env.example .env
   # Edit .env with your actual credentials (see Environment Variables section)
   
   # Start the development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   # Open a new terminal and navigate to frontend
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## 🔧 Environment Configuration

### Backend Environment Variables (`backend/.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# AI Service Configuration (if applicable)
AI_API_KEY=your_ai_service_api_key
AI_BASE_URL=https://api.your-ai-service.com
```

### Security Best Practices

⚠️ **Important Security Notes:**

- **Never commit `.env` files** - they contain sensitive credentials
- Use strong, unique passwords for all services
- Generate secure JWT secrets: [JWT Secret Generator](https://generate-secret.vercel.app/32)
- Enable MongoDB Atlas IP whitelisting
- Use 2FA on all cloud service accounts
- Regularly rotate API keys and passwords

---

## 📁 Project Structure

```
HealthAIChatBot/
├── 📁 backend/                 # Node.js Express API
│   ├── 📁 config/             # Database and app configuration
│   ├── 📁 controllers/        # Request handlers and business logic
│   ├── 📁 middleware/         # Authentication and security middleware
│   ├── 📁 models/             # MongoDB schemas and models
│   ├── 📁 routes/             # API route definitions
│   ├── 📁 services/           # Business logic and external services
│   ├── 📄 server.js          # Application entry point
│   └── 📄 package.json       # Backend dependencies
│
├── 📁 frontend/               # React application
│   ├── 📁 public/            # Static assets
│   ├── 📁 src/               # Source code
│   │   ├── 📁 components/    # Reusable UI components
│   │   ├── 📁 context/       # React context providers
│   │   ├── 📁 pages/         # Page components
│   │   ├── 📁 services/      # API calls and external services
│   │   ├── 📁 utils/         # Utility functions
│   │   └── 📄 main.jsx      # Application entry point
│   ├── 📄 index.html        # HTML template
│   ├── 📄 package.json      # Frontend dependencies
│   └── 📄 vite.config.js    # Vite configuration
│
├── 📄 README.md              # Project documentation
├── 📄 .gitignore            # Git ignore rules
└── 📄 LICENSE               # MIT License
```

---

## 🎯 Key Features Breakdown

### 1. **Authentication System**
- User registration and login
- JWT-based secure authentication
- Password encryption with bcrypt
- Protected routes and middleware

### 2. **Health Dashboard**
- Real-time health metrics visualization
- Interactive circular progress charts
- BMI calculation and categorization
- Blood pressure monitoring
- Cholesterol level tracking
- Diabetes status assessment

### 3. **AI Chatbot**
- Natural language processing for symptoms
- Intelligent health recommendations
- Conversation history tracking
- Multi-turn conversation support

### 4. **User Profile Management**
- Comprehensive health profile creation
- Medical history tracking
- Personal information management
- Profile picture upload (if implemented)

---

## � Live Demo

🌐 **[View Live Application](https://your-deployed-app-url.com)**

### Demo Credentials
```
Email: demo@healthai.com
Password: demo123
```

*Note: Demo data is reset every 24 hours*

---

## 📚 API Documentation

### Authentication Routes
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update user profile
```

### Health Routes
```http
GET  /api/health/profile   # Get health profile
PUT  /api/health/profile   # Update health profile
GET  /api/health/metrics   # Get health metrics
```

### Chat Routes
```http
POST /api/chat/message     # Send chat message
GET  /api/chat/history     # Get chat history
DELETE /api/chat/history   # Clear chat history
```

---

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for user workflows

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend (Railway/Heroku)
```bash
# Build command
npm install

# Start command
npm start
```

### Environment Variables for Production
Remember to set all environment variables in your hosting platform:
- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ESLint for JavaScript linting
- Follow React best practices
- Write meaningful commit messages
- Add tests for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sadini Wanniarachchi**
- GitHub: [@SadiniWanniarachchi](https://github.com/SadiniWanniarachchi)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/your-profile)
- Email: [your.email@domain.com](mailto:your.email@domain.com)

---

## 🙏 Acknowledgments

- Thanks to all contributors who have helped with this project
- Inspiration from modern healthcare applications
- Open source community for amazing tools and libraries
- Healthcare professionals for domain expertise

---

## � Project Stats

![GitHub stars](https://img.shields.io/github/stars/SadiniWanniarachchi/HealthAIChatBot?style=social)
![GitHub forks](https://img.shields.io/github/forks/SadiniWanniarachchi/HealthAIChatBot?style=social)
![GitHub issues](https://img.shields.io/github/issues/SadiniWanniarachchi/HealthAIChatBot)
![GitHub last commit](https://img.shields.io/github/last-commit/SadiniWanniarachchi/HealthAIChatBot)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Sadini Wanniarachchi](https://github.com/SadiniWanniarachchi)

</div>
