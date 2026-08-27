export async function loadCatalog(fetchImpl = fetch) {
  const res = await fetchImpl('data/catalog.json');
  if (!res.ok) {
    throw new Error(`Failed to load catalog: HTTP ${res.status}`);
  }
  return res.json();
}
