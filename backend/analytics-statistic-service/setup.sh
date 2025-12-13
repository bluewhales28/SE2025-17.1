#!/bin/bash
# Setup script for Analytics Service

echo "Setting up Analytics Service..."

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo "Please update .env file with your configuration"
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p reports/pdf
mkdir -p fonts
mkdir -p logs

echo "Setup complete!"
echo ""
echo "To start the service:"
echo "  1. Update .env file with your configuration"
echo "  2. Run: uvicorn app.main:app --reload --port 8004"
echo ""
echo "To run with Docker:"
echo "  docker-compose up -d"


