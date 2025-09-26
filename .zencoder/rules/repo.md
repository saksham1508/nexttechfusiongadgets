---
description: Repository Information Overview
alwaysApply: true
---

# NextTechFusionGadgets Information

## Summary
NextTechFusionGadgets is a cutting-edge Quick Commerce Platform built with React, TypeScript, Node.js, and MongoDB. It features 10-15 minute delivery, real-time tracking, AI-powered search, and advanced e-commerce capabilities specifically designed for tech products and gadgets.

## Structure
- **backend/**: Express.js API with MongoDB models, controllers, and services
- **frontend/**: React application with TypeScript, Redux, and Tailwind CSS
- **docker-compose.yml**: Multi-container setup with MongoDB, Redis, and monitoring
- **scripts/**: PowerShell scripts for environment setup and management

## Language & Runtime
**Frontend**:
- **Language**: TypeScript (target ES2021)
- **Framework**: React 18
- **Package Manager**: npm
- **Build Tool**: react-scripts (Create React App)

**Backend**:
- **Language**: JavaScript (Node.js)
- **Framework**: Express.js
- **Package Manager**: npm
- **Node Version**: >=16.0.0

## Dependencies

### Frontend Dependencies
**Main Dependencies**:
- React 18.2.0
- Redux Toolkit 1.9.7
- React Router 6.20.1
- Axios 1.6.2
- Framer Motion 10.18.0
- Socket.io-client 4.8.1
- Payment integrations (Stripe, PayPal)

**Development Dependencies**:
- TypeScript 4.9.5
- Tailwind CSS 3.3.0
- Cross-env 7.0.3

### Backend Dependencies
**Main Dependencies**:
- Express 4.18.2
- Mongoose 7.5.0
- JWT 9.0.2
- Redis 4.6.10
- Socket.io 4.7.4
- Payment gateways (Stripe, Razorpay, PayPal, Instamojo)
- OpenAI/Gemini AI integrations

**Development Dependencies**:
- Jest 29.7.0
- Nodemon 3.0.1
- ESLint 8.54.0
- MongoDB Memory Server 9.1.3

## Build & Installation

### Root Project
```bash
npm install                # Install dependencies for both frontend and backend
npm run dev                # Start both frontend and backend in development mode
```

### Frontend
```bash
cd frontend
npm install
npm start                  # Development server
npm run build              # Production build
npm run start:prod         # Start with production environment
```

### Backend
```bash
cd backend
npm install
npm run dev                # Development server with nodemon
npm run start:prod         # Start with production environment
```

## Docker
**Docker Compose**: Multi-container setup with services:
- MongoDB (6.0)
- Redis (7-alpine)
- Backend API (Node.js 18-alpine)
- Frontend (Nginx-served React build)
- Monitoring stack (Prometheus, Grafana)

**Backend Dockerfile**: Multi-stage build with development and production targets
**Frontend Dockerfile**: Multi-stage build with optimized Nginx-served production build

**Run Command**:
```bash
docker-compose up -d       # Start all services
docker-compose up backend  # Start only backend service
```

## Testing
**Backend Testing**:
- **Framework**: Jest
- **Test Location**: backend/tests/
- **Configuration**: Jest with MongoDB Memory Server
- **Run Command**:
```bash
cd backend
npm test                   # Run all tests
npm run test:unit          # Run unit tests
npm run test:integration   # Run integration tests
```

**Frontend Testing**:
- **Framework**: React Testing Library (via react-scripts)
- **Run Command**:
```bash
cd frontend
npm test
```

## Environment Management
The project supports three distinct environments:
- **Development**: Local development with debugging
- **Test**: Isolated test database with mock payments
- **Production**: Live payments with enhanced security

Environment variables are managed through `.env` files in both frontend and backend directories with environment-specific versions (.env.development, .env.test, .env.production).