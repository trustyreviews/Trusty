import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function StarRating({ rating, size = 14 }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const stars = [1, 2, 3, 4, 5].map((n) => (
    <Text
      key={n}
      style={[
        styles.star,
        { fontSize: size, color: n <= rating ? colors.star : colors.textDim },
      ]}
    >
      ★
    </Text>
  ));

  return <View style={styles.row}>{stars}</View>;
}

function createStyles() {
  return {
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 1,
    },
    star: {
      lineHeight: 18,
    },
  };
}
