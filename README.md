# ResilientChain AI (ResilientSupply)

> **Autonomous Multi-Agent Supply Chain Resilience & Deterministic Fleet Logistics Platform**  
> *Built for modern enterprise logistics with specialized Indian freight corridors, real-time GPS tracking, and multi-agent governance.*

---

## 📌 Architectural Philosophy: Neuro-Symbolic AI

ResilientChain AI follows a strict **Hybrid Neuro-Symbolic Architecture**:

> *"Use deterministic algorithms for hard constraints, physical routing, and financial calculations; use Generative AI for reasoning, context parsing, and human-understandable explanations."*

1. **Deterministic Solvers (Symbolic)**: Google OR-Tools and NetworkX calculate optimal routes, transit delays, stock-out risks, and financial trade-offs mathematically without hallucination.
2. **Multi-Agent AI (Neural)**: Specialized agents (Sensing, Logistics, Inventory, Compliance, and Orchestrator) reason through incident data, parse unstructured bills of lading, and synthesize recovery options.
3. **Driver Mobile Companion (Edge & Telematics)**: Live hardware GPS streaming (`navigator.geolocation`), MoRTH-compliant duty/rest break clock, and 1-tap roadside Emergency SOS alerts.
4. **Human-in-the-Loop Governance**: Multi-role cryptographic approvals with SHA-256 tamper-evident audit trails.

---

## ✨ Key Capabilities

- 🗺️ **GPS Freight Grid & Telematics**: Interactive dark/light Leaflet map tracking commercial carrier fleets across India's golden quadrilateral (NH-48, NH-44, JNPT, NCR) with simulated hardware telemetry.
- 📱 **Driver Mobile Companion Portal**: Dedicated mobile view with live GPS location streaming, MoRTH duty status toggles (Driving, Rest Break with countdown, Unloading), and emergency broadcasting.
- 🏢 **Multi-Tenant Organization & Role Portal**: Self-serve customer onboarding with custom role management (Admin, Dispatcher, Compliance Officer, Logistics Lead) and custom supply chain node/route mapping.
- ⚡ **Multi-Objective Recovery Solver**: Evaluates and compares alternative recovery corridors balancing transit time, cost penalties, inventory preservation, and regulatory compliance.
- 🛡️ **Autonomous Policy RAG & Compliance**: Validates GST e-way bills, toll fast-tags, cold-chain temperature thresholds, and driver hours-of-service against MoRTH guidelines.
- 🔒 **Cryptographic Audit Ledger**: Immutable record of all automated recommendations, human overrides, and dispatched carrier orders.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.12, FastAPI, SQLAlchemy, SQLite, NetworkX, Google OR-Tools, Pydantic, Uvicorn |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Leaflet, React-Leaflet, Lucide Icons |
| **Intelligence** | Gemini 2.5 Flash, Multi-Agent Orchestration, Policy RAG Engine |
| **Styling** | Executive Monochrome Design System (high-contrast slate & charcoal, zero neon clutter) |

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The FastAPI documentation (Swagger UI) is available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Access the application at: `http://localhost:5173`

---

## 👥 Multi-Role Demo Access

You can log into the application using predefined demo personas or enroll a custom enterprise organization:
- **Operations Director** (`lead_ops`): Full scenario simulation, strategy synthesis, and execution authorization.
- **Logistics Dispatcher** (`dispatcher_mumbai`): Live fleet monitoring, driver tracking, and route allotment.
- **Compliance Officer** (`compliance_delhi`): Regulatory checks, SLA verification, and MoRTH compliance audits.

---

## 📄 License

Apache-2.0 License.
