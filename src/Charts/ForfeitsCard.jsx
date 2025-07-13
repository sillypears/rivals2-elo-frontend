import { useEffect, useState } from 'react';

export default function ForfeitCard(className = '') {
    const [forfeitCount, setForfeitCount] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('http://192.168.1.30:8005/match/forfeits')
            .then(res => res.json())
            .then(json => {
                if (json.status === 'OK' && json.data?.forfeits !== undefined) {
                    setForfeitCount(json.data.forfeits);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    }, []);

    return (
        <div className={`bg-gray-200 w-full h-full text-black gap-4 rounded-lg shadow-md text-center flex flex-col items-center justify-center ${className}`}>
            <h2 className="text-xl font-semibold mb-2">Forfeits</h2>
            {error ? (
                <p className="text-red-600">Error loading data</p>
            ) : (
                <p className="text-4xl font-bold text-yellow-500">
                    {forfeitCount !== null ? forfeitCount : '...'}
                </p>
            )}
        </div>
    );
}
