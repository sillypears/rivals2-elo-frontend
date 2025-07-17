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
