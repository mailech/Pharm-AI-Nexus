import requests
import json

# Test the backend API
url = "http://localhost:8000/api/check_interactions"
payload = {
    "drugs": ["monocef", "Erithromycin", "Aspirin"]
}

print("Testing backend API...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print("\n" + "="*50 + "\n")

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n✓ SUCCESS! Response:")
        print(json.dumps(data, indent=2))
        
        print("\n" + "="*50)
        print("ANALYSIS:")
        print(f"  Drugs analyzed: {data.get('drugs', [])}")
        print(f"  Interactions found: {len(data.get('drug_interactions', []))}")
        print(f"  Organ impacts: {len(data.get('organ_impacts', {}))}")
        print(f"  Region impacts: {len(data.get('region_impacts', {}))}")
        print(f"  Global risk: {data.get('global_risk', 0)}")
        
        if data.get('region_impacts'):
            print("\n  Top affected regions:")
            sorted_regions = sorted(data['region_impacts'].items(), key=lambda x: x[1], reverse=True)[:10]
            for region, score in sorted_regions:
                print(f"    - {region}: {score:.2f}")
    else:
        print(f"\n✗ ERROR: {response.text}")
        
except Exception as e:
    print(f"\n✗ EXCEPTION: {e}")
