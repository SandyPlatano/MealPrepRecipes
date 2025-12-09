# Next Steps: Improving Backend Test Coverage

Based on the TestSprite backend test results, here's a prioritized action plan to improve test coverage and reliability.

## 🎯 Priority 1: Fix Immediate Test Infrastructure Issues

### 1.1 Create Authentication Helper for Tests
**Problem:** Tests fail because they don't authenticate properly. API endpoints use Supabase Auth cookies, not bearer tokens.

**Solution:** Create a test authentication utility that:
- Creates a test user in Supabase
- Obtains authentication cookies
- Returns cookies for use in test requests

**Files to create:**
- `testsprite_tests/helpers/auth_helper.py` - Authentication utilities
- `testsprite_tests/helpers/test_user.py` - Test user management

**Example approach:**
```python
# Use Supabase Admin API or test credentials
# Set cookies in requests: session = requests.Session()
# session.cookies.set('sb-...-auth-token', token)
```

### 1.2 Fix Missing Dependencies
**Problem:** Test TC010 failed due to missing `bs4` (BeautifulSoup) module.

**Solution:** Update test environment to include required dependencies:
- Add `beautifulsoup4` to test requirements
- Or update test to use alternative HTML parsing

---

## 🎯 Priority 2: Update Tests to Match Actual Architecture

### 2.1 Focus on Actual API Endpoints
**Current Issue:** Tests target non-existent endpoints like `/api/auth/signup`, `/api/recipes`.

**Solution:** Rewrite tests to target actual API endpoints:

#### ✅ Test These Endpoints:
1. **`POST /api/parse-recipe`** (requires auth)
   - Test with valid recipe text/HTML
   - Test with invalid input
   - Test rate limiting (20/hour)
   - Test authentication requirement

2. **`POST /api/scrape-url`** (requires auth)
   - Test with valid recipe URL
   - Test SSRF protection (localhost, private IPs)
   - Test rate limiting (30/hour)
   - Test invalid URL handling

3. **`POST /api/send-shopping-list`** (requires auth)
   - Test email sending with valid data
   - Test rate limiting (10/hour)
   - Test empty items handling
   - Test authentication requirement

4. **`GET /api/shopping-list-html`** (public)
   - Test HTML generation
   - Test with/without data parameter
   - Test base64 data parsing

5. **`POST /api/google-calendar/exchange-token`** (requires auth)
   - Test OAuth code exchange
   - Test invalid code handling
   - Test redirect URI validation

6. **`GET /api/google-calendar/status`** (requires auth)
   - Test connection status check
   - Test unauthenticated access

7. **`POST /api/google-calendar/create-events`** (requires auth)
   - Test event creation
   - Test token refresh logic
   - Test excluded days filtering
   - Test rate limiting (20/hour)

8. **`POST /api/google-calendar/disconnect`** (requires auth)
   - Test disconnection
   - Test token clearing

### 2.2 Document Server Actions (Separate Testing Strategy)
**Note:** Server Actions in `src/app/actions/` are NOT REST API endpoints and require different testing approach:

- **For Server Actions:** Use Next.js integration tests or E2E tests
- **For API Routes:** Use HTTP-based tests (current approach)

**Server Actions to test separately:**
- `src/app/actions/auth.ts` - Authentication
- `src/app/actions/recipes.ts` - Recipe CRUD
- `src/app/actions/meal-plans.ts` - Meal planning
- `src/app/actions/shopping-list.ts` - Shopping list generation
- `src/app/actions/cooking-history.ts` - Cooking history

---

## 🎯 Priority 3: Create Test Utilities and Fixtures

### 3.1 Test Data Fixtures
Create reusable test data:
- Sample recipe data
- Sample meal plan data
- Sample shopping list items
- Valid/invalid URLs for scraping tests

### 3.2 Mock External Services
For tests that don't need real API calls:
- Mock Anthropic API responses
- Mock Resend email sending
- Mock Google Calendar API
- Mock Supabase responses (for unit tests)

### 3.3 Rate Limiting Test Utilities
Create helpers to:
- Test rate limit enforcement
- Reset rate limits between tests
- Verify rate limit headers

---

## 🎯 Priority 4: Improve Test Coverage

