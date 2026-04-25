//--------------------------------------------
// productcard.js
//--------------------------------------------

// Reusable product card UI for showing product image, name, price, and actions.
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';

export default function ProductCard({
  item,
  onCardPress,
  onAddToCart,
  showCartButton = true,
  compact = false,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        pressed && styles.pressed,
      ]}
      onPress={onCardPress}
      disabled={!onCardPress}>
      <Image
        source={{ uri: item.image }}
        style={[styles.image, compact && styles.compactImage]}
      />

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          {item.featured ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Popular</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.desc} numberOfLines={compact ? 2 : 3}>
          {item.description}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>$ {item.price.toFixed(2)}</Text>

          {showCartButton ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={onAddToCart}
              activeOpacity={0.8}>
              <Text style={styles.addBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

//Styling
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  compactCard: {
    width: 220,
    marginRight: 12,
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 10,
  },
  pressed: {
    opacity: 0.97,
    transform: [{ scale: 0.99 }],
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  compactImage: {
    width: '100%',
    height: 120,
    marginBottom: 10,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#6A4E23',
  },
  badge: {
    backgroundColor: '#f6f1e9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6A4E23',
  },
  desc: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6A4E23',
  },
  addBtn: {
    backgroundColor: '#6A4E23',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
});
