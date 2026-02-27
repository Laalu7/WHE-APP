"""
Backend API tests for WHE - Win Help Education
Tests login, subjects, questions, and PDF generation endpoints
"""
import pytest
import requests


class TestHealthAndRoot:
    """Basic health check tests"""

    def test_root_endpoint(self, api_client, base_url):
        """Test root API endpoint returns welcome message"""
        response = api_client.get(f"{base_url}/api/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "message" in data
        assert "WHE" in data["message"] or "Win Help Education" in data["message"]


class TestLogin:
    """Authentication endpoint tests"""

    def test_login_success(self, api_client, base_url, valid_credentials):
        """Test login with correct credentials"""
        response = api_client.post(
            f"{base_url}/api/login",
            json=valid_credentials
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.json()
        assert "success" in data
        assert data["success"] is True
        assert "token" in data
        assert data["token"] is not None
        assert "message" in data

    def test_login_failure_wrong_credentials(self, api_client, base_url, invalid_credentials):
        """Test login with incorrect credentials returns 401"""
        response = api_client.post(
            f"{base_url}/api/login",
            json=invalid_credentials
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"

        data = response.json()
        assert "detail" in data

    def test_login_failure_missing_username(self, api_client, base_url):
        """Test login with missing username"""
        response = api_client.post(
            f"{base_url}/api/login",
            json={"password": "Admin@123"}
        )
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"

    def test_login_failure_missing_password(self, api_client, base_url):
        """Test login with missing password"""
        response = api_client.post(
            f"{base_url}/api/login",
            json={"username": "admin"}
        )
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"


class TestSubjects:
    """Subjects endpoint tests"""

    def test_get_all_subjects(self, api_client, base_url):
        """Test GET /api/subjects returns all 6 subjects"""
        response = api_client.get(f"{base_url}/api/subjects")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.json()
        assert isinstance(data, list), "Expected list of subjects"
        assert len(data) == 6, f"Expected 6 subjects, got {len(data)}"

        # Verify all expected subject codes exist
        subject_codes = [s["code"] for s in data]
        expected_codes = ["JVN", "CET", "PSE", "NMMS", "GSSE", "TST"]
        for code in expected_codes:
            assert code in subject_codes, f"Missing subject: {code}"

        # Verify subject structure
        for subject in data:
            assert "id" in subject
            assert "code" in subject
            assert "name_gu" in subject
            assert "name_en" in subject
            assert "total_questions" in subject
            assert "has_questions" in subject
            assert "sections" in subject
            assert len(subject["sections"]) == 3, "Each subject should have 3 sections"

    def test_get_subject_by_id_jvn(self, api_client, base_url):
        """Test GET /api/subjects/jvn returns JVN subject details"""
        response = api_client.get(f"{base_url}/api/subjects/jvn")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.json()
        assert data["id"] == "jvn"
        assert data["code"] == "JVN"
        assert data["has_questions"] is True, "JVN should have questions"
        assert len(data["sections"]) == 3

    def test_get_subject_not_found(self, api_client, base_url):
        """Test GET /api/subjects/invalid returns 404"""
        response = api_client.get(f"{base_url}/api/subjects/invalid")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestQuestions:
    """Questions endpoint tests"""

    def test_get_jvn_questions(self, api_client, base_url):
        """Test GET /api/questions/JVN returns questions"""
        response = api_client.get(f"{base_url}/api/questions/JVN")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.json()
        assert isinstance(data, list), "Expected list of questions"
        assert len(data) > 0, "JVN should have questions"
        
        print(f"✓ Found {len(data)} JVN questions")

        # Verify question structure
        first_question = data[0]
        assert "id" in first_question
        assert "question_number" in first_question
        assert "question_text" in first_question
        assert "options" in first_question
        assert "subject" in first_question
        assert first_question["subject"] == "JVN"

        # Verify options structure
        assert len(first_question["options"]) == 4, "Each question should have 4 options"
        for option in first_question["options"]:
            assert "label" in option
            assert "text" in option
            assert option["label"] in ["A", "B", "C", "D"]

        # Verify no MongoDB _id in response
        assert "_id" not in first_question, "MongoDB _id should be excluded"

    def test_get_questions_empty_subject(self, api_client, base_url):
        """Test GET /api/questions/CET returns empty list (no questions yet)"""
        response = api_client.get(f"{base_url}/api/questions/CET")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.json()
        assert isinstance(data, list), "Expected list"
        assert len(data) == 0, "CET should have no questions yet"

    def test_get_questions_case_insensitive(self, api_client, base_url):
        """Test GET /api/questions/jvn (lowercase) works"""
        response = api_client.get(f"{base_url}/api/questions/jvn")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.json()
        # Should return same questions (backend converts to uppercase)
        assert isinstance(data, list)


class TestPDFGeneration:
    """PDF generation endpoint tests"""

    def test_generate_pdf_jvn(self, api_client, base_url):
        """Test POST /api/generate-pdf for JVN subject"""
        response = api_client.post(
            f"{base_url}/api/generate-pdf",
            json={
                "subject_code": "JVN",
                "title": "JVN Test Paper"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        # Verify response is PDF
        assert response.headers["Content-Type"] == "application/pdf"
        assert "Content-Disposition" in response.headers
        assert "JVN" in response.headers["Content-Disposition"]

        # Verify PDF content is not empty
        assert len(response.content) > 0, "PDF should have content"
        assert response.content[:4] == b'%PDF', "Response should be valid PDF"
        
        print(f"✓ PDF generated successfully, size: {len(response.content)} bytes")

    def test_generate_pdf_no_questions(self, api_client, base_url):
        """Test POST /api/generate-pdf for subject with no questions returns 404"""
        response = api_client.post(
            f"{base_url}/api/generate-pdf",
            json={
                "subject_code": "CET",
                "title": "CET Test Paper"
            }
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"

        data = response.json()
        assert "detail" in data
        assert "No questions" in data["detail"]

    def test_generate_pdf_missing_subject_code(self, api_client, base_url):
        """Test POST /api/generate-pdf without subject_code returns 422"""
        response = api_client.post(
            f"{base_url}/api/generate-pdf",
            json={"title": "Test"}
        )
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