### 4.1 Add Edge Case Tests
- Invalid input handling
- Malformed JSON
- Missing required fields
- Oversized payloads
- SQL injection attempts (for URL scraping)

### 4.2 Add Security Tests
- SSRF protection verification
- Authentication bypass attempts
- Rate limit bypass attempts
- XSS prevention in HTML generation

### 4.3 Add Integration Tests
- End-to-end flows:
  1. Authenticate → Parse Recipe → Create Recipe
  2. Authenticate → Create Meal Plan → Generate Shopping List → Send Email
  3. Authenticate → Connect Google Calendar → Create Events → Disconnect

---

## 🎯 Priority 5: Documentation and Maintenance

### 5.1 Create API Testing Guide
Document:
- Which endpoints exist and their purposes
- Authentication requirements
- Rate limits
- Request/response formats
- Error codes

### 5.2 Update Test Plan
Regenerate TestSprite test plan focusing on:
- Actual API endpoints only
- Proper authentication flow
- Realistic test scenarios

### 5.3 CI/CD Integration
- Add tests to CI pipeline
- Run tests on PR creation
- Block merges if critical tests fail

---

## 📋 Immediate Action Items (This Week)

1. **Create authentication helper** (2-3 hours)
   - [ ] Research Supabase test authentication approach
   - [ ] Create `auth_helper.py` with cookie-based auth
   - [ ] Test authentication with one endpoint

2. **Fix TC010 dependency** (30 minutes)
   - [ ] Add `beautifulsoup4` to test requirements
   - [ ] Re-run TC010

3. **Rewrite 2-3 critical tests** (4-6 hours)
   - [ ] Rewrite TC002 (parse-recipe) with proper auth
   - [ ] Rewrite TC005 (shopping-list) with proper auth
   - [ ] Rewrite TC007 (Google Calendar) with proper auth

4. **Create test fixtures** (2 hours)
   - [ ] Sample recipe data
   - [ ] Sample meal plan data
   - [ ] Valid test URLs

---

## 📋 Short-term Goals (Next 2 Weeks)

1. **Complete API endpoint test coverage**
   - All 8 API endpoints have passing tests
   - Edge cases covered
   - Security tests passing

2. **Set up test environment**
   - Test database with proper RLS
   - Test environment variables
   - Mock external services

3. **Document testing approach**
   - API testing guide
   - Server Actions testing guide
   - Test data management

---

## 📋 Long-term Goals (Next Month)

1. **Integration test suite**
   - End-to-end user flows
   - Server Actions testing
   - Database integration tests

2. **Performance testing**
   - Load testing for rate limits
   - Response time benchmarks
   - Concurrent request handling

3. **Automated test reporting**
   - Test coverage reports
   - Performance metrics
   - Security scan results

---

## 🔧 Technical Notes

### Authentication Approach
- API endpoints use **Supabase Auth cookies** (not bearer tokens)
- Cookies are set by Supabase client after login
- Tests need to simulate browser cookie handling
- Consider using Supabase Admin API for test user creation

### Test Environment Setup
```bash
# Required environment variables for tests
NEXT_PUBLIC_SUPABASE_URL=<test-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<test-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<test-service-role-key>  # For admin operations
ANTHROPIC_API_KEY=<test-key-or-mock>
RESEND_API_KEY=<test-key-or-mock>
```

### Rate Limiting Notes
- Rate limits are in-memory (not persistent)
- Each test run starts fresh
- Rate limit tests need to make multiple rapid requests
- Consider reset mechanism for test isolation

---

## 📊 Success Metrics

- **Target:** 80%+ test pass rate
- **Current:** 10% (1/10 tests passing)
- **Goal:** All API endpoint tests passing
- **Stretch:** Integration tests for critical flows

---

## 🚀 Quick Start Commands

```bash
# Set up test environment
cd nextjs
npm install

# Run tests (after fixing authentication)
cd testsprite_tests
# Update test files with proper auth
# Re-run TestSprite tests

# Or run individual tests
python -m pytest tests/ -v
```

---

**Last Updated:** 2025-12-09  
**Status:** Ready for implementation  
**Estimated Effort:** 2-3 weeks for full coverage

