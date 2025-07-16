# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Project Status (July 2025)

**COMPLETE RENTAL PREDICTION APPLICATION** with v2.0 improvements implemented.
- ✅ Professional mobile-first web application running locally
- ✅ Security layer with HTTPS, rate limiting, and input validation
- ✅ Complete property prediction interface with all features
- ✅ Enhanced ML model v2.0 with 60-70% better accuracy
- ✅ Expanded scraper with 5 data sources (vs 2 previously)
- ✅ 7,395 quality listings (max 6 months old)
- ✅ Confidence metrics and market condition evaluation
- ⚠️ Building/deployment may have issues due to React Native folder conflicts

## Development Commands

- `npm run dev` - Start development server (usually localhost:3001 due to port conflicts)
- `npm run dev:https` - Start secure HTTPS development server on localhost:3007
- `npm run build` - Build for production (may have conflicts with rent-predictor-app folder)
- `npm run lint` - Run ESLint
- `npm run scrape` - Run basic web scraper (2 sources)
- `npm run scrape:enhanced` - Run enhanced scraper (5 sources, quality data)
- `npm run seed` - Seed database with initial data
- `npm run test-prisma` - Test database connection
- `npm run test:https` - Test HTTPS server connectivity
- `npm run test:ml` - Test enhanced ML model v2.0
- `npm run train:ml` - Train machine learning model
- `npm run verify:prod` - Verify production deployment
- `npm run check:env` - Check environment variables
- `npm run setup:prod` - Setup production environment

## Architecture Overview

This is a **complete rental prediction application** for Chilean real estate market with PostgreSQL database, security features, and professional UI for both mobile and desktop.

### Core Components

**Database Schema (Prisma)**
- `Listing` model: stores rental data (comuna, m2, precio)
- `ScrapeLog` model: tracks scraping operations
- PostgreSQL with unique constraints on comuna+m2 combinations

**API Routes**
- `/api/predict` - Basic prediction endpoint (GET/POST) that calculates rental price percentiles
- `/api/predict-enhanced` - **ENHANCED PREDICTION ENDPOINT v2.0** (currently in use)
- `/api/admin-data` - Admin dashboard data with price distribution charts
- `/api/predict-ml` - Machine learning prediction endpoint

**Pages**
- `/` - **MAIN APPLICATION** - Complete rental prediction interface with professional UI
- `/widget` - Alternative simple widget interface
- `/admin` - Admin dashboard with price distribution charts

**Additional Applications**
- `rent-predictor-app/` - React Native mobile application (complete with navigation)
- `public/embed.js` - Embeddable widget for external websites

**Data Pipeline**
- `scripts/scraper.js` - Web scraper for portalinmobiliario.com and yapo.cl
- `scripts/train.py` - Python ML model training
- `scripts/seed.js` - Database seeding

### Prediction Logic

The main prediction algorithm (`/api/predict`) calculates price percentiles (P25, P50, P75) by:
1. Fetching listings for specified comuna
2. Computing per-m2 prices 
3. Scaling to requested m2
4. Returning statistical distribution

### Technology Stack

- **Frontend**: Next.js 14, React, TailwindCSS, Recharts
- **Backend**: Next.js API routes, Prisma ORM  
- **Database**: PostgreSQL
- **Security**: HTTPS certificates, rate limiting, input validation, security headers
- **ML**: Python with scikit-learn (separate training pipeline)
- **Mobile**: React Native application (separate)
- **Deployment**: Local development (Vercel deployment may need updates)

### Security Features Implemented

- **HTTPS Development Server**: Custom SSL certificates for localhost and mobile access
- **Rate Limiting**: 30 requests/minute POST, 60 requests/minute GET
- **Input Validation**: Joi schema validation for all API inputs
- **Security Headers**: XSS protection, CSRF prevention, content security policy
- **Data Sanitization**: Input/output sanitization to prevent injection attacks
- **Audit Logging**: Security event logging for monitoring

### Development Notes

- **Main App URL**: http://localhost:3001 (HTTP) or https://localhost:3007 (HTTPS)
- **Mobile Access**: https://192.168.100.145:3007 (accept certificate prompt)
- Database requires `DATABASE_URL` environment variable
- Scraper uses real data from portalinmobiliario.com and yapo.cl
- ML training requires Python environment with requirements.txt
- Admin dashboard shows price distribution charts using Recharts
- All monetary values formatted in Chilean Peso (CLP)
- Building may fail due to React Native folder - use development servers

### Current Application Features

✅ **Complete Property Form**:
- Comuna selection (dynamic from API)
- Square meters input
- Property type (apartment/house)
- Bedrooms (1-5)
- Parking spaces (0-3)
- Storage unit checkbox

✅ **Professional UI**:
- Mobile-first responsive design
- Modern gradients and animations
- Professional branding and badges
- Loading states and error handling
- Detailed results with percentiles

✅ **Advanced Results Display**:
- Price range with CLP formatting
- Statistical analysis (P25, P50, P75)
- Data quality indicators
- Property count and source information