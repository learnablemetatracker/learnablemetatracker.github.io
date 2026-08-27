function getStatus(progress, metaId) {
  return progress.metaStatus[metaId]?.status ?? 'new';
}

export function computeMapProgress(catalogMap, progress) {
  const total = catalogMap.metaIds.length;
  const mastered = catalogMap.metaIds.filter((id) => getStatus(progress, id) === 'mastered').length;
  return {
    geoguessrId: catalogMap.geoguessrId,
    name: catalogMap.name,
    total,
    mastered,
    percentMastered: total === 0 ? 0 : mastered / total,
    isCurrent: progress.currentMapId === catalogMap.geoguessrId,
    addedAt: progress.addedMaps[catalogMap.geoguessrId]?.addedAt ?? null,
    authors: catalogMap.authors ?? null,
    regions: catalogMap.regions ?? []
  };
}

export function myMaps(catalog, progress) {
  return catalog.maps
    .filter((m) => Boolean(progress.addedMaps[m.geoguessrId]))
    .map((m) => computeMapProgress(m, progress));
}

export function summarizeMyMaps(myMapsList) {
  const totalMetas = myMapsList.reduce((sum, m) => sum + m.total, 0);
  const totalMastered = myMapsList.reduce((sum, m) => sum + m.mastered, 0);
  const avgCompletion = myMapsList.length === 0
    ? 0
    : myMapsList.reduce((sum, m) => sum + m.percentMastered, 0) / myMapsList.length;
  return { totalMetas, totalMastered, avgCompletion };
}

function isMapMastered(map) {
  return map.total > 0 && map.mastered === map.total;
}

// Counts, among the visitor's own added maps only, how many are fully
// mastered (every meta mastered) per continent region. A map with multiple
// regions counts toward each of them, matching filterByRegion's semantics.
// Regions with zero added maps are omitted so the UI doesn't show empty
// boxes for continents the visitor hasn't touched.
export function summarizeByRegion(myMapsList) {
  const result = {};
  for (const region of REGIONS) {
    const inRegion = myMapsList.filter((m) => Array.isArray(m.regions) && m.regions.includes(region));
    if (inRegion.length === 0) continue;
    result[region] = { total: inRegion.length, mastered: inRegion.filter(isMapMastered).length };
  }
  return result;
}

// LearnableMeta's public API doesn't expose a real difficulty rating, so
// this is a best-effort guess from common words in the map's own name
// (checked in this order — a name matching more than one keyword takes the
// first). Maps that match none of them land in 'unclassified'. Always
// surface this as an estimate in the UI, never as a hard fact.
const DIFFICULTY_KEYWORDS = [
  ['basics', /\bbasics?\b/i],
  ['beginner', /\bbeginners?\b/i],
  ['intermediate', /\bintermediate\b/i],
  ['advanced', /\badvanced\b/i],
  ['expert', /\bexperts?\b/i],
  ['ultimate', /\bultimate\b/i]
];
export const DIFFICULTY_TIERS = [...DIFFICULTY_KEYWORDS.map(([tier]) => tier), 'unclassified'];

export function inferDifficulty(mapName) {
  for (const [tier, pattern] of DIFFICULTY_KEYWORDS) {
    if (pattern.test(mapName)) return tier;
  }
  return 'unclassified';
}

// Same idea as summarizeByRegion, but bucketed by the estimated difficulty
// tier instead. Empty tiers are omitted for the same reason.
export function summarizeByDifficulty(myMapsList) {
  const result = {};
  for (const tier of DIFFICULTY_TIERS) {
    const inTier = myMapsList.filter((m) => inferDifficulty(m.name) === tier);
    if (inTier.length === 0) continue;
    result[tier] = { total: inTier.length, mastered: inTier.filter(isMapMastered).length };
  }
  return result;
}

export function availableMapsToAdd(catalog, progress) {
  return catalog.maps.filter((m) => !progress.addedMaps[m.geoguessrId]);
}

// Matches LearnableMeta's own continent groupings. A map can belong to more
// than one (e.g. a Europe/Asia border map), or to none listed here if the
// catalog was generated before this field existed.
export const REGIONS = ['World', 'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'];

export function filterByRegion(maps, region) {
  if (!region || region === 'all') return maps;
  return maps.filter((m) => Array.isArray(m.regions) && m.regions.includes(region));
}

export function isReadyForNextMap(mapProgress, threshold = 0.9) {
  return mapProgress.total > 0 && mapProgress.percentMastered >= threshold;
}

export function mapMetas(catalogMap, catalog, progress) {
  return catalogMap.metaIds.map((id) => ({
    id,
    name: catalog.metas[id].name,
    locationCount: catalog.metas[id].locationCount,
    status: getStatus(progress, id)
  }));
}

