import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading, LoadingCard } from "@/components/ui/loading";
import { Progress } from "@/components/ui/progress";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSeasons } from "@/hooks/useApi";

export default function SeasonDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch all seasons and find the specific one
    const { data: seasons, loading, error } = useSeasons();

    // Find the specific season by ID
    const season = seasons?.find(s => s.id === parseInt(id));

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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };



    // Check if season is currently active
    const isSeasonActive = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return now >= start && now <= end;
    };

    // Generate calendar days for a season (reusing from SeasonsPage)
    const generateSeasonCalendar = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const calendar = [];

        const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
        const lastDay = new Date(end.getFullYear(), end.getMonth(), 1);
        lastDay.setMonth(lastDay.getMonth() + 1, 0);

        const current = new Date(firstDay);
        while (current <= lastDay) {
            const year = current.getFullYear();
            const month = current.getMonth();
            const monthName = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayOfWeek = new Date(year, month, 1).getDay();

            const monthData = {
                name: monthName,
                days: []
            };

            for (let i = 0; i < firstDayOfWeek; i++) {
                monthData.days.push({ empty: true });
            }

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
    const SeasonCalendar = ({ startDate, endDate }) => {
        const calendar = generateSeasonCalendar(startDate, endDate);
        const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        return (
            <div className="text-sm">
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map((day, i) => (
                        <div key={i} className="text-center text-gray-400 font-medium">
                            &nbsp;
                        </div>
                    ))}
                </div>
                <div className="flex gap-6 overflow-x-auto pb-2">
                    {calendar.map((month, monthIndex) => (
                        <div key={monthIndex} className="flex-shrink-0 min-w-[280px]">
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
    const calculateProgressPercentage = (startDate, endDate) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const now = new Date().getTime();

        if (now <= start) return 0;
        if (now >= end) return 100;

        const total = end - start;
        const elapsed = now - start;

        return ((elapsed / total) * 100);
    };
    // Loading and error states
    if (loading) return <LoadingCard className="m-4" />;
    if (error) return <div className="text-red-500 p-4">Error loading seasons: {error}</div>;
    if (!season) return <div className="p-4">Season not found</div>;

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-800 text-white p-6">
                <div className="">
                    {/* Back button */}
                    <div className="mb-6">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/seasons')}
                            className="text-teal-400 border-teal-400 hover:bg-teal-400 hover:text-gray-800"
                        >
                            ← Back to Seasons
                        </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-6 mb-6">
                        {/* Season Header */}
                        <Card className=" border-2 border-gray-400 bg-gray-700 text-white col-span-5">
                            <CardHeader className="pb-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <CardTitle className="text-3xl mb-2">{season.display_name}</CardTitle>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                                            <div>
                                                <span className="text-gray-400">Season ID:</span> {season.id}
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Short Name:</span> {season.short_name}
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Season Index:</span> {season.season_index}
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Status:</span>
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${season.latest ? 'bg-teal-400 text-gray-800' :
                                                    isSeasonActive(season.start_date, season.end_date) ? 'bg-blue-400 text-gray-800' :
                                                        'bg-gray-600 text-white'
                                                    }`}>
                                                    {season.latest ? 'Current Season' :
                                                        isSeasonActive(season.start_date, season.end_date) ? 'Active' :
                                                            'Completed'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                        <Card className=" border-2 border-gray-400 bg-gray-700 text-white col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">External Links</CardTitle>
                            </CardHeader>
                            <CardContent className="">
                                {season.steam_leaderboard ? (
                                    <div>
                                        <div className="text-sm text-gray-400 mb-2">Steam Leaderboard</div>
                                        <a
                                            href={`https://steamcommunity.com/app/1913090/leaderboards/${season.steam_leaderboard}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-teal-400 hover:text-teal-300 underline"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                            View Steam Leaderboard
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-gray-400">
                                        <div className="text-sm mb-2">Steam Leaderboard</div>
                                        <div className="text-sm">No leaderboard available</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    {/* Season Details Grid */}
                    <div className="grid grid-cols-7 gap-6 mb-6">
                        {/* Date Information */}
                        <Card className="bg-gray-700 text-white col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Date Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm text-gray-400">Start Date</div>
                                    <div className="text-lg">{formatDate(season.start_date)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">End Date</div>
                                    <div className="text-lg">{formatDate(season.end_date)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Duration</div>
                                    <div className="text-lg font-semibold">
                                        {calculateSeasonDuration(season.start_date, season.end_date)} days
                                    </div>
                                </div>

                                {/* Progress Section with Bar */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-400">Progress</div>
                                        <div className="text-sm font-medium text-gray-300">
                                            {isSeasonActive(season.start_date, season.end_date) ? (
                                                <>
                                                    Day{" "}
                                                    {Math.ceil(
                                                        (new Date() - new Date(season.start_date)) / (1000 * 60 * 60 * 24)
                                                    )}{" "}
                                                    of {calculateSeasonDuration(season.start_date, season.end_date)}
                                                </>
                                            ) : (
                                                "Completed"
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <Progress
                                        value={
                                            isSeasonActive(season.start_date, season.end_date)
                                                ? calculateProgressPercentage(season.start_date, season.end_date)
                                                : 100
                                        }
                                        className="h-3 bg-red-700 [&>div]:bg-green-400" />

                                    {/* Optional: Percentage */}
                                    <div className="text-right text-xs text-gray-400">
                                        {isSeasonActive(season.start_date, season.end_date)
                                            ? `${calculateProgressPercentage(season.start_date, season.end_date).toFixed(0)}%`
                                            : "100%"}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Calendar Section */}
                    <Card className="bg-gray-700 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Season Calendar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SeasonCalendar
                                startDate={season.start_date}
                                endDate={season.end_date}
                            />
                            {/* Calendar legend */}
                            <div className="flex justify-center gap-6 mt-4 text-sm border-t border-gray-600 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                    <span className="text-gray-300">Season Days</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-teal-400 rounded"></div>
                                    <span className="text-gray-300">Today</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border border-gray-500 rounded"></div>
                                    <span className="text-gray-300">Other Days</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ErrorBoundary>
    );
}