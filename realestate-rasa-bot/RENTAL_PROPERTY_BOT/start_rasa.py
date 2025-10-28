import os
import subprocess

# Read the Render-assigned port (fallback to 10000 locally)
port = os.environ.get("PORT", "10000")

# Your frontend URL for CORS
cors_origin = "https://shineoneestate-new-1.onrender.com"

# The trained model path
model_path = "models/RENTALPROPERTYMODEL.tar.gz"

# Build the command
cmd = [
    "rasa", "run",
    "--enable-api",
    "--cors", cors_origin,
    "--port", str(port),
    "--model", model_path
]

print(f"🚀 Starting Rasa server on port {port} with CORS {cors_origin}")
subprocess.run(cmd)