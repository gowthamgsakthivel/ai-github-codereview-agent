import './globals.css';

export const metadata = {
  title: 'AI GitHub Code Review Agent | 100% Free PR Reviewer',
  description: 'Automated, agentic GitHub Pull Request code reviewer powered by Google Gemini AI and Vercel Serverless.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
