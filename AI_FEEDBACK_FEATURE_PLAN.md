# AI-Driven Feedback Feature Integration Plan

## Overview

Transform the Reactly feedback widget from requiring manual category/rating selection to a streamlined form that relies entirely on AI for analysis. Users will only provide name, email, and feedback text. All categorization, rating, and markdown generation will be handled by AI (GLM).

## Key Changes Summary

### Before (Current)

- Widget requires: text, category (dropdown), rating (stars)
- Backend processes existing inputs
- AI only generates sentiment

### After (New)

- Widget requires: name, email, text only
- Backend uses AI to generate: category, rating, sentiment, structured markdown summary
- No fallback - strict AI requirement

---

## Implementation Plan

### Phase 1: Database Schema Updates

#### 1.1 Feedback Table Changes

- **Add Fields:**
  - `name` (text, required) - User name
  - `email` (text, required) - User email
  - `markdownSummary` (text) - AI-generated structured summary

- **Modify Fields:**
  - `rating` (integer) - Make nullable (AI will populate)
  - `category` (text) - Make nullable (AI will populate)

#### 1.2 Migration Strategy

```sql
ALTER TABLE feedback
ADD COLUMN name text NOT NULL DEFAULT '',
ADD COLUMN email text NOT NULL DEFAULT '',
ADD COLUMN markdownSummary text,
ALTER COLUMN rating DROP NOT NULL,
ALTER COLUMN category DROP NOT NULL;
```

#### 1.3 Migration Priority

- **Immediate:** Database changes before other components
- **Backwards Compatible:** Existing feedback gets default values

---

### Phase 2: Shared Types & Interfaces

#### 2.1 Updated Submit Schema

```typescript
// Old Schema
{
  text: string,
  rating: number,      // REMOVE
  category: string,    // REMOVE
  metadata?: object
}

// New Schema
{
  name: string,        // ADD (required)
  email: string,       // ADD (required)
  text: string,        // KEEP
  metadata?: object
}
```

#### 2.2 New AI Analysis Interface

```typescript
interface FeedbackAnalysis {
  sentiment: SentimentType;
  sentimentScore: number;
  category: FeedbackCategory;
  rating: number; // 1-5
  markdownSummary: string;
}
```

#### 2.3 Updated Feedback Interface

```typescript
interface Feedback {
  id: string;
  projectId: string;
  text: string;
  name: string; // NEW
  email: string; // NEW
  rating?: number; // Now optional
  category?: string; // Now optional
  sentiment: string;
  sentimentScore: number;
  markdownSummary: string; // NEW
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Phase 3: AI Service Enhancement (GLM)

#### 3.1 New Comprehensive Analysis Method

```typescript
async analyzeFeedback(text: string): Promise<FeedbackAnalysis> {
  // Single AI call that generates everything
  // NO FALLBACK - strict AI requirement
  // Returns: sentiment + category + rating + structured markdown
}
```

#### 3.2 Structured Markdown Format

The AI will generate structured markdown with specific sections:

```markdown
## Feedback Analysis

**Sentiment:** Positive (85% confidence)  
**Category:** Improvement  
**Rating:** 4/5

### Key Points

- Dark mode feature appreciated by user
- Loading performance needs optimization
- Overall positive experience with speed concern

### Summary

User loves the new dark mode feature but experiences slow loading times. Suggestion to optimize performance for better user experience.

### Recommendations

