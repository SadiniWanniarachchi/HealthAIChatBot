# 🤖 Quick Gemini AI Setup Guide

## Get Your Free Gemini API Key

### Step 1: Go to Google AI Studio
Visit: https://makersuite.google.com/app/apikey

### Step 2: Sign In
- Use your Google account to sign in
- Accept the terms of service

### Step 3: Create API Key
- Click "Create API Key"
- Select "Create API key in new project" (recommended)
- Copy your API key (starts with "AIza...")

### Step 4: Add to Your Project
1. Open your `.env` file in the frontend folder
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=AIzaSyC_your_actual_api_key_here
   ```

### Step 5: Test Your Setup
1. Save the .env file
2. Restart your development server: `npm run dev`
3. Start a new health consultation
4. Check the browser console - you should see "Using Gemini service"

## ✅ What's Improved

Your AI chat now has:
- **Latest Gemini Model**: Using gemini-1.5-flash for better performance
- **Better Understanding**: Enhanced prompts for health conversations
- **Smart Responses**: Context-aware medical guidance
- **Error Handling**: Clear error messages if something goes wrong
- **Professional Tone**: Empathetic, medical-appropriate responses
- **Better Assessments**: Comprehensive health summaries

## 🚀 Free Usage Limits

Gemini offers generous free tiers:
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

Perfect for development and testing!

## 🛠️ Troubleshooting

### "Using mock service for testing"
- Your API key isn't configured correctly
- Check the .env file format
- Restart your dev server after changes

### API errors or "404 Not Found" / "Model not found"
- **Fixed**: Now automatically tries multiple model versions
- Check browser console - you'll see which model is being used
- The system tries: gemini-1.5-flash → gemini-1.5-pro → gemini-pro
- Check your API key is valid and active

### "Safety" or blocked responses
- Gemini has built-in safety filters for medical content
- The system will provide alternative helpful responses
- This is normal for sensitive health topics

### Still not working?
- Try the mock service first to test the interface
- Check the browser console for error details
- Look for "Successfully used Gemini model: [model-name]" message
- Make sure your .env file is in the frontend folder
- Verify your API key starts with "AIza" and is complete

### Console Messages to Look For
- ✅ "Using Gemini service" - Service selected
- ✅ "Trying Gemini model: [name]" - Testing models
- ✅ "Successfully used Gemini model: [name]" - Working!

## 💡 Pro Tips

1. **Test with Mock First**: The mock service works without any API key - great for testing the interface
2. **Check Console**: Always check browser console for helpful debugging info
3. **Restart Server**: After changing .env, always restart your dev server
4. **Monitor Usage**: Keep an eye on your API usage in Google AI Studio

Your AI health assistant is now ready to provide intelligent, empathetic responses! 🏥✨
