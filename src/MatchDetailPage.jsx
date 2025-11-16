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
                <CardHeader className="mb-4">
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
                    {/* Summary Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>Elo Before: {match.elo_rank_old}</div>
                        <div>Elo After: {match.elo_rank_new} ({match.elo_change >= 0 ? "+" : ""}{match.elo_change})</div>
                        <div>Opponent Elo: {match.opponent_elo}</div>
                        <div>Streak: {match.win_streak_value}</div>
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
