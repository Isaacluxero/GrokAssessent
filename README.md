# SDR Grok - AI-Powered Sales Development Platform

A production-ready SDR automation platform that leverages Grok AI for intelligent lead qualification, scoring, and personalized outreach generation. Built with modern TypeScript, comprehensive error handling, and enterprise-grade evaluation frameworks.

## Overview

SDR Grok transforms sales development workflows by providing:

### 🎯 **Core Capabilities**
- **Intelligent Lead Scoring**: Grok AI analyzes leads across multiple dimensions (industry fit, company size, title relevance, tech signals) to generate qualification scores
- **Personalized Outreach Generation**: AI-powered email creation with safety validation, PII detection, and hallucination prevention
- **Pipeline Management**: Visual kanban board with automated stage tracking and interaction logging
- **Performance Evaluation**: Comprehensive AI evaluation framework with uniform metrics for prompt optimization

### 🏗️ **Architecture**
- **Service-Oriented Design**: Modular services with clear separation of concerns
- **AI-First Approach**: Grok AI integration with fallback handling and error recovery
- **Type-Safe APIs**: Full TypeScript coverage with Zod validation schemas
- **Production Ready**: Comprehensive logging, monitoring, and deployment considerations

## Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (via Docker or local installation)
- Grok AI API key from X.AI

### Installation

1. **Clone and setup environment:**
```bash
git clone <repository-url>
cd sdr-grok
cp .env.example .env
# Edit .env with your GROK_API_KEY and database credentials
```

2. **Start the application:**
```bash
./startup.sh
```

This will:
- Start PostgreSQL database container
- Run database migrations and seeding
- Install all dependencies
- Start backend API server (port 8080)
- Start frontend application (port 3000)

### Manual Setup (Alternative)

1. **Database setup:**
```bash
docker compose up -d db
./scripts/setup-db.sh
```

2. **Backend setup:**
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

3. **Frontend setup:**
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Form Handling**: Zod for validation and type safety
- **Icons**: Lucide React for consistent iconography

### Backend
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with comprehensive type definitions
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Grok API with structured output parsing
- **Logging**: Pino for structured logging with configurable outputs
- **Validation**: Zod schemas for request/response validation
- **Documentation**: OpenAPI/Swagger integration

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Database**: PostgreSQL with connection pooling
- **Development**: Hot reload with tsx and Next.js dev server
- **Production**: Optimized builds with environment-specific configurations

## Project Structure

```
sdr-grok/
├── frontend/                 # Next.js React application
│   ├── app/                 # App Router pages and layouts
│   │   ├── page.tsx         # Dashboard (main page)
│   │   ├── leads/           # Lead management pages
│   │   └── evals/           # Evaluation framework pages
│   ├── components/          # Reusable React components
│   │   ├── ui/              # Base UI components (Button, etc.)
│   │   └── *.tsx            # Feature-specific components
│   ├── lib/                 # Utilities and API client
│   │   ├── api.ts           # TanStack Query hooks and API calls
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── utils.ts         # Helper functions
│   └── public/              # Static assets
├── backend/                 # Express + TypeScript API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   │   ├── leads.ts     # Lead CRUD operations
│   │   │   ├── scoring.ts   # AI scoring endpoints
│   │   │   ├── outreach.ts  # Email generation endpoints
│   │   │   └── evals.ts     # Evaluation framework endpoints
│   │   ├── services/        # Business logic layer
│   │   │   ├── grokClient.ts    # Grok AI API client
│   │   │   ├── leadService.ts   # Lead management logic
│   │   │   ├── scoringService.ts # AI scoring logic
│   │   │   ├── outreachService.ts # Email generation logic
│   │   │   └── evalService.ts   # Evaluation framework logic
│   │   ├── validators/      # Zod validation schemas
│   │   ├── utils/           # Utilities (logging, etc.)
│   │   ├── prompts/         # AI prompt templates
│   │   └── prisma/          # Database schema and seeds
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema definition
│   │   └── migrations/      # Database migration files
│   └── Dockerfile           # Container configuration
├── scripts/                 # Automation and setup scripts
├── docker-compose.yml       # Local development environment
├── startup.sh              # One-command startup script
└── .gitignore              # Git ignore patterns
```

