# Reactly Feedback Widget

Embeddable feedback widget for collecting user feedback.

## Installation

### Via NPM

```bash
npm install @reactly/feedback-widget
```

```javascript
import { initFeedbackWidget } from '@reactly/feedback-widget';

initFeedbackWidget({
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
  theme: {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  },
  labels: {
    title: 'Send Feedback',
    placeholder: 'Tell us what you think...',
    submitButton: 'Submit',
    thankYouMessage: 'Thank you!'
  }
});
```

### Via Script Tag

```html
<script src="https://cdn.reactly.com/widget.umd.js" 
        data-reactly-api-key="your-api-key"
        data-reactly-project-id="your-project-id"
        data-position="bottom-right">
</script>
```

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```
