async def test_health(client):
    response = await client.get("/v1/health")
    data = response.json()
    assert response.status_code == 200
    assert data == {"success": "ok"}