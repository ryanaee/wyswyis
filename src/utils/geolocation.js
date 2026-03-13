/**
 * Returns the device's current GPS position.
 * @param {PositionOptions} [options]
 * @returns {Promise<GeolocationPosition>}
 */
export function getCurrentPosition(options = {}) {
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
 * Convenience helper — returns { latitude, longitude, accuracy } or null.
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number } | null>}
 */
export async function getCoordinates() {
  try {
    const pos = await getCurrentPosition()
    const { latitude, longitude, accuracy } = pos.coords
    return { latitude, longitude, accuracy }
  } catch {
    return null
  }
}
