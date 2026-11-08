async def test_register(client):
    payload = {
                "email": "user@gmail.com",
                "name": "Test user",
                "password": "AA123456",
            }
    response = await client.post("/register", json=payload)
    data = response.json()
    assert response.status_code == 201
    assert "access_token" in data
    assert "refresh_token" in data
    assert "id" in data
    assert payload["email"] == data["email"]
    assert payload["name"] == data["name"]
    assert data["token_type"] == "bearer"