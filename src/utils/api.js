export async function fetchCharacters() {
  const res = await fetch("http://192.168.1.30:8005/characters");
  return await res.json();
}

export async function fetchStages() {
  const res = await fetch("http://192.168.1.30:8005/stages");
  return await res.json();
}

export async function fetchMoves() {
  const res = await fetch("http://192.168.1.30:8005/movelist");
  return await res.json();
}

export async function fetchMatchById(id) {
  let match_id = ""
  if (id != null) {
    match_id = `/${parseInt(id)}`
  }
  const res = await fetch(`http://192.168.1.30:8005/match${match_id}`);
  return await res.json();
}

export async function updateMatchField(id, key, value) {
  const res = await fetch('http://192.168.1.30:8005/update-match', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      row_id: id,
      key,
      value,
    }),
  });
  if (!res.ok) throw new Error (`Failed to update ${id}`); 
  return res.json();
}