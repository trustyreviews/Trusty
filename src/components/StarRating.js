import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function StarRating({ rating, size = 14 }) {
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  star: {
    lineHeight: 18,
  },
});
