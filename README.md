# React Production-Ready Boilerplate

A comprehensive, production-ready React boilerplate with modern tooling and best practices. Perfect for starting new projects quickly without spending time on initial setup.

## 🚀 Features

- ⚡️ **React 19** with TypeScript for type safety
- 🎨 **Styling**: Material-UI (MUI) + Tailwind CSS
- 🔄 **State Management**: Redux Toolkit with typed hooks
- 🛣️ **Routing**: React Router v7 with layouts
- 📝 **Form Handling**: React Hook Form + Zod validation
- 🎯 **API Client**: Ready-to-use fetch wrapper with TypeScript
- 🎭 **Theme Support**: Dark/Light mode with MUI theming
- 🧩 **Reusable Components**: Pre-built form components and layouts
- 🪝 **Custom Hooks**: useLocalStorage, useDebounce, useForm, etc.
- 📦 **Build Tool**: Vite for lightning-fast builds
- ✅ **Code Quality**: ESLint configured for React + TypeScript
- 📁 **Well-Organized**: Clean folder structure following best practices

## 📦 Stack

- **Frontend Framework**: React 19.1.1
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7
- **UI Library**: Material-UI (MUI) 7
- **CSS Framework**: Tailwind CSS 4
- **State Management**: Redux Toolkit 2.9
- **Routing**: React Router 7
- **Form Management**: React Hook Form 7.65
- **Validation**: Zod 4 + Valibot 1
- **Linting**: ESLint 9

## 🛠️ Quick Start

### 1. Clone or Use This Template

```bash
# Clone this repository
git clone <your-repo-url>
cd react_boiler_plate

# Or create from template (if you've set this up as a GitHub template)
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your configuration
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

## 📜 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── common/        # Reusable UI components (Button, Input, Card)
│   ├── forms/         # Form components with validation
│   ├── layout/        # Layout components (Header, Footer, Navigation)
│   └── features/      # Feature-specific components
├── pages/             # Page components
├── routes/            # Route configuration
├── store/             # Redux store
│   ├── slices/        # Redux slices
│   └── middleware/    # Custom middleware
├── services/          # API services
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── types/             # TypeScript types/interfaces
├── contexts/          # React contexts
├── config/            # Configuration files
├── theme/             # MUI theme customization
└── styles/            # Global styles
```

## 🎨 Customization

### Theme

Edit `src/theme/ThemeOptions.ts` to customize MUI theme colors, typography, and more.

### Environment Variables

Add your environment variables in `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Access them via `src/config/env.ts`.

### API Configuration

Update `src/config/constants.ts` for API base URL and other constants.

## 🔧 What's Included

### Components

- **MuiButton**: Enhanced MUI button with loading state
- **MuiInput**: Custom input with error message support
- **MuiCard**: Pre-styled card component
- **LoginForm**: Complete login form with validation
- **RegisterForm**: Registration form with validation
- **ThemeToggle**: Dark/light mode switcher

### Hooks

- `useLocalStorage`: Persist state in localStorage
- `useDebounce`: Debounce values
- `useForm`: Custom form state management
- `useNavigation`: Navigation helper

### Redux Slices

- `authSlice`: Authentication state
- `userSlice`: User management
- `counterSlice`: Example counter (can be removed)

## 🚀 Production Build

```bash
npm run build
```

Outputs optimized files to `/dist` directory.

## 📝 Best Practices

- ✅ TypeScript strict mode enabled
- ✅ ESLint configured for React + TypeScript
- ✅ Component-based architecture
- ✅ Separation of concerns (components, hooks, services)
- ✅ Typed Redux with hooks
- ✅ Environment variable management
- ✅ Error boundaries ready
- ✅ Responsive layouts with MUI breakpoints

## 🤝 Contributing

This is a boilerplate template. Feel free to customize it for your needs!

## 📄 License

MIT License - feel free to use this for your projects!
