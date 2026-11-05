// Geographic coordinate helpers for Leaflet rendering.
// Stored polygons are [lon, lat]; Leaflet consumes [lat, lon].

export const DEFAULT_FILL_OPACITY = 0.25;

export function toLeafletLatLngs(polygon) {
  return polygon.map(([lon, lat]) => [lat, lon]);
}

export function fromLeafletLatLng(latlng) {
  return [latlng.lng, latlng.lat];
}

export function polygonPathOptions(record, selected = false) {
  const base = {
    color: record.color,
    fillColor: record.color,
    fillOpacity: record.fillOpacity,
    weight: record.strokeWidth,
    lineJoin: record.strokeLinejoin,
    className: selected ? 'user-polygon selected' : 'user-polygon',
  };
  if (!selected) return base;
  // Light halo on selection; record fill opacity is preserved exactly.
  return {
    ...base,
    color: '#ffffff',
    weight: Math.max(3, record.strokeWidth + 1.5),
  };
}

export function previewPointOptions(color) {
  return {
    interactive: false,
    radius: 3,
    color: '#ffffff',
    fillColor: color,
    weight: 1.5,
    opacity: 1,
    fillOpacity: 0.9,
  };
}

export function centroid(polygon) {
  let lon = 0;
  let lat = 0;
  for (const [x, y] of polygon) {
    lon += x;
    lat += y;
  }
  return [lon / polygon.length, lat / polygon.length];
}

export function labelTextFor(record) {
  if (record.labelMode === 'hidden') return '';
  if (record.labelMode === 'common') return record.name;
  if (record.labelMode === 'scientific') {
    return record.type === 'flora' ? record.scientificName || record.name : record.name;
  }
  if (record.labelMode === 'both') {
    const sci = record.type === 'flora' ? record.scientificName : '';
    return sci ? `${record.name} · ${sci}` : record.name;
  }
  return '';
}

export function validateVertex(lon, lat) {
  return Number.isFinite(lon) && Number.isFinite(lat) &&
    lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}

export function clonePolygon(polygon) {
  return polygon.map(point => [...point]);
}

export function moveVertex(polygon, index, [lon, lat]) {
  if (!validateVertex(lon, lat)) throw new Error('Invalid vertex coordinates');
  if (index < 0 || index >= polygon.length) throw new Error('Vertex index out of range');
  return polygon.map((p, i) => i === index ? [lon, lat] : [...p]);
}

export function removeVertex(polygon, index) {
  if (polygon.length <= 3) throw new Error('A polygon must keep at least three vertices');
  return polygon.filter((_, i) => i !== index);
}

export function insertVertex(polygon, index, [lon, lat]) {
  if (!validateVertex(lon, lat)) throw new Error('Invalid vertex coordinates');
  if (index < 0 || index >= polygon.length) throw new Error('Vertex index out of range');
  const next = clonePolygon(polygon);
  // Insert after the selected vertex; for the last vertex insert before closing the ring.
  next.splice(index + 1, 0, [lon, lat]);
  return next;
}
