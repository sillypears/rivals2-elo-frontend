# Agent Guidelines for rivals2-elo-frontend

## Overview
This is a React frontend application for tracking Rivals 2 ELO matches. The app provides comprehensive match management, statistics visualization, and manual match entry capabilities with modern UX patterns and robust error handling.

## Commands
- **Build**: `vite build`
- **Lint**: `eslint .`
- **Dev server**: `vite --host --port 8006`
- **Pre-commit**: Automatic linting and formatting via Husky + lint-staged
- **No test framework configured** - add test scripts to package.json if needed

## Development Workflow
- **Pre-commit Hooks**: Husky + lint-staged automatically lint and format code
- **Git Hooks**: `.husky/pre-commit` runs `npx lint-staged`
- **Code Quality**: ESLint fixes auto-fixable issues before commits
- **Import Optimization**: Direct API imports prevent infinite re-renders

## Code Style
- **Language**: JavaScript with JSX (no TypeScript)
- **Imports**: Use `@/*` alias for src directory (configured in jsconfig.json)
- **Components**: PascalCase naming, .jsx extension
- **Styling**: Tailwind CSS with custom design tokens
- **UI Library**: Radix UI components via shadcn/ui + custom dialog components
- **Error Handling**: Use ErrorBoundary component and custom hooks for API calls
- **Formatting**: ESLint with recommended rules + React hooks plugin
- **Naming**: camelCase for files/utilities, PascalCase for components

## API Architecture

### HTTP Client
- **Enhanced fetch wrapper** with 10-second timeout and error handling
- **Request deduplication** and consistent error normalization
- **40+ API functions** covering all backend endpoints from OpenAPI spec

### Custom Hooks System
```javascript
// Data fetching hooks
const { data, loading, error } = useCharacters();
const { data: match } = useMatch(id);
const { data: matches } = useMatches(params);

// Mutation hooks
const { update, updating } = useUpdateMatch();
const { deleteMatch, deleting } = useDeleteMatch();
```

### Available Endpoints
- **Health**: Health checks and WebSocket utilities
- **Meta Data**: Characters, stages, seasons, tiers, opponents, moves
- **Matches**: CRUD operations, pagination, existence checks, forfeits
- **Statistics**: Charts, analytics, performance metrics, elo changes
- **Time**: Game duration analytics by season/opponent
- **Mutable**: Match creation, updates, and deletion

## Component Architecture

### UI Components
- **Dialog System**: Modal components with ESC key support and backdrop clicks
- **Loading States**: Loading spinners and skeleton components
- **Error Boundaries**: Graceful error handling and recovery
- **Form Components**: Comprehensive match entry with validation
- **CountdownTimer**: Live countdown to season end dates

### Page Components
- **MatchEntry**: Manual match creation with JSON import and final moves
- **MatchDetailPage**: Match viewing/editing with delete functionality
- **MatchesPage**: Match listing and navigation
- **ChartsPage**: Statistics and analytics visualization

## Key Features Implemented

### Match Management
- **Manual Entry**: Complete form with character/stage/winner selection
- **Final Moves**: Per-game final move selection for all 3 games
- **JSON Import**: Paste JSON data with modal validation feedback
- **Inline Editing**: Edit match details directly on detail page
- **Delete Functionality**: Confirmation dialogs with navigation

### User Experience
- **Modal Feedback**: Beautiful success/error modals replace browser alerts
- **Loading States**: Proper loading indicators throughout the app
- **Keyboard Accessibility**: ESC key support for all modals
- **Error Recovery**: Comprehensive error handling with user guidance
- **Form Reset**: Automatic form clearing after successful submissions
- **Season Countdown**: Live countdown timer showing time until current season ends

### Data Flow
- **Optimistic Updates**: Immediate UI updates with server synchronization
- **Caching Strategy**: Component-level data caching with refetch capabilities
- **State Management**: React hooks for local state, API hooks for server state
- **Error Boundaries**: Component-level error isolation and recovery

## Recent Improvements Made

### ✅ Development Experience
- **Pre-commit Hooks**: Husky + lint-staged for automatic code quality
- **Git Integration**: Proper hook setup with executable permissions
- **Code Formatting**: Automatic ESLint fixes before commits

### ✅ API System Overhaul
- **Complete API Coverage**: All 40+ endpoints from OpenAPI specification
- **Custom React Hooks**: Specialized hooks for every data type
- **Error Handling**: Comprehensive timeout and error management
- **Loading States**: Built-in loading indicators for all operations

### ✅ User Interface Enhancements
- **Modal System**: Beautiful dialogs replacing browser alerts
- **Final Move Selection**: Added to manual match entry for each game
- **Delete Functionality**: Match deletion with confirmation dialogs
- **Keyboard Accessibility**: ESC key support for modal dismissal
- **JSON Import**: Enhanced with modal feedback for parsing errors
- **Season Countdown Timer**: Live countdown to season end in navbar

### ✅ Component Improvements
- **Error Boundaries**: Graceful error handling throughout the app
- **Loading Components**: Skeleton loaders and spinners
- **Form Validation**: Better user feedback and error states
- **Navigation**: Automatic redirects after operations

## Best Practices

### API Usage
- Use specialized hooks (`useCharacters()`) for common data
- Use generic `useApi()` for custom operations
- Always handle loading/error states in components
- Provide user feedback for all operations

### Component Development
- Wrap components in `ErrorBoundary` for error isolation
- Use consistent modal patterns for user feedback
- Implement proper loading states for async operations
- Follow established naming and styling conventions

### Code Quality
- Pre-commit hooks ensure code quality automatically
- ESLint catches issues during development
- Consistent error handling patterns throughout
- Comprehensive runtime safety checks

## File Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components (buttons, dialogs, etc.)
│   ├── Match/        # Match-specific components
│   ├── CountdownTimer.jsx  # Live season countdown timer
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

## Migration Notes
- **From Alerts to Modals**: All user feedback now uses modal dialogs
- **API Hooks**: Replaced manual fetch calls with custom hooks
- **Error Handling**: Enhanced with proper loading states and recovery
- **Keyboard Support**: ESC key now works for all modal dismissals

This codebase provides a solid, modern foundation for Rivals 2 match tracking with excellent user experience, comprehensive error handling, and maintainable code architecture.</content>
<parameter name="filePath">/home/blap/projects/rivals2-elo-frontend/AGENTS.md