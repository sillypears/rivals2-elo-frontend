import { Link, useLocation  } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

export default function Navbar() {
    const location = useLocation();
    const [currentTier, setCurrentTier] = useState({});
    const [error, setError] = useState(false);
    const wsRef = useRef(null);

    const fetchCurrentElo = () => {
        fetch('http://192.168.1.30:8005/current_tier')
            .then(res => res.json())
            .then(json => {
                if (json.status === 'OK' && json.data) {
                    setCurrentTier(json.data);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };
    useEffect(() => {
        fetchCurrentElo();

        const ws = new WebSocket("ws://192.168.1.30:8005/ws");
        wsRef.current = ws;

        ws.onopen = () => console.log("WebSocket connected");

        ws.onmessage = (event) => {
            try {
                if (!event.data || event.data.trim().charAt(0) !== '{') return;
                const message = JSON.parse(event.data);
                if (message.type === "new_match") {
                    fetchCurrentElo();
                }
            } catch (err) {
                console.warn("Error parsing WebSocket message", err);
            }
        };

        ws.onerror = (err) => console.error("WebSocket error", err);

        ws.onclose = () => console.log("WebSocket closed");

        return () => ws.close(); 
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
            </div>
        </nav>
    );
}
