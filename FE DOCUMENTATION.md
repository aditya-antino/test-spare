# Spare Space Frontend - Technical Documentation

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Project Overview](#2-project-overview)
3. [Technology Stack](#3-technology-stack)
4. [Features Summary](#4-features-summary)
5. [System Requirements](#5-system-requirements)
6. [Folder Structure](#6-folder-structure)
7. [Project Architecture](#7-project-architecture)
8. [Environment Setup](#8-environment-setup)
9. [Environment Variables](#9-environment-variables)
10. [API Layer Documentation](#10-api-layer-documentation)
11. [Authentication Flow](#11-authentication-flow)
12. [State Management](#12-state-management)
13. [UI Component System](#13-ui-component-system)
14. [Coding Standards](#14-coding-standards)
15. [Custom Hooks Documentation](#15-custom-hooks-documentation)
16. [Routing & Navigation](#16-routing--navigation)
17. [Data Fetching Strategy](#17-data-fetching-strategy)
18. [Performance Guidelines](#18-performance-guidelines)
19. [Error Handling](#19-error-handling)
20. [Logging Strategy](#20-logging-strategy)
21. [SEO Documentation](#21-seo-documentation)
22. [Testing Documentation](#22-testing-documentation)
23. [Deployment Guide](#23-deployment-guide)
24. [Git Strategy](#24-git-strategy)
25. [Common Problems & Debugging](#25-common-problems--debugging)
26. [Future Enhancements](#26-future-enhancements)
27. [FAQ](#27-faq)

---

## 1. Introduction

### 1.1 Purpose of This Document

This documentation serves as a comprehensive guide for developers working on the Spare Space Frontend application. It provides detailed information about the project architecture, coding standards, development workflows, and best practices that should be followed when contributing to this codebase.

### 1.2 Target Audience

| Audience | Usage |
|----------|-------|
| New Developers | Onboarding and understanding project structure |
| Frontend Engineers | Day-to-day development reference |
| Tech Leads | Architecture decisions and standards |
| QA Engineers | Understanding application flow for testing |
| DevOps Engineers | Deployment and CI/CD configuration |

### 1.3 Document Conventions

Throughout this document, the following conventions are used:

| Convention | Meaning |
|------------|---------|
| `monospace` | File names, folder names, commands, or technical terms |
| **Bold** | Important concepts or emphasis |
| *Italic* | First use of a term or cross-references |
| Tables | Structured information and comparisons |
| ASCII Diagrams | Visual representation of architecture and flows |

---

## 2. Project Overview

### 2.1 Application Description

**Spare Space** is a modern marketplace platform that connects space owners (Hosts) with individuals or businesses seeking temporary rental spaces (Guests). The platform facilitates the listing, discovery, booking, and management of various types of spaces including:

- Event venues
- Meeting rooms
- Photography studios
- Co-working spaces
- Warehouse storage
- And more

### 2.2 Business Domain

The application operates in the sharing economy sector, specifically focusing on space rental services. It serves two primary user roles:

| Role | Description | Key Activities |
|------|-------------|----------------|
| **Host** | Space owners who list their properties | Create listings, manage reservations, track earnings, communicate with guests |
| **Guest** | Users seeking to book spaces | Search spaces, make bookings, manage reservations, leave reviews |

### 2.3 Application Type

This is a **Next.js 15** based web application utilizing the App Router architecture. It is designed as a responsive, mobile-first application that works seamlessly across desktop, tablet, and mobile devices.

### 2.4 Key Modules

| Module | Description |
|--------|-------------|
| Authentication | User registration, login, OAuth, password recovery |
| Host Dashboard | Listing management, calendar, reservations, earnings |
| Guest Portal | Space discovery, booking, wishlist, booking history |
| Messaging | Real-time chat between hosts and guests |
| Payments | Razorpay integration for secure transactions |
| Analytics | Earnings reports, booking statistics |

---

## 3. Technology Stack

### 3.1 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.4.6 | React framework with SSR/SSG capabilities |
| React | 19.1.0 | UI component library |
| TypeScript | 5.x | Type-safe JavaScript |

### 3.2 State Management

| Technology | Purpose |
|------------|---------|
| Redux Toolkit | Global state management |
| Redux Persist | State persistence across sessions |
| TanStack React Query | Server state management and caching |

### 3.3 Styling

| Technology | Purpose |
|------------|---------|
| Tailwind CSS 4.x | Utility-first CSS framework |
| Radix UI | Accessible, unstyled UI primitives |
| shadcn/ui | Pre-built component library |
| Class Variance Authority | Component variant management |
| Tailwind Merge | Tailwind class merging utility |

### 3.4 Data Fetching & API

| Technology | Purpose |
|------------|---------|
| Axios | HTTP client for API requests |
| GraphQL Request | GraphQL client for CMS queries |
| Socket.io Client | Real-time WebSocket communication |

### 3.5 UI Components & Libraries

| Library | Purpose |
|---------|---------|
| Lucide React | Icon library |
| React Toastify | Toast notifications |
| Swiper | Carousel/slider functionality |
| React Day Picker | Date picker component |
| Embla Carousel | Performant carousel |
| Chart.js / React-Chartjs-2 | Data visualization |

### 3.6 Maps & Location

| Library | Purpose |
|---------|---------|
| React Google Maps API | Google Maps integration |
| Leaflet / React Leaflet | Alternative map solution |

### 3.7 Payments

| Library | Purpose |
|---------|---------|
| React Razorpay | Payment gateway integration |

### 3.8 Utilities

| Library | Purpose |
|---------|---------|
| date-fns | Date manipulation |
| dayjs | Lightweight date library |
| clsx | Conditional class names |
| xlsx | Excel file generation |
| Tesseract.js | OCR for document verification |
| heic2any | Image format conversion |

### 3.9 Development Tools

| Tool | Purpose |
|------|---------|
| ESLint 9.x | Code linting |
| Prettier | Code formatting |
| TypeScript | Static type checking |

---

## 4. Features Summary

### 4.1 Authentication Features

| Feature | Description |
|---------|-------------|
| Email/Password Login | Traditional authentication |
| Google OAuth | Social login integration |
| Email Verification | Account verification via email |
| Phone OTP Verification | Mobile number verification |
| Password Recovery | Forgot password flow |
| Profile Management | User profile editing |

### 4.2 Host Features

| Feature | Description |
|---------|-------------|
| Space Listing Creation | Multi-step listing wizard (9 steps) |
| Listing Management | Edit, deactivate, delete listings |
| Calendar Management | Availability and blocked slots |
| Reservation Management | Accept, reject, cancel bookings |
| Earnings Dashboard | Revenue tracking and analytics |
| Payout Configuration | Bank account linking |
| KYC Verification | Aadhaar, PAN, DL verification |

### 4.3 Guest Features

| Feature | Description |
|---------|-------------|
| Space Discovery | Search with filters |
| Space Details | Comprehensive space information |
| Booking System | Request and instant booking |
| Wishlist | Save favorite spaces |
| Booking History | View past and upcoming bookings |
| Reviews & Ratings | Rate completed bookings |
| Host Profiles | View host information |

### 4.4 Communication Features

| Feature | Description |
|---------|-------------|
| Real-time Chat | Socket-based messaging |
| Booking Conversations | Contextual chat per booking |
| Notifications | In-app notification system |

### 4.5 Payment Features

| Feature | Description |
|---------|-------------|
| Secure Payments | Razorpay integration |
| GST Handling | Tax calculation and invoicing |
| Invoice Generation | Downloadable invoices |

---

## 5. System Requirements

### 5.1 Development Environment

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 18.x | 20.x or higher |
| npm | 9.x | 10.x |
| RAM | 8 GB | 16 GB |
| Storage | 2 GB free | 5 GB free |
| OS | Windows 10, macOS 12, Ubuntu 20.04 | Latest versions |

### 5.2 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### 5.3 IDE Recommendations

| IDE | Extensions |
|-----|------------|
| VS Code | ESLint, Prettier, Tailwind CSS IntelliSense, TypeScript |
| Cursor | Built-in AI assistance, ESLint, Prettier |
| WebStorm | Built-in TypeScript support |

---

## 6. Folder Structure

### 6.1 Root Level Structure

```
spare_space_frontend/
├── public/                    # Static assets served directly
├── src/                       # Source code
├── node_modules/              # Dependencies (git-ignored)
├── components.json            # shadcn/ui configuration
├── eslint.config.mjs          # ESLint configuration
├── Jenkinsfile                # CI/CD pipeline definition
├── next.config.ts             # Next.js configuration
├── next-env.d.ts              # Next.js TypeScript declarations
├── package.json               # Project dependencies and scripts
├── package-lock.json          # Dependency lock file
├── postcss.config.mjs         # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project readme
```

### 6.2 Source Directory Structure

```
src/
├── app/                       # Next.js App Router pages
│   ├── (afterAuth)/           # Protected routes (Host & Guest)
│   │   ├── guest/             # Guest-specific pages
│   │   └── host/              # Host-specific pages
│   ├── (beforeAuth)/          # Public auth pages
│   │   ├── forgot-password/   # Password recovery
│   │   ├── login/             # Login page
│   │   └── sign-up/           # Registration flow
│   ├── about/                 # About page
│   ├── articles/              # Help articles
│   ├── blogs/                 # Blog pages
│   ├── cancellationPolicy/    # Policy page
│   ├── contact/               # Contact page
│   ├── faq/                   # FAQ page
│   ├── privacy/               # Privacy policy
│   ├── terms/                 # Terms of service
│   ├── upload/                # File upload page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── root-provider.tsx      # Application providers
├── assets/                    # Static assets (images, icons)
├── components/                # React components
├── constants/                 # Application constants
├── data/                      # Mock data and static data
├── hooks/                     # Custom React hooks
├── lib/                       # Utility libraries
├── services/                  # API services
├── store/                     # Redux store
├── types/                     # TypeScript type definitions
└── utils/                     # Utility functions
```

### 6.3 Components Directory

```
components/
├── account/                   # Account-related components
├── articles/                  # Help article components
├── auth/                      # Authentication components
│   ├── googleLogin/           # Google OAuth button
│   └── protected/             # Route protection
├── booking/                   # Booking-related components
├── calendar/                  # Calendar components
├── chat-messages/             # Chat/messaging components
├── common/                    # Shared/reusable components
├── dropdowns/                 # Dropdown components
├── homePage/                  # Home page components
├── icons/                     # Custom icon components
├── landing/                   # Landing page components
├── layout/                    # Layout components (Header, Footer)
├── modals/                    # Modal dialogs
├── pagination/                # Pagination components
├── razorpay/                  # Payment components
├── readOnlyMap/               # Map display component
├── shimmers/                  # Loading skeleton components
├── ui/                        # Base UI components (shadcn)
├── GoogleAnalytics.tsx        # Analytics component
├── NotificationIcon.tsx       # Notification icon
└── index.ts                   # Barrel export file
```

### 6.4 Services Directory

```
services/
├── guest/                     # Guest-specific API services
├── host/                      # Host-specific API services
├── landing/                   # Landing page API services
├── aadhar.services.ts         # Aadhaar verification
├── analytics.services.ts      # Analytics API
├── api.ts                     # HTTP method wrappers
├── apiService.ts              # TanStack Query hooks
├── auth.services.ts           # Authentication API
├── calendarApi.ts             # Calendar API
├── chatApi.ts                 # Chat/messaging API
├── endPoints.ts               # API endpoint constants
├── guestGST.services.ts       # GST services
├── invoice.services.ts        # Invoice generation
├── notification.services.ts   # Notification API
├── ratings.services.ts        # Ratings API
├── reservationsApi.ts         # Reservations API
├── staticPages.services.ts    # CMS pages API
└── subscribeMail.services.ts  # Newsletter subscription
```

### 6.5 Store Directory

```
store/
├── slice/
│   ├── authSlice.ts           # Authentication state
│   ├── bookingSlice.ts        # Booking state
│   ├── headerNotificationSlice.ts  # Notification badges
│   ├── homePageSearchSlice.ts # Search filters state
│   └── spaceTypeSlice.ts      # Space type filters
└── store.ts                   # Store configuration
```

### 6.6 Folder Purpose Reference

| Folder | Purpose |
|--------|---------|
| `app/` | Next.js 15 App Router pages and layouts |
| `assets/` | Images, SVGs, and static files imported in code |
| `components/` | Reusable React components |
| `constants/` | Static values, enums, path definitions |
| `data/` | Mock data for development and testing |
| `hooks/` | Custom React hooks for shared logic |
| `lib/` | Third-party library configurations |
| `services/` | API communication layer |
| `store/` | Redux state management |
| `types/` | TypeScript interfaces and types |
| `utils/` | Helper functions and utilities |

---

## 7. Project Architecture

### 7.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SPARE SPACE FRONTEND                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Next.js   │  │   React     │  │  TypeScript │  │ Tailwind   │ │
│  │  App Router │  │   19.1      │  │     5.x     │  │   CSS 4    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                │                │               │         │
│         └────────────────┴────────────────┴───────────────┘         │
│                                  │                                  │
│  ┌───────────────────────────────┴───────────────────────────────┐  │
│  │                      APPLICATION LAYER                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │  Pages   │  │Components│  │  Hooks   │  │   Services   │   │  │
│  │  │ (Routes) │  │   (UI)   │  │ (Logic)  │  │    (API)     │   │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │  │
│  └───────┴─────────────┴─────────────┴───────────────┴───────────┘  │
│                                  │                                  │
│  ┌───────────────────────────────┴───────────────────────────────┐  │
│  │                       STATE LAYER                             │  │
│  │  ┌─────────────────┐              ┌─────────────────────┐     │  │
│  │  │  Redux Toolkit  │              │  TanStack Query     │     │  │
│  │  │  (Client State) │              │  (Server State)     │     │  │
│  │  │  + Persist      │              │  + Caching          │     │  │
│  │  └────────┬────────┘              └──────────┬──────────┘     │  │
│  └───────────┴──────────────────────────────────┴────────────────┘  │
│                                  │                                  │
│  ┌───────────────────────────────┴───────────────────────────────┐  │
│  │                     COMMUNICATION LAYER                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │  │
│  │  │    Axios     │  │  Socket.io   │  │  GraphQL Client  │     │  │
│  │  │  (REST API)  │  │  (Real-time) │  │     (CMS)        │     │  │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘     │  │
│  └─────────┴─────────────────┴───────────────────┴───────────────┘  │
│                                  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ REST API │  │ Socket   │  │ Razorpay │  │  Google  │  │  CMS   │ │
│  │ Backend  │  │ Server   │  │ Payment  │  │  OAuth   │  │(WordPress)│
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     COMPONENT HIERARCHY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    RootLayout                           │    │
│  │  (app/layout.tsx)                                       │    │
│  │  - HTML/Body structure                                  │    │
│  │  - Font configuration                                   │    │
│  │  - Global scripts (GA, Maps, Razorpay)                  │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                    │
│  ┌─────────────────────────▼───────────────────────────────┐    │
│  │                   RootProvider                          │    │
│  │  (app/root-provider.tsx)                                │    │
│  │  - Redux Provider                                       │    │
│  │  - Redux Persist Gate                                   │    │
│  │  - TanStack Query Provider                              │    │
│  │  - Google OAuth Provider                                │    │
│  │  - Toast Container                                      │    │
│  │  - Protected Routes Handler                             │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                    │
│  ┌─────────────────────────▼───────────────────────────────┐    │
│  │                    Page Layouts                         │    │
│  │  ┌───────────────┐  ┌───────────────┐                   │    │
│  │  │ (afterAuth)   │  │ (beforeAuth)  │                   │    │
│  │  │   Layout      │  │    Layout     │                   │    │
│  │  │ - Header      │  │ - Minimal UI  │                   │    │
│  │  │ - Footer      │  │               │                   │    │
│  │  └───────┬───────┘  └───────┬───────┘                   │    │
│  └──────────┴──────────────────┴───────────────────────────┘    │
│                            │                                    │
│  ┌─────────────────────────▼───────────────────────────────┐    │
│  │                    Page Components                      │    │
│  │  - Feature-specific pages                               │    │
│  │  - Composed of smaller components                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Data Flow Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW DIAGRAM                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  USER ACTION                                                       │
│       │                                                            │
│       ▼                                                            │
│  ┌─────────────┐                                                   │
│  │  Component  │ ◄──── UI State (useState, useReducer)             │
│  └──────┬──────┘                                                   │
│         │                                                          │
│         ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     STATE MANAGEMENT                        │   │
│  │                                                             │   │
│  │  ┌─────────────────────┐    ┌─────────────────────────┐     │   │
│  │  │    Redux Store      │    │    TanStack Query       │     │   │
│  │  │                     │    │                         │     │   │
│  │  │  • authSlice        │    │  • useLogin()           │     │   │
│  │  │  • bookingSlice     │    │  • useGetProfile()      │     │   │
│  │  │  • searchSlice      │    │  • useGetSpaceList()    │     │   │
│  │  │  • notificationSlice│    │  • useReservations()    │     │   │
│  │  │                     │    │                         │     │   │
│  │  │  Purpose:           │    │  Purpose:               │     │   │
│  │  │  Client-side state  │    │  Server state + cache   │     │   │
│  │  └──────────┬──────────┘    └────────────┬────────────┘     │   │
│  └─────────────┴────────────────────────────┴──────────────────┘   │
│                │                            │                      │
│                │                            ▼                      │
│                │                   ┌─────────────────┐             │
│                │                   │  API Services   │             │
│                │                   │  (services/)    │             │
│                │                   └────────┬────────┘             │
│                │                            │                      │
│                │                            ▼                      │
│                │                   ┌─────────────────┐             │
│                │                   │  Axios Instance │             │
│                │                   │  (lib/)         │             │
│                │                   └────────┬────────┘             │
│                │                            │                      │
│                ▼                            ▼                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      BACKEND API                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 7.4 Route Groups Explanation

| Route Group | Purpose | Authentication |
|-------------|---------|----------------|
| `(afterAuth)` | Protected pages for logged-in users | Required |
| `(beforeAuth)` | Authentication pages (login, signup) | Must NOT be logged in |
| Root level | Public pages (about, contact, etc.) | Not required |

---

## 8. Environment Setup

### 8.1 Prerequisites Installation

| Step | Command/Action | Notes |
|------|----------------|-------|
| 1 | Install Node.js 20.x | Download from nodejs.org or use nvm |
| 2 | Verify Node installation | Run `node --version` |
| 3 | Verify npm installation | Run `npm --version` |
| 4 | Clone repository | Use Git to clone the project |
| 5 | Navigate to project | `cd spare_space_frontend` |

### 8.2 Project Installation

| Step | Command | Description |
|------|---------|-------------|
| 1 | `npm install` | Install all dependencies |
| 2 | Create `.env.local` | Copy from `.env.example` and configure |
| 3 | `npm run dev` | Start development server |

### 8.3 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start dev server on localhost:3000 |
| Build | `npm run build` | Create production build |
| Start | `npm run start` | Start production server |
| Lint | `npm run lint` | Run ESLint checks |

### 8.4 IDE Setup Recommendations

**VS Code Extensions:**

| Extension | Purpose |
|-----------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Tailwind CSS IntelliSense | Tailwind autocomplete |
| TypeScript Importer | Auto-import types |
| Error Lens | Inline error display |
| GitLens | Git integration |

**VS Code Settings (recommended):**

| Setting | Value | Purpose |
|---------|-------|---------|
| Format On Save | true | Auto-format code |
| Default Formatter | Prettier | Consistent formatting |
| Tab Size | 4 | Project standard |

---

## 9. Environment Variables

### 9.1 Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.sparespace.com` |
| `NEXT_PUBLIC_API_KEY` | API authentication key | `your-api-key` |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL | `wss://socket.sparespace.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxxx.apps.googleusercontent.com` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` |

### 9.2 Environment File Template

Create a `.env.local` file in the project root with the following structure:

| Variable Name | Required | Description |
|---------------|----------|-------------|
| NEXT_PUBLIC_API_URL | Yes | Main API endpoint |
| NEXT_PUBLIC_API_KEY | Yes | API authentication |
| NEXT_PUBLIC_SOCKET_URL | Yes | Real-time messaging |
| NEXT_PUBLIC_GOOGLE_CLIENT_ID | Yes | OAuth integration |
| NEXT_PUBLIC_GA_ID | No | Analytics tracking |

### 9.3 Environment-Specific Configuration

| Environment | File | Usage |
|-------------|------|-------|
| Development | `.env.local` | Local development |
| Staging | `.env.staging` | Staging server |
| Production | `.env.production` | Production server |

**Important Notes:**
- Never commit `.env.local` to version control
- All public variables must be prefixed with `NEXT_PUBLIC_`
- Server-side variables (without prefix) are not exposed to the browser

---

## 10. API Layer Documentation

### 10.1 Axios Instance Configuration

The application uses a centralized Axios instance located at `src/lib/axiosInstance.ts` with the following configuration:

| Configuration | Value | Purpose |
|---------------|-------|---------|
| Base URL | `NEXT_PUBLIC_API_URL + '/api/v1'` | API endpoint prefix |
| Content-Type | `application/json` | Default content type |
| x-api-key | Environment variable | API authentication |

### 10.2 Request Interceptor

The request interceptor handles:

| Feature | Description |
|---------|-------------|
| Token Injection | Adds `Authorization: Bearer <token>` header |
| Role Detection | Sets `x-role-id` header based on current route (host=2, guest=3) |
| Token Source | Retrieves from localStorage |

### 10.3 Response Interceptor

The response interceptor handles:

| Status | Action |
|--------|--------|
| 2xx | Returns response data |
| 401/403 | Clears localStorage, redirects to login |
| Other errors | Logs error, rejects promise with error data |

### 10.4 API Method Wrappers

Located in `src/services/api.ts`:

| Method | Purpose | Returns |
|--------|---------|---------|
| `Get<T>` | HTTP GET requests | Response data |
| `Post<T, D>` | HTTP POST requests | Response data |
| `Put<T, D>` | HTTP PUT requests | Response data |
| `Patch<T, D>` | HTTP PATCH requests | Response data |
| `Delete<T>` | HTTP DELETE requests | Response data |

### 10.5 API Endpoints Structure

Endpoints are defined in `src/services/endPoints.ts`:

| Category | Examples |
|----------|----------|
| Authentication | `/auth/login`, `/auth/signup`, `/auth/profile` |
| Host Operations | `/host/space-list`, `/host/reservations`, `/host/earnings` |
| Guest Operations | `/guest/spaces`, `/guest/request-booking` |
| Calendar | `/host/calendar`, `/host/add-block-slot` |
| Payments | `/payment/rzp/order` |

### 10.6 TanStack Query Integration

API calls are wrapped in TanStack Query hooks in `src/services/apiService.ts`:

| Hook Type | Pattern | Purpose |
|-----------|---------|---------|
| Query | `useGet...` | Data fetching with caching |
| Mutation | `use...` (action verbs) | Data modification |

**Query Hook Features:**

| Feature | Description |
|---------|-------------|
| Query Keys | Unique identifiers for cache management |
| Stale Time | Default 5-10 minutes depending on data type |
| Enabled | Conditional fetching |
| Refetch | Automatic and manual refetch options |

---

## 11. Authentication Flow

### 11.1 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    NEW USER SIGNUP                       │   │
│  │                                                          │   │
│  │  1. Enter email/password ──► 2. Submit signup form       │   │
│  │                                      │                   │   │
│  │                                      ▼                   │   │
│  │  4. Complete profile ◄──── 3. Receive verification email │   │
│  │         │                                                │   │
│  │         ▼                                                │   │
│  │  5. Verify phone (OTP) ──► 6. Access granted             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    EXISTING USER LOGIN                   │   │
│  │                                                          │   │
│  │  1. Enter credentials ──► 2. Validate with backend       │   │
│  │                                      │                   │   │
│  │                                      ▼                   │   │
│  │  3. Receive access token ──► 4. Store in localStorage    │   │
│  │                                      │                   │   │
│  │                                      ▼                   │   │
│  │  5. Update Redux state ──► 6. Redirect to dashboard      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    GOOGLE OAUTH                          │   │
│  │                                                          │   │
│  │  1. Click Google button ──► 2. Google OAuth popup        │   │
│  │                                      │                   │   │
│  │                                      ▼                   │   │
│  │  3. Receive ID token ──► 4. Send to backend              │   │
│  │                                      │                   │   │
│  │                                      ▼                   │   │
│  │  5. Backend validates ──► 6. Returns access token        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Token Management

| Storage | Key | Value |
|---------|-----|-------|
| localStorage | `accessToken` | JWT access token |
| localStorage | `userData` | Serialized user object |
| localStorage | `userRoles` | Array of user roles |
| localStorage | `hostMode` | Boolean for host/guest mode |

### 11.3 Protected Routes

The `ProtectedRoutesHandler` component manages route protection:

| Route Pattern | Allowed Roles | Behavior if Unauthorized |
|---------------|---------------|--------------------------|
| `/host/*` | host | Redirect to login |
| `/host/account/profile` | host, user | Redirect to login |
| `/guest/*` | Any authenticated | Redirect to login |
| `/login`, `/sign-up/*` | Unauthenticated only | Redirect to home |

### 11.4 Role-Based Access

| Role ID | Role Name | Access |
|---------|-----------|--------|
| 2 | Host | Host dashboard, listings, earnings |
| 3 | Guest | Guest features, bookings, wishlist |

### 11.5 Auth State (Redux)

| State Property | Type | Description |
|----------------|------|-------------|
| `accessToken` | string | JWT token |
| `isAuth` | boolean | Authentication status |
| `user` | object | User profile data |
| `userRole` | array | User roles |

### 11.6 Auth Actions

| Action | Purpose |
|--------|---------|
| `setCredentials` | Store token on login |
| `logout` | Clear all auth data |
| `setUserProfile` | Update user data |
| `setUserRole` | Set user roles |

---

## 12. State Management

### 12.1 State Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────┐    ┌───────────────────────────┐     │
│  │    REDUX TOOLKIT      │    │    TANSTACK QUERY         │     │
│  │    (Client State)     │    │    (Server State)         │     │
│  ├───────────────────────┤    ├───────────────────────────┤     │
│  │                       │    │                           │     │
│  │  • UI State           │    │  • API Data               │     │
│  │  • Auth State         │    │  • Cached Responses       │     │
│  │  • Form State         │    │  • Loading States         │     │
│  │  • User Preferences   │    │  • Error States           │     │
│  │                       │    │  • Refetch Logic          │     │
│  │  Persisted:           │    │                           │     │
│  │  • spaceType          │    │  Auto-managed:            │     │
│  │  • search             │    │  • Query invalidation     │     │
│  │  • booking            │    │  • Background refetch     │     │
│  │                       │    │  • Stale-while-revalidate │     │
│  └───────────────────────┘    └───────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 Redux Store Configuration

| Configuration | Value | Purpose |
|---------------|-------|---------|
| Persist Storage | localStorage | Data persistence |
| Persist Whitelist | spaceType, search, booking | Selective persistence |
| Serializable Check | Customized | Handle persist actions |

### 12.3 Redux Slices

| Slice | Purpose | Persisted |
|-------|---------|-----------|
| `authSlice` | Authentication state | No |
| `spaceTypeSlice` | Selected space types | Yes |
| `homePageSearchSlice` | Search filters | Yes |
| `headerNotificationSlice` | Notification badges | No |
| `bookingSlice` | Booking form data | Yes |

### 12.4 Auth Slice Details

| State | Type | Description |
|-------|------|-------------|
| `accessToken` | string/null | JWT token |
| `tempToken` | string/null | Temporary token |
| `isAuth` | boolean | Login status |
| `user` | object/null | User profile |
| `userRole` | array | User roles |

| Action | Payload | Effect |
|--------|---------|--------|
| `setCredentials` | { accessToken } | Stores token |
| `logout` | none | Clears all auth state |
| `setUserProfile` | user object | Updates user data |
| `setUserRole` | roles array | Sets roles |

### 12.5 Booking Slice Details

| State | Type | Description |
|-------|------|-------------|
| `bookingData` | object/null | Current booking info |
| `isInstantBooking` | boolean | Instant vs request |
| `isLoading` | boolean | Loading state |
| `error` | string/null | Error message |

| Action | Purpose |
|--------|---------|
| `setBookingData` | Set complete booking |
| `setIsInstantBooking` | Toggle booking type |
| `updateBookingDetails` | Partial update |
| `updateMessage` | Update guest message |
| `clearBookingData` | Reset booking |

### 12.6 TanStack Query Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| Stale Time | 5-10 min | Cache duration |
| Refetch On Mount | true | Fresh data on mount |
| Refetch On Window Focus | varies | Background updates |

### 12.7 Query Keys Convention

| Pattern | Example | Description |
|---------|---------|-------------|
| Entity list | `['host-space-list']` | List queries |
| Entity detail | `['space', id]` | Single entity |
| Filtered list | `['reservations', filters, page]` | With params |
| User-specific | `['get-profile']` | User data |

---

## 13. UI Component System

### 13.1 Component Library Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    UI COMPONENT STACK                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    APPLICATION UI                       │    │
│  │  Custom components built for Spare Space                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     shadcn/ui                           │    │
│  │  Pre-styled components with Tailwind                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     Radix UI                            │    │
│  │  Accessible, unstyled primitives                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Tailwind CSS                          │    │
│  │  Utility-first styling                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 Base UI Components (shadcn/ui)

| Component | File | Purpose |
|-----------|------|---------|
| Accordion | `accordion.tsx` | Collapsible content |
| Avatar | `avatar.tsx` | User profile images |
| Badge | `badge.tsx` | Status indicators |
| Button | `button.tsx` | Action buttons |
| Calendar | `calendar.tsx` | Date picker |
| Card | `card.tsx` | Content container |
| Carousel | `carousel.tsx` | Image slider |
| Checkbox | `checkbox.tsx` | Boolean input |
| Command | `command.tsx` | Command palette |
| Dialog | `dialog.tsx` | Modal dialogs |
| Drawer | `drawer.tsx` | Side panels |
| Dropdown Menu | `dropdown-menu.tsx` | Action menus |
| Input | `input.tsx` | Text input |
| Label | `label.tsx` | Form labels |
| Modal | `modal.tsx` | Custom modal |
| Popover | `popover.tsx` | Floating content |
| Radio Group | `radio-group.tsx` | Single selection |
| Scroll Area | `scroll-area.tsx` | Custom scrollbar |
| Select | `select.tsx` | Dropdown select |
| Separator | `separator.tsx` | Visual divider |
| Sheet | `sheet.tsx` | Slide-out panel |
| Table | `table.tsx` | Data tables |
| Tabs | `tabs.tsx` | Tab navigation |
| Textarea | `textarea.tsx` | Multi-line input |
| Toggle | `toggle.tsx` | Toggle buttons |
| Tooltip | `tooltip.tsx` | Hover hints |

### 13.3 Button Variants

| Variant | Usage |
|---------|-------|
| `default` | Primary actions (yellow background) |
| `destructive` | Dangerous actions |
| `outline` | Secondary actions |
| `secondary` | Less prominent actions |
| `ghost` | Minimal styling |
| `link` | Text-only links |
| `disabled` | Disabled state |
| `yellow` | Branded yellow |
| `yellowOutline` | Yellow outlined |
| `tableAction` | Table row actions |

| Size | Usage |
|------|-------|
| `default` | Standard buttons |
| `sm` | Compact buttons |
| `lg` | Large buttons |
| `icon` | Icon-only buttons |
| `xs` | Extra small |

### 13.4 Modal Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | boolean | required | Visibility state |
| `onClose` | function | required | Close handler |
| `title` | string | - | Modal title |
| `description` | string | - | Subtitle text |
| `icon` | ReactNode | - | Header icon |
| `children` | ReactNode | required | Modal content |
| `footer` | ReactNode | - | Footer content |
| `showClose` | boolean | true | Show close button |
| `size` | 'sm'/'md'/'lg' | 'sm' | Modal width |
| `closeOnOverlay` | boolean | true | Click outside closes |

### 13.5 Custom Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Header | `layout/Header.tsx` | App header with nav |
| Footer | `layout/Footer.tsx` | App footer |
| BookingCard | `booking/` | Booking display |
| SpaceCard | `homePage/` | Space listing card |
| FilterSidebar | `common/` | Search filters |
| ChatInterface | `chat-messages/` | Messaging UI |
| ImageCarousel | `common/imageCarousel/` | Image gallery |

### 13.6 Color System

| Color Category | CSS Variable | Hex Value |
|----------------|--------------|-----------|
| Primary P1 | `primary-p1` | #F7CD29 |
| Primary P2 | `primary-p2` | #D89D03 |
| Primary P3 | `primary-p3` | #C98D02 |
| Secondary S1 | `secondary-s1` | #FFFFFF |
| Secondary S2 | `secondary-s2` | #C8C8C8 |
| Tertiary T1 | `tertiary-t1` | #000000 |
| Tertiary T2 | `tertiary-t2` | #161616 |

### 13.7 Typography

| Font | Variable | Usage |
|------|----------|-------|
| Figtree | `--font-figtree` | Primary font |
| Poppins | `--font-poppins` | Headings |

---

## 14. Coding Standards

### 14.1 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BookingCard.tsx` |
| Hooks | camelCase with 'use' prefix | `useBooking.ts` |
| Utils | camelCase | `helperFunctions.ts` |
| Constants | camelCase or UPPER_SNAKE | `path.ts`, `BOOKING_STATUS` |
| Types | PascalCase | `@types.booking.ts` |
| Services | camelCase with '.services' | `auth.services.ts` |
| Slices | camelCase with 'Slice' suffix | `authSlice.ts` |

### 14.2 Component Structure

| Section | Order | Description |
|---------|-------|-------------|
| 1 | Imports | External, then internal |
| 2 | Types/Interfaces | Component-specific types |
| 3 | Component | Function declaration |
| 4 | Hooks | All hooks at top |
| 5 | Handlers | Event handlers |
| 6 | Effects | useEffect hooks |
| 7 | Render | JSX return |
| 8 | Export | Named or default |

### 14.3 Import Organization

| Order | Category | Example |
|-------|----------|---------|
| 1 | React | `import React from 'react'` |
| 2 | Next.js | `import { useRouter } from 'next/navigation'` |
| 3 | External libs | `import { toast } from 'react-toastify'` |
| 4 | Internal components | `import { Button } from '@/components/ui/button'` |
| 5 | Hooks | `import { useLogin } from '@/services/apiService'` |
| 6 | Utils | `import { cn } from '@/lib/utils'` |
| 7 | Types | `import type { Space } from '@/types'` |
| 8 | Assets | `import logo from '@/assets/logo.svg'` |

### 14.4 TypeScript Guidelines

| Guideline | Description |
|-----------|-------------|
| Explicit types | Type function parameters and returns |
| Interfaces over types | Prefer interface for objects |
| Avoid `any` | Use specific types when possible |
| Use generics | For reusable typed functions |
| Export types | Make types available for imports |

### 14.5 ESLint Configuration

The project uses ESLint 9 with Next.js configuration. Current relaxed rules:

| Rule | Setting | Reason |
|------|---------|--------|
| `@typescript-eslint/no-explicit-any` | off | Flexibility during development |
| `@typescript-eslint/no-unused-vars` | off | Development convenience |
| `@typescript-eslint/no-empty-function` | off | Placeholder functions |

### 14.6 Prettier Configuration

| Setting | Value |
|---------|-------|
| Tab Width | 4 spaces |
| Single Quote | Yes |
| Trailing Comma | es5 |
| Print Width | 100 |
| Semi | Yes |

### 14.7 Git Commit Conventions

| Type | Description |
|------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `style:` | Formatting (no code change) |
| `refactor:` | Code restructuring |
| `test:` | Adding tests |
| `chore:` | Maintenance |

**Commit Message Format:**
- Type: Short description (50 chars max)
- Body: Detailed explanation if needed
- Footer: Issue references

---

## 15. Custom Hooks Documentation

### 15.1 API Error Handler

**Location:** `src/hooks/handleApiError.ts`

**Purpose:** Centralized error handling for API responses

| Feature | Description |
|---------|-------------|
| Array errors | Iterates and displays each error |
| Object errors | Extracts and displays error messages |
| Single message | Displays with capitalized first letter |
| Fallback | Shows "Something went wrong" |

### 15.2 Chat Hooks

**Location:** `src/hooks/chatMessage.ts`

| Hook | Purpose | Parameters |
|------|---------|------------|
| `useChatUsers` | Fetch conversation list | userId, search |
| `useChatMessages` | Fetch message history | senderId, receiverId, bookingId, page, limit |
| `useLastBooking` | Get last booking details | id |
| `useMyBookings` | Get user's bookings | none |
| `useBookingMessages` | Get booking-related messages | isOnHost |

### 15.3 Verify API Error Handler

**Location:** `src/hooks/handleVerifyApiError.ts`

**Purpose:** Specialized error handling for verification flows

### 15.4 API Service Hooks (TanStack Query)

**Location:** `src/services/apiService.ts`

**Authentication Hooks:**

| Hook | Type | Purpose |
|------|------|---------|
| `useLogin` | Mutation | User login |
| `useLogout` | Mutation | User logout |
| `useSignup` | Mutation | New user registration |
| `useGoogleAuthLogin` | Mutation | Google OAuth |
| `useGetOtp` | Mutation | Request OTP |
| `useVerifyMobileOtp` | Mutation | Verify phone OTP |
| `useVerifyEmail` | Query | Verify email token |
| `useForgotPassword` | Mutation | Password reset request |
| `useResetPassword` | Mutation | Set new password |

**Profile Hooks:**

| Hook | Type | Purpose |
|------|------|---------|
| `useGetProfile` | Query | Fetch user profile |
| `useUpdateProfile` | Mutation | Update profile |
| `useUploadImage` | Mutation | Upload profile image |

**Space Hooks:**

| Hook | Type | Purpose |
|------|------|---------|
| `useGetSpaceList` | Query | Host's space list |
| `useGetSpaceDetails` | Query | Space details |
| `useGetCategories` | Query | Space categories |
| `useGetSpaceTypes` | Query | Space types |
| `useGetAmenities` | Query | Available amenities |

**Booking Hooks:**

| Hook | Type | Purpose |
|------|------|---------|
| `useRequestBooking` | Mutation | Create booking request |
| `useGuestInstantBooking` | Mutation | Instant booking |
| `useApproveBooking` | Mutation | Host approves booking |
| `useRejectBooking` | Mutation | Host rejects booking |
| `useCancelBooking` | Mutation | Cancel booking |

**Listing Creation Hooks (9 Steps):**

| Hook | Step | Purpose |
|------|------|---------|
| `useUpdateSpaceListStep1` | 1 | Basic info |
| `useUpdateSpaceListStep2` | 2 | Rules & amenities |
| `useUpdateSpaceListStep3` | 3 | Images |
| `useUpdateSpaceListStep4` | 4 | Operating hours |
| `useUpdateSpaceListStep5` | 5 | Location |
| `useUpdateSpaceListStep6` | 6 | Pricing |
| `useUpdateSpaceListStep7` | 7 | Policies |
| `useUpdateSpaceListStep8` | 8 | Cancellation |
| `useUpdateSpaceListStep9` | 9 | Verification docs |

---

## 16. Routing & Navigation

### 16.1 App Router Structure

```
app/
├── (afterAuth)/              # Protected route group
│   ├── guest/                # Guest pages
│   │   ├── home/             # Guest home
│   │   ├── account/          # Profile, verification
│   │   ├── my-bookings/      # Booking history
│   │   ├── wishlists/        # Saved spaces
│   │   ├── chat-messages/    # Guest chat
│   │   ├── space-details/    # Space view
│   │   ├── host-profile/     # Host view
│   │   └── guest-details/    # Guest profile view
│   │
│   ├── host/                 # Host pages
│   │   ├── space/            # Space management
│   │   │   ├── your-listings/
│   │   │   ├── reservations/
│   │   │   ├── earnings/
│   │   │   ├── calendar/
│   │   │   ├── booking-requests/
│   │   │   └── chat-messages/
│   │   └── account/          # Host account
│   │       ├── profile/
│   │       ├── verification/
│   │       └── link-payout/
│   │
│   └── layout.tsx            # Shared layout
│
├── (beforeAuth)/             # Auth pages
│   ├── login/                # Login
│   ├── sign-up/              # Registration
│   └── forgot-password/      # Password recovery
│
├── about/                    # Public pages
├── articles/
├── blogs/
├── contact/
├── faq/
├── privacy/
├── terms/
└── cancellationPolicy/
```

### 16.2 Path Constants

**Location:** `src/constants/path.ts`

| Category | Path | Description |
|----------|------|-------------|
| **Common** | | |
| HOME_PAGE | `/guest/home` | Main landing |
| LOGIN | `/login` | Login page |
| SIGN_UP | `/sign-up` | Registration |
| **Host** | | |
| YOUR_LISTING | `/host/space/your-listings` | Listings |
| RESERVATIONS | `/host/space/reservations` | Reservations |
| HOST_CALENDAR | `/host/space/calendar` | Calendar |
| HOST_EARNINGS | `/host/space/earnings` | Earnings |
| **Guest** | | |
| GUEST_MY_BOOKINGS | `/guest/my-bookings` | Bookings |
| GUEST_WISHLISTS | `/guest/wishlists` | Wishlist |
| GUEST_SPACE_DETAILS | `/guest/space-details` | Space view |

### 16.3 Route Protection Logic

| Check | Condition | Action |
|-------|-----------|--------|
| Protected route | Not authenticated | Redirect to login |
| Protected route | Wrong role | Redirect to home |
| Auth route | Already authenticated | Redirect to home |

### 16.4 Navigation Patterns

| Pattern | Implementation | Usage |
|---------|----------------|-------|
| Programmatic | `useRouter().push()` | Button clicks |
| Link | `<Link href="">` | Static navigation |
| Replace | `router.replace()` | Auth redirects |
| Back | `router.back()` | Back navigation |

### 16.5 Dynamic Routes

| Route | Parameter | Example |
|-------|-----------|---------|
| `/blogs/[slug]` | Blog slug | `/blogs/my-article` |
| `/guest/space-details/[id]` | Space ID | `/guest/space-details/123` |
| `/guest/host-profile/[id]` | Host ID | `/guest/host-profile/456` |

---

## 17. Data Fetching Strategy

### 17.1 Fetching Patterns Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FETCHING PATTERNS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  CLIENT-SIDE RENDERING (CSR)                            │    │
│  │  - TanStack Query hooks                                 │    │
│  │  - useEffect + useState                                 │    │
│  │  - Used for: Dynamic user data, real-time updates       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SERVER-SIDE RENDERING (SSR)                            │    │
│  │  - async Server Components                              │    │
│  │  - fetch() in page components                           │    │
│  │  - Used for: SEO-critical pages                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  STATIC GENERATION (SSG)                                │    │
│  │  - generateStaticParams                                 │    │
│  │  - Used for: Blog posts, static content                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 17.2 TanStack Query Usage

| Scenario | Hook Type | Example |
|----------|-----------|---------|
| Read data | useQuery | `useGetProfile()` |
| Create data | useMutation | `useRequestBooking()` |
| Update data | useMutation | `useUpdateProfile()` |
| Delete data | useMutation | `useDeleteSpace()` |

### 17.3 Query Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `staleTime` | 5-10 min | Data freshness threshold |
| `enabled` | true | Conditional fetching |
| `refetchOnMount` | true | Refetch on component mount |
| `refetchOnWindowFocus` | varies | Refetch on tab focus |
| `retry` | 3 | Retry failed requests |

### 17.4 Cache Invalidation

| Trigger | Method | Usage |
|---------|--------|-------|
| After mutation | `queryClient.invalidateQueries` | Refetch related data |
| Manual | `refetch()` | User-triggered refresh |
| Time-based | `staleTime` expiry | Automatic staleness |

### 17.5 Loading & Error States

| State | TanStack Query Property | UI Pattern |
|-------|-------------------------|------------|
| Loading | `isLoading`, `isFetching` | Skeleton/Spinner |
| Error | `isError`, `error` | Error message |
| Success | `isSuccess`, `data` | Render content |
| Empty | `data?.length === 0` | Empty state |

---

## 18. Performance Guidelines

### 18.1 React Optimization Techniques

| Technique | When to Use | Implementation |
|-----------|-------------|----------------|
| `React.memo` | Expensive re-renders | Wrap component |
| `useMemo` | Expensive calculations | Memoize value |
| `useCallback` | Callback prop stability | Memoize function |
| `lazy` | Code splitting | Dynamic imports |

### 18.2 Image Optimization

| Feature | Implementation | Benefit |
|---------|----------------|---------|
| Next/Image | `<Image>` component | Auto optimization |
| Remote patterns | `next.config.ts` | Allowed domains |
| Priority | `priority` prop | LCP optimization |
| Lazy loading | Default behavior | Reduced initial load |

**Configured Remote Domains:**
- `spacespare.s3.ap-south-1.amazonaws.com`
- `images.unsplash.com`
- `wordpress.antino.ca`
- `secure.gravatar.com`

### 18.3 Bundle Optimization

| Strategy | Implementation |
|----------|----------------|
| Dynamic imports | `dynamic()` from Next.js |
| Tree shaking | ES modules |
| Code splitting | Route-based automatic |

### 18.4 Performance Metrics

| Metric | Target | Tool |
|--------|--------|------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| TTI | < 3.8s | Lighthouse |

### 18.5 Caching Strategies

| Data Type | Strategy | Duration |
|-----------|----------|----------|
| User profile | TanStack Query | Until invalidation |
| Space list | TanStack Query | 5 min stale |
| Static content | SSG | Build time |
| API responses | Axios | No client cache |

---

## 19. Error Handling

### 19.1 Error Handling Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING LAYERS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  COMPONENT LEVEL                                        │    │
│  │  - try/catch in handlers                                │    │
│  │                                                         │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  HOOK LEVEL                                             │    │
│  │  - TanStack Query onError                               │    │
│  │  - handleApiError utility                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  API LEVEL                                              │    │
│  │  - Axios interceptors                                   │    │
│  │  - 401/403 handling                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 19.2 Error Response Format

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Operation result |
| `message` | string | Error message |
| `errors` | array/object | Detailed errors |

### 19.3 Toast Notification System

**Library:** React Toastify

| Toast Type | Usage |
|------------|-------|
| `toast.success()` | Successful operations |
| `toast.error()` | Error messages |
| `toast.info()` | Informational messages |
| `toast.warning()` | Warning messages |

### 19.4 HTTP Error Handling

| Status Code | Action |
|-------------|--------|
| 400 | Show validation errors |
| 401 | Clear auth, redirect to login |
| 403 | Clear auth, redirect to login |
| 404 | Show not found message |
| 500 | Show generic error |

### 19.5 Form Validation Errors

| Source | Handling |
|--------|----------|
| Client validation | Inline error messages |
| Server validation | Toast notifications |
| Field-level | Display under input |

---

## 20. Logging Strategy

### 20.1 Current Logging Approach

| Environment | Console Logs | Production Logs |
|-------------|--------------|-----------------|
| Development | Enabled | N/A |
| Production | Disabled | Server-side only |

### 20.2 Logging Categories

| Category | Purpose | Location |
|----------|---------|----------|
| API Errors | Debug API issues | axiosInstance |
| Socket Events | Debug real-time | socket.ts |
| Auth Events | Debug auth flow | authSlice |

### 20.3 Recommended Logging Practices

| Practice | Description |
|----------|-------------|
| Use environment checks | Only log in development |
| Remove sensitive data | Never log tokens/passwords |
| Structured logging | Consistent log format |
| Error context | Include relevant state |

### 20.4 Analytics Integration

**Google Analytics:**

| Event Category | Examples |
|----------------|----------|
| Page Views | Automatic tracking |
| User Actions | Button clicks, form submissions |
| Conversions | Bookings, registrations |

---

## 21. SEO Documentation

### 21.1 Metadata Configuration

**Location:** `app/layout.tsx`

| Meta Tag | Value | Purpose |
|----------|-------|---------|
| title | "Spare Space" | Page title |
| description | (to be added) | Page description |
| icon | "/favicon.svg" | Favicon |

### 21.2 SEO Best Practices

| Practice | Implementation |
|----------|----------------|
| Semantic HTML | Proper heading hierarchy |
| Meta descriptions | Per-page descriptions |
| Alt text | Image descriptions |
| Structured data | JSON-LD schemas |
| Sitemap | Auto-generated |
| Robots.txt | Crawl instructions |

### 21.3 Dynamic Metadata

| Page Type | Metadata Source |
|-----------|-----------------|
| Space details | API data |
| Blog posts | CMS content |
| User profiles | User data |

### 21.4 OpenGraph Tags

| Tag | Purpose |
|-----|---------|
| og:title | Social share title |
| og:description | Social share description |
| og:image | Social share image |
| og:url | Canonical URL |

---

## 22. Testing Documentation

### 22.1 Testing Strategy (Recommended)

| Test Type | Tool | Coverage |
|-----------|------|----------|
| Unit Tests | Jest | Utilities, hooks |
| Component Tests | React Testing Library | UI components |
| Integration Tests | Playwright/Cypress | User flows |
| E2E Tests | Playwright/Cypress | Critical paths |

### 22.2 Test File Organization

| Convention | Example |
|------------|---------|
| Component tests | `Button.test.tsx` |
| Hook tests | `useAuth.test.ts` |
| Utility tests | `helpers.test.ts` |
| Test folder | `__tests__/` directory |

### 22.3 Testing Priorities

| Priority | Area | Reason |
|----------|------|--------|
| High | Authentication | Security critical |
| High | Booking flow | Business critical |
| Medium | Form validation | User experience |
| Medium | Navigation | Core functionality |
| Low | Static pages | Low risk |

---

## 23. Deployment Guide

### 23.1 Build Process

| Step | Command | Output |
|------|---------|--------|
| Install | `npm install` | node_modules |
| Build | `npm run build` | .next folder |
| Start | `npm run start` | Production server |

### 23.2 Environment Configuration

| Environment | Variables Source |
|-------------|------------------|
| Development | `.env.local` |
| Staging | CI/CD secrets |
| Production | CI/CD secrets |

### 23.3 Jenkins Pipeline

**File:** `Jenkinsfile`

| Stage | Action |
|-------|--------|
| Build & Deploy | Execute deploy script |

### 23.4 Deployment Checklist

| Item | Check |
|------|-------|
| Environment variables set | ☐ |
| Build successful | ☐ |
| API connectivity verified | ☐ |
| SSL certificate valid | ☐ |
| CDN configured | ☐ |
| Monitoring enabled | ☐ |

### 23.5 Vercel Deployment (Alternative)

| Configuration | Value |
|---------------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

---

## 24. Common Problems & Debugging

### 24.1 Build Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Module not found | Missing dependency | Run `npm install` |
| Type errors | TypeScript issues | Check types, use `any` temporarily |
| ESLint errors | Linting failures | Fix issues or disable rules |

### 24.2 Runtime Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Hydration mismatch | Server/client diff | Check for browser-only code |
| localStorage not defined | SSR access | Use `typeof window` check |
| 401 Unauthorized | Token expired | Re-login, check token |

### 24.3 API Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS error | Cross-origin blocked | Check API configuration |
| Network error | API unreachable | Verify API URL, network |
| 500 error | Server issue | Check backend logs |

### 24.4 State Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Stale data | Cache not invalidated | Invalidate queries |
| State not updating | Incorrect dispatch | Check action/reducer |
| Persist not working | Storage issues | Clear localStorage |

### 24.5 Debugging Tools

| Tool | Purpose |
|------|---------|
| React DevTools | Component inspection |
| Redux DevTools | State inspection |
| Network tab | API debugging |
| Console | Error messages |

---

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Last Updated | November 2025 |
| Maintained By | Spare Space Development Team |
| Project | Spare Space Frontend |

---

*This documentation is a living document and should be updated as the project evolves.*

