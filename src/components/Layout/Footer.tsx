import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-border/40 py-8 mt-auto bg-background/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} Xray-js. Open Source.</p>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <p>Powered by WebAssembly & Go</p>
                    <span>•</span>
                    <a href="https://github.com/IMROVOID" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        Developed by IMROVOID
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
