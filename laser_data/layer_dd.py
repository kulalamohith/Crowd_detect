import requests
import random
import time
from datetime import datetime

#  backend endpoint (localhost or your hosted server)
API_URL = "http://localhost:5000/api/crowd-data"

# List of zones to simulate
zones = ["Z1", "Z2", "Z3", "Z4"]

def generate_density():
    return round(random.uniform(2.5, 9.8), 2)

def send_data():
    for zone in zones:
        data = {
            "zoneId": zone,
            "density": generate_density()
        }
        try:
            res = requests.post(API_URL, json=data)
            print(f" Sent to {zone} -> {data['density']} | Status: {res.status_code}")
        except Exception as e:
            print(" Failed:", e)

# Main loop – send data every 5 seconds
if __name__ == "__main__":
    while True:
        send_data()
        time.sleep(5)
