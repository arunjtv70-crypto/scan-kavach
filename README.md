# Scam Kavach

AI shield for Indians against digital arrest, fake KYC and job fraud scams. A mobile-first, bilingual application designed to quickly identify scams and provide immediate rescue steps.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- Google Gemini API (`@google/genai`)

## Local Setup

1. **Install Dependencies**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```

3. **Run the Development Server**
   Start the local server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

To test the application:
1. Navigate to the **Scan** page (`/scan`).
2. Test with the following sample messages:
   - **Sample 1 (Scam):** "Dear customer, your electricity power will be disconnected tonight at 9:30 PM. Update your KYC immediately by calling this number."
   - **Sample 2 (Scam):** "CBI Alert: Your Aadhaar is linked to illegal money laundering. Click the link to clear your name or face digital arrest."
   - **Sample 3 (Scam):** "Congratulations! You have been selected for a part-time job. Earn 5000 INR daily by liking YouTube videos."
   - **Sample 4 (Safe):** "Hey mom, I'll be late for dinner today. See you at 8."
3. Observe the verdict, risk score, and recommended next steps for each input.

## Vercel Deployment

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. In the configuration settings, go to **Environment Variables** and add:
   - `GEMINI_API_KEY` (with your production API key)
5. Click **Deploy**. Vercel will automatically build and deploy the Next.js application.

## Quality Rules Followed
- No database or external auth. Backend logic runs purely in Next.js Route Handlers (`/api/scan`, `/api/rescue`).
- Strict premium Indian UI design system (Ivory background, Ink text, Forest Green primary, Saffron Gold accent, Brick Red danger).
- No emojis, stock illustrations, or generic assets.
- Responsive mobile-first design.
- Handles API failures gracefully with friendly fallbacks.
