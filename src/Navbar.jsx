import { API_BASE_URL } from '@/config';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { connectWebSocket, subscribe } from './utils/websocket';

function TierList({ tiers, showTooltip }) {
    return (
        <div className="relative inline-block">
            {showTooltip && (
                <div className="absolute left-0 mt-2 w-60 bg-gray-900 text-white p-3 rounded-lg shadow-lg z-50">
                    <h4 className="font-bold mb-2">Tiers</h4>
                    <ul className="space-y-1">
                        {tiers.map((tier) => (
                            <li key={tier.id} className="flex justify-between items-center">
                                <span className="flex items-center ">
                                    <span className="px-2"><img width="16px" src={`/images/rankTiers/${tier.tier_short_name}.png`} /></span>
                                    <span>{tier.tier_display_name}</span>
                                </span>
                                <span className="text-gray-400">
                                    {tier.min_threshold} - {tier.max_threshold}
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

    const fetchCurrentElo = () => {
        fetch(`http://${API_BASE_URL}/current_tier`)
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
        fetch(`http://${API_BASE_URL}/ranked_tiers`)
            .then(res => res.json())
            .then(json => {
                if (json.status === "SUCCESS" && json.data) {
                    setTiers(json.data);
                } else {
                    setError(true);
                }
            });
    };

    useEffect(() => {
        fetchCurrentElo();
        fetchTiers();
        connectWebSocket(`ws://${API_BASE_URL}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchCurrentElo();
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        fetchCurrentElo();
    }, [location]);

    return (
        <nav className="fixed top-0 w-full z-50 bg-gray-900 text-white px-4 py-2 shadow-md flex justify-between items-center">
            <div className="text-xl font-bold cursor-pointer" onClick={() => window.location.reload()}>
                Tracker
            </div>
            <div
                className="flex text-white items-center relative"
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
                <TierList tiers={tiers} showTooltip={showTooltip} />
            </div>
            <div className="space-x-5">
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
                    to="/add-match"
                    className={location.pathname === "/add-match" ? "text-teal-400" : "hover:text-teal-400"}
                >
                    Add
                </Link>
            </div>
        </nav>
    );
}
