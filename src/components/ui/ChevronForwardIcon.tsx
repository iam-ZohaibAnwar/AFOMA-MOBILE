import { Ionicons } from '@expo/vector-icons';

export interface ChevronForwardIconProps {
  color: string;
  size?: number;
}

export function ChevronForwardIcon({ color, size = 18 }: ChevronForwardIconProps) {
  return <Ionicons name="chevron-forward" size={size} color={color} />;
}
