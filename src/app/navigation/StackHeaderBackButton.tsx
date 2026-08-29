import { useNavigation } from '@react-navigation/native';

import { HeaderBackButton } from '../../components/ui/HeaderBackButton';
import { colors } from '../../design-system';

interface StackHeaderBackButtonProps {
  canGoBack?: boolean;
  tintColor?: string;
  title?: string;
}

export function StackHeaderBackButton({ canGoBack, tintColor, title }: StackHeaderBackButtonProps) {
  const navigation = useNavigation();

  if (!canGoBack) {
    return null;
  }

  return (
    <HeaderBackButton
      onPress={() => navigation.goBack()}
      color={tintColor ?? colors.textPrimary}
      title={title}
    />
  );
}
