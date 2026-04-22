import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

export default function CountdownTimer({ endDate, seasonName, seasonId }) {
  const [timeLeft, setTimeLeft] = useState(null);

  const calculateTimeLeft = useCallback(() => {
    if (!endDate) return null;

    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  }, [endDate]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (!timeLeft) return null;

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <span className="ml-4 text-sm text-gray-300">
      {seasonId && seasonName ? (
        <Link to={`/season/${seasonId}`} className="hover:text-teal-400">
          {seasonName}
        </Link>
      ) : (
        "Season Ends"
      )}
      {timeLeft && ` in ${days}d ${hours}h ${minutes}m ${seconds}s`}
    </span>
  );
}
