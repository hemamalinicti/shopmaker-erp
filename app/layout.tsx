import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShopMaster - Retail Shop ERP',
  description: 'Simple, fast micro ERP system for small retail shops',
};

const speculationRules = {
  prefetch: [
    {
      where: {
        and: [
          { href_matches: '/*' },
          { not: { href_matches: '/login' } },
          { not: { selector_matches: '.no-prefetch' } },
        ],
      },
      eagerness: 'moderate',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speculationRules) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
