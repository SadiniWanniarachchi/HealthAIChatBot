# Security Guidelines for AI Health Chatbot

## Environment Variables Security

### ⚠️ CRITICAL: Never commit `.env` files to version control!

The `.env` files contain sensitive information including:
- API keys (Google Gemini API key)
- JWT secrets
- Database connection strings
- Email credentials

## Setup Instructions

### 1. Frontend Environment Setup
1. Copy `frontend/.env.example` to `frontend/.env`
2. Fill in your actual API keys and configuration values
3. Never commit the `.env` file to git

### 2. Backend Environment Setup  
1. Copy `backend/.env.example` to `backend/.env`
2. Fill in your actual values:
   - Generate a strong JWT secret
   - Add your MongoDB connection string
   - Add your Gemini API key
3. Never commit the `.env` file to git

### 3. Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to both `frontend/.env` and `backend/.env`:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here  # Frontend
   GEMINI_API_KEY=your_api_key_here       # Backend
   ```

## Git Security

### Files Protected by .gitignore:
- `**/.env*` (except `.env.example`)
- `node_modules/`
- `*.log`
- Database files
- API key files

### If You Accidentally Commit Sensitive Data:

1. **Remove from tracking:**
   ```bash
   git rm --cached .env
   ```

2. **Remove from history (if already committed):**
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
   ```

3. **Regenerate compromised keys:**
   - Generate new API keys
   - Update all deployment environments
   - Revoke old keys

## Best Practices

1. **Environment Variables:**
   - Use strong, unique secrets
   - Rotate keys regularly
   - Use different keys for different environments

2. **Development:**
   - Never hard-code sensitive values
   - Use environment variables for all configuration
   - Review code before committing

3. **Deployment:**
   - Use secure environment variable injection
   - Enable rate limiting on APIs
   - Monitor API usage for anomalies

## Emergency Response

If API keys are exposed:
1. **Immediately revoke** the compromised keys
2. **Generate new keys** and update applications
3. **Review access logs** for unauthorized usage  
4. **Update this repository** with new key patterns in .gitignore if needed

## File Structure
```
project/
├── .gitignore              # Root gitignore (protects .env files)
├── frontend/
│   ├── .gitignore         # Frontend-specific gitignore
│   ├── .env.example       # Template file (safe to commit)
│   └── .env              # Actual values (NEVER COMMIT)
└── backend/
    ├── .env.example       # Template file (safe to commit)
    └── .env              # Actual values (NEVER COMMIT)
```

Remember: **Security is everyone's responsibility!**
