## Getting Started
### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose installed
- Docker Desktop running (Windows/macOS)

### Run

```bash
# Clone the repository
git clone https://github.com/Kol1brii/MyAI.git
cd MyAI

# Copy environment variables
cp .env-example .env  # Linux/macOS
# or
copy .env-example .env  # Windows

# Run with Docker
docker compose up --build
```

- ~~The API will be available at: http://localhost:8000~~
- ~~Interactive Swagger docs: http://localhost:8000/docs~~
- API ds2api will be available at: http://172.19.0.2:5001/ 
- ~~ReDoc: http://localhost:8000/redoc~~