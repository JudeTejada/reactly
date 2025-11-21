# GLM AI Service Setup & Usage

## Overview

This document provides setup instructions for the GLM (Zhipu AI) sentiment analysis service integrated into the Reactly backend.

## What is GLM?

GLM (General Language Model) is Zhipu AI's advanced language model that provides:
- High-quality text generation and analysis
- Cost-effective pricing (free tier available)
- JSON mode support for structured responses
- Temperature control for consistent outputs

## Pricing

GLM offers competitive pricing:
- **Free Tier**: Available with API key registration
- **Paid Plans**: Vary by usage, generally more affordable than OpenAI
- **Models Available**: glm-4.6, glm-4.5, glm-4.5-air, glm-4.5-x, glm-4.5-airx, glm-4.5-flash, glm-4-32b-0414-128k

For current pricing, visit: https://z.ai/pricing

## Installation

No additional packages required. GLM uses native `fetch()` API available in Node.js 18+.

## Environment Variables

Add to your `.env` file in `apps/backend/`:

```bash
# GLM API Configuration
GLM_API_KEY=your_glm_api_key_here
```

### Getting Your API Key

1. Visit https://z.ai/manage-apikey/apikey-list
2. Sign up for an account or log in
3. Create a new API key
4. Copy the key to your `.env` file

## Configuration

The GLM service is configured in `src/ai/glm-ai.service.ts`:

```typescript
private readonly modelName = "glm-4.5-flash"; // Latest stable model
private readonly baseUrl = "https://api.z.ai/api";
```

### Model Selection

Choose the appropriate model based on your needs:

| Model | Description | Use Case |
|-------|-------------|----------|
| glm-4.5-flash | Fast, cost-effective | Real-time sentiment analysis |
| glm-4.6 | Latest full-featured | High-accuracy tasks |
| glm-4.5-air | Balanced | General-purpose |
| glm-4.5-x | Extended context | Longer text analysis |
| glm-4-32b-0414-128k | Large context (128K) | Complex analysis |

## Usage in Code

### Inject the Service

```typescript
import { GlmAiService } from "./ai/glm-ai.service";

@Injectable()
export class YourService {
  constructor(private readonly glmService: GlmAiService) {}

  async analyzeFeedback(feedback: string) {
    const result = await this.glmService.analyzeSentiment(feedback);

    console.log(`Sentiment: ${result.sentiment}`);
    console.log(`Score: ${result.score}`);
    console.log(`Confidence: ${result.confidence}`);

    return result;
  }
}
```

### Response Format

```typescript
interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  score: number;      // 0.0 - 1.0
  confidence: number; // 0.0 - 1.0
}
```

## Testing

Run the GLM service test suite:

```bash
cd apps/backend
npx tsx test-glm.service.ts
```

Expected output:
```
================================================================================
GLM AI Service Sentiment Analysis Tests
================================================================================

Test 1: Positive sentiment with enthusiasm
Input: "This product is absolutely amazing! I love how easy it is to use."
Expected: positive
Actual: positive (score: 0.95, confidence: 0.95)
✅ PASSED
--------------------------------------------------------------------------------
...
================================================================================
Test Results: 6 passed, 0 failed out of 6 tests
================================================================================
```

## Testing Without API Key

If you don't have a GLM API key yet, the service will automatically fall back to keyword-based sentiment analysis. This allows you to:
- Test the integration
- Ensure the code compiles
- Verify the fallback mechanism works

To test the fallback mode:
```bash
cd apps/backend
# Ensure GLM_API_KEY is NOT set in your .env
npx tsx test-glm.service.ts
```

You should see warnings about missing API key and fallback being used.

## Error Handling

The GLM service includes comprehensive error handling:

### Common Error Types

1. **API Key Invalid (401)**
   - Check your `GLM_API_KEY` in `.env`
   - Verify the key is active at https://z.ai/manage-apikey/apikey-list

2. **Rate Limit (429)**
   - You've exceeded API quota
   - Implement exponential backoff
   - Consider upgrading your plan

3. **Safety Filters**
   - Content blocked by GLM's safety system
   - Service falls back to keyword analysis

4. **Network Errors**
   - Connection timeout or network issues
   - Service retries or falls back to keyword analysis

### Error Logging

All errors are logged with:
- Error message
- Stack trace
- Request details (sanitized)
- Fallback activation

View logs:
```bash
cd apps/backend
pnpm dev
# Check console output for GLM service logs
```

## Fallback Mechanism

If GLM API fails, the service automatically falls back to keyword-based sentiment analysis:

```typescript
private fallbackSentimentAnalysis(text: string): SentimentResult {
  // Uses predefined positive/negative word lists
  // Returns sentiment with reduced confidence
  // All fallback calls are logged
}
```

**When Fallback is Used:**
- No API key configured
- API returns error
- Response parsing fails
- Network timeout

**Fallback Behavior:**
- Positive words: "good", "great", "excellent", "love", etc.
- Negative words: "bad", "terrible", "hate", "worst", etc.
- Score: 0.5 - 0.95 based on keyword count
- Confidence: 70% of score (lower than API)

## API Reference

### analyzeSentiment(text: string)

Analyzes sentiment of provided text using GLM API.

**Parameters:**
- `text` (string): The text to analyze

**Returns:**
- `Promise<SentimentResult>`: Sentiment analysis result

