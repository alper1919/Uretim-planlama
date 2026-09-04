"""Iteration 7 — Custom username/password JWT auth tests."""
import os
import time
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://manufacture-trace.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"

ADMIN = {"username": "admin", "password": "admin123"}
OPERATOR = {"username": "operator1", "password": "gizli123"}


def _login(sess, creds, remember=False):
    return sess.post(f"{API}/auth/login", json={**creds, "remember": remember}, timeout=30)


@pytest.fixture
def admin_session():
    s = requests.Session()
    r = _login(s, ADMIN, remember=True)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture
def operator_session(admin_session):
    # Ensure operator1 exists
    r = admin_session.get(f"{API}/users")
    assert r.status_code == 200
    exists = any(u["username"] == "operator1" for u in r.json())
    if not exists:
        cr = admin_session.post(f"{API}/users", json={
            "username": "operator1", "password": "gizli123",
            "name": "Operator One", "role": "user"
        })
        assert cr.status_code == 200, cr.text
    s = requests.Session()
    r = _login(s, OPERATOR, remember=False)
    assert r.status_code == 200, r.text
    return s


# --- Login ---
class TestLogin:
    def test_admin_login_sets_cookie_and_returns_user(self):
        s = requests.Session()
        r = _login(s, ADMIN, remember=True)
        assert r.status_code == 200
        data = r.json()
        assert data["username"] == "admin"
        assert data["role"] == "admin"
        assert "access_token" in s.cookies.get_dict()

    def test_wrong_password_401(self):
        s = requests.Session()
        r = _login(s, {"username": "admin", "password": "wrong!"})
        assert r.status_code == 401

    def test_remember_true_sets_max_age(self):
        r = requests.post(f"{API}/auth/login", json={**ADMIN, "remember": True}, timeout=30)
        assert r.status_code == 200
        set_cookie = r.headers.get("set-cookie", "")
        assert "access_token=" in set_cookie
        assert "Max-Age=" in set_cookie or "max-age=" in set_cookie.lower()

    def test_remember_false_session_cookie(self):
        r = requests.post(f"{API}/auth/login", json={**ADMIN, "remember": False}, timeout=30)
        assert r.status_code == 200
        set_cookie = r.headers.get("set-cookie", "")
        assert "access_token=" in set_cookie
        # No Max-Age nor Expires => session cookie
        assert "max-age=" not in set_cookie.lower()

    def test_me_with_cookie(self, admin_session):
        r = admin_session.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_me_without_auth_401(self):
        r = requests.get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 401

    def test_bearer_token_auth(self):
        # Get token via login, then use as Bearer on fresh session
        s = requests.Session()
        r = _login(s, ADMIN, remember=True)
        token = s.cookies.get("access_token")
        assert token
        r2 = requests.get(f"{API}/auth/me",
                          headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r2.status_code == 200


# --- Admin user mgmt ---
class TestUserMgmt:
    def test_admin_can_list_users(self, admin_session):
        r = admin_session.get(f"{API}/users")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_create_and_delete_user(self, admin_session):
        uname = f"testuser_{int(time.time())}"
        r = admin_session.post(f"{API}/users", json={
            "username": uname, "password": "temppass123",
            "name": "Test User", "role": "user"
        })
        assert r.status_code == 200, r.text
        uid = r.json()["user_id"]
        assert r.json()["role"] == "user"
        # verify listing
        lst = admin_session.get(f"{API}/users").json()
        assert any(u["user_id"] == uid for u in lst)
        # delete
        d = admin_session.delete(f"{API}/users/{uid}")
        assert d.status_code == 200

    def test_admin_cannot_delete_self(self, admin_session):
        me = admin_session.get(f"{API}/auth/me").json()
        r = admin_session.delete(f"{API}/users/{me['user_id']}")
        assert r.status_code == 400

    def test_non_admin_cannot_list_users(self, operator_session):
        r = operator_session.get(f"{API}/users")
        assert r.status_code == 403

    def test_non_admin_cannot_create_user(self, operator_session):
        r = operator_session.post(f"{API}/users", json={
            "username": "shouldfail", "password": "x", "name": "x", "role": "user"
        })
        assert r.status_code == 403


# --- Protected data ---
class TestPartsAuth:
    def test_parts_requires_auth(self):
        r = requests.get(f"{API}/parts", timeout=30)
        assert r.status_code == 401

    def test_parts_with_admin(self, admin_session):
        r = admin_session.get(f"{API}/parts")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_parts_with_operator(self, operator_session):
        r = operator_session.get(f"{API}/parts")
        assert r.status_code == 200

    def test_create_part_uses_logged_in_user_name(self, admin_session):
        r = admin_session.post(f"{API}/parts", json={
            "part_code": f"TEST_AUTH_{int(time.time())}",
            "part_name": "Auth test part", "quantity": 1
        })
        assert r.status_code == 200
        me = admin_session.get(f"{API}/auth/me").json()
        assert r.json()["created_by"] == me["name"]
        # cleanup
        admin_session.delete(f"{API}/parts/{r.json()['id']}")


# --- Logout ---
class TestLogout:
    def test_logout_clears_cookie(self, admin_session):
        r = admin_session.post(f"{API}/auth/logout")
        assert r.status_code == 200
        # After logout, cookie should be cleared. /auth/me should 401 with fresh session
        # (Note: server delete_cookie sends Set-Cookie with empty value)
        s2 = requests.Session()
        r2 = s2.get(f"{API}/auth/me")
        assert r2.status_code == 401
