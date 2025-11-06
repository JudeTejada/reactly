# Widget Testing Guide

## Quick Start

### Step 1: Start the Widget Dev Server

```bash
cd apps/widget
pnpm dev
```

This will start the widget development server at `http://localhost:5173`

### Step 2: Create a Project (Get API Credentials)

1. Make sure both backend and frontend are running:
   ```bash
   # Terminal 1 - Backend
   cd apps/backend && pnpm dev
   
   # Terminal 2 - Frontend
   cd apps/web && pnpm dev
   ```

2. Sign in to the dashboard: http://localhost:3000/dashboard

3. Go to Projects: http://localhost:3000/dashboard/projects

4. Click "Create Project"

5. Fill in the details:
   - Name: "Widget Test"
   - Allowed Domains: `http://localhost:5173` (optional for local testing)

6. Copy the **API Key** and **Project ID** from the created project

### Step 3: Update Test Configuration

Open `apps/widget/test.html` and replace these placeholders:

```javascript
const API_KEY = 'YOUR_API_KEY_HERE';        // Replace with your actual API key
const PROJECT_ID = 'YOUR_PROJECT_ID_HERE';  // Replace with your actual project ID
```

### Step 4: Test the Widget

1. Open the test page: http://localhost:5173/test.html

2. You should see:
   - The test page with instructions
   - A feedback button (💬) in the bottom-right corner

3. Click the feedback button to open the widget

4. Fill out the form:
   - Select a star rating (1-5)
   - Choose a category (bug, feature, improvement, etc.)
   - Write your feedback text
   - Click "Send Feedback"

5. You should see a success message

### Step 5: Verify in Dashboard

1. Go to the Feedback Dashboard: http://localhost:3000/dashboard/feedback

2. You should see your test feedback with:
   - The rating you selected
   - The category you chose
   - Your feedback text
   - AI-generated sentiment (positive/negative/neutral)

## Testing Different Scenarios

### Test Positive Feedback
- Rating: 4-5 stars
- Text: "Great product! Love the new features."
- Expected: Sentiment = "positive"

### Test Negative Feedback
- Rating: 1-2 stars
- Text: "This is broken and doesn't work at all."
- Expected: Sentiment = "negative"

### Test Neutral Feedback
- Rating: 3 stars
- Text: "It's okay, could be better."
- Expected: Sentiment = "neutral"

### Test Categories
Try each category:
- Bug Report
- Feature Request
- Improvement
- Complaint
- Praise
- Other

## Widget Customization

You can customize the widget appearance and behavior in `test.html`:

### Change Position
```javascript
position: 'bottom-right'  // Options: bottom-right, bottom-left, top-right, top-left
```

### Change Theme
```javascript
theme: {
  primaryColor: '#3b82f6',    // Widget button and accent color
  backgroundColor: '#ffffff',  // Widget background
  textColor: '#000000',       // Text color
}
```

### Change Labels
```javascript
labels: {
  title: 'Custom Title',
  placeholder: 'Custom placeholder...',
  submitButton: 'Custom Button Text',
  thankYouMessage: 'Custom success message!',
}
```

## Building for Production

### Build the Widget

```bash
cd apps/widget
pnpm build
```

This creates production files in `apps/widget/dist/`:
- `widget.umd.js` - For script tag embedding
- `widget.es.js` - For NPM package usage

### Test Production Build

Create a simple HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>My Website</h1>
  
  <script src="./dist/widget.umd.js" 
          data-reactly-api-key="YOUR_API_KEY"
          data-reactly-project-id="YOUR_PROJECT_ID"
          data-position="bottom-right">
  </script>
</body>
</html>
```

## Troubleshooting

### Widget Not Appearing
1. Check browser console for errors
2. Verify API key and project ID are correct
3. Make sure backend is running at `http://localhost:3001`
4. Check CORS settings if testing from different domain

### Feedback Not Submitting
1. Check browser console for API errors
2. Verify backend is running: http://localhost:3001/health
3. Check that project is active in dashboard
4. Verify API key hasn't been regenerated

### CORS Errors
If testing from a different domain, add it to `ALLOWED_ORIGINS` in `apps/backend/.env`:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
```

### Widget Styling Issues
1. Check if there are CSS conflicts with your site
2. Widget uses class names prefixed with `rly-` to avoid conflicts
3. All widget styles are scoped and shouldn't affect your site

## Next Steps

1. **Deploy Backend**: Deploy to Railway, Render, or your preferred host
2. **Deploy Widget**: Upload widget files to CDN or npm registry
3. **Update API URL**: Change `apiUrl` to your production backend URL
4. **Embed on Real Site**: Add widget script tag to your website
5. **Monitor Feedback**: Check dashboard regularly for new feedback

## Development Tips

### Hot Reload
The widget dev server supports hot reload. Edit files in `apps/widget/src/` and see changes instantly.

### Debug Mode
Add console.log statements in `FeedbackWidget.tsx` to debug:
```typescript
console.log('Submitting feedback:', formData);
```

### Test Error Handling
Try these scenarios:
- Submit with empty text (should show validation error)
- Stop backend and submit (should show network error)
- Use invalid API key (should show auth error)

## Example Projects

You can create multiple projects to test:
1. **Development Project** - For local testing
2. **Staging Project** - For pre-production testing  
3. **Production Project** - For live website

Each project gets its own API key and can have different:
- Allowed domains
- Webhook URLs (for Discord notifications)
- Active/inactive status
