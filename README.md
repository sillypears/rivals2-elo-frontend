# Rivals 2 ELO Frontend

A modern React frontend application for tracking Rivals 2 ELO matches with comprehensive match management, statistics visualization, and manual match entry capabilities.

## Features

### Match Management
- **Manual Match Entry**: Complete form with character/stage/winner selection
- **Final Move Tracking**: Per-game final move selection for all 3 games
- **JSON Import**: Paste JSON data with modal validation feedback
- **Inline Editing**: Edit match details directly on detail pages
- **Delete Functionality**: Confirmation dialogs with navigation

### User Experience
- **Modal Feedback**: Beautiful success/error modals replace browser alerts
- **Loading States**: Proper loading indicators throughout the app
- **Keyboard Accessibility**: ESC key support for all modals
- **Error Recovery**: Comprehensive error handling with user guidance
- **Form Reset**: Automatic form clearing after successful submissions

### Statistics & Analytics
- **Character Statistics**: Win rates, pick frequencies, matchup data
- **Stage Analytics**: Stage pick rates and win percentages
- **ELO Tracking**: Historical ELO changes and trends
- **Head-to-Head**: Player vs player matchup analysis
- **Heatmaps**: Visual data representations

## Tech Stack

- **React 19** with modern hooks and patterns
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **ESLint + Prettier** for code quality
- **Husky + lint-staged** for pre-commit hooks

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production docker
npm run docker:build

# Run linting
npm run lint
```

### Pre-commit Hooks
The project uses Husky and lint-staged for automatic code quality checks:
- ESLint fixes auto-fixable issues
- Code formatting ensures consistency
- Pre-commit validation prevents bad commits

## API Integration

The frontend integrates with a comprehensive REST API providing:
- **40+ endpoints** covering all match and statistics operations
- **Automatic error handling** with timeout and retry logic
- **Type-safe data fetching** with custom React hooks
- **Real-time updates** and optimistic UI updates

See `API_WORKFLOW.md` for detailed API documentation.

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (buttons, dialogs, etc.)
│   ├── Match/        # Match-specific components
│   └── ErrorBoundary.jsx
├── hooks/
│   └── useApi.js     # Custom API hooks for all endpoints
├── utils/
│   └── api.js        # API function definitions (40+ functions)
├── pages/            # Main page components
│   ├── MatchEntry.jsx    # Manual match creation
│   ├── MatchDetailPage.jsx # Match viewing/editing/deletion
│   └── ...
└── config.js         # API configuration
```

## Docker

```bash
# Build Docker image
npm run docker:build

# Run with Docker
docker run -p 8006:80 rivals2-elo-fend
```

## Requirements

1. [GUI for Logging](https://github.com/sillypears/rivals2-log-parser)
2. [Backend API](https://github.com/sillypears/rivals2-elo-backend)
3. [Frontend](https://github.com/sillypears/rivals2-elo-frontend)

## Contributing

1. Follow the established code style and patterns
2. Use the provided pre-commit hooks
3. Update documentation for new features
4. Test thoroughly before submitting PRs

## License

[Add license information here]