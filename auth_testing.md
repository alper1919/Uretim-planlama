# Auth-Gated App Testing Playbook (Emergent Google Auth)

This app uses Emergent-managed Google Auth with session cookies.

## Test session (already seeded)
- session_token: `seed_session_alper`
- user email: alpergur827@gmail.com (name: Alper Gür)

## Backend API test
Use header `Authorization: Bearer seed_session_alper`:
```
curl -s $API/api/auth/me -H "Authorization: Bearer seed_session_alper"
curl -s $API/api/parts -H "Authorization: Bearer seed_session_alper"
```

## Browser test
Set cookie then navigate to `/`:
```
await page.context.add_cookies([{
  "name": "session_token", "value": "seed_session_alper",
  "domain": "<app-domain>", "path": "/", "httpOnly": True, "secure": True, "sameSite": "None"
}])
await page.goto("https://<app>/")
```

## Notes
- Do NOT test Google OAuth redirect flow end-to-end (external). Verify /api/auth/session exists and cookie/session logic via seeded token.
- Success: /api/auth/me returns user; dashboard loads without redirect to /login.
