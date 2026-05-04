# 🧪 TEST LOGIN GOOGLE

**Server:** http://localhost:3000
**Status:** Running avec Google OAuth credentials ✅

---

## Test Steps

### 1. **Open Landing Page**
```
http://localhost:3000
```

Should see:
- ✅ Hero section: "The Operating System for E-commerce"
- ✅ "Sign up" button
- ✅ Features cards
- ✅ Responsive design

---

### 2. **Click "Sign up"**
- Button redirects to Google OAuth login
- Google login popup/redirect should appear
- No error = OAuth config correct ✅

---

### 3. **Google Login**
Options:
- Use real Google account (if configured)
- Or see consent screen error (acceptable for test)

Expected flow:
```
localhost:3000 
  → Click Sign up 
  → Google OAuth endpoint
  → Consent screen
  → Callback to /api/auth/callback/google
  → Redirect to /dashboard (if DB ready)
```

---

## Expected Results

✅ **Success:**
- Click Sign up → Google redirect (no error)
- Google consent screen appears
- Callback handles response

❌ **Failure:**
- Error on Sign up click
- Google endpoint fails
- Callback returns error

---

## Troubleshoot

| Issue | Cause | Fix |
|-------|-------|-----|
| "Sign up" button does nothing | NextAuth not loaded | Check console errors |
| Google doesn't redirect | Bad GOOGLE_CLIENT_ID | Verify .env.local |
| Callback fails | Redirect URI mismatch | Check Google Cloud Console |
| Database error | Tables not created | Run SQL migration |

---

## Next if Success

✅ Login works → Create tables → Full flow test

---

**Ready to test?** Open http://localhost:3000
