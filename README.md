# SpeakUp

> **Practice More. Speak Better.**

SpeakUp is a premium, professional-grade English learning platform designed around building and maintaining language habits. With bite-size lessons, instant feedback, and gamified elements like streaks and XP, SpeakUp makes language learning seamless and engaging.

## 🌟 Features

- **Structured Courses:** Progress from beginner to advanced English with carefully curated, bite-size modules.
- **Instant Feedback:** Receive immediate corrections and explanations on multiple-choice exercises.
- **Gamified Learning:** Earn XP, unlock achievements, and maintain your daily streak to build a consistent habit.
- **Progress Dashboard:** Track your learning minutes, accuracy, and weak areas with an interactive visual dashboard.
- **Modern UI:** A sophisticated "Slate & Indigo" design system built for focus and readability.

## 🛠️ Tech Stack

- **Frontend Framework:** React 18, Vite
- **Styling:** Tailwind CSS, shadcn/ui (Radix UI primitives)
- **State Management & Routing:** React Router, React Hook Form, Zod
- **Backend / Auth:** Supabase
- **Icons & Typography:** Lucide React, Inter (Google Fonts)

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Nikhilmanth/SpeakUp.git
   cd SpeakUp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 🌐 Deployment (Netlify)

This project is configured for seamless deployment on Netlify. A `netlify.toml` file is included in the root directory to handle build commands and routing rules.

1. Connect your GitHub repository to Netlify.
2. Netlify will automatically detect the Vite build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. The `netlify.toml` file ensures that all React Router paths correctly redirect to `index.html` without 404 errors.

## 📄 License

This project is licensed under the MIT License.
