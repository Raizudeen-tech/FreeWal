# 💰 Expense Tracker App

A comprehensive React Native expense tracking application with local data persistence, beautiful UI, and interactive insights through graphs and summaries.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-green.svg)
![Expo](https://img.shields.io/badge/Expo-54.0.20-black.svg)

## ✨ Features

### Core Features
- ✅ **Add, Edit, Delete Expenses** - Complete CRUD operations for expense management
- 📊 **Monthly Dashboard** - Visual summary of your financial status
- 📈 **Interactive Graphs** - Beautiful charts showing spending patterns
- 🏷️ **Category Management** - Customize expense categories with colors
- 💼 **Multiple Accounts** - Track expenses across different accounts
- 🔍 **Search & Filter** - Find expenses by date, category, or notes
- 💾 **Local Data Storage** - All data stored securely on your device using SQLite
- 📤 **Export to CSV** - Backup your data locally

### Dashboard Insights
- **Total Balance** - See your current financial position at a glance
- **Monthly Summary** - Total income, expenses, and net savings
- **Top Category** - Identify your highest spending category
- **Recent Transactions** - Quick view of latest 5 transactions
- **Spending Breakdown** - Category-wise expense distribution

### Graphs & Analytics
- 📊 **Pie Chart** - Category distribution of expenses
- 📈 **Line Chart** - 6-month expense trend
- 📊 **Bar Chart** - Daily spending for last 7 days
- 📉 **Month Comparison** - Compare spending across months

### UI/UX Features
- 🎨 **Material Design 3** - Modern, clean interface
- 🌓 **Dark/Light Theme** - Toggle between themes
- 🎨 **Pastel Color Palette** - Easy on the eyes
- 💫 **Smooth Animations** - Polished user experience
- 📱 **Bottom Navigation** - Easy access to all screens

### Settings
- 💱 **Multiple Currencies** - Support for INR, USD, EUR, GBP, JPY, AUD, CAD
- 🔒 **PIN Lock** - Secure your app with a PIN (optional)
- 👆 **Biometric Lock** - Fingerprint/Face ID support (optional)
- 🌍 **Localization Ready** - Currency symbol auto-formatting

## 🏗️ Architecture

### Tech Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Database**: SQLite (expo-sqlite)
- **State Management**: Zustand
- **Navigation**: React Navigation (Bottom Tabs)
- **Charts**: react-native-chart-kit
- **UI Components**: React Native Paper
- **Date Handling**: date-fns

### Project Structure
```
Expense_app/
├── src/
│   ├── data/
│   │   ├── models/          # TypeScript interfaces
│   │   │   ├── Expense.ts
│   │   │   ├── Category.ts
│   │   │   └── Account.ts
│   │   ├── database/        # SQLite database setup
│   │   │   └── DatabaseService.ts
│   │   └── repositories/    # Data access layer
│   │       ├── ExpenseRepository.ts
│   │       ├── CategoryRepository.ts
│   │       └── AccountRepository.ts
│   ├── stores/              # Zustand state management
│   │   ├── expenseStore.ts
│   │   ├── categoryStore.ts
│   │   ├── accountStore.ts
│   │   └── settingsStore.ts
│   ├── screens/             # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── AddExpenseScreen.tsx
│   │   ├── CategoriesScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/          # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── constants/           # App constants
│   │   ├── theme.ts
│   │   └── data.ts
│   └── utils/               # Utility functions
│       ├── export.ts
│       └── seedData.ts
├── App.tsx                  # Main app component
└── package.json
```

### Design Patterns
- **Repository Pattern** - Clean separation between data access and business logic
- **Store Pattern (Zustand)** - Centralized state management with reactive updates
- **Component-Based Architecture** - Reusable, maintainable components

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app on physical device)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd c:\Users\raizu\Documents\Expense_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your platform**
   - **iOS**: Press `i` in terminal or run `npm run ios`
   - **Android**: Press `a` in terminal or run `npm run android`
   - **Web**: Press `w` in terminal or run `npm run web`
   - **Physical Device**: Scan QR code with Expo Go app

## 📱 Screens Overview

### 1. Home Screen
- Total balance display
- Monthly income/expense summary
- Net savings calculation
- Recent transactions list
- Quick summary cards

### 2. Add Expense Screen
- Type selector (Income/Expense)
- Amount input with currency
- Category selector (horizontal scroll)
- Account selector
- Note input (optional)
- Date picker
- Form validation

### 3. Categories Screen
- List all categories
- Add new category
- Edit existing category
- Delete category (with expense count warning)
- Color picker
- Icon selector

### 4. Stats Screen
- Pie chart for category distribution
- Bar chart for daily spending
- Line chart for monthly trend
- Quick statistics cards

### 5. Settings Screen
- Dark/Light theme toggle
- Currency selection
- PIN lock enable/disable
- Biometric authentication
- Export to CSV
- App version info

## 💾 Database Schema

### Expenses Table
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  category_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  note TEXT,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Accounts Table
```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Theming

The app includes comprehensive light and dark themes with a pastel color palette:

### Light Theme
- Background: #F9FAFB
- Surface: #FFFFFF
- Primary: #6366F1 (Indigo)
- Text: #1F2937

### Dark Theme
- Background: #111827
- Surface: #1F2937
- Primary: #818CF8 (Light Indigo)
- Text: #F9FAFB

## 📊 Sample Data

The app automatically seeds the database with:
- 10 default categories (Food, Transportation, Shopping, etc.)
- 1 default account ("Main Account" with ₹50,000)
- 15 sample transactions for the current month
- Mix of income and expense entries

## 🔒 Security Features

- **Optional PIN Lock**: 4-digit PIN protection
- **Biometric Authentication**: Fingerprint/Face ID support
- **Local Storage Only**: No cloud sync, all data stays on device

## 📤 Export & Backup

- Export all transactions to CSV format
- CSV includes: Date, Type, Amount, Category, Account, Note
- File saved to device storage
- Share via native sharing options

## 🛠️ Development

### Available Scripts

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Building for Production

```bash
# Build Android APK
expo build:android

# Build iOS IPA
expo build:ios
```

## 🐛 Troubleshooting

### Database Issues
If you encounter database issues, you can reset it by:
1. Clearing app data (on device)
2. Reinstalling the app
3. The database will automatically reinitialize with sample data

### Charts Not Showing
Ensure you have transactions in the current month. The seed data automatically creates sample transactions.

## 📝 Future Enhancements

- [ ] Recurring expenses/income
- [ ] Budget setting and tracking
- [ ] Multi-currency support with exchange rates
- [ ] Cloud backup option
- [ ] Widgets for home screen
- [ ] Receipt photo attachment
- [ ] Split expenses
- [ ] Tags for expenses
- [ ] Advanced filtering
- [ ] Export to PDF

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created with ❤️ for personal expense tracking

## 🙏 Acknowledgments

- React Native community
- Expo team
- Chart libraries contributors
- Material Design guidelines

---

**Note**: This app stores all data locally on your device. Make sure to regularly export your data for backup purposes.
