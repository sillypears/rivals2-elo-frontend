import { API_BASE_URL, API_BASE_PORT } from '@/config';
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useCallback, useRef } from 'react';
import { connectWebSocket, subscribe } from './utils/websocket';

export default function HeadToHeadPage() {
    const [oppNameData, setOppNameData] = useState({ names: [], counts: [] });
    const [stats, setStats] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState("N/A");
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const filteredNames = searchQuery.trim() === "" 
        ? oppNameData.names 
        : oppNameData.names.filter(name => 
            name.toLowerCase().includes(searchQuery.toLowerCase())
          );

    const handleSelect = (name) => {
        setSelectedIndex(name);
        setSearchQuery(name);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!isOpen || filteredNames.length === 0) return;
        
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex(prev => 
                prev < filteredNames.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex(prev => 
                prev > 0 ? prev - 1 : filteredNames.length - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0) {
                handleSelect(filteredNames[highlightedIndex]);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setHighlightedIndex(-1);
        }
    };

    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (oppNameData.names.length > 1 && inputRef.current) {
            inputRef.current.focus();
        }
    }, [oppNameData.names]);

    const fetchOpponentNames = useCallback(() => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/opponent_names`)
            .then((res) => res.json())
            .then((data) => setOppNameData(data.data))
            .catch((err) => console.error('Error fetching win data:', err));
    }, []);
    const fetchOpponentData = useCallback((oppName) => {
        if (!oppName || oppName === "N/A") return;
        const escapedName = oppName.replace(/'/g, "\\'");
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/head-to-head?opp_name=${encodeURIComponent(escapedName)}`)
            .then((res) => res.json())
            .then((data) => setStats(data.data))
            .catch((err) => console.error('Error fetching win data:', err));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const opp = params.get('opp');
        if (opp) {
            const decoded = decodeURIComponent(opp);
            setSelectedIndex(decoded);
            fetchOpponentData(decoded);
        }
    }, [fetchOpponentData]);

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
        connectWebSocket(`ws://${API_BASE_URL}:${API_BASE_PORT}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchOpponentNames()

                if (selectedIndex !== "N/A") {
                    fetchOpponentData(selectedIndex);
                }
            }
        });

        return () => unsubscribe();

    }, [fetchOpponentNames, fetchOpponentData, selectedIndex]);

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
        <div className="bg-gray-800 text-white p-2 ">
            <h2 className="justify-between text-3xl font-bold flex">
                <span className="">
                    {stats ? `Against: ${selectedIndex}` : ""}
                </span>
                <span className="">
                    {oppNameData.names.length > 1 && (
                        <div ref={containerRef} className="relative w-[200px]">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search..."
                                value={isOpen ? searchQuery : (selectedIndex === "N/A" ? "" : selectedIndex)}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsOpen(true);
                                    setHighlightedIndex(-1);
                                }}
                                onFocus={() => setIsOpen(true)}
                                onKeyDown={handleKeyDown}
                                className="w-full h-9 px-3 py-1 border rounded bg-gray-700 text-white placeholder-gray-400 text-sm"
                            />
                            {isOpen && filteredNames.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-gray-700 border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                                    {filteredNames.map((opp, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handleSelect(opp)}
                                            className={`px-3 py-1.5 cursor-pointer text-sm ${i === highlightedIndex ? 'bg-blue-600' : 'hover:bg-gray-600'} text-white`}
                                        >
                                            {opp} ({oppNameData.counts[opp]})
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isOpen && filteredNames.length === 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-gray-700 border rounded-md shadow-lg p-2 text-gray-400">
                                    No matches found
                                </div>
                            )}
                        </div>
                    )}
                </span>
            </h2>
            {stats ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000 pt-1">
                    <div className="grid grid-cols-1 gap-2 pb-2 md:grid-cols-2 lg:grid-cols-3">
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
                                        <div className=" text-sm">Avg Elo Δ</div>
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
                            <CardContent className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-1">
                                {stats.matches.map((match) => (
                                    <Card
                                        key={match.id}
                                        className={`p-2 ${match.match_win ? 'bg-green-300' : 'bg-red-300'}`}
                                    >
                                        <CardTitle className="flex justify-between gap-2 px-2 pb-2">
                                            <div><a href="#">{new Date(`${match.match_date}Z`).toLocaleString()}</a></div>
                                            <div><a href={`/match/id/${match.id}`} target="_blank" >#{match.ranked_game_number}</a></div>
                                        </CardTitle>
                                        <CardContent className="text-sm gap-2">
                                            <div className="flex justify-between border-b">
                                                <span>My Elo: {match.elo_rank_old}</span>
                                                <span>{match.elo_change >= 0 ? `Elo Gained: +${match.elo_change}` : `Elo Lost: ${match.elo_change}`}</span>
                                                <span>Opp Elo: {match.opponent_elo}</span>
                                            </div>
                                            {match.game_1_winner >= 0 ?
                                                <div className="pt-2 flex justify-between">
                                                    <span>Game 1</span>
                                                    <span>{match.game_1_stage_name}</span>
                                                    <Badge variant="outline " className={`${match.game_1_winner == 1 ? "bg-green-400" : "bg-red-400"}`}>
                                                        <img height="16px" width="24px" src={`/images/chars/${match.game_1_opponent_pick_image}.png`} title={match.game_1_final_move_id != -1 ? match.game_1_final_move_name : ""} />
                                                    </Badge>
                                                </div>
                                                : ""
                                            }
                                            {match.game_2_winner >= 0 ?

                                                <div className="flex justify-between">
                                                    <span>Game 2</span>
                                                    <span>{match.game_2_stage_name}</span>
                                                    <Badge variant="outline" className={`${match.game_2_winner == 1 ? "bg-green-400" : "bg-red-400"}`}>
                                                        <img height="16px" width="24px" src={`/images/chars/${match.game_2_opponent_pick_image}.png`} title={`${match.game_2_final_move_id != -1 ? match.game_2_final_move_name : ""}`} />
                                                    </Badge>
                                                </div>
                                                : ""
                                            }
                                            {match.game_3_winner >= 0 ?
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