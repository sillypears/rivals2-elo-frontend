import { useState, useEffect } from "react";

export default function GameRowEditor({
    gameNumber,
    matchData,
    characters,
    stages,
    moves,
    onUpdate
}) {
    const safeCharacters = Array.isArray(characters) ? characters : [];
    const safeStages = Array.isArray(stages) ? stages : [];
    const safeMoves = Array.isArray(moves) ? moves : [];

    const prefix = `game_${gameNumber}_`;
    const get = (key) => matchData[`${prefix}${key}`] ?? -1;

    const [values, setValues] = useState({
        char_pick: get("char_pick"),
        opponent_pick: get("opponent_pick"),
        stage: get("stage"),
        winner: get("winner"),
        final_move_id: get("final_move_id"),
    });

    useEffect(() => {
        setValues({
            char_pick: matchData[`${prefix}char_pick`] ?? -1,
            opponent_pick: matchData[`${prefix}opponent_pick`] ?? -1,
            stage: matchData[`${prefix}stage`] ?? -1,
            winner: matchData[`${prefix}winner`] ?? -1,
            final_move_id: matchData[`${prefix}final_move_id`] ?? -1,
        });
    }, [matchData, prefix]);

    const handleChange = (field) => (e) => {
        setValues(prev => ({ ...prev, [field]: Number(e.target.value) }));
    };

    const handleBlur = (field) => () => {
        const original = matchData[`${prefix}${field}`] ?? -1;
        if (values[field] === original) return;
        onUpdate(`${prefix}${field}`, values[field]);
    };

    return (
        <div className="flex flex-wrap items-center gap-4 border-b py-2">
            <span className="font-semibold">Game {gameNumber}</span>

            <select
                value={values.char_pick}
                onChange={handleChange("char_pick")}
                onBlur={handleBlur("char_pick")}
                disabled={safeCharacters.length === 0}
            >
                <option value={-1} disabled>Loading...</option>
                {safeCharacters.map(c => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
            </select>

            <select
                value={values.opponent_pick}
                onChange={handleChange("opponent_pick")}
                onBlur={handleBlur("opponent_pick")}
                disabled={safeCharacters.length === 0}
            >
                <option value={-1} disabled>Loading...</option>
                {safeCharacters.map(c => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
            </select>

            <select
                value={values.stage}
                onChange={handleChange("stage")}
                onBlur={handleBlur("stage")}
                disabled={safeStages.length === 0}
            >
                <option value={-1} disabled>Loading...</option>
                {safeStages.map(s => (
                    <option key={s.id} value={s.id}>{s.display_name}</option>
                ))}
            </select>

            <select
                value={values.winner}
                onChange={handleChange("winner")}
                onBlur={handleBlur("winner")}
            >
                <option value={-1}>N/A</option>
                <option value={1}>Me</option>
                <option value={2}>Opponent</option>
            </select>

            <select
                value={values.final_move_id}
                onChange={handleChange("final_move_id")}
                onBlur={handleBlur("final_move_id")}
                disabled={safeMoves.length === 0}
            >
                <option value={-1} disabled>Loading...</option>
                {safeMoves.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                ))}
            </select>
        </div>
    );
}