// A map's own `regions` tag describes the whole map, not each meta in it —
// a "World" map mixes metas from every continent, so tagging every one of
// its metas "World" made the meta-level region filter useless. This is a
// best-effort guess instead, from the country/place name LearnableMeta
// authors put at the front of almost every meta name ("Australia -
// Bollard", "Nordic Buses - ..."). Checked longest phrase first so e.g.
// "South Korea" matches before a hypothetical bare "Korea" entry would.
// Countries LearnableMeta itself tags as spanning two continents (Russia,
// Turkey) list both. Anything not recognized here (generic category names
// like "Infrastructure", "Landscape", obscure places) is left unclassified
// — always presented as an estimate, never a hard fact. Deliberately
// omitted: "Georgia" — most matches in the real catalog turned out to be
// the US state (license plates, highway signs), not the country, and a
// wrong-majority guess is worse than staying unclassified.
const PLACE_REGIONS = [
  [['Europe'], 'Spain'], [['Europe'], 'Portugal'], [['Europe'], 'France'], [['Europe'], 'Germany'],
  [['Europe'], 'Italy'], [['Europe'], 'United Kingdom'], [['Europe'], 'Ireland'], [['Europe'], 'Netherlands'],
  [['Europe'], 'Belgium'], [['Europe'], 'Luxembourg'], [['Europe'], 'Switzerland'], [['Europe'], 'Austria'],
  [['Europe'], 'Poland'], [['Europe'], 'Czechia'], [['Europe'], 'Czech Republic'], [['Europe'], 'Slovakia'],
  [['Europe'], 'Slovenia'], [['Europe'], 'Croatia'], [['Europe'], 'Serbia'], [['Europe'], 'Bosnia'],
  [['Europe'], 'Montenegro'], [['Europe'], 'Albania'], [['Europe'], 'North Macedonia'], [['Europe'], 'Macedonia'],
  [['Europe'], 'Bulgaria'], [['Europe'], 'Romania'], [['Europe'], 'Hungary'], [['Europe'], 'Greece'],
  [['Europe'], 'Cyprus'], [['Europe'], 'Malta'], [['Europe'], 'Norway'], [['Europe'], 'Sweden'],
  [['Europe'], 'Finland'], [['Europe'], 'Denmark'], [['Europe'], 'Iceland'], [['Europe'], 'Estonia'],
  [['Europe'], 'Latvia'], [['Europe'], 'Lithuania'], [['Europe'], 'Belarus'], [['Europe'], 'Ukraine'],
  [['Europe'], 'Moldova'], [['Europe'], 'Andorra'], [['Europe'], 'San Marino'],
  [['Europe'], 'Monaco'], [['Europe'], 'Liechtenstein'], [['Europe'], 'Isle of Man'], [['Europe'], 'Jersey'],
  [['Europe'], 'Guernsey'], [['Europe'], 'Faroe Islands'], [['Europe'], 'Gibraltar'], [['Europe'], 'Madeira'],
  [['Europe'], 'Azores'], [['Europe'], 'Catalonia'], [['Europe'], 'Nordic'], [['Europe'], 'Baltic'],
  [['Europe'], 'Balkans'], [['Europe'], 'Benelux'],
  [['Asia'], 'Japan'], [['Asia'], 'China'], [['Asia'], 'South Korea'], [['Asia'], 'North Korea'],
  [['Asia'], 'India'], [['Asia'], 'Indonesia'], [['Asia'], 'Malaysia'], [['Asia'], 'Thailand'],
  [['Asia'], 'Philippines'], [['Asia'], 'Vietnam'], [['Asia'], 'Cambodia'], [['Asia'], 'Laos'],
  [['Asia'], 'Myanmar'], [['Asia'], 'Singapore'], [['Asia'], 'Sri Lanka'], [['Asia'], 'Bangladesh'],
  [['Asia'], 'Pakistan'], [['Asia'], 'Nepal'], [['Asia'], 'Bhutan'], [['Asia'], 'Mongolia'],
  [['Asia'], 'Kazakhstan'], [['Asia'], 'Kyrgyzstan'], [['Asia'], 'Uzbekistan'], [['Asia'], 'Tajikistan'],
  [['Asia'], 'Turkmenistan'], [['Asia'], 'Israel'], [['Asia'], 'Jordan'], [['Asia'], 'Lebanon'],
  [['Asia'], 'United Arab Emirates'], [['Asia'], 'Oman'], [['Asia'], 'Qatar'], [['Asia'], 'Saudi Arabia'],
  [['Asia'], 'Kuwait'], [['Asia'], 'Bahrain'], [['Asia'], 'Iraq'], [['Asia'], 'Iran'], [['Asia'], 'Armenia'],
  [['Asia'], 'Azerbaijan'], [['Asia'], 'Taiwan'], [['Asia'], 'Hong Kong'], [['Asia'], 'Macau'],
  [['Asia'], 'Sulawesi'], [['Asia'], 'Kalimantan'], [['Asia'], 'Java'], [['Asia'], 'Penghu'],
  [['Europe', 'Asia'], 'Russia'], [['Europe', 'Asia'], 'Turkey'],
  [['Africa'], 'South Africa'], [['Africa'], 'Kenya'], [['Africa'], 'Nigeria'], [['Africa'], 'Ghana'],
  [['Africa'], 'Senegal'], [['Africa'], 'Tunisia'], [['Africa'], 'Morocco'], [['Africa'], 'Algeria'],
  [['Africa'], 'Egypt'], [['Africa'], 'Botswana'], [['Africa'], 'Namibia'], [['Africa'], 'Zimbabwe'],
  [['Africa'], 'Zambia'], [['Africa'], 'Tanzania'], [['Africa'], 'Uganda'], [['Africa'], 'Rwanda'],
  [['Africa'], 'Ethiopia'], [['Africa'], 'Madagascar'], [['Africa'], 'Mozambique'], [['Africa'], 'Lesotho'],
  [['Africa'], 'Eswatini'], [['Africa'], 'Reunion'], [['Africa'], 'Réunion'], [['Africa'], "Ivory Coast"],
  [['Africa'], "Cote d'Ivoire"], [['Africa'], 'São Tomé & Príncipe'],
  [['North America'], 'United States of America'], [['North America'], 'United States'],
  [['North America'], 'Estados Unidos'], [['North America'], 'USA'], [['North America'], 'Canada'],
  [['North America'], 'Mexico'], [['North America'], 'Greenland'], [['North America'], 'California'],
  [['North America'], 'New Jersey'], [['North America'], 'Ontario'], [['North America'], 'Québec'], [['North America'], 'Quebec'],
  [['North America'], 'British Columbia'], [['North America'], 'Saskatchewan'], [['North America'], 'Alberta'],
  [['North America'], 'Manitoba'], [['North America'], 'New Brunswick'], [['North America'], 'Nova Scotia'],
  [['North America'], 'Newfoundland & Labrador'], [['North America'], 'Newfoundland'], [['North America'], 'Yukon'],
  [['North America'], 'Northwest Territories'], [['North America'], 'Prince Edward Island'],
  [['North America'], 'Eastern Canada'], [['North America'], 'Atlantic Canada'],
  [['North America'], 'Puerto Rico'], [['North America'], 'Dominican Republic'], [['North America'], 'Bermuda'],
  [['North America'], 'Curacao'], [['North America'], 'Guatemala'], [['North America'], 'Panama'],
  [['South America'], 'Brazil'], [['South America'], 'Argentina'], [['South America'], 'Colombia'],
  [['South America'], 'Chile'], [['South America'], 'Peru'], [['South America'], 'Uruguay'],
  [['South America'], 'Bolivia'], [['South America'], 'Ecuador'],
  [['South America', 'North America'], 'Latin America'],
  [['Oceania'], 'Australia'], [['Oceania'], 'New Zealand'], [['Oceania'], 'Hawaii'], [['Oceania'], 'Guam'],
  [['Oceania'], 'American Samoa'], [['Oceania'], 'Northern Mariana Islands'], [['Oceania'], 'Christmas Island']
].sort((a, b) => b[1].length - a[1].length);

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function inferMetaRegions(metaName) {
  for (const [regions, keyword] of PLACE_REGIONS) {
    if (new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i').test(metaName)) {
      return regions;
    }
  }
  return [];
}

