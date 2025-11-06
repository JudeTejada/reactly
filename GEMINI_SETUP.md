# Google Gemini AI Setup Guide

## What Changed

✅ **Replaced OpenAI with Google Gemini**
- Removed `openai` package
- Added `@google/generative-ai` package
- Updated AI service to use Gemini Pro model
- Updated environment variables

## Why Gemini?

- **Free tier**: 60 requests per minute (vs OpenAI's paid only)
- **Cost-effective**: More generous free tier for development
- **Performance**: Gemini Pro is comparable to GPT-3.5-turbo
- **Latest tech**: Google's newest AI models

## Getting Your Gemini API Key

### Step 1: Go to Google AI Studio
Visit: https://makersuite.google.com/app/apikey

Or: https://aistudio.google.com/app/apikey

### Step 2: Sign in with Google Account
Use your Google account to sign in

### Step 3: Create API Key
1. Click "Create API Key" button
2. Select "Create API key in new project" (or use existing project)
3. Copy the generated API key

### Step 4: Add to Backend `.env`
Open `apps/backend/.env` and replace:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

With your actual key:
```env
GEMINI_API_KEY=AIzaSy...your-actual-key-here
```

### Step 5: Restart Backend
```bash
cd apps/backend
pnpm dev
```

## Features

### Sentiment Analysis with Gemini
The AI service now uses Gemini Pro to analyze feedback sentiment:

```typescript
{
  sentiment: "positive" | "negative" | "neutral",
  score: 0.85, // Confidence score 0-1
  confidence: 0.85
}
```

### Fallback Mechanism
If Gemini API fails or key is not configured, the service automatically falls back to keyword-based sentiment analysis.

## API Limits (Free Tier)

**Gemini Pro:**
- 60 requests per minute
- 1,500 requests per day
- Free forever for development

This is more than enough for testing and even small production apps!

## Testing Sentiment Analysis

### Test Positive Feedback
```
"This is amazing! Love the new features. Great work!"
→ Expected: sentiment = "positive", score ≈ 0.9
```

### Test Negative Feedback
```
"Terrible experience. Nothing works. Very disappointed."
→ Expected: sentiment = "negative", score ≈ 0.9
```

### Test Neutral Feedback
```
"It's okay. Some things are good, some need improvement."
→ Expected: sentiment = "neutral", score ≈ 0.7
```

## Verify It's Working

### Check Backend Logs
When feedback is submitted, you should see:
```
[AiService] Analyzed sentiment with Gemini: positive (score: 0.85)
```

If using fallback:
```
[AiService] Gemini API key not configured, using fallback
[AiService] Using fallback sentiment analysis
```

### Submit Test Feedback
1. Go to widget test page: http://localhost:5173/test.html
2. Submit feedback with clear sentiment
3. Check dashboard: http://localhost:3000/dashboard/feedback
4. Verify sentiment was correctly analyzed

## Troubleshooting

### Error: "GEMINI_API_KEY not configured"
- Make sure you added the API key to `apps/backend/.env`
- Restart the backend server
- Check for typos in the environment variable name

### Error: "API key not valid"
- Verify you copied the complete API key
- Check if the key is enabled in Google AI Studio
- Try generating a new API key

### Using Fallback Instead of Gemini
If you see "Using fallback sentiment analysis":
1. Check if `GEMINI_API_KEY` is set in `.env`
2. Verify the API key is correct
3. Check if you've hit rate limits (60/min)
4. Look for error messages in backend logs

### Rate Limit Exceeded
If you hit the 60 requests/minute limit:
- Wait a minute and try again
- For production, consider upgrading to paid tier
- Implement caching for repeated analyses

## Comparison: OpenAI vs Gemini

| Feature | OpenAI GPT-3.5 | Google Gemini Pro |
|---------|---------------|-------------------|
| **Cost** | Paid only | Free tier available |
| **Free Requests** | 0 | 60/min, 1500/day |
| **Quality** | Excellent | Very Good |
| **Speed** | Fast | Fast |
| **Setup** | Credit card required | Email only |
| **Best For** | Production apps with budget | Development & small apps |

## Next Steps

1. ✅ Get Gemini API key
2. ✅ Add to `.env` file
3. ✅ Restart backend
4. ✅ Test with widget
5. ✅ Check dashboard for sentiment results

## Production Considerations

For production deployment:
- Monitor rate limits and usage
- Consider upgrading to paid tier if needed
- Implement caching for similar feedback
- Add retry logic for API failures
- Keep fallback mechanism enabled

## Additional Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **Rate Limits**: https://ai.google.dev/gemini-api/docs/rate-limits
- **Models**: https://ai.google.dev/models/gemini
