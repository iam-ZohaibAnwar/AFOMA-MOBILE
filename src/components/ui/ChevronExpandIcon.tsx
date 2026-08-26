import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../design-system';

export interface ChevronExpandIconProps {
  expanded?: boolean;
  color?: string;
  size?: number;
}

export function ChevronExpandIcon({
  expanded = false,
  color = colors.textMuted,
  size = 18,
}: ChevronExpandIconProps) {
  return (
    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={size} color={color} />
  );
}
