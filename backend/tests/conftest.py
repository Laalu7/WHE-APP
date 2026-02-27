import pytest
import requests
import os

@pytest.fixture
def api_client():
    """Shared requests session for API testing"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def base_url():
    """Get base URL from environment variable"""
    url = os.environ.get('EXPO_PUBLIC_BACKEND_URL')
    if not url:
        pytest.fail("EXPO_PUBLIC_BACKEND_URL environment variable not set")
    return url.rstrip('/')

@pytest.fixture
def valid_credentials():
    """Valid login credentials"""
    return {"username": "admin", "password": "Admin@123"}

@pytest.fixture
def invalid_credentials():
    """Invalid login credentials"""
    return {"username": "wrong", "password": "wrong"}
