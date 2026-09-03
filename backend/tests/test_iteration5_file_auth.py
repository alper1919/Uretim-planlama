"""Iteration 5: GET /api/files/{path} cookie-auth bug fix tests."""
import os
import io
import pytest
import requests

def _load_frontend_env():
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                return line.split("=", 1)[1].strip()
    raise RuntimeError("REACT_APP_BACKEND_URL not found")

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or _load_frontend_env()).rstrip("/")
TOKEN = "seed_session_alper"


@pytest.fixture(scope="module")
def part_id():
    r = requests.get(f"{BASE_URL}/api/parts", headers={"Authorization": f"Bearer {TOKEN}"})
    assert r.status_code == 200
    parts = r.json()
    assert len(parts) > 0
    return parts[0]["id"]


@pytest.fixture(scope="module")
def uploaded_files(part_id):
    """Upload an image and a PDF to the first part."""
    # Minimal PNG
    png = bytes.fromhex(
        "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4"
        "890000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
    )
    # Minimal PDF
    pdf = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 100 100]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000100 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n160\n%%EOF"

    results = {}
    for name, data, ctype, key in [
        ("test_iter5.png", png, "image/png", "image"),
        ("test_iter5.pdf", pdf, "application/pdf", "pdf"),
    ]:
        r = requests.post(
            f"{BASE_URL}/api/parts/{part_id}/drawings",
            headers={"Authorization": f"Bearer {TOKEN}"},
            files={"file": (name, io.BytesIO(data), ctype)},
        )
        assert r.status_code == 200, r.text
        drawings = r.json()["drawings"]
        # find our just-uploaded drawing
        d = [x for x in drawings if x["original_filename"] == name][-1]
        results[key] = {"path": d["storage_path"], "ctype": ctype, "filename": name}
    return results


class TestFileCookieAuth:
    def test_no_auth_returns_401(self, uploaded_files):
        path = uploaded_files["image"]["path"]
        r = requests.get(f"{BASE_URL}/api/files/{path}")
        assert r.status_code == 401

    def test_bearer_header_returns_200_image(self, uploaded_files):
        f = uploaded_files["image"]
        r = requests.get(
            f"{BASE_URL}/api/files/{f['path']}",
            headers={"Authorization": f"Bearer {TOKEN}"},
        )
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/png")
        assert len(r.content) > 0

    def test_cookie_returns_200_image(self, uploaded_files):
        f = uploaded_files["image"]
        r = requests.get(
            f"{BASE_URL}/api/files/{f['path']}",
            cookies={"session_token": TOKEN},
        )
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/png")

    def test_cookie_returns_200_pdf(self, uploaded_files):
        f = uploaded_files["pdf"]
        r = requests.get(
            f"{BASE_URL}/api/files/{f['path']}",
            cookies={"session_token": TOKEN},
        )
        assert r.status_code == 200
        assert r.headers.get("content-type", "") == "application/pdf"
        cd = r.headers.get("content-disposition", "")
        assert "inline" in cd
        assert r.content.startswith(b"%PDF")

    def test_query_auth_still_works(self, uploaded_files):
        f = uploaded_files["pdf"]
        r = requests.get(f"{BASE_URL}/api/files/{f['path']}?auth={TOKEN}")
        assert r.status_code == 200
        assert r.headers.get("content-type", "") == "application/pdf"

    def test_invalid_cookie_returns_401(self, uploaded_files):
        f = uploaded_files["image"]
        r = requests.get(
            f"{BASE_URL}/api/files/{f['path']}",
            cookies={"session_token": "invalid_token_xyz"},
        )
        assert r.status_code == 401
