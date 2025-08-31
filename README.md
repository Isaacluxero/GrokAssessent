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

## Deployment Considerations

### Production Environment Setup

#### Required Environment Variables
```bash
# Core Configuration
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-domain.com

# Database Configuration (Use managed PostgreSQL)
DATABASE_URL=postgresql://username:password@host:5432/sdr_grok_prod
DATABASE_POOL_SIZE=20
DATABASE_CONNECTION_TIMEOUT=30000

# Grok AI Configuration
GROK_API_KEY=your_production_grok_api_key
GROK_MODEL=grok-4-0709
GROK_BASE_URL=https://api.x.ai/v1
GROK_TIMEOUT=30000
GROK_MAX_RETRIES=2

# Security Configuration
CORS_ORIGINS=https://your-domain.com
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100        # requests per window

# Monitoring & Logging
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_for_error_tracking
```

#### Database Deployment
1. **Use managed PostgreSQL** (AWS RDS, Google Cloud SQL, Azure Database)
2. **Configure SSL connections** for security
3. **Set up automated backups** (daily + point-in-time recovery)
4. **Configure connection pooling** (10-20 connections recommended)
5. **Run migrations**: `npx prisma migrate deploy`
6. **Seed initial data**: `npm run db:seed`

#### Application Deployment

**Option 1: Cloud Platforms (Recommended)**
```bash
# Frontend: Vercel
vercel --prod

# Backend: Railway, Render, or AWS App Runner
railway login && railway up
```

**Option 2: Container Deployment**
```bash
# Build production images
docker build -t sdr-grok-backend ./backend
docker build -t sdr-grok-frontend ./frontend

# Deploy with orchestration (Kubernetes, ECS, etc.)
kubectl apply -f k8s/
```

#### Performance & Scaling
- **Frontend**: Use CDN (CloudFront, Cloudflare) for static assets
- **Backend**: Configure horizontal scaling with load balancer
- **Database**: Use read replicas for high-traffic scenarios
- **Caching**: Implement Redis for session storage and API caching
- **Monitoring**: Set up APM (DataDog, New Relic) and error tracking (Sentry)

#### Security Checklist
- [ ] Configure HTTPS with SSL certificates
- [ ] Set up CORS for production domains only
- [ ] Enable rate limiting (100 req/15min recommended)
- [ ] Configure security headers (helmet.js)
- [ ] Use environment variables for all secrets
- [ ] Set up VPC with private subnets (if using AWS/GCP)
- [ ] Configure firewall rules and security groups
- [ ] Regular security updates and dependency scanning

#### Monitoring & Health Checks
```bash
# Application health endpoints
GET /health                    # Overall application health
GET /api/leads/health/status   # Lead service health
GET /api/scoring/health/status # Scoring service health
GET /api/evals/health/status   # Evaluation service health

# Key metrics to monitor
- API response times (<2s for scoring, <500ms for CRUD)
- Grok API success rate (>95%)
- Database connection pool usage
- Memory and CPU utilization
- Error rates by endpoint
```

#### Backup & Recovery
- **Database**: Automated daily backups with 30-day retention
- **Application**: Code in version control with deployment artifacts
- **Configurations**: Environment variables in secure storage
- **Disaster Recovery**: RTO <4 hours, RPO <1 hour

#### Cost Optimization
- **Grok API**: Monitor token usage and implement caching
- **Database**: Right-size instances based on actual usage
- **Compute**: Use auto-scaling to match demand
- **Storage**: Implement log rotation and data archival policies
