import { API_BASE_URL } from '@/config';
import { Card, CardTitle, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from './components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useCallback } from 'react';
import { connectWebSocket, subscribe } from './utils/websocket';

export default function HeadToHeadPage() {
    const [oppNameData, setOppNameData] = useState({ names: [], counts: [] });
    const [stats, setStats] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState("N/A");

    const fetchOpponentNames = useCallback(() => {
        fetch(`http://${API_BASE_URL}/opponent_names`)
            .then((res) => res.json())
            .then((data) => setOppNameData(data.data))
            .catch((err) => console.error('Error fetching win data:', err));
    });
    const fetchOpponentData = useCallback((oppName) => {
        if (!oppName || oppName === "N/A") return;
        fetch(`http://${API_BASE_URL}/head-to-head?opp_name=${encodeURIComponent(oppName)}`)
            .then((res) => res.json())
            .then((data) => setStats(data.data))
            .catch((err) => console.error('Error fetching win data:', err));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const opp = params.get('opp');
        if (opp) {
            setSelectedIndex(opp);
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (selectedIndex && selectedIndex !== "N/A") {
            params.set('opp', selectedIndex);
        } else {
            params.delete('opp');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }, [selectedIndex]);
    
    useEffect(() => {
        fetchOpponentNames();
        connectWebSocket(`ws://${API_BASE_URL}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchOpponentNames()

                if (selectedIndex !== "N/A") {
                    fetchOpponentData(selectedIndex);
                }
            }
        });

        return () => unsubscribe();

    }, [fetchOpponentData, selectedIndex]);

    useEffect(() => {
        if (selectedIndex !== "N/A") {
            fetchOpponentData(selectedIndex);
        } else {
            setStats(null);
        }
    }, [selectedIndex, fetchOpponentData]);

    const ProgressBar = ({ percentage, color = "bg-blue-500" }) => (
        <div className="w-full bg-slate-600 rounded-full h-2">
            <div
                className={`h-2 rounded-full transition-all duration-300 ${color}`}
                style={{ width: `${percentage}%` }}
                title={`${percentage}%`}
            ></div>
        </div>
    );

    const getWinRateColor = (winRate) => {
        if (winRate >= 70) return "bg-green-500";
        if (winRate >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };
    return (
        <div className="bg-gray-800 text-white p-2">
            <h2 className="justify-between text-3xl font-bold flex">
                <span className="">
                    Head to Head {stats ? `against: ${selectedIndex}` : ""}
                </span>
                <span className="">
                    {oppNameData.names.length > 1 && (
                        <Select
                            value={selectedIndex}
                            onValueChange={(e) => setSelectedIndex(e)}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select someone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="N/A" defaultValue="N/A" disabled>N/A</SelectItem>
                                {oppNameData.names.map((opp, i) => (
                                    <SelectItem key={i} value={opp} >
                                        {opp} ({oppNameData.counts[opp]})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </span>
            </h2>
            {stats ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.overall ?
                            <Card className="bg-gray-400">
                                <CardHeader>
                                    <CardTitle className="text-center">Overall Record</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-5 text-center gap-4">
                                    <div>
                                        <div className="text-2xl font-bold">{stats.overall.total_matches}</div>
                                        <div className="text-sm">Matches</div>
                                    </div>
                                    <div className="text-green-700">
                                        <div className="text-2xl font-bold">{stats.overall.matches_won}</div>
                                        <div className="text-sm">Wins</div>
                                    </div>
                                    <div className="text-red-700">
                                        <div className="text-2xl font-bold">{stats.overall.matches_lost}</div>
                                        <div className="text-sm">Losses</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{stats.overall.win_percentage}%</div>
                                        <div className="text-sm">Win Rate</div>
                                    </div>
                                    <div>
                                        <div className={`text-2xl font-bold `}>
                                            {stats.overall.avg_elo_change}
                                        </div>
                                        <div className=" text-sm">Avg ELO Δ</div>
                                    </div>
                                </CardContent>
                            </Card>
                            :
                            <Card>
                                <div>No Overall Stats</div>
                            </Card>
                        }
                        {stats.stages ?
                            <Card className="bg-gray-400">
                                <CardHeader>
                                    <CardTitle className="text-center">Stage Performance</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {stats.stages.map((stage, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>{stage.stage_name}</span>
                                                <span>{stage.win_rate}%</span>
                                            </div>
                                            <ProgressBar percentage={stage.win_rate} color={getWinRateColor(stage.win_rate)} />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            :
                            <Card>
                                <p>No Match Data</p>
                            </Card>
                        }
                        {stats.matchup ?
                            <Card className="bg-gray-400">
                                <CardHeader>
                                    <CardTitle className="text-center">Character Matchups</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {stats.matchup.map((mu, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>vs {mu.opponent_character}</span>
                                                <span>{mu.win_rate}%</span>
                                            </div>
                                            <ProgressBar percentage={mu.win_rate} color={getWinRateColor(mu.win_rate)} />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            :
                            <Card>
                                <p>No Character Data</p>
                            </Card>
                        }
                    </div>
                    {stats.matches ?
                        <Card className="bg-gray-400 p-2">
                            <CardTitle className="font-bold text-center p-2 ">Last {stats.matches.length} Match{stats.matches.length != 1 ? "es" : ""}</CardTitle>
                            <CardContent className="pt-2 grid grid-cols-4">
                                {stats.matches.map((match) => (
                                    <Card
                                        key={match.id}
                                        className={`p-2 ${match.match_win ? 'bg-green-300' : 'bg-red-300'}`}
                                    >
                                        <CardTitle className="flex justify-center">
                                            <span><a href={`/match/${match.id}`} target="_blank" >#{match.ranked_game_number}</a></span>
                                        </CardTitle>
                                        <CardContent className="text-sm gap-2">
                                            <div className="flex justify-between border-b">
                                                <span>My Elo: {match.elo_rank_old}</span>
                                                <span>{match.elo_change >= 0 ? `Elo Gained: +${match.elo_change}` : `Elo Lost: ${match.elo_change}`}</span>
                                                <span>Opp Elo: {match.opponent_elo}</span>
                                            </div>
                                            {match.game_1_winner != -1 ?
                                                <div className="pt-2 flex justify-between">
                                                    <span>Game 1</span>
                                                    <span>{match.game_1_stage_name}</span>
                                                    <Badge variant="outline " className={`${match.game_1_winner == 1 ? "bg-green-400" : "bg-red-400"}`}>
                                                        <img height="16px" width="24px" src={`/images/chars/${match.game_1_opponent_pick_image}.png`} title={match.game_1_final_move_id != -1 ? match.game_1_final_move_name : ""} />
                                                    </Badge>
                                                </div>
                                                : ""
                                            }
                                            {match.game_2_winner != -1 ?

                                                <div className="flex justify-between">
                                                    <span>Game 2</span>
                                                    <span>{match.game_2_stage_name}</span>
                                                    <Badge variant="outline" className={`${match.game_2_winner == 1 ? "bg-green-400" : "bg-red-400"}`}>
                                                        <img height="16px" width="24px" src={`/images/chars/${match.game_2_opponent_pick_image}.png`} title={`${match.game_2_final_move_id != -1 ? match.game_2_final_move_name : ""}`} />
                                                    </Badge>
                                                </div>
                                                : ""
                                            }
                                            {match.game_3_winner != -1 ?
                                                <div className="flex justify-between">
                                                    <span>Game 3</span>
                                                    <span>{match.game_3_stage_name}</span>
                                                    <Badge variant="outline" className={`${match.game_3_winner == 1 ? "bg-green-400" : "bg-red-400"}`}>
                                                        <img height="16px" width="24px" src={`/images/chars/${match.game_3_opponent_pick_image}.png`} title={match.game_3_final_move_id != -1 ? match.game_3_final_move_name : ""} />
                                                    </Badge>

                                                </div>
                                                : ""
                                            }
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                        :
                        <p>No Match Data</p>
                    }

                </div >
            ) : (
                <p className="text-center text-3xl">Pick an opponent</p>
            )}
        </div >
    )
}