## Core Features

### 1. Lead Management
- **CRUD Operations**: Full lead lifecycle management with company association
- **Automatic AI Scoring**: New leads are automatically scored by Grok AI upon creation
- **Pipeline Tracking**: Visual kanban board with drag-and-drop functionality
- **Search & Filtering**: Full-text search across leads, companies, and metadata

### 2. AI-Powered Scoring
- **Multi-Factor Analysis**: Industry fit, company size, title relevance, tech signals
- **Configurable Profiles**: Customizable scoring weights and business rules
- **Real-Time Evaluation**: Instant scoring with detailed factor breakdown
- **Score Validation**: Automatic reasonableness checks and confidence scoring

### 3. Personalized Outreach
- **Template-Based Generation**: AI enhancement of structured email templates
- **Variable Substitution**: Dynamic personalization with lead and company data
- **Safety Validation**: PII detection and hallucination risk assessment
- **Preview & Send**: Review generated emails before sending

### 4. Evaluation Framework
- **Uniform Metrics**: Consistent evaluation criteria across all AI operations
- **Performance Tracking**: Monitor AI response quality, consistency, and reliability
- **Batch Processing**: Evaluate multiple leads simultaneously
- **Actionable Insights**: Specific recommendations for prompt and system improvements

## API Reference

### Lead Management
```bash
GET    /api/leads              # List leads with pagination and filtering
POST   /api/leads              # Create new lead (auto-scored with AI)
GET    /api/leads/:id          # Get lead details
PUT    /api/leads/:id          # Update lead information
DELETE /api/leads/:id          # Delete lead and associated data
```

### AI Scoring
```bash
POST   /api/scoring/score      # Score lead with Grok AI
GET    /api/scoring/profiles   # List scoring profiles
POST   /api/scoring/profiles   # Create scoring profile
GET    /api/scoring/health     # Scoring service health check
```

### Outreach Generation
```bash
POST   /api/outreach/preview   # Generate email preview with AI
POST   /api/outreach/send      # Send personalized email
GET    /api/outreach/templates # List email templates
POST   /api/outreach/templates # Create email template
```

### Evaluation Framework
```bash
POST   /api/evals/batch        # Run batch evaluation on real leads
GET    /api/evals/runs         # List evaluation results
GET    /api/evals/cases        # List test cases
GET    /api/evals/health       # Evaluation service health check
```

### System Health
```bash
GET    /health                 # Overall application health
GET    /api/leads/health       # Lead service status
GET    /api/scoring/health     # Scoring service status
GET    /api/evals/health       # Evaluation service status
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

## Troubleshooting

### Common Issues

#### White Page / UI Not Loading
- **Check browser console** for JavaScript errors
- **Verify backend is running** on port 8080
- **Check network tab** for failed API calls
- **Restart services**: `./startup.sh`

#### Grok AI Scoring Failures
- **Verify API key** is set in environment variables
- **Check API quotas** and rate limits
- **Review backend logs** for detailed error messages
- **Test API directly**: `curl -X POST http://localhost:8080/api/scoring/score`

#### Database Connection Issues
- **Ensure PostgreSQL is running**: `docker compose ps`
- **Check DATABASE_URL** format and credentials
- **Verify database exists**: `psql -d sdr_grok_db -c "\dt"`
- **Reset database**: `npx prisma migrate reset --force`

#### Performance Issues
- **Monitor Grok API response times** (should be <10s)
- **Check database query performance** via logs
- **Review memory usage** of Node.js processes
- **Optimize database indexes** for large datasets

### Support

For issues and questions:
1. **Check logs**: Backend console output and browser console
2. **Review API responses**: Use browser DevTools Network tab
3. **Test individual services**: Use health check endpoints
4. **Verify configuration**: Double-check environment variables

### Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** with proper TypeScript types and tests
4. **Update documentation** as needed
5. **Submit pull request** with detailed description

---

**Built with ❤️ using Grok AI and modern TypeScript**
