# API Workflow Documentation

## Overview

This document explains the new API workflow implemented in the Rivals 2 ELO frontend. The system provides a robust, type-safe, and user-friendly way to handle API interactions with proper error handling, loading states, and caching.

## Architecture

### 1. Enhanced API Layer (`src/utils/api.js`)

The foundation layer provides consistent HTTP request handling with built-in error management and timeout support.

#### Key Features:
- **Timeout Handling**: 10-second timeout for all requests
- **Error Normalization**: Consistent error messages and HTTP status checking
- **Request Deduplication**: Centralized request logic
- **Response Validation**: Automatic error throwing for failed requests

#### API Functions:

**Core Infrastructure:**
```javascript
async function apiRequest(endpoint, options = {}) // Centralized HTTP handler with timeout/error handling
```

**Health & Meta Data:**
```javascript
healthCheck()                    // GET /healthcheck
fetchCharacters()               // GET /characters
fetchStages()                   // GET /stages
fetchSeasons()                  // GET /seasons
fetchLatestSeason()             // GET /season/latest
fetchRankedTiers()              // GET /ranked_tiers
fetchOpponentNames()            // GET /opponent_names
fetchMoves()                    // GET /movelist
fetchTopMoves()                 // GET /movelist/top
```

**Performance:**
```javascript
fetchCurrentTier()              // GET /current_tier
```

**Matches:**
```javascript
fetchMatches(params)            // GET /matches (with query params)
fetchMatchesWithLimit(limit)    // GET /matches/{limit}
fetchMatchesWithOffset(offset, limit) // GET /matches/{offset}/{limit}
fetchMatchById(id)              // GET /match/{id}
fetchMatch(params)              // GET /match (with query params)
checkMatchExists(matchNumber)   // GET /match-exists
fetchMatchForfeits()            // GET /match_forfeits
```

**Statistics & Charts:**
```javascript
fetchStats(params)              // GET /stats
fetchCharacterStats()           // GET /char-stats
fetchCharactersByTimesPicked()  // GET /char-stats-picked
fetchStageStats()               // GET /stage-stats
fetchMatchStats()               // GET /match-stats
fetchMatchStageStats()          // GET /match-stage-stats
fetchEloChanges(matchNumber)    // GET /elo-change/{match_number}
fetchEloChangesList(params)     // GET /elo-change
fetchFinalMoveStats()           // GET /final-move-stats
fetchAllSeasonsStats()          // GET /all-seasons-stats
fetchEloBySeason()              // GET /elo-by-season
fetchHeadToHead(params)         // GET /head-to-head
fetchTopMatchups()              // GET /head-to-head/top
fetchHeatmapData()              // GET /heatmap-data
fetchStagePickData()            // GET /stagepick-data
fetchCharacterMatchupData()     // GET /character-mu-data
```

**Time & Duration:**
```javascript
fetchGameDuration()             // GET /game_duration
fetchGameDurationBySeason()     // GET /game_duration/season
fetchGameDurationByOpponent()   // GET /game_duration/opponent
```

**Mutable Operations:**
```javascript
createMatch(matchData, debug)   // POST /insert-match
updateMatch(updateData)         // PATCH /update-match/
updateMatchField(id, key, value)// PATCH /update-match/ (legacy)
deleteMatch(id)                 // DELETE /match/{id}
```

**WebSocket Utilities:**
```javascript
testWebSocketBroadcast()        // GET /ws-test
getWebSocketCount()             // GET /ws-count
```

#### Usage Example:
```javascript
import { fetchMatchById } from '@/utils/api';

const match = await fetchMatchById(123);
// Returns: { data: { id: 123, elo_rank_old: 1500, ... } }
```

### 2. Custom React Hooks (`src/hooks/useApi.js`)

The hook layer provides React integration with automatic loading states, error handling, and lifecycle management.

#### Core Hook: `useApi`
```javascript
const { data, loading, error, execute, refetch } = useApi(apiFunction, dependencies);
```

**Parameters:**
- `apiFunction`: Async function that returns API response
- `dependencies`: Array of values that trigger re-fetch when changed

**Returns:**
- `data`: API response data (null initially)
- `loading`: Boolean indicating request in progress
- `error`: Error message string (null if no error)
- `execute`: Manual execution function
- `refetch`: Alias for execute (convenience)

#### Specialized Hooks:

**Meta Data Hooks:**
```javascript
const { data: characters } = useCharacters();      // Character list
const { data: stages } = useStages();              // Stage list
const { data: seasons } = useSeasons();            // Season list
const { data: latestSeason } = useLatestSeason();  // Current season
const { data: tiers } = useRankedTiers();          // Ranked tiers
const { data: opponents } = useOpponentNames();    // Opponent names
const { data: moves } = useMoves();                // Move list
const { data: topMoves } = useTopMoves();          // Top moves
```

**Performance Hooks:**
```javascript
const { data: currentTier } = useCurrentTier();    // Current player tier
```

**Match Hooks:**
```javascript
const { data: matches } = useMatches(params);      // Match list with filters
const { data: match } = useMatch(id);              // Single match by ID
const { data: match } = useMatchByQuery(params);   // Match by query params
```

**Statistics Hooks:**
```javascript
const { data: stats } = useStats(params);          // General stats
const { data: charStats } = useCharacterStats();   // Character statistics
const { data: stageStats } = useStageStats();      // Stage statistics
const { data: eloChanges } = useEloChanges(matchNumber); // Elo changes
const { data: h2h } = useHeadToHead(params);       // Head-to-head data
const { data: heatmap } = useHeatmapData();        // Heatmap data
const { data: duration } = useGameDuration();      // Game duration stats
```

