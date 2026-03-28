// src/hooks/useApi.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../utils/api';

export function useApi(apiFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  // Create stable dependency array for useEffect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deps = useMemo(() => dependencies, [JSON.stringify(dependencies)]);

  useEffect(() => {
    if (deps.length === 0 || deps.every(dep => dep != null)) {
      execute();
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, execute, refetch: execute };
}

// ========== META DATA HOOKS ==========
export function useCharacters() {
  return useApi(async () => {
    const response = await api.fetchCharacters();
    return response.data;
  });
}

export function useStages() {
  return useApi(async () => {
    const response = await api.fetchStages();
    return response.data;
  });
}

export function useSeasons() {
  return useApi(async () => {
    const response = await api.fetchSeasons();
    return response.data;
  });
}

export function useLatestSeason() {
  return useApi(async () => {
    const response = await api.fetchLatestSeason();
    return response.data;
  });
}

export function useSeason(id) {
  return useApi(async () => {
    const response = await api.fetchSeasonById(id);
    return response.data;
  }, [id]);
}

export function useRankedTiers() {
  return useApi(async () => {
    const response = await api.fetchRankedTiers();
    return response.data;
  });
}

export function useOpponentNames() {
  return useApi(async () => {
    const response = await api.fetchOpponentNames();
    return response.data;
  });
}

export function useMoves() {
  return useApi(async () => {
    const response = await api.fetchMoves();
    return response.data;
  });
}

export function useTopMoves() {
  return useApi(async () => {
    const response = await api.fetchTopMoves();
    return response.data;
  });
}

// ========== PERFORMANCE HOOKS ==========
export function useCurrentTier() {
  return useApi(async () => {
    const response = await api.fetchCurrentTier();
    return response.data;
  });
}

// ========== MATCH HOOKS ==========
export function useMatches(params = {}) {
  return useApi(async () => {
    const response = await api.fetchMatches(params);
    return response.data;
  }, [JSON.stringify(params)]);
}

export function useMatchesBySeason(seasonId) {
  return useApi(async () => {
    const response = await api.fetchMatchesBySeason(seasonId);
    return response.data;
  }, [seasonId]);
}

export function useMatch(id) {
  return useApi(async () => {
    const response = await api.fetchMatchById(id);
    return response.data;
  }, [id]);
}

export function useMatchByQuery(params = {}) {
  return useApi(async () => {
    const response = await api.fetchMatch(params);
    return response.data;
  }, [JSON.stringify(params)]);
}

// ========== STATISTICS/CHART HOOKS ==========
export function useStats(params = {}) {
  return useApi(async () => {
    const response = await api.fetchStats(params);
    return response.data;
  }, [JSON.stringify(params)]);
}

export function useCharacterStats() {
  return useApi(async () => {
    const response = await api.fetchCharacterStats();
    return response.data;
  });
}

export function useStageStats() {
  return useApi(async () => {
    const response = await api.fetchStageStats();
    return response.data;
  });
}

export function useEloChanges(matchNumber) {
  return useApi(async () => {
    const response = await api.fetchEloChanges(matchNumber);
    return response.data;
  }, [matchNumber]);
}

export function useHeadToHead(params = {}) {
  return useApi(async () => {
    const response = await api.fetchHeadToHead(params);
    return response.data;
  }, [JSON.stringify(params)]);
}

export function useHeatmapData() {
  return useApi(async () => {
    const response = await api.fetchHeatmapData();
    return response.data;
  });
}

export function useGameDuration() {
  return useApi(async () => {
    const response = await api.fetchGameDuration();
    return response.data;
  });
}

export function useBestWins() {
  return useApi(async () => {
    const response = await api.fetchBestWins();
    return response.data;
  });
}

export function useMatchStats(params = {}) {
  return useApi(async () => {
    const response = await api.fetchMatchStats(params);
    return response.data;
  }, [JSON.stringify(params)]);
}

export function useMatchStatsBySeason(seasonId) {
  return useApi(async () => {
    const response = await api.fetchMatchStats({ season_id: seasonId });
    return response.data;
  }, [seasonId]);
}

export function useGetPlayersPlaying() {
  return useApi(async () => {
    const response = await api.getPlayersPlaying();
    return response.data;
  })
}

// ========== MUTATION HOOKS ==========
export function useUpdateMatch() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (updateData) => {
    setUpdating(true);
    setError(null);
    try {
      const result = await api.updateMatch(updateData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  return { update, updating, error };
}

export function useDeleteMatch() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteMatchById = useCallback(async (id) => {
    setDeleting(true);
    setError(null);
    try {
      const result = await api.deleteMatch(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteMatch: deleteMatchById, deleting, error };
}

export function useDeleteSeason() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteSeasonById = useCallback(async (id) => {
    setDeleting(true);
    setError(null);
    try {
      const result = await deleteSeasonById(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteSeason: deleteSeasonById, deleting, error };
}