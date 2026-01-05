// src/hooks/useApi.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchCharacters, fetchStages, fetchSeasons, fetchLatestSeason, fetchRankedTiers, fetchOpponentNames, fetchMoves, fetchTopMoves, fetchCurrentTier, fetchMatches, fetchMatchById, fetchMatch, fetchStats, fetchCharacterStats, fetchStageStats, fetchEloChanges, fetchHeadToHead, fetchHeatmapData, fetchGameDuration, updateMatch, deleteMatch } from '../utils/api';

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
    const response = await fetchCharacters();
    return response.data;
  });
}

export function useStages() {
  return useApi(async () => {
    const response = await fetchStages();
    return response.data;
  });
}

export function useSeasons() {
  return useApi(async () => {
    const response = await fetchSeasons();
    return response.data;
  });
}

export function useLatestSeason() {
  return useApi(async () => {
    const response = await fetchLatestSeason();
    return response.data;
  });
}

export function useRankedTiers() {
  return useApi(async () => {
    const response = await fetchRankedTiers();
    return response.data;
  });
}

export function useOpponentNames() {
  return useApi(async () => {
    const response = await fetchOpponentNames();
    return response.data;
  });
}

export function useMoves() {
  return useApi(async () => {
    const response = await fetchMoves();
    return response.data;
  });
}

export function useTopMoves() {
  return useApi(async () => {
    const response = await fetchTopMoves();
    return response.data;
  });
}

// ========== PERFORMANCE HOOKS ==========
export function useCurrentTier() {
  return useApi(async () => {
    const response = await fetchCurrentTier();
    return response.data;
  });
}

// ========== MATCH HOOKS ==========
export function useMatches(params = {}) {
  return useApi(async () => {
    const response = await fetchMatches(params);
    return response.data;
  }, [JSON.stringify(params)]);
}

export function useMatch(id) {
  return useApi(async () => {
    const response = await fetchMatchById(id);
    return response.data;
  }, [id]);
}

export function useMatchByQuery(params = {}) {
  return useApi(async () => {
    const response = await fetchMatch(params);
    return response.data;
  }, [JSON.stringify(params)]);
}

// ========== STATISTICS/CHART HOOKS ==========
export function useStats(params = {}) {
  return useApi(async () => {
    const response = await fetchStats(params);
    return response.data;
  }, [JSON.stringify(params)]);
}

export function useCharacterStats() {
  return useApi(async () => {
    const response = await fetchCharacterStats();
    return response.data;
  });
}

export function useStageStats() {
  return useApi(async () => {
    const response = await fetchStageStats();
    return response.data;
  });
}

export function useEloChanges(matchNumber) {
  return useApi(async () => {
    const response = await fetchEloChanges(matchNumber);
    return response.data;
  }, [matchNumber]);
}

export function useHeadToHead(params = {}) {
  return useApi(async () => {
    const response = await fetchHeadToHead(params);
    return response.data;
  }, [JSON.stringify(params)]);
}

export function useHeatmapData() {
  return useApi(async () => {
    const response = await fetchHeatmapData();
    return response.data;
  });
}

export function useGameDuration() {
  return useApi(async () => {
    const response = await fetchGameDuration();
    return response.data;
  });
}

// ========== MUTATION HOOKS ==========
export function useUpdateMatch() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (updateData) => {
    setUpdating(true);
    setError(null);
    try {
      const result = await updateMatch(updateData);
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
      const result = await deleteMatch(id);
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