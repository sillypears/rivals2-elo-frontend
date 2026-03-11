// src/pages/MatchDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading, LoadingCard } from "@/components/ui/loading";
import ErrorBoundary from "@/components/ErrorBoundary";
import GameRowEditor from "@/components/Match/GameRowEditor";
import { useMatch, useCharacters, useStages, useMoves, useDeleteMatch } from "@/hooks/useApi";
import { updateMatchField } from "@/utils/api";

export default function MatchDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Use custom hooks for data fetching
    const { data: match, loading: matchLoading, error: matchError, refetch: refetchMatch } = useMatch(id);
    const { data: characters, loading: charactersLoading } = useCharacters();
    const { data: stages, loading: stagesLoading } = useStages();
    const { data: moves, loading: movesLoading } = useMoves();
    const { deleteMatch, deleting } = useDeleteMatch();

    const handleUpdate = async (key, value) => {
        try {
            await updateMatchField(id, key, value);
            // Optimistically update local state
            refetchMatch();
        } catch (error) {
            alert(`Update failed: ${error.message}`);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete Match #${match.ranked_game_number}? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteMatch(id);
            alert('Match deleted successfully');
            navigate('/matches'); // Navigate back to matches list
        } catch (error) {
            alert(`Delete failed: ${error.message}`);
        }
    };

    // Show loading state
    if (matchLoading) return <LoadingCard className="m-4" />;
    if (matchError) return <div className="text-red-500 p-4">Error loading match: {matchError}</div>;
    if (!match) return <div className="p-4">Match not found</div>;

    return (
        <ErrorBoundary>
            <Card className="p-6">
                {/* Important Info Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-4 mb-4 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold">
                                {match.is_forfeit ? (
                                    <span className="text-yellow-400">Forfeit</span>
                                ) : match.is_win ? (
                                    <span className="text-green-400">Win</span>
                                ) : (
                                    <span className="text-red-400">Loss</span>
                                )}
                            </div>
                            <div className="text-lg">
                                vs <span className="font-semibold">{match.opponent_name || match.opponent || 'Unknown'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            {match.match_date && (
                                <div className="opacity-80">
                                    {new Date(match.match_date).toLocaleDateString()}
                                </div>
                            )}
                            <div className="font-mono text-lg">
                                {match.elo_change >= 0 ? "+" : ""}{match.elo_change} ELO
                            </div>
                            <div className="opacity-60">
                                {match.elo_rank_old} → {match.elo_rank_new}
                            </div>
                        </div>
                    </div>
                </div>

                <CardHeader className="mb-4 pb-4 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle>Match #{match.ranked_game_number}</CardTitle>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="ml-4"
                        >
                            {deleting ? 'Deleting...' : 'Delete Match'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 rounded-lg p-3">
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Opponent Elo</div>
                            <div className="font-medium">{match.opponent_elo}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Streak</div>
                            <div className="font-medium">{match.win_streak_value}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Season</div>
                            <div className="font-medium">{match.season_name || match.season || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Character</div>
                            <div className="font-medium">{match.character_name || match.character || '-'}</div>
                        </div>
                    </div>

                    {/* Show loading for reference data */}
                    {(charactersLoading || stagesLoading || movesLoading) && (
                        <div className="flex gap-4 justify-center py-4">
                            {charactersLoading && <Loading size="sm" text="Loading characters..." />}
                            {stagesLoading && <Loading size="sm" text="Loading stages..." />}
                            {movesLoading && <Loading size="sm" text="Loading moves..." />}
                        </div>
                    )}

                    {[1, 2, 3].map(game => (
                        <GameRowEditor
                            key={`${id}-${game}`}
                            gameNumber={game}
                            matchData={match}
                            characters={characters}
                            stages={stages}
                            moves={moves}
                            onUpdate={handleUpdate}
                        />
                    ))}
                 <div className="mt-8 border-t pt-4">
                   <h2 className="text-lg font-semibold mb-2">All Editable Match Fields</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                     {Object.entries(match)
                       .filter(([key]) => key !== "id") // Only exclude the ID field
                       .sort(([a], [b]) => a.localeCompare(b)) // Sort alphabetically for better organization
                       .map(([key, value]) => (
                         <div key={key} className="flex flex-col gap-1">
                           <label className="font-medium text-xs text-gray-600 uppercase tracking-wide" htmlFor={key}>
                             {key.replace(/_/g, ' ')}
                           </label>
                           <input
                             id={key}
                             type={typeof value === 'number' ? 'number' : 'text'}
                             className="border rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             value={value ?? ""}
                             onChange={(e) => {
                               const inputValue = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
                               handleUpdate(key, inputValue);
                             }}
                           />
                         </div>
                       ))}
                   </div>
                 </div>

                </CardContent>
            </Card>
        </ErrorBoundary>
    );
}
