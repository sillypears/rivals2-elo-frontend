import { useEffect, useRef } from 'react';
import { Timeline } from '@knight-lab/timelinejs';
import '@knight-lab/timelinejs/dist/css/timeline.css';

const TIMELINE_STYLES = `
#tl-inner .tl-timeline { background: #9ca3af; }
#tl-inner .tl-timeline .tl-storyslider { background: #9ca3af; }
#tl-inner .tl-timeline .tl-slider { background: #9ca3af; }
#tl-inner .tl-timeline .tl-slide { background: transparent; }
#tl-inner .tl-timeline .tl-slide .tl-slide-content-container .tl-slide-content .tl-text h2 { color: #111827; }
#tl-inner .tl-timeline .tl-slide .tl-slide-content-container .tl-slide-content .tl-text p { color: #1f2937; }
#tl-inner .tl-timeline h1, #tl-inner .tl-timeline h2, #tl-inner .tl-timeline h3, #tl-inner .tl-timeline h4, #tl-inner .tl-timeline h5, #tl-inner .tl-timeline h6 { color: #111827; }
#tl-inner .tl-timeline p { color: #1f2937; }
#tl-inner .tl-timeline a { color: #1d4ed8; }
#tl-inner .tl-timeline .tl-headline-date { color: #374151; font-weight: 600; }
#tl-inner .tl-timeline .tl-slidenav .tl-slidenav-content-container .tl-slidenav-title { color: #111827; }
#tl-inner .tl-timeline .tl-slidenav .tl-slidenav-content-container .tl-slidenav-description { color: #374151; }
#tl-inner .tl-timeline .tl-slidenav .tl-slidenav-content-container .tl-slidenav-icon { color: #6b7280; }
#tl-inner .tl-timeline .tl-attribution { color: #6b7280; }
#tl-inner .tl-timeline .tl-timenav { background: #9ca3af; border-top: 2px solid #6b7280; }
#tl-inner .tl-timeline .tl-timenav .tl-timenav-slider { background: #9ca3af; }
#tl-inner .tl-timeline .tl-timenav .tl-timenav-slider .tl-timenav-slider-background { background: transparent; }
#tl-inner .tl-timeline .tl-timenav .tl-timenav-line { background-color: #4b5563; }
#tl-inner .tl-timeline .tl-timeaxis-background { background: #9ca3af; border-top-color: #6b7280; }
#tl-inner .tl-timeline .tl-timeaxis .tl-timeaxis-content-container .tl-timeaxis-major .tl-timeaxis-tick { border-left-color: #4b5563; }
#tl-inner .tl-timeline .tl-timeaxis .tl-timeaxis-content-container .tl-timeaxis-minor .tl-timeaxis-tick { border-left-color: #6b7280; }
#tl-inner .tl-timeline .tl-timeaxis .tl-timeaxis-content-container .tl-timeaxis-major .tl-timeaxis-tick .tl-timeaxis-tick-text { color: #111827 !important; font-weight: 700 !important; font-size: 13px !important; opacity: 1 !important; background: transparent; }
#tl-inner .tl-timeline .tl-timeaxis .tl-timeaxis-content-container .tl-timeaxis-minor .tl-timeaxis-tick .tl-timeaxis-tick-text { color: #374151 !important; font-weight: 500 !important; opacity: 1 !important; background: transparent; }
#tl-inner .tl-timeline .tl-timeaxis .tl-timeaxis-content-container .tl-timeaxis-major { background: transparent; }
#tl-inner .tl-timeline .tl-timeaxis .tl-timeaxis-content-container .tl-timeaxis-minor { background: transparent; }
#tl-inner .tl-timeline .tl-timemarker .tl-timemarker-content-container .tl-timemarker-content { background: #374151; border-color: #4b5563; border-radius: 4px; }
#tl-inner .tl-timeline .tl-timemarker .tl-timemarker-content-container .tl-timemarker-content .tl-timemarker-text h2 { color: #f1f5f9; font-size: 11px; }
#tl-inner .tl-timeline .tl-timemarker .tl-timemarker-content-container .tl-timemarker-content .tl-timemarker-text p { color: #94a3b8; font-size: 10px; }
#tl-inner .tl-timeline .tl-timemarker .tl-timemarker-media-container .tl-timemarker-media { background: #374151; max-height: 28px; }
#tl-inner .tl-timeline .tl-timemarker .tl-timemarker-timespan { background-color: rgba(55, 65, 81, 0.15); }
#tl-inner .tl-timeline .tl-timemarker .tl-timemarker-line-left,
#tl-inner .tl-timeline .tl-timemarker .tl-timemarker-line-right { border-color: #4b5563; box-shadow: none; }
#tl-inner .tl-timeline .tl-timemarker .tl-timemarker-line-left:after,
#tl-inner .tl-timeline .tl-timemarker .tl-timemarker-line-right:after { background-color: #374151; }
#tl-inner .tl-timeline .tl-timemarker.tl-timemarker-active .tl-timemarker-content-container .tl-timemarker-content { border-color: #3b82f6; }
#tl-inner .tl-timeline .tl-timemarker.tl-timemarker-active .tl-timemarker-content-container .tl-timemarker-content .tl-timemarker-text h2 { color: #f8fafc; }
#tl-inner .tl-timeline .tl-timemarker.tl-timemarker-active .tl-timemarker-line-left,
#tl-inner .tl-timeline .tl-timemarker.tl-timemarker-active .tl-timemarker-line-right { border-color: #3b82f6; box-shadow: none; }
#tl-inner .tl-timeline .tl-timemarker.tl-timemarker-active .tl-timemarker-line-left:after,
#tl-inner .tl-timeline .tl-timemarker.tl-timemarker-active .tl-timemarker-line-right:after { background-color: #3b82f6; }
#tl-inner .tl-timeline .tl-timegroup { background: transparent; }
#tl-inner .tl-timeline .tl-timegroup .tl-timegroup-message { color: #f1f5f9; background: #374151; border: 1px solid #4b5563; border-radius: 4px; font-size: 11px; padding: 2px 10px; }
`;

