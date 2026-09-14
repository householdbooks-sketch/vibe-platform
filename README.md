# Vibe Platform

An intelligent code generation and collaboration platform built with Next.js, designed to run on Cloudflare's edge infrastructure with real-time code generation and live preview capabilities.

## Architecture Overview

### Edge Runtime & Deployment
- **Platform**: Cloudflare Pages with edge runtime capabilities
- **Framework**: Next.js 16.3.5 with static export optimization
- **Build Target**: Static site generation (`next build`) with Cloudflare Pages integration
- **Deployment**: Automated CI/CD via GitHub Actions to Cloudflare Pages

### Database & Schema
- **Database**: Cloudflare D1 (SQLite-compatible serverless database)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Schema Structure**:
  - `workspaces`: Project organization and management
  - `sessions`: Code generation sessions within workspaces  
  - `prompts`: Conversation history and AI interactions
  - `generatedFiles`: Version-controlled generated code files

### 3-Column Workspace Interface
The platform features a responsive three-panel workspace designed for efficient code generation workflows:

1. **Left Panel (320px)**: Prompt & Conversation Interface
   - AI model selection (Claude 3.5 Sonnet default)
   - Message history and conversation flow
   - Real-time generation status indicators
   - Token usage tracking

2. **Center Panel (Flexible)**: Code Editor & File Management
   - Multi-file code viewer with syntax highlighting
   - Generated file navigation and selection
   - Code editing capabilities with live updates
   - File version tracking and history

3. **Right Panel (384px)**: Live Preview
   - Real-time HTML/CSS/JS preview rendering
   - Responsive design testing viewport
   - Hot-reload on code changes
   - Loading states during generation

## Setup & Local Development

### Prerequisites
- Node.js 22.x or later
- npm (latest version recommended)
- Git for version control

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd vibe-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # If you encounter peer dependency issues:
   npm install --legacy-peer-deps
   ```

3. **Configure environment (if needed):**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

### Development Commands

- **Start development server:**
  ```bash
  npm run dev
  ```
  Opens at [http://localhost:3000](http://localhost:3000)

- **Build for production:**
  ```bash
  npm run build
  ```

- **Build for Cloudflare Pages:**
  ```bash
  npm run build:pages
  ```

- **Run linting:**
  ```bash
  npm run lint
  ```

- **Generate database schema:**
  ```bash
  npm run db:generate
  ```

### Project Structure

```
vibe-platform/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   └── db/              # Database schema and configuration
├── drizzle/             # Database migrations
├── public/              # Static assets
├── .github/workflows/   # CI/CD automation
├── wrangler.jsonc       # Cloudflare configuration
└── drizzle.config.ts    # Drizzle ORM configuration
```

## GitHub Actions Secrets Configuration

For automated deployments to Cloudflare Pages, configure the following secrets in your GitHub repository settings:

### Required Secrets

1. **CLOUDFLARE_API_TOKEN**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Create a Custom Token with the following permissions:
     - `Cloudflare Pages:Edit`
     - `Account:Read`
     - `Zone:Read` (if using custom domain)
   - Include your account in Account Resources
   - Copy the token value

2. **CLOUDFLARE_ACCOUNT_ID**
   - Found in Cloudflare Dashboard sidebar
   - Or via API: `curl -X GET "https://api.cloudflare.com/client/v4/accounts" -H "Authorization: Bearer YOUR_API_TOKEN"`
   - Copy the Account ID value

### Setting up Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact names above
5. Verify the secrets are listed in your repository settings

### Deployment Workflow

The CI/CD pipeline includes two jobs:

- **`validate`**: Runs on all pushes and pull requests
  - Code quality checks (ESLint)
  - Build verification
  - Dependency installation testing

- **`deploy`**: Runs only on main branch pushes after validation passes  
  - Builds static site for Cloudflare Pages
  - Deploys to `vibe-platform` project on Cloudflare
  - Automatic URL generation for preview deployments

## Development Workflow

1. **Feature Development:**
   - Create feature branch from main
   - Develop with `npm run dev` for hot reloading
   - Test build process with `npm run build`

2. **Quality Assurance:**
   - Run `npm run lint` to check code quality
   - Verify build succeeds without errors
   - Test generated static files in `./out` directory

3. **Deployment:**
   - Create pull request to main branch
   - Automated validation runs via GitHub Actions
   - Merge triggers automatic deployment to Cloudflare Pages
   - Monitor deployment status in Cloudflare Dashboard

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/) - Pages deployment and configuration
- [Drizzle ORM Documentation](https://orm.drizzle.team/) - Database operations and schema management
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/) - Serverless database features
