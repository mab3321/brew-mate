//--------------------------------------------
// CheckoutScreen.js
//--------------------------------------------

// Shows final order summary and payment totals.
// Places the order, registers sales, clears cart, and redirects after success.
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../state/CartContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CatalogContext } from '../state/CatalogContext';

export default function CheckoutScreen({ navigation }) {
  const { cart = [], subtotal = 0, clearCart } = useContext(CartContext);
  const { registerSale } = useContext(CatalogContext);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const deliveryFee = useMemo(() => {
    return cart.length > 0 ? 2.5 : 0;
  }, [cart.length]);

  const tax = useMemo(() => {
    return cart.length > 0 ? subtotal * 0.05 : 0;
  }, [cart.length, subtotal]);

  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    console.log(
      '[CheckoutScreen] cart changed:',
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
    console.log('[CheckoutScreen] totals changed:', {
      itemsCount: cart.length,
      subtotal,
      deliveryFee,
      tax,
      total,
      placingOrder,
    });
  }, [cart.length, subtotal, deliveryFee, tax, total, placingOrder]);

  useEffect(() => {
    console.log('[CheckoutScreen] successVisible changed:', successVisible);
  }, [successVisible]);

  const handleBackToCart = () => {
    console.log('[CheckoutScreen] handleBackToCart:', {
      placingOrder,
    });

    if (!placingOrder) {
      navigation.goBack();
    }
  };

  const handlePlaceOrder = () => {
    console.log('[CheckoutScreen] handlePlaceOrder start:', {
      cartLength: cart.length,
      placingOrder,
      subtotal,
      deliveryFee,
      tax,
      total,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
      })),
    });

    if (cart.length === 0 || placingOrder) {
      console.log('[CheckoutScreen] handlePlaceOrder blocked:', {
        reason: cart.length === 0 ? 'empty-cart' : 'already-placing',
      });
      return;
    }

    setPlacingOrder(true);
    console.log('[CheckoutScreen] placingOrder set to true');

    setTimeout(() => {
      console.log('[CheckoutScreen] order timeout fired, registering sale');

      try {
        registerSale(cart);
        console.log(
          '[CheckoutScreen] registerSale success:',
          cart.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
          }))
        );
      } catch (error) {
        console.log('[CheckoutScreen] registerSale error:', error);
      }

      try {
        clearCart();
        console.log('[CheckoutScreen] clearCart success');
      } catch (error) {
        console.log('[CheckoutScreen] clearCart error:', error);
      }

      setSuccessVisible(true);
      setPlacingOrder(false);

      console.log('[CheckoutScreen] order complete, success modal shown');

      setTimeout(() => {
        console.log('[CheckoutScreen] resetting navigation to Home');

        setSuccessVisible(false);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'MainTabs',
              params: { screen: 'Home' },
            },
          ],
        });
      }, 1500);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleBackToCart}
              activeOpacity={0.85}
              disabled={placingOrder}>
              <Ionicons name="chevron-back" size={25} color="#6A4E23" />
              <Text style={styles.backText}>Back to cart</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            {cart.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bag-outline" size={28} color="#6A4E23" />
                <Text style={styles.emptyTitle}>No items in checkout</Text>
                <Text style={styles.emptyText}>
                  Your cart is empty, so there is nothing to place yet.
                </Text>
              </View>
            ) : (
              <>
                {cart.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Image source={{ uri: item.image }} style={styles.image} />

                    <View style={styles.itemInfo}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.desc} numberOfLines={2}>
                        {item.quantity} × {item.description}
                      </Text>
                    </View>

                    <Text style={styles.itemPrice}>
                      $ {(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View style={styles.totalItemsPill}>
                  <Text style={styles.totalItemsLabel}>
                    Total Items in Cart:
                  </Text>
                  <Text style={styles.totalItemsValue}>{cart.length}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Payment summary</Text>

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
              style={[
                styles.placeBtn,
                (placingOrder || cart.length === 0) && styles.placeBtnDisabled,
              ]}
              onPress={handlePlaceOrder}
              activeOpacity={0.9}
              disabled={placingOrder || cart.length === 0}>
              <Text style={styles.placeBtnText}>
                {placingOrder ? 'Placing order...' : 'Place order'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <Modal
          transparent
          visible={successVisible}
          animationType="fade"
          onRequestClose={() => {
            console.log('[CheckoutScreen] success modal request close');
            setSuccessVisible(false);
          }}>
          <Pressable style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark" size={28} color="#fff" />
              </View>

              <Text style={styles.modalTitle}>Order complete</Text>
              <Text style={styles.modalText}>
                Your order has been placed successfully.
              </Text>
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

//Styling
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f6f1e9',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
    flexGrow: 1,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 2,
  },
  backText: {
    color: '#6A4E23',
    fontWeight: '800',
    fontSize: 13,
  },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6A4E23',
    marginBottom: 12,
  },

  emptyState: {
    backgroundColor: '#f9f6f1',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '900',
    color: '#6A4E23',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 19,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#eee',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '900',
    color: '#222',
  },
  desc: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6A4E23',
  },

  totalItemsPill: {
    marginTop: 14,
    backgroundColor: '#f9f6f1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#efe4d6',
  },
  totalItemsLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
  },
  totalItemsValue: {
    color: '#6A4E23',
    fontSize: 16,
    fontWeight: '900',
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

  placeBtn: {
    marginTop: 14,
    backgroundColor: '#6A4E23',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  placeBtnDisabled: {
    opacity: 0.7,
  },
  placeBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  bottomSpacer: {
    height: 24,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  successIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6A4E23',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#6A4E23',
  },
  modalText: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
