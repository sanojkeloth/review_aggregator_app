# Movie Review Aggregator

A production-ready web application that aggregates movie reviews from multiple sources (YouTube, Instagram, articles, blogs) and uses AI to generate comprehensive summaries. Think "TripAdvisor for movies" - helping users make quick, informed decisions about what to watch.

## Features

### Customer-Facing Features
- 🎬 Browse curated movie reviews
- 🤖 AI-powered review summaries
- 🔍 Search and filter movies
- 📊 Sentiment analysis (Positive, Mixed, Negative)
- 📱 Fully responsive design
- 🎯 Quick recommendations

### Admin CMS Features
- 🔐 Google OAuth authentication
- 📝 Movie management (CRUD operations)
- 🔗 Review link aggregation
- 🧠 AI summarization engine
- 💬 AI chat interface for refining summaries
- 📈 Analytics dashboard
- 🎨 Intuitive content management

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React
- **State**: React Hooks, Zustand

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Google OAuth)
- **AI**: OpenAI GPT-4

### Content Extraction
- **YouTube**: youtube-transcript
- **Web Scraping**: Cheerio, Axios
- **Instagram**: Placeholder (requires Instagram Graph API)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud Platform account (for OAuth)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd review_aggregator_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in the required values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `OPENAI_API_KEY`: From OpenAI platform

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

### OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys
3. Create a new secret key
4. Copy to `.env`

### Database Setup

#### Local PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or
sudo apt-get install postgresql  # Ubuntu

# Create database
createdb movie_reviews
```

#### Docker PostgreSQL
```bash
docker run --name movie-reviews-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=movie_reviews \
  -p 5432:5432 \
  -d postgres:15
```

## Project Structure

```
review_aggregator_app/
├── app/
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth routes
│   │   ├── movies/        # Movie CRUD
│   │   └── public/        # Public API
│   ├── admin/             # Admin CMS pages
│   ├── movies/            # Public movie pages
│   └── page.tsx           # Homepage
├── components/
│   ├── admin/             # Admin components
│   ├── public/            # Public-facing components
│   ├── providers/         # Context providers
│   └── ui/                # Reusable UI components
├── lib/
│   ├── ai/                # AI services (OpenAI)
│   ├── extractors/        # Content extractors
│   ├── auth.ts            # NextAuth config
│   └── prisma.ts          # Prisma client
├── prisma/
│   └── schema.prisma      # Database schema
└── public/                # Static assets
```

## Usage

### Admin Workflow

1. **Sign in** at `/admin` with Google
2. **Add a movie**:
   - Click "Add Movie"
   - Fill in movie details (title, year, genre, etc.)
   - Upload poster image
   - Save as draft
3. **Add review links**:
   - Navigate to movie edit page
   - Add YouTube, article, or blog URLs
   - System will extract content automatically
4. **Generate summary**:
   - Click "Generate Summary"
   - AI processes all reviews
   - View AI-generated summary
5. **Refine with AI chat**:
   - Use chat interface to refine summary
   - Example: "Make it shorter" or "Focus on acting"
6. **Publish** the movie to make it visible to public

### Public User Experience

1. Visit homepage
2. Browse movie cards with sentiment indicators
3. Click on a movie to see:
   - Full AI summary
   - Strengths and weaknesses
   - Recommendation
   - Links to original sources
4. Use search to find specific movies

## API Documentation

### Public Endpoints

#### Get Movies
```http
GET /api/public/movies
Query Parameters:
  - search: string
  - genre: string
  - language: string
  - page: number
  - limit: number
```

#### Get Movie Details
```http
GET /api/public/movies/:id
```

### Admin Endpoints (Require Authentication)

#### Create Movie
```http
POST /api/movies
Body: { title, releaseYear, genre, ... }
```

#### Add Review
```http
POST /api/movies/:id/reviews
Body: { sourceUrl, sourceType, sourceName }
```

#### Generate Summary
```http
POST /api/movies/:id/summarize
```

#### Chat Refinement
```http
POST /api/movies/:id/chat
Body: { message: string }
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | App URL (e.g., https://yourdomain.com) |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth secret |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | Alternative AI provider |
| `NODE_ENV` | No | Environment (development/production) |

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Database Management
```bash
# Open Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (careful!)
npx prisma migrate reset
```

## Troubleshooting

### Common Issues

**Issue**: Prisma client errors
```bash
# Solution: Regenerate Prisma client
npx prisma generate
```

**Issue**: Database connection fails
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Verify database exists

**Issue**: Google OAuth not working
- Check redirect URI matches exactly
- Verify environment variables are set
- Ensure Google+ API is enabled

**Issue**: AI summarization fails
- Verify OpenAI API key is valid
- Check API usage limits
- Review error logs

## License

This project is licensed under the MIT License.

## Roadmap

- [ ] User accounts and favorites
- [ ] Multi-language support
- [ ] TV shows and series
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Recommendation engine
- [ ] Social features

---

Built with ❤️ using Next.js, TypeScript, and AI
