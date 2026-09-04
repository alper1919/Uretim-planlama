# Auth Testing Playbook — Username/Password JWT (ParçaTakip PRO)

Custom username/password auth. httpOnly cookie `access_token` (also accepts `Authorization: Bearer`).
No public register. Admin-only user creation. RBAC roles: `admin`, `user`. Data (parts) is shared by all authenticated users; only /api/users* is admin-gated.

## Credentials (seeded)
- Admin: username `admin`, password `admin123` (role admin)
- Test user: username `operator1`, password `gizli123` (role user) — create via admin if missing

## API tests
```
API=$REACT_APP_BACKEND_URL
# login (remember=true -> 30d cookie)
curl -c c.txt -X POST $API/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123","remember":true}'
curl -b c.txt $API/api/auth/me
# wrong password -> 401
curl -X POST $API/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"x"}'
# admin creates user
curl -b c.txt -X POST $API/api/users -H "Content-Type: application/json" -d '{"username":"operator1","password":"gizli123","name":"Ahmet Usta","role":"user"}'
curl -b c.txt $API/api/users
# non-admin creating user -> 403
curl -c o.txt -X POST $API/api/auth/login -H "Content-Type: application/json" -d '{"username":"operator1","password":"gizli123"}'
curl -b o.txt -X POST $API/api/users -H "Content-Type: application/json" -d '{"username":"x","password":"y"}'   # expect 403
```

## Browser
- Login page data-testids: login-username, login-password, login-remember (checkbox), login-submit, login-error.
- After admin login, header shows "Kullanıcılar" button (open-user-mgmt) → user-mgmt-modal with new-user-username/name/password/role + create-user-button + user-list rows.
- Non-admin must NOT see the Kullanıcılar button.
- "Oturumu açık tut" checked → cookie persists across browser restart (max_age 30d); unchecked → session cookie.

## Notes for auth debugging
- Read this file + /app/memory/test_credentials.md for correct creds.
- Check backend logs: `tail -n 100 /var/log/supervisor/backend.*.log`
- bcrypt hashes start with $2b$; JWT_SECRET/ADMIN_* live in backend/.env.
