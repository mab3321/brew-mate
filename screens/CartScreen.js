//--------------------------------------------
// CartScreen.js
//--------------------------------------------

// Shows all items added to the cart.
// Lets user update quantity, remove items, clear cart, and go to checkout.
import React, { useContext, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../state/CartContext';

export default function CartScreen({ navigation }) {
  const {
    cart = [],
    subtotal = 0,
    cartCount = 0,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useContext(CartContext);

  const deliveryFee = useMemo(() => {
    return cart.length > 0 ? 2.5 : 0;
  }, [cart.length]);

  const tax = useMemo(() => {
    return cart.length > 0 ? subtotal * 0.05 : 0;
  }, [cart.length, subtotal]);

  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    console.log(
      '[CartScreen] cart changed:',
      cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        lineTotal: Number(item.price || 0) * Number(item.quantity || 0),
      }))
    );
  }, [cart]);

  useEffect(() => {
    console.log('[CartScreen] summary changed:', {
      cartCount,
      subtotal,
      deliveryFee,
      tax,
      total,
    });
  }, [cartCount, subtotal, deliveryFee, tax, total]);

  const handleCheckout = () => {
    console.log('[CartScreen] handleCheckout:', {
      cartCount,
      subtotal,
      deliveryFee,
      tax,
      total,
      cartItems: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
      })),
    });

    if (cart.length === 0) {
      console.log('[CartScreen] checkout blocked: cart is empty');
      return;
    }

    navigation.navigate('Checkout');
  };

  const handleContinueShopping = () => {
    console.log('[CartScreen] handleContinueShopping');
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const handleRemoveFromCart = (item) => {
    console.log('[CartScreen] handleRemoveFromCart:', {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
    });

    removeFromCart(item.id);
  };

  const handleDecreaseQuantity = (item) => {
    console.log('[CartScreen] handleDecreaseQuantity:', {
      id: item.id,
      name: item.name,
      currentQuantity: item.quantity,
    });

    if (item.quantity === 1) {
      console.log('[CartScreen] quantity reached 1, removing item:', {
        id: item.id,
        name: item.name,
      });
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncreaseQuantity = (item) => {
    console.log('[CartScreen] handleIncreaseQuantity:', {
      id: item.id,
      name: item.name,
      currentQuantity: item.quantity,
      nextQuantity: item.quantity + 1,
    });

    updateQuantity(item.id, item.quantity + 1);
  };

  const handleClearCart = () => {
    console.log('[CartScreen] handleClearCart:', {
      cartCount,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
      })),
    });

    clearCart();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.header}>Your Cart</Text>
            <Text style={styles.subheader}>
              {cartCount} item{cartCount === 1 ? '' : 's'} ready to go
            </Text>
          </View>

          <View style={styles.badge}>
            <Ionicons name="cart" size={16} color="#6A4E23" />
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Subtotal</Text>
            <Text style={styles.statValue}>$ {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Delivery</Text>
            <Text style={styles.statValue}>$ {deliveryFee.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="leaf-outline" size={34} color="#6A4E23" />
          </View>
          <Text style={styles.emptyTitle}>Cart is empty</Text>
          <Text style={styles.emptyText}>
            Add some coffee, snacks, or a favorite drink to continue.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleContinueShopping}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Browse menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {cart.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.image} />

              <View style={styles.itemInfo}>
                <View style={styles.itemTopRow}>
                  <View style={styles.itemTextWrap}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.desc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.removeIconBtn}
                    onPress={() => handleRemoveFromCart(item)}
                    activeOpacity={0.8}>
                    <Ionicons name="trash-outline" size={18} color="#d33" />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemBottomRow}>
                  <Text style={styles.price}>
                    $ {(item.price * item.quantity).toFixed(2)}
                  </Text>

                  <View style={styles.qtyBox}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => handleDecreaseQuantity(item)}
                      activeOpacity={0.8}>
                      <Text style={styles.qtyText}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.qty}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => handleIncreaseQuantity(item)}
                      activeOpacity={0.8}>
                      <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>$ {subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery fee</Text>
              <Text style={styles.summaryValue}>
                $ {deliveryFee.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>$ {tax.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>$ {total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.9}>
              <Text style={styles.checkoutBtnText}>Proceed to checkout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleContinueShopping}
              activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>Continue shopping</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearCart}
              activeOpacity={0.85}>
              <Text style={styles.clearBtnText}>Clear cart</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

//Styling
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f1e9' },
  content: { padding: 16, paddingBottom: 30, flexGrow: 1 },

  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 30,
    fontWeight: '900',
    color: '#6A4E23',
    letterSpacing: 0.2,
  },
  primaryBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#6A4E23',
    letterSpacing: 0.2,
  },
  subheader: {
    color: '#666',
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f6f1e9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: '#6A4E23',
    fontWeight: '900',
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statPill: {
    flex: 1,
    backgroundColor: '#f9f6f1',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#efe4d6',
  },
  statLabel: {
    color: '#777',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  statValue: {
    color: '#333',
    fontSize: 16,
    fontWeight: '900',
  },

  emptyCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f6f1e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#6A4E23',
  },
  emptyText: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: '#f6f1e9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: '#eee',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  itemTextWrap: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6A4E23',
  },
  desc: {
    marginTop: 4,
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  removeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: '#333',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f1e9',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6A4E23',
    marginTop: -1,
  },
  qty: {
    minWidth: 28,
    textAlign: 'center',
    fontWeight: '900',
    color: '#222',
  },

  summaryCard: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6A4E23',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#222',
    fontSize: 14,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#222',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6A4E23',
  },
  checkoutBtn: {
    marginTop: 14,
    backgroundColor: '#6A4E23',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  secondaryBtn: {
    marginTop: 10,
    backgroundColor: '#f6f1e9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#6A4E23',
    fontWeight: '900',
    fontSize: 14,
  },
  clearBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearBtnText: {
    color: '#d33',
    fontWeight: '800',
  },
});
