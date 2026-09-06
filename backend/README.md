# ResilientChain AI — Backend Engine

FastAPI backend providing deterministic supply chain optimization, route graph analysis, and multi-agent coordination.

## Quickstart

1. Create and activate a Python virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API docs (Swagger UI) will be live at: `http://localhost:8000/docs`
