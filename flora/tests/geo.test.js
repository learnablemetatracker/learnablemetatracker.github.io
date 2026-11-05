import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  toLeafletLatLngs,
  fromLeafletLatLng,
  polygonPathOptions,
  previewPointOptions,
  labelTextFor,
  centroid,
  validateVertex,
  clonePolygon,
  moveVertex,
  removeVertex,
  insertVertex,
  DEFAULT_FILL_OPACITY,
} from '../js/geo.js';

describe('geo helpers', () => {
  it('converts [lon, lat] polygon to Leaflet [lat, lon]', () => {
    const polygon = [[-3.7, 40.4], [-4.0, 41.0], [-3.0, 41.0]];
    assert.deepEqual(toLeafletLatLngs(polygon), [[40.4, -3.7], [41.0, -4.0], [41.0, -3.0]]);
  });

  it('converts Leaflet latLng to [lon, lat]', () => {
    assert.deepEqual(fromLeafletLatLng({ lat: 40.4, lng: -3.7 }), [-3.7, 40.4]);
  });

  it('default fill opacity is ~0.25', () => {
    assert.equal(DEFAULT_FILL_OPACITY, 0.25);
  });

  it('path options use record color and opacity', () => {
    const r = { color: '#336699', fillOpacity: 0.25, strokeWidth: 2, strokeLinejoin: 'round' };
    const opts = polygonPathOptions(r, false);
    assert.equal(opts.color, '#336699');
    assert.equal(opts.fillColor, '#336699');
    assert.equal(opts.fillOpacity, 0.25);
    assert.equal(opts.weight, 2);
    assert.equal(opts.lineJoin, 'round');
  });

  it('selected record gets a light halo instead of a black border', () => {
    const r = { color: '#338833', fillOpacity: 0.25, strokeWidth: 2, strokeLinejoin: 'round' };
    const opts = polygonPathOptions(r, true);
    assert.equal(opts.color, '#ffffff');
    assert.ok(opts.weight > r.strokeWidth, 'halo weight should exceed base stroke');
    assert.ok(opts.fillOpacity >= r.fillOpacity, 'selected fill should stay readable');
  });

  it('preview point has fixed pixel radius and white border', () => {
    const opts = previewPointOptions('#338833');
    assert.equal(opts.radius, 3);
    assert.equal(opts.color, '#ffffff');
    assert.equal(opts.fillColor, '#338833');
    assert.equal(opts.weight, 1.5);
  });

  it('preview points do not intercept clicks while placing vertices', () => {
    assert.equal(previewPointOptions('#338833').interactive, false);
  });

  it('computes polygon centroid in lon/lat', () => {
    const polygon = [[0, 0], [10, 0], [10, 10], [0, 10]];
    assert.deepEqual(centroid(polygon), [5, 5]);
  });

  it('labelTextFor returns empty for hidden mode', () => {
    const flora = { type: 'flora', name: 'Encina', scientificName: 'Quercus ilex', labelMode: 'hidden' };
    assert.equal(labelTextFor(flora), '');
  });

  it('labelTextFor shows common name', () => {
    const r = { type: 'meta', name: 'España', labelMode: 'common' };
    assert.equal(labelTextFor(r), 'España');
  });

  it('labelTextFor falls back to common name for scientific on meta', () => {
    const r = { type: 'meta', name: 'España', labelMode: 'scientific' };
    assert.equal(labelTextFor(r), 'España');
  });

  it('labelTextFor shows both names for flora', () => {
    const r = { type: 'flora', name: 'Encina', scientificName: 'Quercus ilex', labelMode: 'both' };
    assert.equal(labelTextFor(r), 'Encina · Quercus ilex');
  });

  it('preserves exact fill opacity when selected, including 1', () => {
    for (const opacity of [0, 0.7, 1]) {
      const r = { color: '#338833', fillOpacity: opacity, strokeWidth: 2, strokeLinejoin: 'round' };
      const opts = polygonPathOptions(r, true);
      assert.equal(opts.fillOpacity, opacity, `selected fillOpacity should be ${opacity}`);
      assert.equal(opts.color, '#ffffff');
      assert.ok(opts.weight > r.strokeWidth);
    }
  });

  it('validates geographic vertex ranges', () => {
    assert.equal(validateVertex(0, 0), true);
    assert.equal(validateVertex(-180, -90), true);
    assert.equal(validateVertex(180, 90), true);
    assert.equal(validateVertex(-181, 0), false);
    assert.equal(validateVertex(0, 91), false);
    assert.equal(validateVertex(NaN, 0), false);
  });

  it('clones a polygon deeply', () => {
    const poly = [[0, 0], [1, 0], [1, 1]];
    const copy = clonePolygon(poly);
    assert.notStrictEqual(copy, poly);
    assert.deepEqual(copy, poly);
    copy[0][0] = 99;
    assert.notDeepEqual(copy, poly);
  });

  it('moveVertex returns a new polygon with the vertex updated', () => {
    const poly = [[0, 0], [1, 0], [1, 1]];
    const moved = moveVertex(poly, 1, [5, 5]);
    assert.deepEqual(moved, [[0, 0], [5, 5], [1, 1]]);
    assert.deepEqual(poly, [[0, 0], [1, 0], [1, 1]]);
  });

  it('removeVertex removes a vertex keeping at least three', () => {
    const poly = [[0, 0], [1, 0], [1, 1], [0, 1]];
    assert.deepEqual(removeVertex(poly, 0), [[1, 0], [1, 1], [0, 1]]);
    assert.throws(() => removeVertex([[0, 0], [1, 0], [1, 1]], 0), /three/);
  });

  it('insertVertex adds a vertex after the selected index', () => {
    const poly = [[0, 0], [1, 0], [1, 1]];
    const inserted = insertVertex(poly, 0, [0.5, 0.5]);
    assert.deepEqual(inserted, [[0, 0], [0.5, 0.5], [1, 0], [1, 1]]);
  });
});
