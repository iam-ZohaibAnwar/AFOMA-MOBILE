import { Ionicons } from '@expo/vector-icons';

export interface MenuIconProps {
  color: string;
  size?: number;
}

export function MenuIcon({ color, size = 22 }: MenuIconProps) {
  return <Ionicons name="menu-outline" size={size} color={color} />;
}
