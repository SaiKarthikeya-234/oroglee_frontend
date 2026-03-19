# Dentify — Frontend Application

This is the React frontend for the Dentify appointment platform. It is built with **Vite** for lightning-fast hot-module reloading and features a custom "Premium Glassmorphic Aurora" dark mode UI.

## ✨ Features
- **Premium Aurora UI**: Full custom CSS design system using immersive glassmorphism, animated mesh gradients, and neon neon accents.
- **Search & Filtering**: Live-filtering on the `DentistList` page to refine searches by Name, Clinic, Speciality, and Location.
- **Form Validation**: Strict client-side validation for booking appointments (restricts past dates, enforces age limits, validates emails).
- **Toast Notifications**: Animated floating CSS notifications instead of native alerts.
- **Responsive**: Fully optimized for Desktop, Tablet, and Mobile displays.

## 🚀 Setup Guide

### 1. Install Dependencies
Make sure you are in the `frontend/` directory, then run:
```bash
npm install
```

### 2. Environment Configuration
Create a file named precisely `.env` in the root of the `frontend/` directory. This tells React where your backend is running:
```env
# Point this to your running backend Express server
VITE_API_URL=http://localhost:5001
```

### 3. Run the Development Server
```bash
npm run dev
```
The application will launch and be available in your browser at `http://localhost:5173`.
