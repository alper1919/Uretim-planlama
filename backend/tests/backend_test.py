"""Backend API tests for ParçaTakip PRO."""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://manufacture-trace.preview.emergentagent.com').rstrip('/')
TOKEN = "seed_session_alper"
HDR = {"Authorization": f"Bearer {TOKEN}"}


# ---------- Auth ----------
def test_auth_me_ok():
    r = requests.get(f"{BASE_URL}/api/auth/me", headers=HDR, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["email"] == "alpergur827@gmail.com"
    assert d["name"]


def test_auth_me_unauth():
    r = requests.get(f"{BASE_URL}/api/auth/me", timeout=30)
    assert r.status_code == 401


# ---------- List seeded parts ----------
def test_list_parts_seeded():
    r = requests.get(f"{BASE_URL}/api/parts", headers=HDR, timeout=30)
    assert r.status_code == 200
    parts = r.json()
    assert isinstance(parts, list)
    assert len(parts) >= 6, f"Expected 6 seeded parts, got {len(parts)}"


# ---------- Create / update / status / delete flow ----------
@pytest.fixture(scope="module")
def created_part_id():
    payload = {
        "part_code": "TEST_CODE_001",
        "part_name": "TEST Part",
        "quantity": 5,
        "material_type": "Çelik",
        "material_dimensions": "100x50x10",
    }
    r = requests.post(f"{BASE_URL}/api/parts", json=payload, headers=HDR, timeout=30)
    assert r.status_code == 200, r.text
    p = r.json()
    assert p["status"] == "hammadde_siparis_edildi"
    assert len(p["history"]) == 1
    assert p["history"][0]["note"] == "Parça oluşturuldu"
    assert p["history"][0]["to_status"] == "hammadde_siparis_edildi"
    yield p["id"]
    # cleanup
    requests.delete(f"{BASE_URL}/api/parts/{p['id']}", headers=HDR, timeout=30)


def test_get_created_part(created_part_id):
    r = requests.get(f"{BASE_URL}/api/parts/{created_part_id}", headers=HDR, timeout=30)
    assert r.status_code == 200
    assert r.json()["part_code"] == "TEST_CODE_001"


def test_update_part(created_part_id):
    payload = {
        "part_code": "TEST_CODE_001",
        "part_name": "TEST Part Updated",
        "quantity": 10,
        "material_type": "Alüminyum",
        "material_dimensions": "200x50x10",
    }
    r = requests.put(f"{BASE_URL}/api/parts/{created_part_id}", json=payload, headers=HDR, timeout=30)
    assert r.status_code == 200
    assert r.json()["part_name"] == "TEST Part Updated"
    assert r.json()["quantity"] == 10
    # verify persistence
    g = requests.get(f"{BASE_URL}/api/parts/{created_part_id}", headers=HDR, timeout=30).json()
    assert g["part_name"] == "TEST Part Updated"


def test_patch_status_valid(created_part_id):
    r = requests.patch(f"{BASE_URL}/api/parts/{created_part_id}/status",
                       json={"status": "isleme_alindi"}, headers=HDR, timeout=30)
    assert r.status_code == 200
    p = r.json()
    assert p["status"] == "isleme_alindi"
    last = p["history"][-1]
    assert last["from_status"] == "hammadde_siparis_edildi"
    assert last["to_status"] == "isleme_alindi"
    assert last["user_name"]
    assert last["timestamp"]


def test_patch_status_invalid(created_part_id):
    r = requests.patch(f"{BASE_URL}/api/parts/{created_part_id}/status",
                       json={"status": "bogus_status"}, headers=HDR, timeout=30)
    assert r.status_code == 400


# ---------- Drawings ----------
def test_upload_and_download_drawing(created_part_id):
    files = {"file": ("test.png", io.BytesIO(b"\x89PNG\r\n\x1a\nfake"), "image/png")}
    r = requests.post(f"{BASE_URL}/api/parts/{created_part_id}/drawings",
                      files=files, headers=HDR, timeout=60)
    assert r.status_code == 200, r.text
    p = r.json()
    assert len(p["drawings"]) >= 1
    d = p["drawings"][-1]
    assert d["original_filename"] == "test.png"
    storage_path = d["storage_path"]
    drawing_id = d["id"]

    # Download w/ auth
    r2 = requests.get(f"{BASE_URL}/api/files/{storage_path}", headers=HDR, timeout=60)
    assert r2.status_code == 200
    assert len(r2.content) > 0

    # No auth
    r3 = requests.get(f"{BASE_URL}/api/files/{storage_path}", timeout=30)
    assert r3.status_code == 401

    # Delete drawing
    r4 = requests.delete(f"{BASE_URL}/api/parts/{created_part_id}/drawings/{drawing_id}",
                         headers=HDR, timeout=30)
    assert r4.status_code == 200
    remaining = [x for x in r4.json()["drawings"] if x["id"] == drawing_id]
    assert not remaining


def test_delete_part_flow():
    payload = {"part_code": "TEST_DEL", "part_name": "TEST Del", "quantity": 1,
               "material_type": "x", "material_dimensions": "y"}
    r = requests.post(f"{BASE_URL}/api/parts", json=payload, headers=HDR, timeout=30)
    pid = r.json()["id"]
    r2 = requests.delete(f"{BASE_URL}/api/parts/{pid}", headers=HDR, timeout=30)
    assert r2.status_code == 200
    r3 = requests.get(f"{BASE_URL}/api/parts/{pid}", headers=HDR, timeout=30)
    assert r3.status_code == 404
