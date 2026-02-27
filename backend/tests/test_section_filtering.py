"""
Backend API tests for Section Filtering Feature
Tests that questions can be filtered by section (mental, math, gujarati)
"""
import pytest
import requests


class TestSectionFiltering:
    """Test section query parameter filtering for questions endpoint"""

    def test_jvn_section_mental(self, api_client, base_url):
        """Test GET /api/questions/JVN?section=mental returns 12 questions"""
        response = api_client.get(f"{base_url}/api/questions/JVN?section=mental")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.json()
        assert isinstance(data, list), "Expected list of questions"
        assert len(data) == 12, f"Expected 12 mental ability questions, got {len(data)}"
        
        # Verify all questions have section='mental'
        for question in data:
            assert "section" in question, "Question should have section field"
            assert question["section"] == "mental", f"Expected section='mental', got {question.get('section')}"
            assert question["subject"] == "JVN", "All questions should be JVN subject"
        
        print(f"✓ GET /api/questions/JVN?section=mental returned {len(data)} questions")

    def test_jvn_section_math(self, api_client, base_url):
        """Test GET /api/questions/JVN?section=math returns empty array (0 questions)"""
        response = api_client.get(f"{base_url}/api/questions/JVN?section=math")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.json()
        assert isinstance(data, list), "Expected list"
        assert len(data) == 0, f"Expected 0 math questions (Coming Soon), got {len(data)}"
        
        print(f"✓ GET /api/questions/JVN?section=math returned empty array (Coming Soon)")

    def test_jvn_section_gujarati(self, api_client, base_url):
        """Test GET /api/questions/JVN?section=gujarati returns empty array (0 questions)"""
        response = api_client.get(f"{base_url}/api/questions/JVN?section=gujarati")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.json()
        assert isinstance(data, list), "Expected list"
        assert len(data) == 0, f"Expected 0 gujarati questions (Coming Soon), got {len(data)}"
        
        print(f"✓ GET /api/questions/JVN?section=gujarati returned empty array (Coming Soon)")

    def test_jvn_without_section_param(self, api_client, base_url):
        """Test GET /api/questions/JVN without section param returns all questions"""
        response = api_client.get(f"{base_url}/api/questions/JVN")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.json()
        assert isinstance(data, list), "Expected list of questions"
        # Should return all 12 questions (all are mental section)
        assert len(data) == 12, f"Expected 12 total questions, got {len(data)}"
        
        print(f"✓ GET /api/questions/JVN (no section param) returned {len(data)} questions")

    def test_section_filtering_case_sensitive(self, api_client, base_url):
        """Test section filtering is case-sensitive (lowercase 'mental' should work)"""
        response = api_client.get(f"{base_url}/api/questions/JVN?section=mental")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12, "Lowercase 'mental' should match database section value"
        
        print("✓ Section filtering works with lowercase section names")

    def test_section_filtering_invalid_section(self, api_client, base_url):
        """Test section filtering with non-existent section returns empty array"""
        response = api_client.get(f"{base_url}/api/questions/JVN?section=invalid_section")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0, "Non-existent section should return empty array"
        
        print("✓ Invalid section returns empty array (no error)")


class TestSectionFilteringDataIntegrity:
    """Verify database has correct section assignments"""

    def test_all_jvn_questions_have_section_field(self, api_client, base_url):
        """Verify all JVN questions have section field"""
        response = api_client.get(f"{base_url}/api/questions/JVN")
        assert response.status_code == 200
        questions = response.json()
        
        for question in questions:
            assert "section" in question, f"Question {question.get('question_number')} missing section field"
            assert question["section"] is not None, f"Question {question.get('question_number')} has null section"
        
        print(f"✓ All {len(questions)} JVN questions have section field")

    def test_section_distribution(self, api_client, base_url):
        """Test section distribution: all 12 questions should be mental section"""
        response = api_client.get(f"{base_url}/api/questions/JVN")
        questions = response.json()
        
        section_count = {}
        for q in questions:
            section = q.get("section", "unknown")
            section_count[section] = section_count.get(section, 0) + 1
        
        assert section_count.get("mental", 0) == 12, f"Expected 12 mental questions, got {section_count.get('mental', 0)}"
        assert section_count.get("math", 0) == 0, "Expected 0 math questions"
        assert section_count.get("gujarati", 0) == 0, "Expected 0 gujarati questions"
        
        print(f"✓ Section distribution verified: {section_count}")
