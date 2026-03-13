const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
const FALLBACK = 'Unknown location'

/**
 * Returns the device's current GPS position.
 * @param {PositionOptions} [options]
 * @returns {Promise<GeolocationPosition>}
 */
function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 0,
      ...options,
    })
  })
}

/**
 * Reverse-geocode a lat/lon pair using OpenStreetMap Nominatim.
 * Returns a short "City, CC" string, or null if the API call fails.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<string|null>}
 */
async function reverseGeocode(lat, lon) {
  const url = `${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'WYSWYIS/1.0' },
  })

  if (!res.ok) return null

  const data = await res.json()
  const addr = data.address ?? {}

  // Pick the most specific populated-place name available
  const city =
    addr.city ??
    addr.town ??
    addr.village ??
    addr.county ??
    addr.state ??
    null

  const country = addr.country_code?.toUpperCase() ?? null

  if (!city && !country) return null
  if (!country) return city
  if (!city) return country
  return `${city}, ${country}`
}

/**
 * Request geolocation permission, resolve coordinates, and return a
 * human-readable location string like "Jakarta, ID" or "Tokyo, JP".
 * Falls back to "Unknown location" on any error.
 *
 * @returns {Promise<string>}
 */
export async function getLocationString() {
  try {
    const position = await getCurrentPosition()
    const { latitude, longitude } = position.coords
    const label = await reverseGeocode(latitude, longitude)
    return label ?? FALLBACK
  } catch {
    return FALLBACK
  }
}

// Module-level cache: null = not yet fetched, string = result stored
let _cachedLocation = null

/**
 * Same as getLocationString() but only calls the browser + Nominatim once
 * per session. Subsequent calls return the cached string immediately.
 *
 * @returns {Promise<string>}
 */
export async function getLocationStringCached() {
  if (_cachedLocation !== null) return _cachedLocation
  _cachedLocation = await getLocationString()
  return _cachedLocation
}
