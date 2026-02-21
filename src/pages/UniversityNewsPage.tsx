import React, { useEffect } from 'react';

interface UniversityNewsPageProps {
    onBack: () => void;
}

const UniversityNewsPage: React.FC<UniversityNewsPageProps> = ({ onBack }) => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="relative flex h-screen w-full flex-col rugged-grid overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <style>
                {`
                .rugged-grid {
                    background-image: radial-gradient(circle, #1a2e22 1px, transparent 1px);
                    background-size: 30px 30px;
                }
                .scroll-indicator {
                    height: 3px;
                    background: #13ec6d;
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 100;
                }
                .prose p {
                    margin-bottom: 1.5rem;
                    line-height: 1.75;
                    color: #d1d5db;
                }
                `}
            </style>

            {/* Scroll Progress Indicator */}
            <div className="scroll-indicator w-[35%]"></div>

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent z-10"></div>
                    <img alt="Modern university campus building" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuqKmUPJ3TqyFBsx-hjfNDAnGAxk-mgegj74SVdp2PrlO4RjLZ_xdCBg9GGKDzM3FWQI-TeMgLlNeH_nGQNRk_tvS5NS5jQLehqHBhUedJcPzwILemXEqh0iSWBveAEdZHaG8x1ijQAaJRRXM5GTEh0i72MHM9BgtHgG7EGFjIfy_f-CF8rhmHKZ6k6uIfXNpcRgMrgW0XU-sWjR48fzLCxj2DpnQriSdKewNSLqgrkEpcsZshDmqROunkNRp3lobbh2D8pkklywSN" />
                    <div className="absolute bottom-0 left-0 w-full z-20 px-6 lg:px-20 pb-12">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-primary text-background-dark text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_15px_-3px_rgba(19,236,109,0.4)]">Infraestructura</span>
                                <span className="text-white/60 text-sm flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">calendar_today</span>
                                    Febrero 21, 2026
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 animate-in fade-in slide-in-from-left-4 duration-700">Apertura del Nuevo Centro de Simulación Médica</h2>
                            <p className="text-xl text-white/80 max-w-2xl font-light italic">Liderando la innovación en educación de salud con tecnología de vanguardia y entornos realistas.</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-7xl mx-auto px-6 lg:px-20 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Article Column */}
                    <article className="lg:col-span-8">
                        <div className="flex items-center mb-8">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-300 uppercase tracking-widest text-xs"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Volver a Universidad
                            </button>
                            <div className="ml-auto flex gap-4">
                                <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:text-background-dark transition-all duration-300">
                                    <span className="material-symbols-outlined text-lg">share</span>
                                </button>
                                <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:text-background-dark transition-all duration-300">
                                    <span className="material-symbols-outlined text-lg">bookmark</span>
                                </button>
                            </div>
                        </div>

                        <div className="prose dark:prose-invert prose-lg max-w-none text-slate-300">
                            <p className="text-xl font-medium text-white mb-8 border-l-4 border-primary pl-6">La Universidad ha inaugurado oficialmente el Centro de Simulación Médica (CSM), una instalación de 1.200 metros cuadrados que redefine los estándares de la formación clínica en la región.</p>

                            <h3 className="text-2xl font-bold text-white mt-10 mb-4 uppercase tracking-tight">Innovación en el Corazón del Campus</h3>
                            <p>Este nuevo espacio cuenta con salas de alta fidelidad equipadas con simuladores robóticos de última generación que pueden reaccionar de manera autónoma a tratamientos médicos. Desde partos simulados hasta emergencias quirúrgicas críticas, el centro permite a los estudiantes practicar en un entorno seguro y controlado.</p>

                            <div className="my-10 rounded-[32px] overflow-hidden border border-white/10 bg-white/5 p-2 shadow-2xl relative group">
                                <img alt="Medical simulation lab" className="rounded-[28px] w-full h-[400px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFxnPMZf3-cq965HhBN2QK9SaEr8xdSXDHLT5nASMm9xv9pYfXWbEQLq30dn97yoZvkwza9rJJ6QQqskk3rOOMd0OpXw97XkbiHBa9H3ZrGWcSJj_RP7uyuuq3Ibb70JJeX0CDEbassp2ai0OVEFvuzkp8ZZOXWDrxxiFgqAhrljli-xZM9GQWAhfX3QJ54jgk9Vy9ywod2sM2yeYu_wWuQUy5q4lkpXN_Jg6gJuLm8ArKkmFir0fTB60CeeYbHz6NCkGAUmDeb_MS" />
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-background-dark text-6xl">zoom_in</span>
                                </div>
                                <p className="text-sm text-center text-slate-500 mt-4 italic">Estudiantes de último año operando en la nueva sala de simulación quirúrgica "Alpha".</p>
                            </div>

                            <h3 className="text-2xl font-bold text-white mt-10 mb-4 uppercase tracking-tight">Un Compromiso con la Excelencia</h3>
                            <p>“Esta inversión no es solo en infraestructura, sino en el futuro de la salud pública”, afirmó el Rector durante la ceremonia de corte de cinta. El centro también estará disponible para programas de capacitación continua para profesionales de la salud externos, fomentando la integración entre la academia y el sector hospitalario.</p>

                            <blockquote className="border-l-4 border-primary pl-8 py-6 my-10 bg-primary/5 rounded-r-[24px] relative overflow-hidden">
                                <span className="material-symbols-outlined absolute -top-4 -left-4 text-9xl text-primary/5 -z-10 rotate-12">format_quote</span>
                                <p className="text-2xl italic text-white/90 font-light leading-relaxed">"Estamos construyendo el puente entre el aula y la sala de emergencias. Nuestros alumnos saldrán más preparados que nunca para enfrentar los retos reales del sistema de salud."</p>
                                <footer className="mt-4 flex items-center gap-4">
                                    <div className="w-10 h-1px bg-primary/30"></div>
                                    <cite className="text-primary font-black uppercase tracking-widest text-xs not-italic">— Dr. Alejandro Rivera, Decano de Medicina</cite>
                                </footer>
                            </blockquote>

                            <p>Además de la simulación, el edificio integra áreas de coworking, laboratorios de bio-impresión 3D y una zona de realidad virtual para anatomía avanzada. Con esta apertura, TrekManager University se posiciona en el top 5 de centros de simulación en Latinoamérica.</p>
                        </div>

                        {/* Social Share */}
                        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Compartir noticia</span>
                                <div className="flex gap-2">
                                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-primary hover:text-background-dark transition-all border border-white/5">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"></path></svg>
                                    </button>
                                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-primary hover:text-background-dark transition-all border border-white/5">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-4 py-2 bg-white/5 text-[10px] font-bold uppercase tracking-widest rounded-full text-slate-400 border border-white/5">#Medicina</span>
                                <span className="px-4 py-2 bg-white/5 text-[10px] font-bold uppercase tracking-widest rounded-full text-slate-400 border border-white/5">#CampusLife</span>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar Content */}
                    <aside className="lg:col-span-4 space-y-12">
                        {/* Related News */}
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                            <h4 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                <span className="w-2 h-8 bg-primary rounded-full"></span>
                                Lo último
                            </h4>
                            <div className="space-y-8">
                                <a className="group block space-y-3" href="#">
                                    <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
                                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7UUBjF5FUTU_WmFnEcHREYmxWsCvyD-TjWO0NmMHmKEUiDiUyUq0vNDwnCTP0HkCYpiiSK4HZfhR6SlEKLfpUVuCN7A-IoW3Gbf1kH-3vD99cn4lhqGnQEHa0jjHLYSsB_UL00ukpAJ37QJCv66uH8hhISiTzNgN5F7wZbx9DpYFtnkRTf1niflNuMkMRc14sEWEYmLOw6OFHc0pI2VanZgmnY_aAonQ1sXsQK5R86LfFM_AGawulorn_7qOnDEL5oi6FKVEN093b" alt="Lab" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-black text-primary tracking-widest">Academia</span>
                                        <h5 className="text-white font-bold group-hover:text-primary transition-colors text-lg leading-tight mt-1">Nuevos Laboratorios de Biotecnología 2024</h5>
                                    </div>
                                </a>
                                <a className="group block space-y-3" href="#">
                                    <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
                                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcxLhlieoFT036d2EAEcX0Yatj5yNRL3J7z6bkVl5ROiRjT3iI0Nh_11bta3MeFrm97ZTDxhznQIpoQSpJQBK9OcVcAiXZTt3gcTYiJ-uI10-ulioOn1OH5rs24COQqLkokhFjgVTa0LKUqHkK87HzSJnqwsb3Qnjqtwyzy8NhHqApqfzIssZWUSsqgC8dmekGyh2sQJlTfAdQQNfMyqV6xlcYnoz2XL0N8IJqMzUN1G1ytHIXMWP3DCkVIqELU4IvDqKwQz6vjTBa" alt="Scholarship" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-black text-primary tracking-widest">Estudiantes</span>
                                        <h5 className="text-white font-bold group-hover:text-primary transition-colors text-lg leading-tight mt-1">Convocatoria: Becas de Excelencia Deportiva</h5>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="p-1 border-t border-white/10 pt-12">
                            <h4 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                <span className="w-2 h-8 bg-primary rounded-full"></span>
                                Agenda
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                    <div className="w-12 h-12 flex-shrink-0 bg-primary/20 rounded-xl flex flex-col items-center justify-center text-primary shadow-lg shadow-primary/5">
                                        <span className="text-lg font-black leading-none tracking-tighter">28</span>
                                        <span className="text-[10px] font-bold uppercase">Oct</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-bold uppercase tracking-tight">Taller de Reanimación RCP</p>
                                        <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-1">Centro de Simulación, 10:00 AM</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                    <div className="w-12 h-12 flex-shrink-0 bg-white/10 rounded-xl flex flex-col items-center justify-center text-slate-300">
                                        <span className="text-lg font-black leading-none tracking-tighter">05</span>
                                        <span className="text-[10px] font-bold uppercase">Nov</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-bold uppercase tracking-tight">Seminario de Ética Médica</p>
                                        <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-1">Aula Magna, 09:00 AM</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-8 py-4 bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-background-dark transition-all duration-500">
                                Ver Calendario Completo
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default UniversityNewsPage;
