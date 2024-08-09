
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import RootProviders from "@/components/providers/RootProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "CashFlow",
	description: "Your personal Finance Assistant",
};

export default function RootLayout({
  	children,
}: {
  	children: React.ReactNode;
}) {
  return (
		<ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/sign-in">
			<html lang="en" className="dark" style={{ colorScheme: "dark" }}>
				<body className={inter.className}>
					<RootProviders>
						{children}
					</RootProviders>
				</body>
			</html>
		</ClerkProvider>
	);
}
