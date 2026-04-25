//--------------------------------------------
// ProductDetailModal.js
//--------------------------------------------

// Modal that shows full product details and allows adding the selected item to cart.
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailModal({
  visible,
  product,
  onClose,
  onAddToCart,
}) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (visible) setQuantity(1);
  }, [visible, product]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(quantity);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.handle} />

          <Image source={{ uri: product.image }} style={styles.image} />

          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text style={styles.name}>{product.name}</Text>
              {product.featured ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Popular</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.desc}>{product.description}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>$ {product.price.toFixed(2)}</Text>
            </View>

            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Quantity</Text>

              <View style={styles.qtyBox}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  activeOpacity={0.8}>
                  <Ionicons name="remove" size={16} color="#6A4E23" />
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((q) => q + 1)}
                  activeOpacity={0.8}>
                  <Ionicons name="add" size={16} color="#6A4E23" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                <Text style={styles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleAdd}
                activeOpacity={0.9}>
                <Ionicons name="cart-outline" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

//Styling
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  handle: {
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#eee',
  },
  content: {
    padding: 18,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    color: '#6A4E23',
  },
  badge: {
    backgroundColor: '#f6f1e9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  badgeText: {
    color: '#6A4E23',
    fontSize: 11,
    fontWeight: '800',
  },
  desc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#555',
  },
  priceRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    color: '#222',
  },
  qtyRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f6f1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#efe4d6',
  },
  qtyLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6A4E23',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f1e9',
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontWeight: '900',
    color: '#222',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#f6f1e9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#6A4E23',
    fontWeight: '900',
    fontSize: 14,
  },
  primaryBtn: {
    flex: 1.3,
    backgroundColor: '#6A4E23',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#6A4E23',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
});
