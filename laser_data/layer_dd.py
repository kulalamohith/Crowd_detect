import requests
import random
import time
import json

selected_gates = [
    {"locationId": "stadium1", "gateId": "G1"},
    {"locationId": "metro1", "gateId": "G4"},
    {"locationId": "mall1", "gateId": "G6"},
    {"locationId": "theatre1", "gateId": "G7"}
]

API_URL = "http://localhost:5000/api/crowd-data"

def generate_density():
    return round(random.uniform(2.5, 9.8), 2)

def send_data():
    for gate in selected_gates:
        data = {
            "locationId": gate["locationId"],
            "gateId": gate["gateId"],
            "density": generate_density()
        }
        try:
            res = requests.post(API_URL, json=data)
            status = "yes" if res.status_code == 201 else "no"
            print(f"{status} {data}")
        except Exception as e:
            print("Failed to send:", e)

if __name__ == "__main__":
    while True:
        send_data()
        time.sleep(5)
