import { Ionicons } from '@expo/vector-icons';

export interface ShareIconProps {
  color: string;
  size?: number;
}

/** Share-nodes icon — matches web PDP `faShareNodes`. */
export function ShareIcon({ color, size = 20 }: ShareIconProps) {
  return <Ionicons name="share-social-outline" size={size} color={color} />;
}
