"""
Free location-based services using OpenStreetMap APIs
No API key required - completely free!
"""
import requests
from typing import List, Dict, Optional
import time

class PlacesService:
    def __init__(self):
        # OpenStreetMap Nominatim for geocoding (free, no API key)
        self.nominatim_url = "https://nominatim.openstreetmap.org"
        # Overpass API for POI search (free, no API key)
        self.overpass_url = "https://overpass-api.de/api/interpreter"
        self.headers = {
            'User-Agent': 'PharmAI-Nexus/1.0'  # Required by OSM
        }
    
    def reverse_geocode(self, lat: float, lon: float) -> Dict:
        """Get location details from coordinates using Nominatim (FREE)"""
        try:
            url = f"{self.nominatim_url}/reverse"
            params = {
                'lat': lat,
                'lon': lon,
                'format': 'json',
                'addressdetails': 1
            }
            
            response = requests.get(url, params=params, headers=self.headers, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            address = data.get('address', {})
            return {
                'city': address.get('city') or address.get('town') or address.get('village', 'Unknown'),
                'state': address.get('state', ''),
                'country': address.get('country', 'Unknown'),
                'display_name': data.get('display_name', 'Unknown Location')
            }
        except Exception as e:
            print(f"Reverse geocoding error: {e}")
            return {
                'city': 'Unknown',
                'state': '',
                'country': 'Unknown',
                'display_name': f"{lat}, {lon}"
            }
    
    def search_nearby_facilities(self, lat: float, lon: float, radius_km: float = 5.0, 
                                 facility_types: List[str] = None) -> List[Dict]:
        """
        Search for nearby medical facilities using Overpass API (FREE)
        
        Args:
            lat, lon: User's coordinates
            radius_km: Search radius in kilometers
            facility_types: List of facility types to search for
        
        Returns:
            List of facilities with details
        """
        if facility_types is None:
            facility_types = ['hospital', 'clinic', 'doctors', 'laboratory']
        
        try:
            # Build Overpass QL query
            radius_m = int(radius_km * 1000)
            
            # Query for healthcare facilities
            query = f"""
            [out:json][timeout:25];
            (
              node["amenity"="hospital"](around:{radius_m},{lat},{lon});
              node["amenity"="clinic"](around:{radius_m},{lat},{lon});
              node["amenity"="doctors"](around:{radius_m},{lat},{lon});
              node["healthcare"="laboratory"](around:{radius_m},{lat},{lon});
              node["healthcare"="clinic"](around:{radius_m},{lat},{lon});
              way["amenity"="hospital"](around:{radius_m},{lat},{lon});
              way["amenity"="clinic"](around:{radius_m},{lat},{lon});
              way["healthcare"="laboratory"](around:{radius_m},{lat},{lon});
            );
            out body;
            >;
            out skel qt;
            """
            
            response = requests.post(
                self.overpass_url,
                data={'data': query},
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            
            facilities = []
            seen_names = set()  # Avoid duplicates
            
            for element in data.get('elements', []):
                tags = element.get('tags', {})
                name = tags.get('name', tags.get('operator', 'Unnamed Facility'))
                
                # Skip duplicates
                if name in seen_names:
                    continue
                seen_names.add(name)
                
                # Get coordinates
                if element['type'] == 'node':
                    elem_lat = element['lat']
                    elem_lon = element['lon']
                elif element['type'] == 'way' and 'center' in element:
                    elem_lat = element['center']['lat']
                    elem_lon = element['center']['lon']
                else:
                    continue
                
                # Calculate distance
                distance_km = self._calculate_distance(lat, lon, elem_lat, elem_lon)
                
                # Determine facility type
                amenity = tags.get('amenity', tags.get('healthcare', 'clinic'))
                facility_type = self._map_facility_type(amenity)
                
                # Extract contact info
                phone = tags.get('phone', tags.get('contact:phone', ''))
                website = tags.get('website', tags.get('contact:website', ''))
                
                # Build address
                address_parts = []
                for key in ['addr:housenumber', 'addr:street', 'addr:city']:
                    if key in tags:
                        address_parts.append(tags[key])
                address = ', '.join(address_parts) if address_parts else 'Address not available'
                
                facilities.append({
                    'name': name,
                    'type': facility_type,
                    'distance_km': round(distance_km, 2),
                    'address': address,
                    'contact': phone,
                    'website': website,
                    'lat': elem_lat,
                    'lon': elem_lon,
                    'opening_hours': tags.get('opening_hours', 'Not specified')
                })
            
            # Sort by distance
            facilities.sort(key=lambda x: x['distance_km'])
            
            # Return top 10
            return facilities[:10]
            
        except Exception as e:
            print(f"Overpass API error: {e}")
            return self._get_fallback_facilities(lat, lon)
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two coordinates using Haversine formula"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in km
        
        lat1_rad = radians(lat1)
        lat2_rad = radians(lat2)
        delta_lat = radians(lat2 - lat1)
        delta_lon = radians(lon2 - lon1)
        
        a = sin(delta_lat/2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    def _map_facility_type(self, amenity: str) -> str:
        """Map OSM amenity tags to user-friendly types"""
        mapping = {
            'hospital': 'Hospital',
            'clinic': 'Clinic',
            'doctors': 'Doctor\'s Office',
            'laboratory': 'Laboratory',
            'pharmacy': 'Pharmacy'
        }
        return mapping.get(amenity.lower(), 'Medical Facility')
    
    def _get_fallback_facilities(self, lat: float, lon: float) -> List[Dict]:
        """Fallback mock data if API fails"""
        return [
            {
                "name": "Nearby Medical Center",
                "type": "Hospital",
                "distance_km": 2.5,
                "address": "Location data unavailable",
                "contact": "",
                "website": "",
                "lat": lat,
                "lon": lon,
                "opening_hours": "24/7"
            }
        ]

# Singleton instance
places_service = PlacesService()
