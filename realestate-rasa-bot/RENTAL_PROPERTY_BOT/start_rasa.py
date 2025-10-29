import os
import subprocess
import time
import socket

# Delay start a bit so Render doesn't timeout
print("⏳ Waiting for environment to stabilize...")
time.sleep(10)

port = os.getenv("PORT")
if not port:
    print("⚙️  No PORT found in environment, using default 10000 for local run.")
    port = "10000"
cors_origin = "https://shineoneestate-new-1.onrender.com"
model_path = "models/RENTALPROPERTYMODEL.tar.gz"

cmd = [
    "rasa", "run",
    "--enable-api",
    "--cors", cors_origin,
    "--model", model_path,
    "--interface", "0.0.0.0",   # ✅ corrected flag
    "--port", str(port)
]

print(f"Binding explicitly to 0.0.0.0:{port}")
os.environ["PORT"] = str(port)
print(f"🚀 Starting Rasa server on port {port} with CORS {cors_origin}")
subprocess.Popen(cmd)

# Wait until the port is open to satisfy Render’s port scan
print("🔍 Waiting for Rasa to open the port...")
for _ in range(60):  # up to ~60 seconds
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("0.0.0.0", int(port))) == 0:
            print(f"✅ Port {port} is open. Rasa is live!")
            while True:
                time.sleep(60)
        time.sleep(1)

print("❌ Timeout: Rasa did not open the port in time.")