import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Book, Github, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Live Demo', path: '/', icon: <Activity className="w-4 h-4 mr-2" /> },
        { name: 'Documentation', path: '/docs', icon: <Book className="w-4 h-4 mr-2" /> },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-background/80 backdrop-blur-md border-border/40' : 'bg-transparent border-transparent'
                }`}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 group">
                    <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                        X
                    </div>
                    <span className="font-bold text-lg tracking-tight">Xray-js</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
                                }`}
                        >
                            {link.icon}
                            {link.name}
                        </Link>
                    ))}
                    <a
                        href="https://github.com/IMROVOID/xray-js"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-muted-foreground hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background border-b border-border/40 overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center p-2 rounded-md ${location.pathname === link.path ? 'bg-secondary/50 text-white' : 'text-muted-foreground'
                                        }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}
                            <a
                                href="https://github.com/IMROVOID/xray-js"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-2 text-muted-foreground"
                            >
                                <Github className="w-4 h-4 mr-2" />
                                GitHub
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
