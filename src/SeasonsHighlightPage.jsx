import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingCard } from "@/components/ui/loading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAllSeasonsStats } from "@/hooks/useApi";

function StatCell({ label, value, highlight = false, subValue = null }) {
  return (
    <div className={`text-center p-2 ${highlight ? "bg-orange-900/30 rounded" : ""}`}>
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-lg font-bold ${highlight ? "text-orange-400" : "text-white"}`}>
        {value}
      </div>
      {subValue && <div className="text-xs text-gray-500">{subValue}</div>}
    </div>
  );
}

export default function SeasonsHighlightPage() {
  const { data: allSeasonsStats, loading: statsLoading, error: statsError } =
    useAllSeasonsStats();

  if (statsLoading) return <LoadingCard className="m-4" />;
  if (statsError)
    return (
      <div className="text-red-500 p-4">Error loading stats: {statsError}</div>
    );
  if (!allSeasonsStats) return <LoadingCard className="m-4" />;

  const sortedStats =
    allSeasonsStats?.sort((a, b) => a.season_id - b.season_id) || [];

  const overallWinStreak = Math.max(...allSeasonsStats.map((s) => s.highest_win_streak || 0));
  const overallLossStreak = Math.max(...allSeasonsStats.map((s) => s.highest_loss_streak || 0));

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-gray-800"
          >
            ← Back to Seasons
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Seasons Highlights</h1>

        {/* Overall Stats */}
        <Card className="bg-slate-700 border-2 border-orange-400 mb-6">
          <CardHeader>
            <CardTitle className="text-xl">All-Time Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCell
                label="Highest Win Streak"
                value={overallWinStreak}
                highlight
              />
              <StatCell
                label="Highest Loss Streak"
                value={overallLossStreak}
              />
              <StatCell
                label="All-Time High Elo"
                value={
                  Math.max(...allSeasonsStats.map((s) => s.max_elo || 0))
                }
                highlight
              />
              <StatCell
                label="All-Time Low Elo"
                value={
                  Math.min(...allSeasonsStats.map((s) => s.min_elo || 9999))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Season-by-Season Comparison */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left p-3 text-gray-400">Season</th>
                <th className="p-3 text-gray-400">Matches</th>
                <th className="p-3 text-gray-400">W-L</th>
                <th className="p-3 text-gray-400">Win Rate</th>
                <th className="p-3 text-gray-400">Win Streak</th>
                <th className="p-3 text-gray-400">Loss Streak</th>
                <th className="p-3 text-gray-400">Min Elo</th>
                <th className="p-3 text-gray-400">Max Elo</th>
                <th className="p-3 text-gray-400">Elo Change</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((season) => {
                return (
                  <tr
                    key={season.season_id}
                    className="border-b border-slate-600 hover:bg-slate-600/50"
                  >
                    <td className="p-3 font-medium">
                      <div>{season.season_display_name}</div>
                    </td>
                    <td className="p-3 text-center">{season.total_matches}</td>
                    <td className="p-3 text-center">
                      <span className="text-green-400">{season.match_wins}</span>
                      <span className="text-gray-400">-</span>
                      <span className="text-red-400">{season.match_losses}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          season.win_rate_percent >= 50
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {season.win_rate_percent}%
                      </span>
                    </td>
                    <td className="p-3 text-center text-green-400 font-bold">
                      {season.highest_win_streak}
                    </td>
                    <td className="p-3 text-center text-red-400 font-bold">
                      {season.highest_loss_streak}
                    </td>
                    <td className="p-3 text-center">{season.min_elo}</td>
                    <td className="p-3 text-center text-orange-400 font-bold">
                      {season.max_elo}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          season.total_elo_change >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {season.total_elo_change >= 0 ? "+" : ""}
                        {season.total_elo_change}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Row */}
        <Card className="mt-6 bg-slate-600 border-orange-400">
          <CardHeader>
            <CardTitle className="text-lg text-center">All-Time Totals</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-400">Total Seasons</div>
                <div className="text-2xl font-bold">{allSeasonsStats.length}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Matches</div>
                <div className="text-2xl font-bold">
                  {allSeasonsStats.reduce((sum, s) => sum + s.total_matches, 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Wins</div>
                <div className="text-2xl font-bold text-green-400">
                  {allSeasonsStats.reduce((sum, s) => sum + s.match_wins, 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Losses</div>
                <div className="text-2xl font-bold text-red-400">
                  {allSeasonsStats.reduce((sum, s) => sum + s.match_losses, 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Overall Win Rate</div>
                <div className="text-2xl font-bold">
                  {(() => {
                    const totalWins = allSeasonsStats.reduce(
                      (sum, s) => sum + s.match_wins,
                      0
                    );
                    const totalLosses = allSeasonsStats.reduce(
                      (sum, s) => sum + s.match_losses,
                      0
                    );
                    const total = totalWins + totalLosses;
                    return total > 0
                      ? ((totalWins / total) * 100).toFixed(1) + "%"
                      : "0%";
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}