#!/usr/bin/env python3
"""Quick test to verify the Q-AOP demo is working."""

import requests
import json
import time

def test_servers():
    print("🧪 Testing Q-AOP Demo Servers...")
    print("=" * 50)
    
    # Test backend
    try:
        print("🔍 Testing backend (http://localhost:8000)...")
        response = requests.get('http://localhost:8000/docs', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running - FastAPI docs available")
        else:
            print(f"❌ Backend returned status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend not accessible - make sure it's running")
        return False
    except Exception as e:
        print(f"❌ Backend error: {e}")
        return False
    
    # Test frontend
    try:
        print("🔍 Testing frontend (http://localhost:5173)...")
        response = requests.get('http://localhost:5173', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running - React app accessible")
        else:
            print(f"❌ Frontend returned status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Frontend not accessible - make sure it's running")
        return False
    except Exception as e:
        print(f"❌ Frontend error: {e}")
        return False
    
    # Test API with small network
    try:
        print("🔍 Testing API optimization...")
        small_network = {
            "nodes": [
                {"id": 0, "lat": 70.0, "lon": -150.0},
                {"id": 1, "lat": 71.0, "lon": -149.0},
                {"id": 2, "lat": 72.0, "lon": -148.0}
            ],
            "edges": []
        }
        
        payload = {
            "network": small_network,
            "mode": "classical"
        }
        
        response = requests.post('http://localhost:8000/optimize', json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API optimization successful!")
            print(f"   Route: {len(result['route'])} nodes")
            print(f"   Fuel: {result['fuel_nm']} nm")
            print(f"   Time: {result['block_time_h']} hours")
        else:
            print(f"❌ API returned status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API test error: {e}")
        return False
    
    print("=" * 50)
    print("🎉 All tests passed! Demo is ready!")
    print()
    print("🚀 Open your browser to:")
    print("   Frontend: http://localhost:5173")
    print("   Backend:  http://localhost:8000/docs")
    print()
    print("🎬 Demo Script:")
    print("1. Show classical optimization (blue theme)")
    print("2. Toggle quantum mode (purple theme + 20s wait)")
    print("3. Compare results in side panel (10% improvement)")
    print("4. Highlight business value ($2.4M savings)")
    
    return True

if __name__ == "__main__":
    test_servers() 