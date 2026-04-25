//--------------------------------------------
// tabNavigator.js
//--------------------------------------------

// Bottom tab navigation for Home, Categories, Cart, and other main app screens.
import React, { useContext } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import { CartContext } from '../state/CartContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { cartCount } = useContext(CartContext);
  const displayCount = cartCount > 10 ? '10+' : cartCount;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6A4E23',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 80 : 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? -6 : 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          }

          return (
            <View>
              <Ionicons name={iconName} size={24} color={color} />
              {route.name === 'Cart' && cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{displayCount}</Text>
                </View>
              )}
            </View>
          );
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
    </Tab.Navigator>
  );
}

//Styling
const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -10,
    top: -3,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
