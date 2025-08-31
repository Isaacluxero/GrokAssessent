# SDR Grok Demo

An AI-powered SDR demo that uses Grok as the core intelligence layer to: (1) qualify and score inbound/outbound leads, (2) generate personalized outreach with guardrails + validation, and (3) track pipeline progress with searchable history. Includes a lightweight eval framework to iterate prompts + recommend improvements.

## Quick Start

1. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your GROK_API_KEY and other values
```

2. Start the database:
```bash
docker compose up -d db
```

3. Set up the database:
```bash
./scripts/setup-db.sh
```

4. Start both applications:
```bash
npm run dev
```

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, TailwindCSS, shadcn/ui, TanStack Query
- **Backend**: Node.js, Express, TypeScript, Prisma (Postgres), Grok API
- **AI**: Grok API with structured outputs and validation
- **Evaluation**: YAML/JSONL test cases with LLM grading

## Project Structure

```
sdr-grok/
├── frontend/          # Next.js React application
├── backend/           # Express + TypeScript API
├── scripts/           # Database setup and evaluation scripts
└── docker-compose.yml # Local development environment
```

## Demo Script (5 min)

1. **Dashboard**: Show funnel + last replies
2. **Scoring**: Open a lead, hit "Rescore" with different weights → watch score change
3. **Personalized Outreach**: Generate preview → validate → safety badge → "Send" (mock)
4. **Pipeline**: Move card to MEETING_SCHEDULED; timeline shows interactions
5. **Evals**: Run evals → show pass rate + recommendations for prompt iteration

## API Endpoints

- `GET /health` - Health check
- `GET/POST /leads` - Lead management
- `POST /leads/:id/score` - Score leads with AI
- `POST /outreach/preview` - Generate personalized outreach
- `POST /outreach/send` - Send outreach (mock)
- `POST /evals/run` - Run evaluation cases

## Environment Variables

```bash
DATABASE_URL=postgresql://isaaclucero@localhost:5432/sdr_grok_db
GROK_API_KEY=your_grok_api_key_here
GROK_MODEL=grok-4-0709
GROK_BASE_URL=https://api.x.ai/v1
HOST=http://localhost:3000
PORT=8080
```
