import pytest
from datetime import timedelta
from backend.security import hash_password, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    pw = "SecretPass@2026"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPass", hashed) is False

def test_jwt_generation_and_decoding():
    payload = {
        "sub": "test@aicte-india.org",
        "userId": "usr-test-99",
        "role": "regional_officer",
        "regionalOffice": "Northern Regional Office",
        "institutionPid": None
    }
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "test@aicte-india.org"
    assert decoded["role"] == "regional_officer"
    assert decoded["iss"] == "pravah-aicte-auth"

def test_jwt_expired_token():
    payload = {"sub": "expired@aicte.org", "userId": "usr-exp"}
    expired_token = create_access_token(payload, expires_delta=timedelta(seconds=-10))
    with pytest.raises(ValueError, match="Invalid or expired token"):
        decode_access_token(expired_token)

def test_valid_login(client):
    res = client.post("/api/auth/login", json={
        "email": "r.srivastava@aicte-india.org",
        "password": "Password@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "r.srivastava@aicte-india.org"
    assert data["user"]["role"] == "regional_officer"

def test_invalid_password_login(client):
    res = client.post("/api/auth/login", json={
        "email": "r.srivastava@aicte-india.org",
        "password": "WrongPassword999"
    })
    assert res.status_code == 401
    assert "Invalid credentials" in res.json()["detail"]

def test_nonexistent_user_login(client):
    res = client.post("/api/auth/login", json={
        "email": "ghost@aicte-india.org",
        "password": "Password@123"
    })
    assert res.status_code == 401

def test_get_current_user_me(client, ro_token):
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {ro_token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "r.srivastava@aicte-india.org"
    assert data["role"] == "regional_officer"

def test_protected_route_unauthenticated(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
