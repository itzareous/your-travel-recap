export interface TravelDestination {
  id: string;
  type: 'country' | 'city';
  name: string;
  country: string;
  image: string | null;
  visitOrder: number;
}

export interface UserProfile {
  username: string;
  platform: 'instagram' | 'twitter' | 'none';
}

export interface TravelRecapData {
  profile: UserProfile;
  destinations: TravelDestination[];
  year: number;
}

// Helper function to get display name for a destination
export function getDestinationDisplayName(destination: TravelDestination): string {
  if (destination.type === 'city') {
    return `${destination.name}, ${destination.country}`;
  }
  return destination.name;
}
