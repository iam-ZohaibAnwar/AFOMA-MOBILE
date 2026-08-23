import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

const LOGO_ASPECT_RATIO = 940 / 300;

export interface AfomaLogoProps {
  width?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

export function AfomaLogo({
  width = 132,
  style,
  imageStyle,
  accessibilityLabel = 'AFOMA',
}: AfomaLogoProps) {
  const height = width / LOGO_ASPECT_RATIO;

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Image
        source={require('../../assets/images/afoma-logo.png')}
        accessibilityLabel={accessibilityLabel}
        resizeMode="contain"
        style={[styles.image, { width, height }, imageStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
});
