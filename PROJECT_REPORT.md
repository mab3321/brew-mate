# BrewMate Expo Project Report

## 1. Project Overview

This project is an Expo-based React Native app for a coffee shop style menu called **BrewMate**.

It currently provides:

- A splash screen
- A home screen with featured products
- Category browsing
- A shopping cart
- A checkout flow
- An admin login
- An admin panel for managing categories, products, stock visibility, and sales stats

This is a **frontend-only app**. It does **not** have a real backend server, database, or API.

The app stores data locally using `AsyncStorage`, so catalog changes and cart contents persist on the same device/browser.

## 2. Tech Stack

- Expo SDK 54
- React 19
- React Native 0.81
- React Navigation
- AsyncStorage for local persistence
- React Native Web for browser support

## 3. Directory Structure

### Root files

- `App.js`
  Main app composition. Wraps the app with context providers and defines the stack navigation flow.

- `index.js`
  Expo entry file. Registers `App` as the root component.

- `app.json`
  Expo app configuration such as app name, icon, splash, Android settings, and web favicon.

- `package.json`
  Project scripts and dependencies.

### `assets/`

Stores static app images used by Expo itself:

- app icon
- adaptive Android icon
- splash icon
- web favicon

These are not the coffee product images. Product images are mostly remote URLs defined in the seed data.

### `components/`

Reusable UI pieces used across screens.

- `productcard.js`
  Shared product card used in product lists.

- `ProductDetailModal.js`
  Popup modal showing product details and quantity controls.

### `data/`

Seed data used as the default catalog.

- `Categories.js`
  Default list of categories.

- `products.js`
  Default list of products.

These are the app's starting values. If admin resets the catalog, the app returns to these defaults.

### `navigation/`

- `tabnavigator.js`
  Bottom tab navigation for:
  - Home
  - Categories
  - Cart

This is the main user-facing navigation after the splash screen.

### `screens/`

Each file is one major app screen.

- `SplashScreen.js`
  Startup screen with animation. Waits for catalog hydration before entering the app.

- `HomeScreen.js`
  Main landing page. Shows featured products, all products, search, sort, and admin button.

- `CategoriesScreen.js`
  Lets the user filter products by category.

- `CartScreen.js`
  Shows selected items, quantity changes, subtotal, tax, delivery fee, and checkout button.

- `CheckoutScreen.js`
  Final order summary. "Place order" clears the cart and records sales locally.

- `AdminLoginScreen.js`
  Simple hardcoded admin login form.

- `AdminPanelScreen.js`
  Admin area to add categories, add/edit products, hide/show products, inspect sales, and reset data.

### `state/`

Global state management using React Context.

- `CatalogContext.js`
  Manages categories, products, visibility, sales tracking, persistence, and reset behavior.

- `CartContext.js`
  Manages cart items, quantities, totals, persistence, and cart count.

## 4. How the App Works

### App startup

1. Expo starts `index.js`
2. `index.js` loads `App.js`
3. `App.js` wraps the app with:
   - `CatalogProvider`
   - `CartProvider`
4. `App.js` creates a stack navigator
5. First screen shown is `Splash`

### Data loading

When the app starts:

- `CatalogContext` loads the catalog from `AsyncStorage`
- `CartContext` loads the cart from `AsyncStorage`

If no saved data exists:

- categories are loaded from `data/Categories.js`
- products are loaded from `data/products.js`

So the app works even with no internet API, because its product catalog is bundled in the app and then persisted locally.

### Main navigation flow

- Splash screen loads first
- App transitions to tab navigation
- Tabs give access to Home, Categories, and Cart
- Checkout is opened from Cart
- Admin login is opened from Home
- Admin panel is opened after successful admin login

## 5. Current Capabilities

### Customer-facing capabilities

- View featured products
- View all visible products
- Search products by name or description
- Sort products by:
  - A-Z
  - Z-A
  - High to Low
  - Low to High
- Browse products by category
- Open product details in a modal
- Add products to cart
- Increase or decrease cart quantities
- Remove cart items
- Clear cart
- Checkout and place an order

### Admin capabilities

