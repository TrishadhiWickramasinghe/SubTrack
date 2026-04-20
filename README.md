# SubTrack 📱

> A cross-platform subscription management and financial tracking app built with React Native & Expo.

SubTrack helps you take control of your recurring expenses — track every subscription, set spending budgets, analyse trends, and never miss a payment date again.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Subscription Management** | Add, edit, and delete subscriptions with full billing-cycle support (daily → yearly) |
| **Budget Tracking** | Set global and per-category budgets with configurable alert thresholds (50 / 75 / 90 / 100 %) |
| **Analytics Dashboard** | Spending trends, category breakdowns, MRR/ARR, and savings opportunities |
| **Smart Reminders** | Configurable payment reminders and trial-end alerts with quiet-hours support |
| **Multi-Currency** | 50+ currencies with real-time conversion helpers |
| **Multi-Language** | English, Sinhala, and Tamil |
| **Secure Storage** | AES-256-GCM encryption via React Native MMKV |
| **Authentication** | Email/password sign-up & login powered by Supabase |
| **Dark / Light / Auto Theme** | System-aware theme with manual override |
| **Premium Tier** | AI insights, receipt scanning, bill splitting, and family sharing (configurable) |

---

## 🛠 Tech Stack

### Core
- **React Native 0.81.5** + **Expo 54** — cross-platform mobile framework
- **Expo Router 6** — file-based routing (iOS, Android, Web)
- **React 19** — UI library
- **TypeScript 5.9** — full static typing across the entire codebase

### State & Storage
- **Context API** — global app state
- **Zustand 4** — lightweight store for isolated state slices
- **React Native MMKV 2** — fast, encrypted on-device key-value storage
- **AsyncStorage** — legacy / web fallback

### Backend
- **Supabase** — authentication, database, and real-time subscriptions

### Navigation & UI
- **React Navigation 7** (stack + bottom tabs)
- **Expo Linear Gradient**, **Expo Symbols**, **React Native SVG**
- **Expo Vector Icons**

### Utilities
- **date-fns 4** — date manipulation
- **UUID 9** — ID generation
- **React Native Reanimated 4** — animations
- **React Native Gesture Handler** — gesture support

---

## 📋 Prerequisites

- **Node.js 18+**
- **npm** or **yarn**
- **Expo CLI** — `npm install -g expo-cli`
- **Expo Go** app on your device *or* a configured iOS / Android emulator
- A **Supabase** project (free tier is sufficient)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/TrishadhiWickramasinghe/SubTrack.git
cd SubTrack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous (public) key |
| `EXPO_PUBLIC_API_TIMEOUT` | Request timeout in ms (default `30000`) |
| `EXPO_PUBLIC_MAX_RETRIES` | Max retry attempts (default `3`) |
| `EXPO_PUBLIC_ENABLE_OFFLINE_MODE` | Enable offline support (`true`/`false`) |
| `EXPO_PUBLIC_ENABLE_REAL_TIME` | Enable Supabase real-time (`true`/`false`) |
| `EXPO_PUBLIC_ENABLE_ANALYTICS` | Enable analytics (`true`/`false`) |

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Start the development server

```bash
npm start          # interactive menu (Expo CLI)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
```

---

## 📁 Project Structure

```
SubTrack/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/             # Bottom-tab screens
│   │   ├── home.tsx
│   │   ├── subscriptions.tsx
│   │   └── analytics.tsx
│   └── auth/               # Authentication screens
│       ├── welcome.tsx
│       ├── login.tsx
│       └── signup.tsx
├── screens/                # Additional screen components
│   └── main/               # Dashboard, Budget, Settings, …
├── components/             # Reusable UI components
├── context/                # React Context providers
│   ├── AppContext.ts
│   ├── SubscriptionContext.ts
│   ├── CurrencyContext.ts
│   └── ThemeContext.ts
├── models/                 # TypeScript data models
│   ├── Subscription.ts
│   ├── User.ts
│   ├── Budget.ts
│   ├── Payment.ts
│   └── Category.ts
├── services/
│   └── storage/            # MMKV / AsyncStorage abstractions
├── utils/                  # Helpers & calculation library
│   ├── calculations.ts     # MRR, ARR, NPV, IRR, CAGR, statistics, …
│   ├── dateHelpers.ts
│   ├── currencyHelpers.ts
│   └── validation.ts
├── config/                 # App-wide configuration
│   ├── appConfig.ts
│   ├── categories.ts
│   ├── currencies.ts
│   └── theme.ts
├── assets/                 # Images, fonts, icons
├── .env.example            # Environment variable template
└── app.json                # Expo configuration
```

---

## 🧪 Linting

```bash
npm run lint
```

ESLint is configured with the official `eslint-config-expo` ruleset.

---

## 🔒 Security

- Sensitive data is encrypted with **AES-256-GCM** (10 000 iterations, 256-bit key) via MMKV.
- Supabase credentials are loaded exclusively from environment variables — never hard-coded.
- The service-role key (`SUPABASE_SERVICE_ROLE_KEY`) must **never** be bundled in the client app.

---

## 📖 Additional Documentation

| File | Contents |
|---|---|
| `AUTH_IMPLEMENTATION_SUMMARY.md` | Supabase auth integration overview |
| `AUTH_FLOW_DIAGRAMS.md` | Authentication flow diagrams |
| `COMPONENT_USAGE_GUIDE.md` | How to use shared components |
| `TYPESCRIPT_MIGRATION_GUIDE.md` | JS → TS migration notes |
| `FILE_STRUCTURE_GUIDE.md` | Detailed file-by-file breakdown |
| `IMPLEMENTATION_CHECKLIST.md` | Feature completion checklist |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is private. All rights reserved.
