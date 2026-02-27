"""
Backend API tests for new GET /api/generate-pdf/{subject_code} endpoint
Tests for bug fix: PDF 'Method Not Allowed' error on mobile
"""
import pytest
import requests


class TestNewPDFEndpoint:
    """Test new GET endpoint for PDF generation (mobile browser compatibility)"""

    def test_generate_pdf_get_basic(self, api_client, base_url):
        """Test GET /api/generate-pdf/JVN returns valid PDF"""
        response = api_client.get(f"{base_url}/api/generate-pdf/JVN")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        # Verify response is PDF
        assert response.headers["Content-Type"] == "application/pdf"
        assert "Content-Disposition" in response.headers
        assert "JVN" in response.headers["Content-Disposition"]

        # Verify PDF content is not empty
        assert len(response.content) > 0, "PDF should have content"
        assert response.content[:4] == b'%PDF', "Response should be valid PDF"
        
        print(f"✓ GET PDF generated successfully, size: {len(response.content)} bytes")

    def test_generate_pdf_get_with_title(self, api_client, base_url):
        """Test GET /api/generate-pdf/JVN with custom title"""
        response = api_client.get(f"{base_url}/api/generate-pdf/JVN?title=Test%20Paper")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        assert response.headers["Content-Type"] == "application/pdf"
        assert len(response.content) > 0
        assert response.content[:4] == b'%PDF'
        
        print("✓ GET PDF with custom title generated successfully")

    def test_generate_pdf_get_with_selected_ids(self, api_client, base_url):
        """Test GET /api/generate-pdf/JVN?selected_ids=<id1>,<id2> filters correctly"""
        # First, get all questions to get valid question IDs
        questions_response = api_client.get(f"{base_url}/api/questions/JVN")
        assert questions_response.status_code == 200
        questions = questions_response.json()
        assert len(questions) >= 3, "Need at least 3 questions for this test"
        
        # Select first 3 questions
        selected_ids = [questions[0]["id"], questions[1]["id"], questions[2]["id"]]
        ids_param = ",".join(selected_ids)
        
        # Generate PDF with only selected questions via GET
        response = api_client.get(
            f"{base_url}/api/generate-pdf/JVN?selected_ids={ids_param}&title=Selected%20Questions"
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify response is PDF
        assert response.headers["Content-Type"] == "application/pdf"
        assert len(response.content) > 0, "PDF should have content"
        assert response.content[:4] == b'%PDF', "Response should be valid PDF"
        
        print(f"✓ GET PDF with {len(selected_ids)} selected questions generated successfully")

    def test_generate_pdf_get_no_questions(self, api_client, base_url):
        """Test GET /api/generate-pdf/CET (no questions) returns 404"""
        response = api_client.get(f"{base_url}/api/generate-pdf/CET")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"

        data = response.json()
        assert "detail" in data
        assert "No questions" in data["detail"]
        
        print("✓ GET PDF returns 404 for subject with no questions")

    def test_generate_pdf_get_with_empty_selected_ids(self, api_client, base_url):
        """Test GET /api/generate-pdf/JVN?selected_ids= (empty string) returns all questions"""
        response = api_client.get(f"{base_url}/api/generate-pdf/JVN?selected_ids=")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        assert response.headers["Content-Type"] == "application/pdf"
        assert len(response.content) > 0
        assert response.content[:4] == b'%PDF'
        
        print("✓ GET PDF with empty selected_ids returns all questions")


class TestBackwardCompatibility:
    """Test POST /api/generate-pdf still works (backward compatibility)"""

    def test_post_generate_pdf_still_works(self, api_client, base_url):
        """Test POST /api/generate-pdf still works after adding GET endpoint"""
        response = api_client.post(
            f"{base_url}/api/generate-pdf",
            json={
                "subject_code": "JVN",
                "title": "JVN POST Test Paper"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        # Verify response is PDF
        assert response.headers["Content-Type"] == "application/pdf"
        assert "Content-Disposition" in response.headers
        assert len(response.content) > 0
        assert response.content[:4] == b'%PDF'
        
        print("✓ POST /api/generate-pdf still works (backward compatibility verified)")

    def test_post_with_selected_questions_still_works(self, api_client, base_url):
        """Test POST /api/generate-pdf with selected_question_ids still works"""
        # Get question IDs
        questions_response = api_client.get(f"{base_url}/api/questions/JVN")
        questions = questions_response.json()
        selected_ids = [questions[0]["id"], questions[1]["id"]]
        
        response = api_client.post(
            f"{base_url}/api/generate-pdf",
            json={
                "subject_code": "JVN",
                "title": "POST Selected Questions",
                "selected_question_ids": selected_ids
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.headers["Content-Type"] == "application/pdf"
        assert response.content[:4] == b'%PDF'
        
        print("✓ POST /api/generate-pdf with selected_question_ids still works")
