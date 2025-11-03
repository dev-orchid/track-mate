# TrackMate

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kedar17/track-mate)

A full-stack user tracking and analytics platform built with Next.js and Express.js.

## Features

- **User Tracking**: Track user sessions, events, and behavior
- **Admin Dashboard**: Modern Next.js dashboard with real-time analytics
- **Profile Management**: Track and manage user profiles
- **Event Analytics**: Detailed event tracking and analysis
- **Webhook Integration**: Server-side event tracking via webhooks
- **API Key Authentication**: Secure webhook endpoints
- **JWT Authentication**: Secure access to admin dashboard

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Vercel-ready

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start both client and server
npm run watch

# Or start separately
npm run client  # Client on http://localhost:3000
npm run server  # Server on http://localhost:8000
```

### Environment Variables

Create `server/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
PORT=8000
```

Create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

### Deploy to Vercel (Recommended)

**Quick Deploy** (10 minutes):
See [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)

**Full Documentation**:
See [DEPLOYMENT.md](./DEPLOYMENT.md)

### Step-by-Step Deploy

1. Click "Deploy with Vercel" button above
2. **Set Root Directory to `client`** ⚠️ (Required!)
3. Add environment variable `NEXT_PUBLIC_API_URL`
4. Deploy!

**Important**: You MUST set the Root Directory to `client` or deployment will fail.

## Project Structure

```
track-mate/
├── client/                # Next.js frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Next.js pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── styles/       # CSS styles
│   │   └── utils/        # Utilities
│   └── package.json
├── server/               # Express.js backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── utils/        # Utilities
│   ├── api/              # Vercel serverless handlers
│   └── package.json
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## Scripts

```bash
# Development
npm run watch           # Run both client and server
npm run client          # Run client only (Next.js dev)
npm run server          # Run server only (nodemon watch)

# Installation
npm install             # Install all dependencies
npm run install-client  # Install client dependencies
npm run install-server  # Install server dependencies

# Production Build
npm run build           # Build client for production
npm run build:client    # Build client only
npm run vercel-build    # Vercel build command

# Testing
npm test                # Run all tests
```

## API Documentation

See [API_GUIDE.md](./API_GUIDE.md) for complete API documentation.

## Development Guide

See [CLAUDE.md](./CLAUDE.md) for detailed development instructions and architecture.

## Features Documentation

- **Tracking Guide**: [TRACKING_GUIDE.md](./TRACKING_GUIDE.md)
- **Webhook Flow**: [WEBHOOK_FLOW_DIAGRAM.md](./WEBHOOK_FLOW_DIAGRAM.md)
- **QA Report**: [QA_REPORT.md](./QA_REPORT.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Express.js**
