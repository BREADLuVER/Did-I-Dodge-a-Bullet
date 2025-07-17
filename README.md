# 🚩 Did I Dodge a Bullet?

Post-interview red flag bingo for the quietly suspicious.

You just finished an interview. You're not sure how to feel. Something was... off. But it wasn't overt enough to call a red flag-just that quiet little tug in your gut.

**Did I Dodge a Bullet?** is a simple, self-guided bingo experience that helps you unpack those moments. It's a subtle, slightly cynical, and deeply honest tool for reflecting on interviews before you sign a contract you'll regret.

## 🎯 What It Is

A web-based 3x3 bingo board, filled with **research-backed red flags** pulled from real-world interview experiences on Reddit, Glassdoor, and job seeker communities-like:

- "They described the team as a 'family'"
- "Recruiter bombards with 45 texts & 15 calls in 3 days"
- "They ask if you work weekends for free"
- "Office feels tense-no one smiles"

You click the ones you experienced. Get a bingo? You might've dodged a bullet.

## ✨ Features

- **3x3 Balanced Board**: Each board contains 3 light, 3 medium, and 3 heavy red flags
- **Research-Backed Content**: All red flags sourced from real interview experiences
- **Smart Tooltips**: Hover over squares to see "Why this matters" explanations
- **No Forced Sharing**: Stay on the board, screenshot when ready
- **Bingo Detection**: Automatic detection with fun animations (no forced redirects)
- **Download Results**: Get a detailed text report of your findings
- **Responsive Design**: Works perfectly on mobile and desktop
- **Accessibility**: Full keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/did-i-dodge-a-bullet.git
cd did-i-dodge-a-bullet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```bash
   # Site Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # Firebase Configuration (see FIREBASE_SETUP.md for details)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run analyze` - Analyze bundle size and dependencies
- `npm run perf` - Test production build performance
- `npm run clean` - Clean development environment

## 🎮 How to Play

1. **Start a New Game**: The board loads with 9 balanced red flags (3 light, 3 medium, 3 heavy)
2. **Mark Your Experience**: Click squares that match what you experienced in your interview
3. **Get Bingo**: Complete any row, column, or diagonal for a bingo (with animation!)
4. **Stay on Board**: No forced redirects-keep marking as many as you want
5. **Share or Download**: Screenshot your board or download a detailed report
6. **Start Over**: Click "New Board" for a fresh set of red flags

## 🎨 Design Philosophy

- **Research-Backed**: All red flags come from real interview experiences
- **Balanced Severity**: Mix of subtle gut-pulls and serious red flags
- **Educational**: Tooltips explain why each flag matters
- **Non-Judgmental**: Focus on reflection, not telling you what to do
- **Screenshot-Friendly**: Clean design perfect for sharing

## 📊 Red Flag Categories

### Light (Subtle Gut Pulls)
- "They described the team as a 'family'"
- "Culture is 'hardworking'-no examples given"
- "They need someone 'very flexible' with schedule"

### Medium (Noticeable Details)
- "Conflicting job descriptions from different interviewers"
- "They dodge career growth or salary questions"
- "Interviewers speak poorly about colleagues or past teams"

### Heavy (Commonly Serious)
- "Predecessor only lasted a few weeks/months"
- "Recruiter bombards with 45 texts & 15 calls in 3 days"
- "They ask if you work weekends for free"

## 🔮 Future Features

- Community-submitted red flags with moderation
- Green Flag Bingo for celebrating great interviews
- Company Bullet Report section for anonymous pattern logging
- Job seeker analytics on common red flag clusters
- Dark mode support
- Multiple language support
- Local storage for saving board state

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Adding New Red Flags

To add new red flags, edit the `lib/redFlags.ts` file:

```typescript
{
  id: 'unique-identifier',
  text: 'Description of the red flag',
  category: 'culture' | 'leadership' | 'role' | 'process' | 'communication' | 'compensation' | 'stability' | 'environment',
  severity: 'light' | 'medium' | 'heavy',
  explanation: 'Why this matters...'
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by countless job seekers who trusted their instincts
- Red flags sourced from Reddit, Glassdoor, Stack Exchange, and job seeker communities
- Built for everyone who's ever felt that quiet tug in their gut after an interview
- Thanks to the open source community for the amazing tools that made this possible

---

**Remember**: Trust your instincts. You deserve better. 💪