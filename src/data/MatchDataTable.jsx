import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { fetchCharacters, fetchStages, fetchMoves } from '../utils/api';
import { data } from 'react-router-dom';


const columnHelper = createColumnHelper();

export default function MatchDataTable({ matches, onCellUpdate }) {
    const [pageSize, setPageSize] = useState(20);
    const [pageIndex, setPageIndex] = useState(0);
    const [characters, setCharacters] = useState([]);
    const [stages, setStages] = useState([]);
    const [moves, setMoves] = useState([]);

    useEffect(() => {
        fetchCharacters().then((cdata) => setCharacters(cdata.data));
        fetchStages().then((sdata) => setStages(sdata.data));
        fetchMoves().then((mdata) => setMoves(mdata.data));
    }, []);

    const characterMap = useMemo(() =>
        Object.fromEntries(characters.map(c => [c.id, c.display_name])),
        [characters]
    );

    const maxGames = useMemo(() => {
        let max = 0;
        for (const match of matches) {
            const count = Object.keys(match).filter(k => k.startsWith('game_') && k.includes('_winner')).length;
            max = Math.max(max, count);
        }
        return max;
    }, [matches]);
    const columns = useMemo(() => {
        if (characters.length === 0 || stages.length === 0) return [];

        const baseColumns = [
            columnHelper.accessor('ranked_game_number', {
                header: 'Game #',
                cell: ({ row }) => {
                    return (
                        <a href={`/match/${row.original.id}`} target="_blank">
                            {row.original.ranked_game_number}
                        </a>
                    )
                }

            }),
            columnHelper.accessor('match_win', {
                header: 'Result',
                cell: info => info.getValue() ? 'Win' : 'Loss',
            }),
            columnHelper.accessor('elo_rank_old', {
                header: 'ELO Before',
                cell: ({ row }) => {
                    const oldElo = row.original.elo_rank_old;
                    const delta = row.original.elo_change;

                    return (
                        <span className="relative">
                            {oldElo}
                            {delta !== 0 && (
                                <sup
                                    className={`ml-1 text-xs ${delta > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}
                                >
                                    {delta > 0 ? `+${delta}` : delta}
                                </sup>
                            )}
                        </span>
                    );
                },
            }),
            columnHelper.accessor('elo_rank_new', { header: 'ELO After' }),
            columnHelper.accessor('opponent_elo', {
                header: 'Opponent ELO',
                cell: ({ row, getValue }) => {
                    const rankedGameNumber = row.original.ranked_game_number;
                    const row_id = row.original.id;
                    const externalValue = getValue();
                    const [editing, setEditing] = useState(false);
                    const [value, setValue] = useState(externalValue);
                    const [originalValue, setOriginalValue] = useState(externalValue);
                    const estimated_elo = row.original.opponent_estimated_elo;
                    const opp_name = row.original.opponent_name;

                    useEffect(() => {
                        setValue(externalValue);
                        setOriginalValue(externalValue);
                    }, [externalValue]);

                    const handleBlur = () => {
                        setEditing(false);
                        if (value === originalValue) return;
                        fetch('http://192.168.1.30:8005/update-match/', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                game_number: rankedGameNumber,
                                row_id: row_id,
                                key: 'opponent_elo',
                                value: value,
                            }),
                        })
                            .then(res => {
                                if (!res.ok) throw new Error("Bad response");
                                return res.json();
                            })
                            .then(() => setOriginalValue(value))
                            .catch(err => {
                                console.error("Update failed:", err);
                                setValue(originalValue);
                                alert("Update failed. Reverting.");
                            });
                    };

                    return editing ? (
                        <input
                            type="number"
                            className="w-20 text-sm p-1 border rounded"
                            autoFocus
                            value={value}
                            onChange={e => setValue(Number(e.target.value))}
                            onBlur={handleBlur}
                            onKeyDown={e => {
                                if (e.key === 'Enter') e.target.blur();
                            }}

                        />
                    ) : (
                            <span
                                className="cursor-pointer hover:underline"
                                onClick={() => setEditing(true)}
                                title={`${opp_name}`}
                            >
                                {value === -2 ? 'UNRANKED' : value}
                                <sup title="Estimated ELO" className="ml-2 text-gray-400">
                                    {estimated_elo > -1 ? `${estimated_elo}` : ''}
                                </sup>

                            </span>

                    );
                }
            }),
            columnHelper.accessor('win_streak_value', { header: 'Win Streak' }),
        ];

        const gameColumns = [];
        for (let i = 1; i <= maxGames; i++) {
            gameColumns.push(
                columnHelper.accessor(`game_${i}_char_pick`, {
                    header: `Game ${i} Me`,
                    cell: info => {
                        const val = info.getValue();
                        const row = info.row.original;
                        const row_id = info.row.original.id;
                        const gameKey = `game_${i}_char_pick`;
                        const gameNumber = row.ranked_game_number;
                        const imageKey = row[`game_${i}_char_pick_image`] || 'na';
                        return (
                            <div className="flex items-center gap-2">
                                <img
                                    src={`/images/chars/${imageKey}.png`}
                                    alt={characterMap[val] || 'N/A'}
                                    onError={e => { e.target.src = '/images/chars/na.png'; }}
                                    className="w-5 h-5"
                                />
                                <select
                                    className="bg-white text-black rounded px-1"
                                    value={val ?? -1}
                                    onChange={e => {
                                        const newVal = parseInt(e.target.value);
                                        if (newVal !== val && onCellUpdate) {
                                            onCellUpdate(row_id, gameNumber, gameKey, newVal);
                                        }
                                    }}
                                >
                                    {characters.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.display_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    },
                }),
                columnHelper.accessor(`game_${i}_opponent_pick`, {
                    header: `Game ${i} Opp`,
                    cell: info => {
                        const val = info.getValue();
                        const row = info.row.original;
                        const row_id = info.row.original.id;
                        const gameKey = `game_${i}_opponent_pick`;
                        const gameNumber = row.ranked_game_number;
                        const imageKey = row[`game_${i}_opponent_pick_image`] || 'na';
                        return (
                            <div className="flex items-center gap-2">
                                <img
                                    src={`/images/chars/${imageKey}.png`}
                                    alt={characterMap[val] || 'N/A'}
                                    onError={e => { e.target.src = '/images/chars/na.png'; }}
                                    className="w-5 h-5"
                                />
                                <select
                                    className="bg-white text-black rounded px-1"
                                    value={val ?? -1}
                                    onChange={e => {
                                        const newVal = parseInt(e.target.value);
                                        if (newVal !== val && onCellUpdate) {
                                            onCellUpdate(row_id, gameNumber, gameKey, newVal);
                                        }
                                    }}
                                >
                                    {characters.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.display_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    },
                }),
                columnHelper.accessor(`game_${i}_stage`, {
                    header: `Game ${i} Stage`,
                    cell: info => {
                        const val = info.getValue();
                        const row = info.row.original;
                        const row_id = info.row.original.id;
                        const gameKey = `game_${i}_stage`;
                        const gameNumber = row.ranked_game_number;

                        return (
                            <select
                                className="bg-white text-black rounded px-1"
                                value={val ?? -1}
                                onChange={e => {
                                    const newVal = parseInt(e.target.value);
                                    if (newVal !== val && onCellUpdate) {
                                        onCellUpdate(row_id, gameNumber, gameKey, newVal);
                                    }
                                }}
                            >
                                {stages.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.display_name}
                                    </option>
                                ))}
                            </select>
                        );
                    },
                }),
                columnHelper.accessor(`game_${i}_winner`, {
                    header: `Game ${i} Winner`,
                    cell: info => {
                        const val = info.getValue();
                        const row = info.row.original;
                        const row_id = info.row.original.id;
                        const gameKey = `game_${i}_winner`;
                        const gameNumber = row.ranked_game_number;

                        return (
                            <select
                                className="bg-white text-black rounded px-1"
                                value={val ?? -1}
                                onChange={e => {
                                    const newVal = parseInt(e.target.value);
                                    if (newVal !== val && onCellUpdate) {
                                        onCellUpdate(row_id, gameNumber, gameKey, newVal);
                                    }
                                }}
                            >
                                <option value={-1}>N/A</option>
                                <option value={1}>Me</option>
                                <option value={2}>Opponent</option>
                            </select>
                        );
                    },
                }),
                columnHelper.accessor(`game_${i}_final_move_id`, {
                    header: `Game ${i} Finish`,
                    cell: info => {
                        const val = info.getValue();
                        const row = info.row.original;
                        const row_id = info.row.original.id;
                        const gameKey = `game_${i}_final_move_id`;
                        const gameNumber = row.ranked_game_number;

                        return (
                            <select
                                className="bg-white text-black rounded px-1"
                                value={val ?? -1}
                                onChange={e => {
                                    const newVal = parseInt(e.target.value);
                                    if (newVal !== val && onCellUpdate) {
                                        onCellUpdate(row_id, gameNumber, gameKey, newVal);
                                    }
                                }}
                            >
                                {moves.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.display_name}
                                    </option>
                                ))}
                            </select>
                        );
                    },
                })
            );
        }

        const endColumns = [

        ];

        return [...baseColumns, ...gameColumns, ...endColumns];

    }, [characters, stages, moves, maxGames, onCellUpdate]);

    const table = useReactTable({
        data: matches,
        columns,
        pageCount: Math.ceil(matches.length / pageSize),
        state: {
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: updater => {
            const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
            setPageIndex(next.pageIndex ?? 0);
            setPageSize(next.pageSize ?? 10);
        },
    });

    return (
        <div className="overflow-x-auto bg-gray-200 text-black p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Match History</h2>
            <table className="min-w-full border text-sm table-auto">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="bg-gray-400">
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="p-2 border text-left text-md">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="odd:bg-gray-200 even:bg-gray-100 hover:bg-gray-300">
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} id={cell.id} ranked_game_number={cell.ranked_game_no} className="p-2 border">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination controls */}
            <div className="flex justify-left items-center mt-4">
                <div>
                    Page {pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="space-x-2">
                    <button
                        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Prev
                    </button>
                    <button
                        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
