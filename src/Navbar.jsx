import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();

    return (
        <nav className="fixed top-0 w-full z-50 bg-gray-900 text-white px-4 py-2 shadow-md flex justify-between items-center">
            <div className="text-xl font-bold">ELO Tracker</div>
            <div className="space-x-6">
                <Link
                    to="/"
                    className={location.pathname === "/" ? "text-teal-400" : "hover:text-teal-400"}
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
