import { Ionicons } from '@expo/vector-icons';

export interface SearchIconProps {
  color: string;
  size?: number;
}

export function SearchIcon({ color, size = 24 }: SearchIconProps) {
  return <Ionicons name="search-outline" size={size} color={color} />;
}