**Mutation Hooks:**
```javascript
// Update operations
const { update, updating, error } = useUpdateMatch();
await update({ row_id: 123, key: 'elo_change', value: 25 });

// Delete operations
const { deleteMatch, deleting, error } = useDeleteMatch();
await deleteMatch(123);
```

**Match Detail Page Features:**
- Edit all match fields inline
- Delete matches with confirmation dialog
- Automatic navigation after successful deletion
- Loading states for all operations

**Match Entry Page Features:**
- Complete form for manual match entry
- Success/error modals instead of browser alerts
- JSON import with modal validation feedback
- Keyboard accessibility (ESC key to dismiss modals)
- Form reset after successful submission
- Final move selection for each game

**All data hooks return:** `{ data, loading, error, execute, refetch }`

### 3. Component Integration

Components use the hooks to manage data fetching and UI state automatically.

#### Basic Usage Pattern:
```javascript
import { useMatch, useCharacters, useStages, useMoves } from '@/hooks/useApi';

export default function MatchDetailPage() {
  // Automatic data fetching
  const { data: match, loading, error } = useMatch(id);
  const { data: characters } = useCharacters();
  const { data: stages } = useStages();
  const { data: moves } = useMoves();

  // Loading state
  if (loading) return <LoadingCard />;

  // Error state
  if (error) return <div>Error: {error}</div>;

  // Success state
  return <div>Match: {match.elo_rank_old}</div>;
}
```

#### Advanced Usage with Manual Control:
```javascript
const { data, loading, execute: updateData } = useApi(myApiFunction);

// Manual trigger
const handleRefresh = () => updateData();

// Conditional execution
useEffect(() => {
  if (someCondition) {
    updateData();
  }
}, [someCondition]);
```

## Data Flow

### 1. Initial Load
```
Component Mount → useApi Hook → apiRequest() → API Call → Data Update → Re-render
```

### 2. Dependency Changes
```
Dependency Change → useEffect Trigger → apiRequest() → API Call → Data Update → Re-render
```

### 3. Manual Operations
```
User Action → execute() → apiRequest() → API Call → Data Update → Re-render
```

### 4. Error Handling
```
API Error → Error State Update → Error UI Display → User Retry Option
```

## Error Handling

### Automatic Error Handling
- **Network Errors**: Timeout, connection failures
- **HTTP Errors**: 4xx, 5xx status codes
- **Data Errors**: Malformed responses

### Error States in Components
```javascript
const { data, loading, error } = useMatch(id);

if (error) {
  return (
    <div className="text-red-500 p-4">
      Failed to load match: {error}
      <button onClick={() => refetch()}>Retry</button>
    </div>
  );
}
```

### Global Error Boundaries
Components wrapped in `ErrorBoundary` catch React errors:
```javascript
<ErrorBoundary>
  <MatchDetailPage />
</ErrorBoundary>
```

## Loading States

### Automatic Loading Indicators
```javascript
const { loading } = useCharacters();

return (
  <select disabled={loading}>
    {loading ? (
      <option>Loading...</option>
    ) : (
      characters.map(char => <option key={char.id}>{char.name}</option>)
    )}
  </select>
);
```

### Skeleton Components
```javascript
import { Loading, LoadingCard } from '@/components/ui/loading';

if (loading) return <LoadingCard />;
```

## Best Practices

### 1. Hook Usage
- Use specialized hooks (`useCharacters`) for common data
- Use generic `useApi` for custom operations
- Always destructure all return values you need

### 2. Error Handling
- Always check for `error` state in components
- Provide user-friendly error messages
- Include retry mechanisms for failed requests

### 3. Loading States
- Show loading indicators during data fetch
- Disable interactive elements while loading
- Use skeleton components for better UX

### 4. Data Dependencies
- Include all variables in dependency arrays
- Use primitive values when possible
- Avoid object/array dependencies (use IDs instead)

### 5. Performance
- Hooks automatically prevent duplicate requests
- Data is cached per component instance
- Re-fetching only occurs when dependencies change

## Migration Guide

### From Old Pattern:
```javascript
// Old way
useEffect(() => {
  fetchMatchById(id).then(data => setMatch(data.data));
}, [id]);
```

### To New Pattern:
```javascript
// New way
const { data: match, loading, error } = useMatch(id);
```

## Troubleshooting

### Common Issues:

1. **Infinite API Calls**
   - Check dependency arrays in `useApi` calls
   - Ensure dependencies are primitive values
   - Avoid passing objects/arrays as dependencies

2. **Data Not Updating**
   - Use `refetch()` to manually trigger updates
   - Check that dependencies are changing correctly
   - Verify API functions return expected data structure

3. **Loading States Not Working**
   - Ensure `loading` state is checked in component
   - Verify API call is actually in progress
   - Check for error states that might override loading

4. **Type Errors**
   - API responses have `{ data: actualData }` structure
   - Hooks return the `data` property directly
   - Check that components expect the correct data shape

## Future Enhancements

- **React Query Integration**: For advanced caching and synchronization
- **Request Interceptors**: For authentication headers
- **Response Caching**: Browser-level caching strategies
- **Optimistic Updates**: Immediate UI updates before API confirmation
- **Background Refetching**: Automatic data freshness checks</content>
<parameter name="filePath">/home/blap/projects/rivals2-elo-frontend/API_WORKFLOW.md