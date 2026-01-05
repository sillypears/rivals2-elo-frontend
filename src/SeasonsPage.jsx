import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading, LoadingCard } from "@/components/ui/loading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSeasons } from "@/hooks/useApi";
import { useEffect, useRef } from "react";

export default function SeasonsPage() {
    const { data: seasons, loading, error } = useSeasons();
    const calendarRefs = useRef({});

    // Calculate season duration
    const calculateSeasonDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Format dates for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Generate calendar days for a season
    const generateSeasonCalendar = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const calendar = [];
        
        // Get the first day of the start month
        const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
        const lastDay = new Date(end.getFullYear(), end.getMonth(), 1);
        lastDay.setMonth(lastDay.getMonth() + 1, 0); // Last day of end month
        
        // Generate all months from start to end
        const current = new Date(firstDay);
        while (current <= lastDay) {
            const year = current.getFullYear();
            const month = current.getMonth();
            const monthName = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            // Get days in month
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayOfWeek = new Date(year, month, 1).getDay();
            
            const monthData = {
                name: monthName,
                days: []
            };
            
            // Add empty cells for days before month starts
            for (let i = 0; i < firstDayOfWeek; i++) {
                monthData.days.push({ empty: true });
            }
            
            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const currentDate = new Date(year, month, day);
                const isSeasonDay = currentDate >= start && currentDate <= end;
                const isToday = currentDate.toDateString() === new Date().toDateString();
                
                monthData.days.push({
                    day,
                    isSeasonDay,
                    isToday
                });
            }
            
            calendar.push(monthData);
            current.setMonth(current.getMonth() + 1);
        }
        
        return calendar;
    };

    // Calendar component for displaying season days
    const SeasonCalendar = ({ startDate, endDate, seasonId }) => {
        const calendar = generateSeasonCalendar(startDate, endDate);
        const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        
        return (
            <div className="text-sm">
                {/* Weekday headers - shown once for all months */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map((day, i) => (
                        <div key={i} className="text-center text-gray-400 font-medium">
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Months displayed horizontally */}
                <div className="flex gap-6 overflow-x-auto pb-2" ref={(el) => {
                    calendarRefs.current[`season-${seasonId}-container`] = el;
                }}>
                    {calendar.map((month, monthIndex) => (
                        <div 
                            key={monthIndex} 
                            className="flex-shrink-0 min-w-[280px]"
                            ref={(el) => {
                                calendarRefs.current[`season-${seasonId}-month-${monthIndex}`] = el;
                            }}
                        >
                            <div className="text-center text-gray-300 font-medium mb-2">
                                {month.name}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {month.days.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className={`
                                            aspect-square flex items-center justify-center rounded text-sm w-8 h-8
                                            ${day.empty ? '' : 
                                                day.isSeasonDay ? 
                                                    day.isToday ? 'bg-teal-400 text-gray-800 font-bold' : 
                                                    'bg-blue-600 text-white' : 
                                                    'text-gray-500'
                                            }
                                        `}
                                    >
                                        {!day.empty && day.day}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    

// Auto-scroll to current month on page load
    useEffect(() => {
        if (seasons && seasons.length > 0) {
            const today = new Date();
            
            seasons.forEach(season => {
                const start = new Date(season.start_date);
                const end = new Date(season.end_date);
                
                // Check if today is within this season
                if (today >= start && today <= end) {
                    // Find current month in this season
                    const calendar = generateSeasonCalendar(season.start_date, season.end_date);
                    calendar.forEach((month, index) => {
                        const monthDate = new Date(season.start_date);
                        monthDate.setMonth(monthDate.getMonth() + index);
                        
                        // If this month contains today's date, scroll to it
                        if (monthDate.getMonth() === today.getMonth()) {
                            setTimeout(() => {
                                const ref = calendarRefs.current[`season-${season.id}-month-${index}`];
                                if (ref) {
                                    ref.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'nearest',
                                        inline: 'center'
                                    });
                                }
                            }, 300);
                        }
                    });
                }
            });
        }
    }, [seasons]);

    // Loading and error states
    if (loading) return <LoadingCard className="m-4" />;
    if (error) return <div className="text-red-500 p-4">Error loading seasons: {error}</div>;

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-800 text-white p-6">
                <h1 className="text-3xl font-bold mb-6">Seasons</h1>
                
                <div className="grid grid-cols-1 gap-6">
                    {seasons?.map(season => (
                        <Card key={season.id} className={`bg-gray-700 border-2 ${season.latest ? 'border-teal-400' : 'border-gray-600'}`}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{season.display_name}</CardTitle>
                                    {season.latest && (
                                        <span className="bg-teal-400 text-gray-800 text-xs px-2 py-1 rounded-full">
                                            Current
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="">
                                {/* Date range and duration */}
                                <div className="text-sm text-gray-300">
                                    <div>{formatDate(season.start_date)} - {formatDate(season.end_date)}</div>
                                    <div className="text-xs ">
                                        {calculateSeasonDuration(season.start_date, season.end_date)} total days
                                    </div>
                                </div>

                                {/* Calendar view */}
                                <div className="bg-gray-800 p-4 rounded border border-gray-600">
                                    <SeasonCalendar 
                                        startDate={season.start_date} 
                                        endDate={season.end_date} 
                                        seasonId={season.id}
                                    />
                                    {/* Calendar legend */}
                                    <div className="flex justify-center gap-4 mt-2 text-xs border-t border-gray-700 pt-2">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-blue-600 rounded"></div>
                                            <span className="text-gray-300">Season Days</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-teal-400 rounded"></div>
                                            <span className="text-gray-300">Today</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 border border-gray-500 rounded"></div>
                                            <span className="text-gray-300">Other Days</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Steam leaderboard link */}
                                {season.steam_leaderboard && (
                                    <div>
                                        <a
                                            href={`https://steamcommunity.com/stats/2217000/leaderboards/${season.steam_leaderboard}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-teal-400 hover:text-teal-300 text-sm underline"
                                        >
                                            View Steam Leaderboard
                                        </a>
                                    </div>
                                )}

                                {/* View details button */}
                                <Link to={`/season/${season.id}`}>
                                    <Button className="w-full mt-3">
                                        View Season Details
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </ErrorBoundary>
    );
}