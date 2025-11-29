import requests
import json

BASE_URL = "http://localhost:8000"

def test_check_interactions():
    print("Testing /api/check_interactions...")
    payload = {
        "drugs": ["Warfarin", "Aspirin", "Ibuprofen"]
    }
    try:
        response = requests.post(f"{BASE_URL}/api/check_interactions", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("Success!")
            print(f"Drugs: {data.get('drugs')}")
            print(f"Interactions: {len(data.get('drug_interactions', []))}")
            print(f"Organ Impacts: {data.get('organ_impacts')}")
        else:
            print(f"Failed with status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_mock_appointment():
    print("\nTesting /api/appointments/mock...")
    payload = {
        "facility": "City Hospital",
        "time": "10:00 AM"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/appointments/mock", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("Success!")
            print(f"Booking: {data}")
        else:
            print(f"Failed with status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_check_interactions()
    test_mock_appointment()
