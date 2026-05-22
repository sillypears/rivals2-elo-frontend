import { API_BASE_URL, API_BASE_PORT } from '@/config';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { connectWebSocket, subscribe } from './utils/websocket';
import { useLatestSeason, useGetPlayersPlaying } from './hooks/useApi';
import CountdownTimer from './components/CountdownTimer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function TierList({ tiers, showTooltip }) {
    return (
        <div className="relative inline-block">
            {showTooltip && (
                <div className="absolute left-0 mt-2 w-80 bg-gray-900 text-white p-3 rounded-lg shadow-lg z-50">
                    <h4 className="font-bold mb-2">Tiers</h4>
                    <ul className="space-y-1">
                        {tiers.map((tier) => (
                            <li key={tier.id} className="flex justify-between items-center">
                                <span className="flex items-center ">
                                    <span className="px-2"><img width="16px" src={`/images/rankTiers/${tier.tier_short_name}.png`} /></span>
                                    <span>{tier.tier_display_name}</span>
                                </span>
                                <span className="text-gray-400">
                                    {tier.min_threshold} - {tier.max_threshold === 99999 ? '∞' : tier.max_threshold}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const location = useLocation();
    const [currentTier, setCurrentTier] = useState({});
    const [error, setError] = useState(false);
    const [tiers, setTiers] = useState([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { data: latestSeason } = useLatestSeason();
    const { data: playersData, refetch: refetchPlayers } = useGetPlayersPlaying();
    const playerRefreshInterval = 5 * 60 * 1000
    const [opponentLookup, setOpponentLookup] = useState({ open: false, name: '', data: null });
    const lookupTimerRef = useRef(null);

    const fetchCurrentElo = () => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/current_tier`)
            .then(res => res.json())
            .then(json => {
                if (json.status === 'SUCCESS' && json.data) {
                    setCurrentTier(json.data);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

    const fetchTiers = () => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/ranked_tiers`)
            .then(res => res.json())
            .then(json => {
                if (json.status === "SUCCESS" && json.data) {
                    setTiers(json.data);
                } else {
                    setError(true);
                }
            });
    };

    const fetchOpponentLookup = useCallback((opponentName) => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/head-to-head?opp_name=${encodeURIComponent(opponentName)}`)
            .then((res) => res.json())
            .then((data) => {
                const d = data.data;
                let lastElo = null;
                const charCount = {};
                if (d.matches && d.matches.length > 0) {
                    const sorted = [...d.matches].sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
                    lastElo = sorted[0].opponent_elo;
                    for (const m of d.matches) {
                        for (const key of ['game_1_opponent_pick_image', 'game_2_opponent_pick_image', 'game_3_opponent_pick_image']) {
                            if (m[key] && m[key] !== -1) {
                                const name = m[key].replace(/\.png$/i, '');
                                charCount[name] = (charCount[name] || 0) + 1;
                            }
                        }
                    }
                }
                const topChars = Object.entries(charCount)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([name]) => name);
                setOpponentLookup({ open: true, name: opponentName, data: { ...d, lastElo, topChars } });
                if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
                lookupTimerRef.current = setTimeout(() => {
                    setOpponentLookup({ open: false, name: '', data: null });
                }, 10000);
            })
            .catch((err) => console.error('Error fetching opponent lookup:', err));
    }, []);

    useEffect(() => {
        fetchCurrentElo();
        fetchTiers();
        connectWebSocket(`ws://${API_BASE_URL}:${API_BASE_PORT}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchCurrentElo();
            }
            if (message.type === "ui_user_lookup" && message.opponent_name) {
                fetchOpponentLookup(message.opponent_name);
            }
        });

        return () => {
            unsubscribe();
            if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
        };
    }, [fetchOpponentLookup]);

    useEffect(() => {
        fetchCurrentElo();
    }, [location]);


    useEffect(() => {
    const interval = setInterval(() => {
            refetchPlayers();
        }, playerRefreshInterval);
        return () => clearInterval(interval);
    }, [refetchPlayers]);

    return (
        <nav className="fixed top-0 w-full z-50 bg-gray-900 text-white px-4 lg:py-2 shadow-md flex justify-between items-center">
            <div className="text-xl font-bold cursor-pointer" onClick={() => window.location.reload()}>
                Tracker
            </div>
            
            <div className="text-xs">
                {playersData && (
                `🥊${playersData.player_count}`
                )}
            </div>
            <div
                className="hidden md:flex text-white items-center relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                Current: {currentTier.current_elo}
                {currentTier.tier_short && (
                    <img
                        className="size-6 object-bottom ml-2"
                        src={`/images/rankTiers/${currentTier.tier_short}.png`}
                        alt={currentTier.tier_short}
                    />
                )}
                {latestSeason && <CountdownTimer endDate={latestSeason.end_date} seasonName={latestSeason.display_name} seasonId={latestSeason.id} />}
                <TierList tiers={tiers} showTooltip={showTooltip} />
            </div>
            <div className="hidden md:flex space-x-5">
                <Link
                    to="/stats"
                    className={location.pathname === "/stats" ? "text-teal-400" : "hover:text-teal-400"}
                >
                    Charts
                </Link>
                <Link
                    to="/matches"
                    className={location.pathname === "/matches" ? "text-teal-400" : "hover:text-teal-400"}
                >
                    Matches
                </Link>
                <Link
                    to="/history"
                    className={location.pathname === "/history" ? "text-teal-400" : "hover:text-teal-400"}
                >
                    History
                </Link>
                <Link
                    to="/head-to-head"
                    className={location.pathname === "/head-to-head" ? "text-teal-400" : "hover:text-teal-400"}
                >
                    H2H
                </Link>
                <Link
                    to="/seasons"
                    className={location.pathname === "/seasons" ? "text-teal-400" : "hover:text-teal-400"}
                >
                    Seasons
                </Link>                

                <Link
                    to="/add-match"
                    className={location.pathname === "/add-match" ? "text-teal-400" : "hover:text-teal-400"}
                >
                    Add
                </Link>
            </div>
            <button
                className="md:hidden inline-flex items-center justify-center p-2 rounded hover:bg-gray-800"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>

            {/* Collapsed menu */}
            {menuOpen && (
                <div className="absolute top-full left-0 w-full bg-gray-900 flex flex-col items-start space-y-2 p-4 md:hidden">
                    <Link
                        to="/stats"
                        onClick={() => setMenuOpen(false)}
                        className={location.pathname === "/stats" ? "text-teal-400" : "hover:text-teal-400"}
                    >
                        Charts
                    </Link>
                    <Link to="/matches" onClick={() => setMenuOpen(false)}>Matches</Link>
                    <Link to="/history" onClick={() => setMenuOpen(false)}>History</Link>
                    <Link to="/head-to-head" onClick={() => setMenuOpen(false)}>H2H</Link>
                    <Link to="/seasons" onClick={() => setMenuOpen(false)}>Seasons</Link>
                    <Link to="/add-match" onClick={() => setMenuOpen(false)}>Add</Link>
                </div>
            )}
            {error && (
                <div>
                    Something broke :)
                </div>
            )}
            {opponentLookup.open && opponentLookup.data && (
                <Dialog open={opponentLookup.open} onOpenChange={(open) => {
                    setOpponentLookup(prev => ({ ...prev, open }));
                    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 text-center p-2">
                                {opponentLookup.name}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="text-gray-700 space-y-3">
                            {opponentLookup.data.overall ? (
                                <>
                                    <div className="grid grid-cols-5 gap-2 text-center text-sm">
                                        <div>
                                            <div className="text-xl font-bold">{opponentLookup.data.overall.total_matches}</div>
                                            <div className="text-xs">Matches</div>
                                        </div>
                                        <div className="text-green-600">
                                            <div className="text-xl font-bold">{opponentLookup.data.overall.matches_won}</div>
                                            <div className="text-xs">Wins</div>
                                        </div>
                                        <div className="text-red-600">
                                            <div className="text-xl font-bold">{opponentLookup.data.overall.matches_lost}</div>
                                            <div className="text-xs">Losses</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{opponentLookup.data.overall.win_percentage}%</div>
                                            <div className="text-xs">Win Rate</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{opponentLookup.data.overall.avg_elo_change}</div>
                                            <div className="text-xs">Avg Elo Δ</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-6 text-sm border-t pt-2">
                                        {opponentLookup.data.lastElo != null && (
                                            <div className="text-center">
                                                <div className="text-lg font-bold">{opponentLookup.data.lastElo}</div>
                                                <div className="text-xs">Last ELO</div>
                                            </div>
                                        )}
                                        {opponentLookup.data.topChars && opponentLookup.data.topChars.length > 0 && (
                                            <div className="text-center">
                                                <div className="flex gap-1 justify-center">
                                                    {opponentLookup.data.topChars.map((ch) => (
                                                        <img key={ch} className="size-6" src={`/images/chars/${ch}.png`} title={ch} />
                                                    ))}
                                                </div>
                                                <div className="text-xs">Plays</div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-gray-500">No stats available</p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </nav >
    );
}
