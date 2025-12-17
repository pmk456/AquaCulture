/**
 * Check if a point (lat, lng) is inside a polygon using ray-casting algorithm
 * @param {number} lat - Latitude of the point
 * @param {number} lng - Longitude of the point
 * @param {Array} polygon - Array of {lat, lng} or {latitude, longitude} points
 * @returns {boolean} - True if point is inside polygon
 */
function isInsidePolygon(lat, lng, polygon) {
  if (!polygon || !Array.isArray(polygon) || polygon.length < 3) {
    return false;
  }

  let inside = false;
  const x = lng;
  const y = lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng || polygon[i].longitude;
    const yi = polygon[i].lat || polygon[i].latitude;
    const xj = polygon[j].lng || polygon[j].longitude;
    const yj = polygon[j].lat || polygon[j].latitude;

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-12) + xi);
    
    if (intersect) inside = !inside;
  }

  return inside;
}

module.exports = { isInsidePolygon };

