import React from "react";

export default function GameRowEditor({
    gameNumber,
    matchData,
    characters,
    stages,
    moves,
    onChange
}) {

    const prefix = `game_${gameNumber}_`;
    const get = (key) => matchData[`${prefix}${key}`] ?? -1;
    console.log(gameNumber)
    return (
        <div className="flex flex-wrap items-center gap-4 border-b py-2">
            <span className="font-semibold">Game {gameNumber}</span>

            <select value={get("char_pick")} onChange={(e) => onChange(`${prefix}char_pick`, Number(e.target.value))}>
                {characters.map(c => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
            </select>

            <select value={get("opponent_pick")} onChange={(e) => onChange(`${prefix}opponent_pick`, Number(e.target.value))}>
                {characters.map(c => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
            </select>

            <select value={get("stage")} onChange={(e) => onChange(`${prefix}stage`, Number(e.target.value))}>
                {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.display_name}</option>
                ))}
            </select>

            <select value={get("winner")} onChange={(e) => onChange(`${prefix}winner`, Number(e.target.value))}>
                <option value={-1}>N/A</option>
                <option value={1}>Me</option>
                <option value={2}>Opponent</option>
            </select>

            <select value={get("final_move_id")} onChange={(e) => onChange(`${prefix}final_move_id`, Number(e.target.value))}>
                {moves.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                ))}
            </select>
        </div>
    );
}
