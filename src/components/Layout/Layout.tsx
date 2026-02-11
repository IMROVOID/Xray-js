import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-white/20">
            <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-background to-background pointer-events-none" />
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 pt-24 relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
