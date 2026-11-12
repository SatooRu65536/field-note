export interface Coordinates {
  readonly latitude: number
  readonly longitude: number
}

const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
}

/**
 * Geolocation API で現在地を取得する
 * @returns 現在地．許可されなかった場合や取得に失敗した場合は null
 */
export function getCurrentCoordinates(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => resolve(null),
      POSITION_OPTIONS,
    )
  })
}
