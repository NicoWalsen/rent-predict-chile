import * as Location from 'expo-location';

// Security: Location service with permission handling
export class LocationService {
  private static instance: LocationService;
  
  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Security: Request location permissions safely
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Get current location with error handling
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de ubicación no concedidos');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Security: Approximate comuna detection (basic implementation)
  async detectComuna(): Promise<string | null> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) return null;

      const { latitude, longitude } = location.coords;
      
      // Simple comuna detection based on coordinates
      // In production, you'd use a proper geocoding service
      const comunaMap = this.getComunaByCoordinates(latitude, longitude);
      
      return comunaMap;
    } catch (error) {
      console.error('Error detecting comuna:', error);
      return null;
    }
  }

  // Basic comuna mapping - in production use proper geocoding
  private getComunaByCoordinates(lat: number, lng: number): string | null {
    // Santiago area boundaries (simplified)
    if (lat >= -33.6 && lat <= -33.3 && lng >= -70.8 && lng <= -70.5) {
      // Basic comuna detection based on coordinates
      if (lat > -33.4 && lng > -70.6) return 'Las Condes';
      if (lat > -33.45 && lng > -70.65) return 'Providencia';
      if (lat > -33.5 && lng > -70.7) return 'Santiago';
      if (lat > -33.52 && lng > -70.72) return 'Ñuñoa';
      return 'Santiago'; // Default fallback
    }
    
    return null; // Outside Santiago area
  }
}

export const locationService = LocationService.getInstance();