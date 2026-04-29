<div align="center">
  <div style="background-color: #4F46E5; width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  </div>

  <h1>SpeakUp</h1>
  <p><strong>Practice More. Speak Better.</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#seeding-content">Seeding Content</a>
  </p>
</div>

<br />

SpeakUp is a premium, professional-grade English learning platform designed around building and maintaining language habits. With bite-size lessons, instant feedback, and gamified elements like streaks and XP, SpeakUp makes language learning seamless and engaging.

## 🌟 Features

- **Structured Courses:** Progress from beginner to advanced English with carefully curated, bite-size modules.
- **Interactive Quizzes:** Timed assessments with multiple-choice questions and immediate, detailed explanations.
- **Gamified Learning:** Earn XP, unlock achievement badges, and maintain your daily streak to build a consistent habit.
- **Progress Dashboard:** Track your learning minutes, accuracy, and weak areas with an interactive visual dashboard.
- **Premium UI:** A sophisticated, highly polished "Slate & Indigo" design system built for focus and readability, featuring split-screen authentication and dynamic charts.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS, Shadcn/UI (Radix UI primitives)
- **State & Routing:** React Router, React Hook Form, Zod
- **Visuals:** Recharts (Data Visualization), Lucide React (Icons), Inter (Typography)

### Backend & Infrastructure
- **Database & Auth:** Supabase (PostgreSQL)
- **Deployment:** Netlify

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/Nikhilmanth/SpeakUp.git
cd SpeakUp
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

### 4. Start the development server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📚 Seeding Presentation Content

To make the platform truly shine for presentations and showcases, a highly realistic database seed script is provided. This will populate your Supabase database with professional "Business English" and "Travel" courses, rich Markdown lessons, interactive quizzes, and badges.

**How to inject this content into your live database:**

1. Open your project in the **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Go to the **SQL Editor** on the left menu.
3. Open the `supabase/seed.sql` file located in this repository.
4. **Copy all the text** inside `seed.sql`.
5. **Paste** it into a new query in the Supabase SQL Editor and hit **Run**.

*(Note: This script will safely clear out any existing dummy courses and badges to ensure a clean slate, but your user accounts and XP will not be affected).*

---

## 🌐 Deployment (Netlify)

This project is configured for seamless deployment on Netlify. A `netlify.toml` file is included in the root directory to handle build commands and routing rules.

1. Connect your GitHub repository to Netlify.
2. Add your `VITE_SUPABASE_*` environment variables in the Netlify dashboard.
3. Netlify will automatically detect the Vite build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. The `netlify.toml` file ensures that all React Router paths correctly redirect to `index.html` without 404 errors.

---

## 📄 License

This project is licensed under the MIT License.
