# Strudel Sample Library

A comprehensive web application for discovering, managing, and sharing audio samples for the Strudel live coding community.

## Features

### Sample Discovery
- Search and browse `strudel.json` files from public GitHub repositories
- Filter by categories (drums, bass, synth, ambient, etc.)
- Preview samples directly in the browser
- Display sample metadata (BPM, key, tags, author)
- Generate Strudel-ready code snippets for each sample

### Personal Library Management
- User authentication system (Google, GitHub, or email/password)
- Save favorites and create custom collections
- Organize samples into playlists/projects
- Tag and annotate samples
- Export collections as Strudel code

### Sample Upload & Sharing
- Upload audio files (WAV, MP3, OGG, WebM)
- Auto-generate `strudel.json` metadata
- Public/private sharing options
- Community contributions

## Technology Stack

- **Frontend**: Next.js 14+ with React, Tailwind CSS, Web Audio API
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Local filesystem (dev) / Cloud storage (production)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Known Issues

**Prisma Client Import**: Prisma 7 requires a custom output path. After running `npx prisma generate`, you may need to adjust the import in `lib/prisma.ts` to match your generated client location. The current setup generates to `node_modules/.prisma/client`.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd strudel-sample-library
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL`: SQLite database path (default: `file:./dev.db`)
- `NEXTAUTH_SECRET`: Generate a random secret (e.g., `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your app URL (default: `http://localhost:3000`)
- OAuth credentials (optional): Add Google/GitHub client IDs and secrets for OAuth login

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
strudel-sample-library/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── samples/      # Sample search and preview
│   │   ├── library/      # Favorites and collections
│   │   └── upload/       # Sample upload
│   ├── components/       # React components
│   │   ├── SampleBrowser.tsx
│   │   ├── SamplePlayer.tsx
│   │   ├── LibraryManager.tsx
│   │   ├── UploadInterface.tsx
│   │   ├── CodeGenerator.tsx
│   │   └── Navigation.tsx
│   ├── library/          # Library page
│   ├── upload/           # Upload page
│   └── page.tsx          # Home page
├── lib/
│   ├── services/         # GitHub integration service
│   ├── prisma.ts         # Prisma client
│   ├── strudel-codegen.ts # Code generation utilities
│   └── audio-utils.ts    # Audio utilities
├── prisma/
│   └── schema.prisma     # Database schema
└── types/
    └── next-auth.d.ts    # NextAuth type definitions
```

## Usage

### Discovering Samples

1. Navigate to the home page
2. Use the search bar to find samples
3. Filter by category or source (GitHub/Uploaded)
4. Click on samples to preview them
5. Select multiple samples to generate Strudel code

### Managing Your Library

1. Sign in to access your library
2. Click the heart icon to favorite samples
3. Create collections to organize samples
4. Export collections as Strudel code

### Uploading Samples

1. Sign in and navigate to the Upload page
2. Fill in sample metadata (optional)
3. Drag and drop audio files or click to select
4. Your samples will be available in the discovery page

## API Endpoints

- `GET /api/samples/search` - Search for samples
- `GET /api/samples/preview` - Preview audio files
- `GET /api/library/favorites` - Get user favorites
- `POST /api/library/favorites` - Add favorite
- `DELETE /api/library/favorites` - Remove favorite
- `GET /api/library/collections` - Get collections
- `POST /api/library/collections` - Create collection
- `POST /api/upload` - Upload sample

## Development

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration-name

# Apply migrations
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio
```

### Building for Production

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
