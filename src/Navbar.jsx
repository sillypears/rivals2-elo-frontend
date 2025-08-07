import { API_BASE_URL } from '@/config';
import { Link, useLocation  } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { connectWebSocket, subscribe } from './utils/websocket';

export default function Navbar() {
    const location = useLocation();
    const [currentTier, setCurrentTier] = useState({});
    const [error, setError] = useState(false);

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
    useEffect(() => {
        fetchCurrentElo();

        connectWebSocket(`ws://${API_BASE_URL}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchCurrentElo(); 
            }
        });

        return () => unsubscribe(); 
    }, []);
    
    return (
        <nav className="fixed top-0 w-full z-50 bg-gray-900 text-white px-4 py-2 shadow-md flex justify-between items-center">
            <div className="text-xl font-bold">Tracker</div>
            <div className=" flex text-white items-center">
                Current: {currentTier.current_elo} <img className="size-6 object-bottom"  src={`/images/rankTiers/${currentTier.tier_short}.png`} />
            </div>
            <div className="space-x-5">
                <Link
                    to="/history"
                    className={location.pathname === "/history" ? "text-teal-400" : "hover:text-teal-400"}
                >
                    History
                </Link>
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
                    to="/add-match"
                    className={location.pathname === "/add-match" ? "text-teal-400" : "hover:text-teal-400"}
                >
                    Add
                </Link>
                <Link
                    to="/head-to-head"
                    className={location.pathname === "/add-match" ? "text-teal-400" : "hover:text-teal-400"}
                >
                    H2H
                </Link>
            </div>
        </nav>
    );
}