- Login through admin screen
- Add new categories
- Add new products
- Edit existing products
- Mark products as featured
- Hide products from customers
- Show hidden products again
- View product sales counts
- View top sellers
- View low sellers
- Reset all catalog data
- Reset only sales data

## 6. Does It Have a Backend?

No.

This project currently has:

- No Node.js server
- No Express app
- No Firebase config
- No Supabase config
- No REST API
- No database
- No authentication service

Instead, it uses local device/browser storage through `AsyncStorage`.

That means:

- admin credentials are hardcoded in the frontend
- product changes are stored locally on the current device/browser only
- order placement is simulated locally
- sales stats are local only
- different users/devices will not share the same data

## 7. How Admin Login Works

Admin login is hardcoded in `screens/AdminLoginScreen.js`.

Current credentials are:

- Username: `eman`
- Password: `admin`

If those values match, the app navigates to the admin panel.

This is not secure for production because:

- credentials are visible in the frontend code
- there is no server verification
- anyone with source access can see the admin login

## 8. Web Setup and Run

### What I changed

To enable web support properly, I installed:

- `react-dom`
- `react-native-web`

### Commands

Install dependencies:

```bash
npm install
```

Run Expo normally:

```bash
npm start
```

Run directly on web:

```bash
npm run web
```

### Verified web URL

The app is currently serving on:

`http://localhost:19006`

## 9. How to Run on Android

### Option A: Expo Go on a real Android phone

1. Install **Expo Go** from the Play Store
2. In the project folder run:

```bash
npm start
```

3. Scan the QR code from the Expo terminal using Expo Go
4. The app will open on your phone

### Option B: Android emulator

1. Install Android Studio
2. Create and start an Android emulator
3. Run:

```bash
npm run android
```

Expo will launch the app in the emulator.

### Important note

Because this project uses remote product image URLs, Android/web should load them as long as internet access is available.

## 10. Important Architectural Notes for a Beginner

### Why `state/` matters

If you are new to Expo, the most important thing to understand is this:

- screens render the UI
- contexts in `state/` hold shared app data
- navigation decides which screen is currently visible

So:

- UI logic lives mostly in `screens/`
- reusable card/modal UI lives in `components/`
- shared business data lives in `state/`
- default content lives in `data/`

### Why this app works without a backend

It behaves like a local demo or prototype:

- product catalog starts from local seed data
- admin edits update local state
- local state is saved in `AsyncStorage`
- next time the same user opens the app, their changes remain

That is enough for demos, learning, and UI projects, but not enough for production.

## 11. File-Level Working Summary

### `App.js`

- Defines the stack screens
- Wraps the whole app in providers

### `state/CatalogContext.js`

- Loads default or saved catalog
- Persists catalog updates
- Handles category/product CRUD-like operations
- Tracks sales and reset actions

### `state/CartContext.js`

- Loads and saves cart
- Computes cart count and subtotal

### `navigation/tabnavigator.js`

- Bottom tabs
- Cart badge count

### `screens/HomeScreen.js`

- Search
- Sort
- Featured carousel
- Open admin login

### `screens/CategoriesScreen.js`

- Category filtering

### `screens/CartScreen.js`

- Cart editing
- Pricing summary
- Checkout entry point

### `screens/CheckoutScreen.js`

- Order placement simulation
- Sales registration

### `screens/AdminLoginScreen.js`

- Hardcoded login check

### `screens/AdminPanelScreen.js`

- Product/category management
- Sales stats
- Reset tools

## 12. Limitations Right Now

- No real backend
- No real payment system
- No secure auth
- No shared data across users/devices
- No order history
- No user accounts
- No real inventory database
- No real admin authorization

## 13. Recommended Next Steps

If you want to evolve this project beyond a demo, the next major upgrades should be:

1. Add a real backend
2. Move admin login to secure server-side auth
3. Store products/orders/users in a database
4. Replace local-only sales tracking with server-side order records
5. Add proper form validation and role-based access

## 14. Quick Answers

- Is it an Expo project? Yes.
- Is it frontend only? Yes.
- Does it have backend code? No.
- Can it run on web? Yes.
- Can it run on Android? Yes, through Expo Go or emulator.
- Can admin edit products? Yes.
- Is admin auth secure? No, it is hardcoded.
