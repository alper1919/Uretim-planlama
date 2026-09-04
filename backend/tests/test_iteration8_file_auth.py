"""Iteration 8 — File endpoint auth (access_token cookie / Bearer / no auth) and PDF drawing exists."""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://manufacture-trace.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"

ADMIN = {"username": "admin", "password": "admin123"}


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={**ADMIN, "remember": True}, timeout=30)
    assert r.status_code == 200, r.text
    return s


@pytest.fixture(scope="module")
def pdf_drawing_path(admin_session):
    r = admin_session.get(f"{API}/parts", timeout=30)
    assert r.status_code == 200
    parts = r.json()
    # look for PRÇ-2026-058 with pdf
    for p in parts:
        if p.get("part_code") in ("PRÇ-2026-058", "PRC-2026-058") or True:
            for d in p.get("drawings", []) or []:
                if d.get("content_type") == "application/pdf":
                    return d["storage_path"], d.get("original_filename", "")
    pytest.skip("No PDF drawing found on any part")


class TestFileAuth:
    def test_no_auth_401(self, pdf_drawing_path):
        path, _ = pdf_drawing_path
        r = requests.get(f"{API}/files/{path}", timeout=30)
        assert r.status_code == 401

    def test_cookie_auth_200_pdf(self, admin_session, pdf_drawing_path):
        path, fname = pdf_drawing_path
        r = admin_session.get(f"{API}/files/{path}", timeout=30)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content[:4] == b"%PDF"
        # inline disposition
        assert "inline" in r.headers.get("content-disposition", "").lower()

    def test_bearer_auth_200(self, admin_session, pdf_drawing_path):
        path, _ = pdf_drawing_path
        token = admin_session.cookies.get("access_token")
        assert token
        r = requests.get(f"{API}/files/{path}",
                         headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r.status_code == 200

    def test_bad_token_401(self, pdf_drawing_path):
        path, _ = pdf_drawing_path
        r = requests.get(f"{API}/files/{path}",
                         headers={"Authorization": "Bearer notavalidjwt"}, timeout=30)
        assert r.status_code == 401


class TestPdfPartExists:
    def test_part_prc_2026_058_has_pdf(self, admin_session):
        r = admin_session.get(f"{API}/parts", timeout=30)
        assert r.status_code == 200
        target = next((p for p in r.json() if p.get("part_code") in ("PRÇ-2026-058", "PRC-2026-058")), None)
        assert target is not None, "Part PRÇ-2026-058 not found"
        pdfs = [d for d in (target.get("drawings") or []) if d.get("content_type") == "application/pdf"]
        assert len(pdfs) >= 1, "Expected at least one PDF drawing on PRÇ-2026-058"
