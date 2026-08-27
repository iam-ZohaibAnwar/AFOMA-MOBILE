import { Ionicons } from '@expo/vector-icons';

export interface MessageIconProps {
  color: string;
  size?: number;
}

/** Chat/message icon for PDP seller contact. */
export function MessageIcon({ color, size = 20 }: MessageIconProps) {
  return <Ionicons name="chatbubble-outline" size={size} color={color} />;
}
