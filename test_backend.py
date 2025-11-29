import requests
import json

# Test the backend API
url = "http://localhost:8000/api/check_interactions"
payload = {
    "drugs": ["monocef", "paracetamol", "Dolo 650"]
}

print("Testing backend API...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print("\n" + "="*50 + "\n")

try:
    response = requests.post(url, json=payload, timeout=5)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n✓ SUCCESS! Response:")
        print(json.dumps(data, indent=2))
    else:
        print(f"\n✗ ERROR: {response.text}")
        
except requests.exceptions.Timeout:
    print("\n✗ TIMEOUT: Request took too long (>5 seconds)")
except Exception as e:
    print(f"\n✗ EXCEPTION: {e}")
