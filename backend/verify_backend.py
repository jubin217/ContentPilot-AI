import sys
import os

# Reconfigure stdout to support UTF-8 printing (handles emojis on Windows)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Add the current directory to sys.path so we can import app
sys.path.append(os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("==========================================")
    print("STARTING BACKEND INTEGRATION VERIFICATION")
    print("==========================================")

    # 1. Test Root
    print("\n[Test 1] GET /")
    res = client.get("/")
    print("Status:", res.status_code)
    print("JSON:", res.json())
    assert res.status_code == 200
    assert res.json()["status"] == "online"

    # 2. Test Tone Detection
    print("\n[Test 2] POST /api/tone")
    payload = {"text": "I am so frustrated because my server keeps crashing!"}
    res = client.post("/api/tone", json=payload)
    print("Status:", res.status_code)
    print("JSON:", res.json())
    assert res.status_code == 200
    assert "detected_tone" in res.json()
    assert "professional_reply" in res.json()

    # 3. Test Predict Engagement
    print("\n[Test 3] POST /api/predict-engagement")
    payload = {"text": "Here is an amazing tip on how to deploy a Kubernetes cluster in 5 minutes."}
    res = client.post("/api/predict-engagement", json=payload)
    print("Status:", res.status_code)
    print("JSON:", res.json())
    assert res.status_code == 200
    assert "scores" in res.json()
    assert "hook" in res.json()["scores"]

    # 4. Test Career Copilot
    print("\n[Test 4] POST /api/career-copilot")
    payload = {"achievement": "Completed AWS Certified Cloud Practitioner Certification"}
    res = client.post("/api/career-copilot", json=payload)
    print("Status:", res.status_code)
    print("JSON:", res.json())
    assert res.status_code == 200
    assert "linkedin_post" in res.json()
    assert "resume_update" in res.json()
    assert len(res.json()["interview_questions"]) > 0

    # 5. Test Journal CRUD
    print("\n[Test 5] POST /api/journal (Create)")
    payload = {"text": "Finished building the backend API.", "category": "Project"}
    res = client.post("/api/journal", json=payload)
    print("Status:", res.status_code)
    print("JSON:", res.json())
    assert res.status_code == 200
    entry_id = res.json()["id"]

    print("\n[Test 6] GET /api/journal (Read List)")
    res = client.get("/api/journal")
    print("Status:", res.status_code)
    print("Entries Found:", len(res.json()))
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 6. Test Journal Digest Generation
    print("\n[Test 7] POST /api/journal/generate-digest")
    payload = {"entry_ids": [entry_id], "digest_type": "LinkedIn Post"}
    res = client.post("/api/journal/generate-digest", json=payload)
    print("Status:", res.status_code)
    print("JSON:", res.json())
    assert res.status_code == 200
    assert "output_text" in res.json()


    print("\n[Test 8] DELETE /api/journal/{id} (Delete)")
    res = client.delete(f"/api/journal/{entry_id}")
    print("Status:", res.status_code)
    print("JSON:", res.json())
    assert res.status_code == 200

    # 7. Test Writing Style API
    print("\n[Test 9] POST /api/style")
    payload = {
        "name": "Tech Enthusiast",
        "sample_texts": "Hey folks! Just deployed a new site. It was super fast. The UI looks slick, check it out!"
    }
    res = client.post("/api/style", json=payload)
    print("Status:", res.status_code)
    print("JSON:", res.json())
    assert res.status_code == 200
    style_id = res.json()["id"]

    print("\n[Test 10] GET /api/style")
    res = client.get("/api/style")
    print("Status:", res.status_code)
    print("Styles Found:", len(res.json()))
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 8. Test AI Generation
    print("\n[Test 11] POST /api/generate")
    payload = {
        "text": "built a react project today",
        "format": "LinkedIn Post",
        "style": "Technical",
        "custom_style_id": style_id
    }
    res = client.post("/api/generate", json=payload)
    print("Status:", res.status_code)
    print("JSON:", res.json())
    assert res.status_code == 200
    assert "output_text" in res.json()

    # 9. Test Rewrite
    print("\n[Test 12] POST /api/rewrite")
    payload = {
        "text": "this code is bad but it works i guess",
        "action": "Professionalize"
    }
    res = client.post("/api/rewrite", json=payload)
    print("Status:", res.status_code)
    print("JSON:", res.json())
    assert res.status_code == 200
    assert "output_text" in res.json()

    print("\n==========================================")
    print("ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
