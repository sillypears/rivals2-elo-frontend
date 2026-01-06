import { API_BASE_URL, API_BASE_PORT } from '@/config';

// Base API configuration
const API_BASE = `http://${API_BASE_URL}:${API_BASE_PORT}`;
const TIMEOUT = 10000; // 10 seconds

// Helper function for consistent error handling
function handleApiError(response, operation) {
  if (!response.ok) {
    throw new Error(`${operation} failed: ${response.status} ${response.statusText}`);
  }
  return response;
}

// Helper function for fetch with timeout
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetchWithTimeout(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  return handleApiError(response, options.method || 'GET');
}

// ========== HEALTH CHECK ==========
export async function healthCheck() {
  const response = await apiRequest('/healthcheck');
  return await response.json();
}

// ========== META DATA ENDPOINTS ==========
export async function fetchCharacters() {
  const response = await apiRequest('/characters');
  return await response.json();
}

export async function fetchStages() {
  const response = await apiRequest('/stages');
  return await response.json();
}

export async function fetchSeasons() {
  const response = await apiRequest('/seasons');
  return await response.json();
}

export async function fetchLatestSeason() {
  const response = await apiRequest('/season/latest');
  return await response.json();
}

export async function fetchSeasonById(id) {
  const response = await apiRequest(`/season/id/${id}`);
  return await response.json();
}

export async function fetchRankedTiers() {
  const response = await apiRequest('/ranked_tiers');
  return await response.json();
}

export async function fetchOpponentNames() {
  const response = await apiRequest('/opponent_names');
  return await response.json();
}

export async function fetchMoves() {
  const response = await apiRequest('/movelist');
  return await response.json();
}

export async function fetchTopMoves() {
  const response = await apiRequest('/movelist/top');
  return await response.json();
}

// ========== PERFORMANCE ENDPOINTS ==========
export async function fetchCurrentTier() {
  const response = await apiRequest('/current_tier');
  return await response.json();
}

// ========== MATCH ENDPOINTS ==========
export async function fetchMatches(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/matches?${queryString}` : '/matches';
  const response = await apiRequest(endpoint);
  return await response.json();
}

export async function fetchMatchesWithLimit(limit) {
  const response = await apiRequest(`/matches/${limit}`);
  return await response.json();
}

export async function fetchMatchesWithOffset(offset, limit) {
  const response = await apiRequest(`/matches/${offset}/${limit}`);
  return await response.json();
}

export async function fetchMatchById(id) {
  const response = await apiRequest(`/match/id/${id}`);
  return await response.json();
}

export async function fetchMatch(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/match?${queryString}` : '/match';
  const response = await apiRequest(endpoint);
  return await response.json();
}

export async function checkMatchExists(matchNumber = 0) {
  const queryString = new URLSearchParams({ match_number: matchNumber.toString() }).toString();
  const response = await apiRequest(`/match-exists?${queryString}`);
  return await response.json();
}

export async function fetchMatchForfeits() {
  const response = await apiRequest('/match_forfeits');
  return await response.json();
}

// ========== CHART/STATISTICS ENDPOINTS ==========
export async function fetchStats(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/stats?${queryString}` : '/stats';
  const response = await apiRequest(endpoint);
  return await response.json();
}

export async function fetchCharacterStats() {
  const response = await apiRequest('/char-stats');
  return await response.json();
}

export async function fetchCharactersByTimesPicked() {
  const response = await apiRequest('/char-stats-picked');
  return await response.json();
}

export async function fetchStageStats() {
  const response = await apiRequest('/stage-stats');
  return await response.json();
}

export async function fetchMatchStats() {
  const response = await apiRequest('/match-stats');
  return await response.json();
}

export async function fetchMatchStageStats() {
  const response = await apiRequest('/match-stage-stats');
  return await response.json();
}

export async function fetchEloChanges(matchNumber) {
  const response = await apiRequest(`/elo-change/${matchNumber}`);
  return await response.json();
}

export async function fetchEloChangesList(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/elo-change?${queryString}` : '/elo-change';
  const response = await apiRequest(endpoint);
  return await response.json();
}

export async function fetchFinalMoveStats() {
  const response = await apiRequest('/final-move-stats');
  return await response.json();
}

export async function fetchAllSeasonsStats() {
  const response = await apiRequest('/all-seasons-stats');
  return await response.json();
}

export async function fetchEloBySeason() {
  const response = await apiRequest('/elo-by-season');
  return await response.json();
}

export async function fetchHeadToHead(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/head-to-head?${queryString}` : '/head-to-head';
  const response = await apiRequest(endpoint);
  return await response.json();
}

export async function fetchTopMatchups() {
  const response = await apiRequest('/head-to-head/top');
  return await response.json();
}

export async function fetchHeatmapData() {
  const response = await apiRequest('/heatmap-data');
  return await response.json();
}

export async function fetchStagePickData() {
  const response = await apiRequest('/stagepick-data');
  return await response.json();
}

export async function fetchCharacterMatchupData() {
  const response = await apiRequest('/character-mu-data');
  return await response.json();
}

// ========== TIME/GAME DURATION ENDPOINTS ==========
export async function fetchGameDuration() {
  const response = await apiRequest('/game_duration');
  return await response.json();
}

export async function fetchGameDurationBySeason() {
  const response = await apiRequest('/game_duration/season');
  return await response.json();
}

export async function fetchGameDurationByOpponent() {
  const response = await apiRequest('/game_duration/opponent');
  return await response.json();
}

// ========== MUTABLE OPERATIONS ==========
export async function createMatch(matchData, debug = false) {
  const queryString = new URLSearchParams({ debug: debug.toString() }).toString();
  const response = await apiRequest(`/insert-match?${queryString}`, {
    method: 'POST',
    body: JSON.stringify(matchData),
  });
  return await response.json();
}

export async function updateMatch(updateData) {
  const response = await apiRequest('/update-match/', {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
  return await response.json();
}

// Legacy function for backward compatibility
export async function updateMatchField(id, key, value) {
  return await updateMatch({
    row_id: id,
    key,
    value,
  });
}

export async function updateSeason(id, updateData) {
  const response = await apiRequest(`/season/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
  return await response.json();
}

export async function deleteMatch(id) {
  const response = await apiRequest(`/match/${id}`, {
    method: 'DELETE',
  });
  return await response.json();
}

// ========== WEBSOCKET ENDPOINTS ==========
export async function testWebSocketBroadcast() {
  const response = await apiRequest('/ws-test');
  return await response.json();
}

export async function getWebSocketCount() {
  const response = await apiRequest('/ws-count');
  return await response.json();
}