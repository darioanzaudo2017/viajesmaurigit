import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-solid border-trek-border bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-10 py-3">
            <div className="max-w-[1280px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-primary">
                        <div className="size-6">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">TrekManager</h2>
                    </div>
                    <nav className="hidden lg:flex items-center gap-6">
                        <a className="text-white text-sm font-medium hover:text-primary transition-colors" href="#">Trips</a>
                        <a className="text-trek-text-muted text-sm font-medium hover:text-white transition-colors" href="#">Guides</a>
                        <a className="text-trek-text-muted text-sm font-medium hover:text-white transition-colors" href="#">Participants</a>
                        <a className="text-trek-text-muted text-sm font-medium hover:text-white transition-colors" href="#">Inventory</a>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <button className="p-2 text-trek-text-muted hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">cloud_done</span>
                        </button>
                        <button className="p-2 text-trek-text-muted hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="p-2 text-trek-text-muted hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                    <div
                        className="size-10 rounded-full bg-cover bg-center border border-trek-border"
                        title="User Profile"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBVsdGFsrZQYh8X-ZV6tmDdnjH1AEZrFo71TUyf9-58xd_mD_W8j4Z2XcRFCzUySIKscNIPN5x3JDAPmG1BdmMT5JdjxKEdc6E-xigexGgd8zASCtxW3L50days4MNcA2_bohL_hpZmyTJdvI_ZMqVCUsOmAgCnkyl4HT9zxcysZ83r11C_a4EkFkvceziHd023xHR-ff6oIZFBpAiljIu_cSV01NFuNmcff9eoLpc8mNA1IwWSJXVUZVS0v4uYwWCs0c-QxD2HgAUs")' }}
                    ></div>
                </div>
            </div>
        </header>
    );
};

export default Header;
