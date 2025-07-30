# Forgot Password Troubleshooting Guide

## Common Issues and Solutions

### 1. Email Not Sending
- **Check**: Email credentials in .env file
- **Solution**: Use Gmail App Password (not regular password)
- **Test**: Run `node test-email.js` from backend folder

### 2. "Invalid or expired token" Error
- **Cause**: Token expires after 10 minutes
- **Solution**: Request a new reset email
- **Check**: System clock synchronization

### 3. Reset Link Not Working
- **Check**: FRONTEND_URL in .env matches your frontend URL
- **Common Issue**: http://localhost:5174 vs http://localhost:5173
- **Solution**: Update FRONTEND_URL in backend/.env

### 4. Email Goes to Spam
- **Solution**: 
  - Check spam folder
  - Add your email to safe senders
  - Use a proper "From" email address

### 5. Database Connection Issues
- **Check**: User model has passwordResetToken and passwordResetExpires fields
- **Verify**: MongoDB connection is working
- **Test**: Try registering a new user first

### 6. Frontend API Issues
- **Check**: API base URL in frontend/src/services/api.js
- **Common**: Port mismatch (5000 vs 3000)
- **Solution**: Ensure backend runs on correct port

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Can register a new user
- [ ] Can login with existing user
- [ ] Email test script passes
- [ ] Forgot password form submits
- [ ] Email is received (check spam)
- [ ] Reset link opens correctly
- [ ] New password can be set
- [ ] Can login with new password

## Email Provider Settings

### Gmail
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=16-character-app-password
```

### Outlook/Hotmail
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

## Security Notes

- Tokens expire in 10 minutes
- Each token can only be used once
- Tokens are hashed in database
- No user enumeration (same response for existing/non-existing emails)
- HTTPS recommended for production
