"""Iteration 2 tests: due_date persistence + Excel export endpoint."""
import io
import os
import zipfile
import pytest
import requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
TOKEN = "seed_session_alper"
HDR = {"Authorization": f"Bearer {TOKEN}"}


# ---------------- due_date ----------------
def test_create_part_persists_due_date():
    payload = {
        "part_code": "TEST_DUE_001",
        "part_name": "TEST Due Part",
        "quantity": 1,
        "due_date": "2026-09-10",
    }
    r = requests.post(f"{BASE_URL}/api/parts", json=payload, headers=HDR, timeout=30)
    assert r.status_code == 200, r.text
    p = r.json()
    assert p["due_date"] == "2026-09-10"
    pid = p["id"]

    # GET verify persistence
    g = requests.get(f"{BASE_URL}/api/parts/{pid}", headers=HDR, timeout=30)
    assert g.status_code == 200
    assert g.json()["due_date"] == "2026-09-10"

    # PUT update due_date
    payload2 = {**payload, "due_date": "2026-12-31"}
    u = requests.put(f"{BASE_URL}/api/parts/{pid}", json=payload2, headers=HDR, timeout=30)
    assert u.status_code == 200
    assert u.json()["due_date"] == "2026-12-31"

    # PUT clear due_date
    payload3 = {**payload, "due_date": None}
    u2 = requests.put(f"{BASE_URL}/api/parts/{pid}", json=payload3, headers=HDR, timeout=30)
    assert u2.status_code == 200
    assert u2.json().get("due_date") in (None, "")

    # cleanup
    requests.delete(f"{BASE_URL}/api/parts/{pid}", headers=HDR, timeout=30)


def test_list_parts_returns_due_date_field():
    r = requests.get(f"{BASE_URL}/api/parts", headers=HDR, timeout=30)
    assert r.status_code == 200
    parts = r.json()
    # each part dict must have due_date key (Optional)
    for p in parts:
        assert "due_date" in p


# ---------------- Excel export ----------------
def test_export_xlsx_unauth():
    r = requests.get(f"{BASE_URL}/api/export/parts.xlsx", timeout=30)
    assert r.status_code == 401


def test_export_xlsx_ok():
    r = requests.get(f"{BASE_URL}/api/export/parts.xlsx", headers=HDR, timeout=60)
    assert r.status_code == 200, r.text
    ct = r.headers.get("content-type", "")
    assert "openxmlformats-officedocument.spreadsheetml.sheet" in ct
    assert len(r.content) > 0

    # Verify it's a valid xlsx (zip) with expected sheet names
    buf = io.BytesIO(r.content)
    with zipfile.ZipFile(buf) as z:
        assert "xl/workbook.xml" in z.namelist()
        wb_xml = z.read("xl/workbook.xml").decode("utf-8", errors="ignore")
        assert "Parçalar" in wb_xml
        assert "Durum Geçmişi" in wb_xml