let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
  const el = document.createElement('style');
  el.textContent = TIMELINE_STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

function parseDate(dateStr) {
  const d = new Date(`${dateStr}Z`);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
}

function gameSummary(match) {
  const games = [];
  for (let i = 1; i <= 3; i++) {
    const winner = match[`game_${i}_winner`];
    if (winner == null || winner < 0) break;
    const stage = match[`game_${i}_stage_name`] || '';
    const char = match[`game_${i}_opponent_pick_image`] || '';
    const win = winner === 1;
    games.push({ game: i, win, stage, char });
  }
  return games;
}

export default function MatchTimeline({ matches = [], opponentName }) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    injectStyles();

    if (!containerRef.current || !matches.length) return;

    if (timelineRef.current) {
      containerRef.current.innerHTML = '<div id="tl-inner"></div>';
    }

    const sorted = [...matches].sort((a, b) => new Date(a.match_date) - new Date(b.match_date));

    const events = sorted.map((m) => {
      const games = gameSummary(m);
      const won = m.match_win === 1;
      const elo = m.elo_change;
      const eloText = elo >= 0 ? `+${elo}` : elo;

      const gameRows = games.map((g) => {
        const icon = g.char
          ? `<img style="width:18px;height:18px;vertical-align:middle;margin-right:4px" src="/images/chars/${g.char}.png" />`
          : '';
        return `<tr>
          <td style="padding:2px 8px;text-align:center;color:#6b7280">G${g.game}</td>
          <td style="padding:2px 8px;color:#111827">${g.stage}</td>
          <td style="padding:2px 8px">${icon}</td>
          <td style="padding:2px 8px;color:${g.win ? '#16a34a' : '#dc2626'};font-weight:700">${g.win ? 'W' : 'L'}</td>
        </tr>`;
      }).join('');

      return {
        start_date: parseDate(m.match_date),
          text: {
            headline: `<span style="color:${won ? '#16a34a' : '#dc2626'}">${won ? 'WIN' : 'LOSS'}</span> <span style="color:#111827">${eloText} ELO</span>`,
            text: `<table style="width:100%;border-collapse:collapse">
              <tr style="border-bottom:1px solid #9ca3af"><td style="padding:2px 8px;font-weight:600;color:#374151">My ELO:</td><td style="padding:2px 8px;color:#111827">${m.elo_rank_old} → ${m.elo_rank_new}</td></tr>
              <tr style="border-bottom:1px solid #9ca3af"><td style="padding:2px 8px;font-weight:600;color:#374151">Opp ELO:</td><td style="padding:2px 8px;color:#111827">${m.opponent_elo}</td></tr>
              ${gameRows}
            </table>`,
        },
        media: {
          url: `/images/chars/${sorted[0].game_1_opponent_pick_image}.png`,
          thumbnail: `/images/chars/${sorted[0].game_1_opponent_pick_image}.png`,
          caption: `#${m.ranked_game_number}`,
        },
        background: { color: won ? '#166534' : '#991b1b' },
        group: won ? 'Wins' : 'Losses',
        unique_id: String(m.id),
      };
    });

    const data = { events };

    const el = containerRef.current.querySelector('#tl-inner') || containerRef.current;
    timelineRef.current = new Timeline(el, data, {
      timenav_height_percentage: 25,
      initial_zoom: 0,
      optimal_tick_width: 10,
      hash_bookmark: false,
      start_at_slide: events.length - 1,
    });

    function stripMonth() {
      containerRef.current?.querySelectorAll('.tl-timeaxis-tick-text').forEach(el => {
        const text = el.textContent.trim();
        const match = text.match(/^[A-Z][a-z]+\.?\s+(\d+)$/);
        if (match) el.textContent = match[1];
      });
      rafRef.current = requestAnimationFrame(stripMonth);
    }
    rafRef.current = requestAnimationFrame(stripMonth);

    return () => cancelAnimationFrame(rafRef.current);
  }, [matches, opponentName]);

  if (!matches.length) return null;

  return (
    <div className="w-full">
      <div ref={containerRef} id="tl-inner" className="w-full" style={{ height: '450px' }} />
    </div>
  );
}
