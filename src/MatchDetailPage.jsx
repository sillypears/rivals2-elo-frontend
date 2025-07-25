// src/pages/MatchDetailPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import GameRowEditor from "@/components/Match/GameRowEditor";
import { fetchMatchById, updateMatchField, fetchCharacters, fetchMoves, fetchStages } from "@/utils/api";

export default function MatchDetailPage() {
    const { id } = useParams();
    const [match, setMatch] = useState(null);
    const [error, setError] = useState(false);
    const [characters, setCharacters] = useState([])
    const [stages, setStages] = useState([])
    const [moves, setMoves] = useState([])
        

    useEffect(() => {
        fetchMatchById(id)
            .then(data => setMatch(data.data))
            .catch(() => setError(true));
    }, [id]);

    useEffect(() => {
        fetchCharacters().then((cdata) => setCharacters(cdata.data));
        fetchStages().then((sdata) => setStages(sdata.data));
        fetchMoves().then((mdata) => setMoves(mdata.data));
    }, []);

    const handleUpdate = (key, value) => {
        updateMatchField(id, key, value)
            .then(() => setMatch(prev => ({ ...prev, [key]: value })))
            .catch(() => alert("Update failed"));
    };

    if (error) return <div className="text-red-500 p-4">Error loading match</div>;
    if (!match) return <div className="p-4">Loading match...</div>;

    return (
        <Card className="p-6">
            <CardHeader className="mb-4">
                <CardTitle>Match #{match.ranked_game_number}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>ELO Before: {match.elo_rank_old}</div>
                    <div>ELO After: {match.elo_rank_new} ({match.elo_change >= 0 ? "+" : ""}{match.elo_change})</div>
                    <div>Opponent ELO: {match.opponent_elo}</div>
                    <div>Streak: {match.win_streak_value}</div>
                    <div>Final Move: {match.final_move_name}</div>
                </div>

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
  <h2 className="text-lg font-semibold mb-2">Editable Match Fields</h2>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
    {Object.entries(match)
      .filter(([key]) =>
        ![  // Exclude fields shown elsewhere or deeply nested ones
          "id",
          "season_short_name",
          "season_display_name",
          "game_1_char_pick_image", "game_2_char_pick_image", "game_3_char_pick_image",
          "game_1_opponent_pick_image", "game_2_opponent_pick_image", "game_3_opponent_pick_image",
        ].includes(key)
      )
      .map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="font-medium text-xs text-gray-600" htmlFor={key}>{key}</label>
          <input
            id={key}
            className="border rounded px-2 py-1 text-xs"
            value={value ?? ""}
            onChange={(e) => handleUpdate(key, e.target.value)}
          />
        </div>
      ))}
  </div>
</div>

            </CardContent>
        </Card>
    );
}
