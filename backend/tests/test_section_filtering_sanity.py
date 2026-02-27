"""
Sanity checks for section filtering iteration
Quick tests to verify login and PDF generation still work with section filtering
"""
import pytest
import requests


class TestSanityChecks:
    """Quick sanity tests for critical endpoints"""

    def test_login_works(self, api_client, base_url, valid_credentials):
        """Verify login still works with admin/Admin@123"""
        response = api_client.post(
            f"{base_url}/api/login",
            json=valid_credentials
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        
        print("✓ Login endpoint working (admin/Admin@123)")

    def test_pdf_generation_works(self, api_client, base_url):
        """Verify GET /api/generate-pdf/JVN returns valid PDF"""
        response = api_client.get(f"{base_url}/api/generate-pdf/JVN")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        assert response.headers["Content-Type"] == "application/pdf"
        assert len(response.content) > 0
        assert response.content[:4] == b'%PDF'
        
        print(f"✓ PDF generation working, size: {len(response.content)} bytes")

    def test_subjects_endpoint_works(self, api_client, base_url):
        """Verify subjects endpoint returns 6 subjects"""
        response = api_client.get(f"{base_url}/api/subjects")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 6
        assert data[0]["code"] == "JVN"
        
        print("✓ Subjects endpoint working (6 subjects)")
