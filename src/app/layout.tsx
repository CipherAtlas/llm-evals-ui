// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Multi-Model Prompt Testing Tool",
  description: "A tool for testing prompts across multiple LLM providers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
