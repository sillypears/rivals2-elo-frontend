import { useEffect, useState } from 'react';
import { fetchCharacters, fetchStages } from './utils/api';
import { data } from 'autoprefixer';

Math.log10 = Math.log10 || function (x) {
    return Math.log(x) / Math.LN10;
};
function estimateOpponentElo(myElo, eloChange, result, k = 25) {
    if ((result === 1 && eloChange < 0) || (result === 0 && eloChange > 0)) {
        throw new Error("Mismatch between match result and elo change sign.");
    }

    let expectedScore = result - (eloChange / k);

    const epsilon = 1e-6;
    expectedScore = Math.max(epsilon, Math.min(1 - epsilon, expectedScore));

    const oddsRatio = (1 - expectedScore) / expectedScore;

    const log10 = x => Math.log(x) / Math.LN10;

    const opponentElo = myElo + 400 * log10(oddsRatio);

    console.log("estimateOpponentElo debug", {
        myElo, eloChange, result, expectedScore, oddsRatio,
        log10: log10(oddsRatio),
        opponentElo
    });

    return Math.floor(opponentElo);
}



export default function ManualMatchEntry() {
    const [characters, setCharacters] = useState([]);
    const [stages, setStages] = useState([]);
    const [form, setForm] = useState({
        match_date: new Date().toISOString().slice(0, 16),
        elo_rank_old: -1,
        elo_rank_new: -1,
        elo_change: -1,
        match_win: 1,
        match_forfeit: -1,
        ranked_game_number: -1,
        total_wins: -1,
        win_streak_value: -1,
        opponent_elo: -1,
        opponent_estimated_elo: -1,
        opponent_name: '',
        game_1_char_pick: -1,
        game_1_opponent_pick: -1,
        game_1_stage: -1,
        game_1_winner: -1,
        game_2_char_pick: -1,
        game_2_opponent_pick: -1,
        game_2_stage: -1,
        game_2_winner: -1,
        game_3_char_pick: -1,
        game_3_opponent_pick: -1,
        game_3_stage: -1,
        game_3_winner: -1,
        final_move_id: -1,
    });
    const loadLatestMatch = async () => {
        try {
            const res = await fetch('http://192.168.1.30:8005/matches/1');
            const json = await res.json();
            const data = json['data'][0];
            setForm(prev => ({
                ...prev,
                ranked_game_number: data.ranked_game_number,
                elo_rank_old: data.elo_rank_new,
                win_streak_value: data.win_streak_value,
                total_wins: data.total_wins,
            }));
        } catch (err) {
            alert('Failed to load latest match');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCharacters().then((data) => setCharacters(data.data));
        fetchStages().then((data) => setStages(data.data));
    }, []);

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleStageChange = (gameNum, stageId) => {
        update(`game_${gameNum}_stage`, stageId);
    };

    const handleSubmit = async () => {
        const response = await fetch('http://192.168.1.30:8005/insert-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        alert(response.ok ? 'Match submitted!' : 'Submission failed');
    };

    const gameBlock = (num) => (
        <div key={num} className="border rounded p-2 text-xs space-y-1">
            <div className="font-semibold">Game {num}</div>
            <select value={form[`game_${num}_char_pick`]} onChange={e => update(`game_${num}_char_pick`, +e.target.value)} className="w-full">
                <option value={-1}>My Char</option>
                {characters.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
            </select>
            <select value={form[`game_${num}_opponent_pick`]} onChange={e => update(`game_${num}_opponent_pick`, +e.target.value)} className="w-full">
                <option value={-1}>Opponent Char</option>
                {characters.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
            </select>
            <select value={form[`game_${num}_stage`]} onChange={e => handleStageChange(num, +e.target.value)} className="w-full">
                <option value={-1}>Stage</option>
                {stages.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
            </select>
            <select value={form[`game_${num}_winner`]} onChange={e => update(`game_${num}_winner`, +e.target.value)} className="w-full">
                <option value={-1}>Winner</option>
                <option value={1}>Me</option>
                <option value={2}>Opponent</option>
            </select>
        </div>
    );

    return (
        <div className="p-4 bg-white rounded shadow text-black max-w-screen-xl mx-auto text-sm space-y-4">
            <h2 className="text-lg font-bold">Manual Match Entry</h2>
            <button
                onClick={loadLatestMatch}
                className="bg-gray-200 border border-gray-400 px-4 py-1 rounded hover:bg-gray-300 text-sm"
            >
                Load Latest Match
            </button>

            <div className="grid grid-cols-4 gap-4">
                <label className="flex flex-col">
                    Match Date
                    <input type="datetime-local" value={form.match_date} onChange={e => update('match_date', e.target.value)} className="p-1 border rounded" />
                </label>
                <label className="flex flex-col">
                    Game #
                    <input type="number" value={form.ranked_game_number} onChange={e => update('ranked_game_number', +e.target.value)} className="p-1 border rounded" />
                </label>
                <label className="flex flex-col">
                    ELO Before
                    <input type="number" value={form.elo_rank_old} onChange={e => {
                        const val = +e.target.value;
                        update('elo_rank_old', val);
                        update('elo_rank_new', val + form.elo_change);
                    }} className="p-1 border rounded" />
                </label>
                <label className="flex flex-col">
                    ELO Change
                    <input
                        type="number"
                        value={form.elo_change}
                        onChange={e => {
                            const delta = +e.target.value;
                            const oldElo = form.elo_rank_old;
                            const matchWin = form.match_win;

                            let estimated = -1;
                            try {
                                estimated = estimateOpponentElo(oldElo, delta, matchWin);
                            } catch (err) {
                                console.warn("Could not estimate opponent ELO:", err.message);
                            }

                            update('elo_change', delta);
                            update('elo_rank_new', oldElo + delta);
                            update('opponent_estimated_elo', estimated);
                        }}
                        className="p-1 border rounded"
                    />
                </label>

                <label className="flex flex-col">
                    ELO After
                    <input type="number" value={form.elo_rank_new} disabled className="p-1 border rounded bg-gray-100" />
                </label>
                <label className="flex flex-col">
                    Match Win
                    <select value={form.match_win} onChange={e => update('match_win', +e.target.value)} className="p-1 border rounded">
                        <option value={1}>Win</option>
                        <option value={0}>Loss</option>
                    </select>
                </label>
                <label className="flex flex-col">
                    Forfeit
                    <select value={form.match_forfeit} onChange={e => update('match_forfeit', +e.target.value)} className="p-1 border rounded">
                        <option value={0} defaultChecked>No</option>
                        <option value={1}>Yes</option>
                    </select>
                </label>
                <label className="flex flex-col">
                    Opponent Name
                    <input type="text" value={form.opponent_name} onChange={e => update('opponent_name', e.target.value)} className="p-1 border rounded" />
                </label>

                <label className="flex flex-col">
                    Opponent ELO
                    <input type="number" value={form.opponent_elo} onChange={e => update('opponent_elo', +e.target.value)} className="p-1 border rounded" />
                </label>
                <label className="flex flex-col">
                    Est ELO
                    <input type="number" value={form.opponent_estimated_elo} disabled onChange={e => update('opponent_estimated_elo', +e.target.value)} className="p-1 border rounded bg-gray-100" />
                </label>
                <label className="flex flex-col">
                    Win Streak
                    <input type="number" value={form.win_streak_value} onChange={e => update('win_streak_value', +e.target.value)} className="p-1 border rounded" />
                </label>
                <label className="flex flex-col">
                    Total Wins
                    <input type="number" value={form.total_wins} onChange={e => update('total_wins', +e.target.value)} className="p-1 border rounded" />
                </label>
            </div>

            {/* Game Entry */}
            <div className="grid grid-cols-3 gap-2">{[1, 2, 3].map(gameBlock)}</div>

            <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4">
                Submit
            </button>
        </div>
    );
}
