# Use a stable Python lightweight base image
FROM python:3.10-slim

# Install system libraries required for OpenCV and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install PyTorch (CPU-only version) to dramatically reduce container size and RAM usage
RUN pip install --no-cache-dir torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu

# Install the rest of the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Create the data directory for storage (and visual vaults)
RUN mkdir -p data/card_images

# Expose the API port (Cloud Run will override this, but standardizing on 8080 or dynamic is good practice)
EXPOSE 8080

# Start uvicorn server, using the PORT environment variable if available, defaulting to 8000
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