**Example:**
```typescript
const result = await glmService.analyzeSentiment("I love this product!");
// {
//   sentiment: "positive",
//   score: 0.92,
//   confidence: 0.92
// }
```

## Monitoring & Metrics

Track GLM API usage:

1. **Request Count**: Monitor in application logs
2. **Token Usage**: Check GLM dashboard at https://z.ai/manage-apikey/apikey-list
3. **Error Rate**: Track fallback activations
4. **Response Time**: Monitor API latency

## Best Practices

### 1. Environment Configuration
```typescript
// ✅ GOOD - Using ConfigService
constructor(private configService: ConfigService) {}
const apiKey = this.configService.get<string>("GLM_API_KEY");

// ❌ BAD - Direct process.env access
const apiKey = process.env.GLM_API_KEY;
```

### 2. Error Handling
```typescript
try {
  return await this.glmService.analyzeSentiment(text);
} catch (error) {
  // Always handle errors
  // Service provides fallback, but log for monitoring
  this.logger.error(`Sentiment analysis failed: ${error.message}`);
  throw error;
}
```

### 3. Response Validation
```typescript
const result = await this.glmService.analyzeSentiment(text);

// Validate before using
if (!result || typeof result.score !== "number") {
  throw new Error("Invalid sentiment result");
}
```

### 4. Caching (Optional)
For high-traffic applications, consider caching frequent results:

```typescript
private async getCachedSentiment(text: string): Promise<SentimentResult> {
  const cacheKey = `sentiment:${hashText(text)}`;
  const cached = await this.cache.get(cacheKey);

  if (cached) return cached;

  const result = await this.glmService.analyzeSentiment(text);
  await this.cache.set(cacheKey, result, 3600); // 1 hour

  return result;
}
```

## Troubleshooting

### Issue: "GLM_API_KEY not configured"
**Solution:**
1. Check `.env` file exists in `apps/backend/`
2. Verify key is correct (no extra spaces)
3. Restart the backend server
4. Check file encoding is UTF-8

### Issue: "Invalid GLM API key"
**Solution:**
1. Visit https://z.ai/manage-apikey/apikey-list
2. Verify key is active
3. Regenerate key if needed
4. Update `.env` file
5. Restart server

### Issue: All tests failing
**Solution:**
1. Check API key is valid
2. Verify internet connection
3. Check GLM service status at https://z.ai/status
4. Run with `GLM_API_KEY` unset to test fallback

### Issue: TypeScript errors
**Solution:**
```bash
cd apps/backend
pnpm type-check
# Fix any type errors reported
```

### Issue: Long response times
**Solutions:**
1. Use `glm-4.5-flash` model (fastest)
2. Reduce `max_tokens` in request
3. Implement caching
4. Check network latency to api.z.ai

## Integration with Feedback Service

The GLM service is designed to replace or complement Gemini:

```typescript
// Option 1: Use GLM as primary
import { GlmAiService } from "./ai/glm-ai.service";
constructor(private aiService: GlmAiService) {}

// Option 2: Use both (load balancing)
if (useGlm) {
  return await this.glmService.analyzeSentiment(text);
} else {
  return await this.geminiService.analyzeSentiment(text);
}
```

## Migration from Gemini to GLM

To switch from Gemini to GLM:

1. **Update import** in `feedback.service.ts`:
```typescript
// From:
import { GeminiAiService } from "../ai/gemini-ai.service";

// To:
import { GlmAiService } from "../ai/glm-ai.service";
```

2. **Update injection**:
```typescript
// From:
constructor(private aiService: GeminiAiService) {}

// To:
constructor(private aiService: GlmAiService) {}
```

3. **Update environment**:
```bash
# Remove:
GEMINI_API_KEY=...

# Add:
GLM_API_KEY=your_key_here
```

4. **Test**:
```bash
npx tsx test-glm.service.ts
```

## Support & Resources

- **GLM Documentation**: https://docs.z.ai/api-reference/llm/chat-completion
- **API Key Management**: https://z.ai/manage-apikey/apikey-list
- **Pricing**: https://z.ai/pricing
- **Status Page**: https://z.ai/status
- **Support**: https://z.ai/support

## Comparison: GLM vs Gemini

| Feature | GLM | Gemini |
|---------|-----|--------|
| Free Tier | Yes | Yes |
| Pricing | Competitive | Competitive |
| Models | Multiple (4.x series) | Multiple |
| SDK | Native fetch | @google/genai |
| Setup | Simple | Moderate |
| Response Time | Fast | Fast |
| JSON Mode | Yes | Yes |

Choose based on:
- **Budget**: Both offer free tiers
- **Availability**: Check your region
- **Model preference**: Test both for your use case
- **Team familiarity**: Pick what your team knows

## Security Notes

- Never commit `.env` files with API keys
- Use different keys for dev/staging/prod
- Rotate API keys periodically
- Monitor API key usage for anomalies
- Restrict API key permissions if possible

## Summary

The GLM AI service provides:
✅ Cost-effective sentiment analysis
✅ Easy setup with native fetch
✅ Comprehensive error handling
✅ Automatic fallback mechanism
✅ Detailed logging
✅ TypeScript support
✅ JSON mode for structured responses

Ready to use! Just add your `GLM_API_KEY` to `.env` and start analyzing sentiment.