- Optimize dark mode loading times
- Consider caching for faster initial load
- Monitor performance metrics for dark mode usage
```

#### 3.3 AI Prompt Strategy

```typescript
const prompt = `
Analyze this feedback and respond with ONLY JSON:

Text: "${userFeedback}"

Generate analysis in this exact format:
{
  "sentiment": "positive|negative|neutral",
  "sentimentScore": 0.95,
  "category": "bug|feature|improvement|complaint|praise|other", 
  "rating": 4,
  "markdownSummary": "## Feedback Analysis\n\n**Sentiment:** Positive (95% confidence)\n**Category:** Improvement\n**Rating:** 4/5\n\n### Key Points\n- Feature appreciation\n- Performance concern\n\n### Summary\nUser feedback summary\n\n### Recommendations\n- Actionable recommendation"
}

Rules:
- NO fallback allowed - must return valid JSON
- Strict category classification
- Rating based on content sentiment analysis
- Structured markdown with specific sections
- Maximum 200 words for markdown summary
`;
```

---

### Phase 4: Backend Service Updates

#### 4.1 Feedback Service Changes

```typescript
async submitFeedback(projectId: string, dto: SubmitFeedbackDto) {
  // 1. Get AI analysis
  const analysis = await this.aiService.analyzeFeedback(dto.text);

  // 2. Store with AI-generated fields
  const feedback = await this.db.insert(feedback).values({
    projectId,
    name: dto.name,        // NEW
    email: dto.email,      // NEW
    text: dto.text,
    rating: analysis.rating,           // AI generated
    category: analysis.category,       // AI generated
    sentiment: analysis.sentiment,
    sentimentScore: analysis.sentimentScore,
    markdownSummary: analysis.markdownSummary, // NEW
    metadata: dto.metadata
  });

  // 3. Return complete feedback
  return feedback[0];
}
```

#### 4.2 Error Handling Strategy

```typescript
// NO FALLBACK - strict AI requirement
try {
  const analysis = await this.aiService.analyzeFeedback(text);
  // Proceed with AI-generated values
} catch (error) {
  // Throw error, do not proceed
  throw new BadRequestException(
    "AI analysis failed - feedback cannot be processed"
  );
}
```

#### 4.3 Webhook Integration

Update Discord webhook to use AI-generated content:

- Use `markdownSummary` for rich formatting
- Include AI-generated category and rating
- Enhanced notification content

---

### Phase 5: API Controller Updates

#### 5.1 Updated Submit Endpoint

```typescript
@Post()
@UseGuards(ApiKeyGuard)
async submitFeedback(
  @Body() dto: SubmitFeedbackDto,
  @CurrentProject() project: Project
) {
  // 1. Validate new schema (name/email/text only)
  const validated = submitFeedbackSchema.parse(dto);

  // 2. AI processing (no user-provided rating/category)
  const feedback = await this.feedbackService.submitFeedback(
    project.id,
    validated
  );

  // 3. Return response with AI analysis
  return {
    success: true,
    data: {
      id: feedback.id,
      sentiment: feedback.sentiment,
      analysis: {
        category: feedback.category,
        rating: feedback.rating,
        markdownSummary: feedback.markdownSummary
      }
    }
  };
}
```

#### 5.2 Validation Changes

- Remove rating/category validation from schema
- Add name/email validation
- Ensure email format validation
- Name length validation (1-100 chars)

---

### Phase 6: Widget UI Transformation

#### 6.1 Remove Components

- Category dropdown selection
- Star rating component (★☆☆☆☆)
- Related form validation

#### 6.2 Add Components

- Name input field (required)
- Email input field (required, email validation)
- Keep existing feedback textarea

#### 6.3 Updated Widget Form

```jsx
// Simplified form structure
<form onSubmit={handleSubmit}>
  <div className="form-group">
    <label htmlFor="name">Your Name</label>
    <input
      id="name"
      type="text"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      required
      maxLength={100}
    />
  </div>

  <div className="form-group">
    <label htmlFor="email">Your Email</label>
    <input
      id="email"
      type="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      required
      maxLength={200}
    />
  </div>

  <div className="form-group">
    <label htmlFor="text">Your Feedback</label>
    <textarea
      id="text"
      value={formData.text}
      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
      placeholder="Tell us what you think..."
      rows={4}
      required
      maxLength={5000}
    />
  </div>

  <button type="submit">Submit Feedback</button>
</form>
```

#### 6.4 Form State Management

```typescript
// Simplified form data
const [formData, setFormData] = useState({
  name: "",
  email: "",
  text: "",
});

// Remove rating/category from state
```

---

### Phase 7: Admin Dashboard Updates

#### 7.1 Display AI-Generated Markdown Summary

Add markdown summary display to feedback list/details:

```jsx
// In feedback list component
<div className="feedback-item">
  <div className="feedback-header">
    <h4>{feedback.name}</h4>
    <span className="email">{feedback.email}</span>
    <span className={`sentiment ${feedback.sentiment}`}>
      {feedback.sentiment} ({Math.round(feedback.sentimentScore * 100)}%)
    </span>
  </div>

  <div className="feedback-text">{feedback.text}</div>

  {/* NEW: AI-generated markdown summary */}
  <div className="ai-summary">
    <ReactMarkdown>{feedback.markdownSummary}</ReactMarkdown>
  </div>

  <div className="feedback-meta">
    <span className="category">{feedback.category}</span>
    <span className="rating">{"⭐".repeat(feedback.rating || 0)}</span>
    <span className="date">{formatDate(feedback.createdAt)}</span>
  </div>
