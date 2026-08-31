import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading, LoadingCard } from "@/components/ui/loading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSeason, useUpdateSeason } from "@/hooks/useApi";

function toDatetimeLocal(isoString) {
    if (!isoString) return "";
    // isoString like "2024-10-23T00:00:00" -> "2024-10-23T00:00"
    const d = new Date(isoString + "Z");
    if (isNaN(d.getTime())) {
        // fallback: try slice
        return isoString.slice(0, 16);
    }
    const pad = (n) => String(n).padStart(2, "0");
    // Use local datetime representation from UTC original
    // Convert back to local input format: YYYY-MM-DDTHH:MM
    // The stored date is treated as UTC; we render as local via ISO slicing
    // Simpler: just slice the raw string to keep same wall time
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(isoString)) {
        return isoString.slice(0, 16);
    }
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(localValue) {
    if (!localValue) return null;
    // localValue like "2024-10-23T00:00" -> "2024-10-23T00:00:00"
    if (localValue.length === 16) return `${localValue}:00`;
    return localValue;
}

export default function SeasonEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: season, loading, error } = useSeason(id);
    const { updateSeason, updating } = useUpdateSeason();

    const [form, setForm] = useState({
        display_name: "",
        short_name: "",
        season_index: "",
        start_date: "",
        end_date: "",
        steam_leaderboard: "",
        latest: false,
    });
    const [submitError, setSubmitError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (season) {
            setForm({
                display_name: season.display_name ?? "",
                short_name: season.short_name ?? "",
                season_index: season.season_index ?? "",
                start_date: toDatetimeLocal(season.start_date),
                end_date: toDatetimeLocal(season.end_date),
                steam_leaderboard: season.steam_leaderboard ?? "",
                latest: !!season.latest,
            });
        }
    }, [season]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setSuccess(null);

        if (!form.display_name.trim() || !form.short_name.trim()) {
            setSubmitError("Display name and short name are required.");
            return;
        }
        if (!form.start_date || !form.end_date) {
            setSubmitError("Start and end dates are required.");
            return;
        }
        if (new Date(fromDatetimeLocal(form.start_date)) >= new Date(fromDatetimeLocal(form.end_date))) {
            setSubmitError("End date must be after start date.");
            return;
        }

        const payload = {
            display_name: form.display_name.trim(),
            short_name: form.short_name.trim(),
            season_index: form.season_index === "" ? null : parseInt(form.season_index, 10),
            start_date: fromDatetimeLocal(form.start_date),
            end_date: fromDatetimeLocal(form.end_date),
            steam_leaderboard: form.steam_leaderboard === "" ? null : parseInt(form.steam_leaderboard, 10),
        };

        // Remove NaN checks
        if (payload.season_index !== null && Number.isNaN(payload.season_index)) {
            setSubmitError("Season index must be a number.");
            return;
        }
        if (payload.steam_leaderboard !== null && Number.isNaN(payload.steam_leaderboard)) {
            setSubmitError("Steam leaderboard must be a number.");
            return;
        }

        try {
            await updateSeason(id, payload);
            setSuccess("Season updated successfully.");
            setTimeout(() => navigate(`/season/${id}`), 800);
        } catch (err) {
            setSubmitError(err.message || "Update failed.");
        }
    };

    if (loading) return <LoadingCard className="m-4" />;
    if (error) return <div className="text-red-500 p-4">Error loading season: {error}</div>;
    if (!season) return <div className="p-4 text-white">Season not found</div>;

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-800 text-white p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6 flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/season/${id}`)}
                            className="text-teal-400 border-teal-400 hover:bg-teal-400 hover:text-gray-800"
                        >
                            ← Back to Season
                        </Button>
                        <Link to="/seasons">
                            <Button variant="outline" className="text-gray-300 border-gray-500 hover:bg-gray-700">
                                All Seasons
                            </Button>
                        </Link>
                    </div>

                    <Card className="bg-gray-700 text-white border-2 border-gray-400">
                        <CardHeader>
                            <CardTitle className="text-2xl">Edit Season #{season.id} — {season.display_name}</CardTitle>
                            <p className="text-sm text-gray-400">
                                Update season details. Changes are sent via <code className="bg-gray-600 px-1 rounded">PATCH /season/id/{id}</code>.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-300">Display Name *</span>
                                        <input
                                            type="text"
                                            value={form.display_name}
                                            onChange={(e) => handleChange("display_name", e.target.value)}
                                            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="Fall 2025"
                                            required
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-300">Short Name *</span>
                                        <input
                                            type="text"
                                            value={form.short_name}
                                            onChange={(e) => handleChange("short_name", e.target.value)}
                                            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="fall_2025"
                                            required
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-300">Season Index</span>
                                        <input
                                            type="number"
                                            value={form.season_index}
                                            onChange={(e) => handleChange("season_index", e.target.value)}
                                            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="4"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-300">Steam Leaderboard ID</span>
                                        <input
                                            type="number"
                                            value={form.steam_leaderboard}
                                            onChange={(e) => handleChange("steam_leaderboard", e.target.value)}
                                            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="17834843 (empty for none)"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-300">Start Date *</span>
                                        <input
                                            type="datetime-local"
                                            value={form.start_date}
                                            onChange={(e) => handleChange("start_date", e.target.value)}
                                            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            required
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-300">End Date *</span>
                                        <input
                                            type="datetime-local"
                                            value={form.end_date}
                                            onChange={(e) => handleChange("end_date", e.target.value)}
                                            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            required
                                        />
                                    </label>
                                </div>

                                <div className="bg-gray-800 rounded p-3 border border-gray-600">
                                    <div className="text-sm text-gray-400">Latest status is computed automatically</div>
                                    <div className="text-sm">
                                        {form.latest ? (
                                            <span className="text-teal-400">This season is currently marked as latest</span>
                                        ) : (
                                            <span className="text-gray-400">Not the latest season — latest is determined by date range containing today</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">To change which season is latest, adjust its start/end dates to include today.</div>
                                </div>

                                {submitError && (
                                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded text-sm">
                                        {submitError}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-2 rounded text-sm">
                                        {success} Redirecting...
                                    </div>
                                )}

                                <div className="flex gap-3 justify-end pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(`/season/${id}`)}
                                        disabled={updating}
                                        className="border-gray-500 text-gray-300 hover:bg-gray-600"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={updating}
                                        className="bg-teal-600 hover:bg-teal-500 text-white"
                                    >
                                        {updating ? <><Loading size="sm" /> Saving...</> : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-4 text-xs text-gray-500">
                        Season ID: {season.id} • Original: {season.start_date} → {season.end_date}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
