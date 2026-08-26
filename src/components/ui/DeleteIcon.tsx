import { Ionicons } from '@expo/vector-icons';

export interface DeleteIconProps {
  color: string;
  size?: number;
}

export function DeleteIcon({ color, size = 18 }: DeleteIconProps) {
  return <Ionicons name="trash-outline" size={size} color={color} />;
}