export function allTrackedMetas(catalog, progress) {
  const addedMapIds = new Set(Object.keys(progress.addedMaps));
  const metaToMapNames = new Map();

  for (const map of catalog.maps) {
    if (!addedMapIds.has(map.geoguessrId)) continue;
    for (const metaId of map.metaIds) {
      if (!metaToMapNames.has(metaId)) metaToMapNames.set(metaId, []);
      metaToMapNames.get(metaId).push(map.name);
    }
  }

  return [...metaToMapNames.entries()].map(([id, mapNames]) => ({
    id,
    name: catalog.metas[id].name,
    locationCount: catalog.metas[id].locationCount,
    status: getStatus(progress, id),
    mapNames,
    regions: inferMetaRegions(catalog.metas[id].name),
    updatedAt: progress.metaStatus[id]?.updatedAt ?? null
  }));
}

export function filterByStatus(metas, status) {
  if (!status || status === 'all') return metas;
  return metas.filter((m) => m.status === status);
}

export function filterByText(metas, query) {
  const trimmed = (query ?? '').trim().toLowerCase();
  if (!trimmed) return metas;
  return metas.filter((m) => m.name.toLowerCase().includes(trimmed));
}

export function countsByStatus(metas) {
  const counts = { all: metas.length, new: 0, learning: 0, reviewing: 0, mastered: 0 };
  for (const meta of metas) {
    counts[meta.status] = (counts[meta.status] ?? 0) + 1;
  }
  return counts;
}
