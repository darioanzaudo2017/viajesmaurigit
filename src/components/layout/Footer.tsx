import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="fixed bottom-0 w-full bg-background-dark/90 backdrop-blur-md border-t border-trek-border px-6 py-2 flex items-center justify-between z-50">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-trek-text-muted text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span>System Online</span>
                </div>
                <div className="h-4 w-px bg-trek-border"></div>
                <div className="text-trek-text-muted text-xs">
                    Last synced: Just now
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="text-trek-text-muted hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">help</span>
                </button>
            </div>
        </footer>
    );
};

export default Footer;