</div>
```

#### 7.2 Analytics Updates

Update analytics queries to handle nullable rating/category:

- Graceful handling of null values
- Updated average rating calculations
- Category breakdown with null handling

---

### Phase 8: Migration & Data Handling

#### 8.1 Database Migration Steps

1. **Backup existing data**
2. **Create migration script**
3. **Add new columns with defaults**
4. **Update nullable constraints**
5. **Test with existing data**

#### 8.2 Existing Data Handling

```typescript
// Migration for existing feedback
const migrationQueries = [
  // Add new columns with defaults
  `ALTER TABLE feedback ADD COLUMN name text DEFAULT 'Anonymous'`,
  `ALTER TABLE feedback ADD COLUMN email text DEFAULT ''`,
  `ALTER TABLE feedback ADD COLUMN markdownSummary text`,

  // Make rating/category nullable
  `ALTER TABLE feedback ALTER COLUMN rating DROP NOT NULL`,
  `ALTER TABLE feedback ALTER COLUMN category DROP NOT NULL`,
];
```

#### 8.3 Backwards Compatibility

- Existing feedback gets default name "Anonymous"
- Email field optional for existing records
- Markdown summary empty for existing records
- Rating/category will be null for existing records

---

### Phase 9: Testing Strategy

#### 9.1 Unit Tests

- **AI Service:** Comprehensive analysis method
- **Feedback Service:** New submit flow
- **Widget Component:** Updated form validation
- **Controller:** Schema validation

#### 9.2 Integration Tests

- **End-to-end:** Widget → Backend → AI → Database
- **Error Scenarios:** AI failure handling
- **Data Migration:** Existing data compatibility

#### 9.3 User Experience Tests

- **Form Simplicity:** Name/email/text only
- **AI Analysis Quality:** Category/rating accuracy
- **Dashboard Display:** Markdown rendering

---

### Phase 10: Deployment Checklist

#### 10.1 Pre-Deployment

- [ ] Database migration ready
- [ ] Environment variables configured (GLM API key)
- [ ] Testing completed on staging
- [ ] Rollback plan prepared

#### 10.2 Deployment Steps

1. **Deploy backend changes** (API compatibility)
2. **Run database migration** (schema changes)
3. **Deploy widget changes** (simplified form)
4. **Update dashboard** (markdown display)
5. **Monitor for errors**

#### 10.3 Post-Deployment Monitoring

- **AI Service Health:** Check GLM API status
- **Feedback Processing:** Monitor success rates
- **User Experience:** Track form submissions
- **Error Rates:** Monitor AI failures

---

## Technical Considerations

### Performance Impact

- **Single AI Call:** More efficient than multiple calls
- **Larger Payloads:** Markdown summaries increase data size
- **Processing Time:** AI analysis adds latency

### Error Handling

- **Strict AI Requirement:** No fallback mechanisms
- **User Feedback:** Clear error messages for AI failures
- **Monitoring:** Track AI success/failure rates

### Rate Limiting

- **API Key Management:** Monitor GLM API usage
- **Cost Optimization:** Batch processing where possible
- **User Experience:** Loading states during AI processing

### Security & Privacy

- **Data Handling:** Name/email storage compliance
- **GDPR Considerations:** User data handling policies
- **API Security:** Secure GLM API key management

---

## Success Metrics

### User Experience

- **Reduced Form Complexity:** Fewer form fields
- **Higher Submission Rates:** Simpler UX
- **Faster Feedback Collection:** Streamlined process

### AI Analysis Quality

- **Category Accuracy:** Proper classification rates
- **Rating Consistency:** Correlation with sentiment
- **Markdown Quality:** Structured summary usefulness

### System Performance

- **Processing Speed:** AI analysis latency
- **Success Rates:** AI service reliability
- **Error Rates:** System stability metrics

---

## Timeline Estimate

| Phase                  | Duration | Critical Path |
| ---------------------- | -------- | ------------- |
| Database Schema        | 1-2 days | Yes           |
| Shared Types           | 1 day    | Yes           |
| AI Service Enhancement | 2-3 days | Yes           |
| Backend Services       | 2 days   | Yes           |
| Widget UI              | 1-2 days | No            |
| Dashboard Updates      | 1 day    | No            |
| Testing & QA           | 2-3 days | Yes           |
| Migration & Deployment | 1 day    | Yes           |

**Total Estimated Time:** 10-15 days

---

## Risk Assessment

### High Risk

- **AI Service Dependencies:** GLM API reliability
- **Database Migration:** Data integrity concerns
- **Breaking Changes:** API schema modifications

### Medium Risk

- **User Experience:** Form changes acceptance
- **Performance Impact:** Additional AI processing time
- **Testing Coverage:** End-to-end validation needs

### Low Risk

- **Dashboard Display:** Non-critical UI changes
- **Analytics Updates:** Graceful handling of null values

---

## Rollback Plan

### Emergency Rollback Steps

1. **Revert Database Migration** (if needed)
2. **Deploy Previous Backend Version** (API compatibility)
3. **Restore Original Widget** (previous form structure)
4. **Monitor System Recovery**

### Data Recovery

- **Database Backups:** Pre-migration snapshots
- **API Versioning:** Support both new/old schemas temporarily
- **Gradual Migration:** Phase deployment approach
