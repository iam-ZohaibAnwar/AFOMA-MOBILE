import { BackSearchHeader } from '../../../components/ui/BackSearchHeader';

export interface ShopSearchFieldProps {
  onPress: () => void;
  onBackPress: () => void;
}

export function ShopSearchField({ onPress, onBackPress }: ShopSearchFieldProps) {
  return <BackSearchHeader onSearchPress={onPress} onBackPress={onBackPress} />;
}
