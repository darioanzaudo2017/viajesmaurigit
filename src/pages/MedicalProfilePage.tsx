import React, { useState } from 'react';
import { useMedicalProfile } from '../hooks/useMedicalProfile';

interface MedicalProfilePageProps {
    userId: string;
    onEdit?: () => void;
    fullView?: boolean;
}

const MedicalProfilePage: React.FC<MedicalProfilePageProps> = ({ userId, onEdit, fullView = false }) => {
    const [activeSection, setActiveSection] = useState('general');
    const { profile, loading } = useMedicalProfile(userId);

    const menuItems = [
        { id: 'general', label: 'Información General', icon: 'info' },
        { id: 'conditions', label: 'Condiciones', icon: 'stethoscope' },
        { id: 'contacts', label: 'Contactos de Emergencia', icon: 'group' },
    ];

    const conditions_catalog = [
        { id: 1, condicion: 'COVID-19' },
        { id: 2, condicion: 'Síntomas de COVID-19' },
        { id: 3, condicion: 'Dificultad visual' },
        { id: 4, condicion: 'Problemas auditivos' },
        { id: 5, condicion: 'Alergias' },
        { id: 6, condicion: 'Afecciones del corazón' },
        { id: 7, condicion: 'Epilepsia' },
        { id: 8, condicion: 'Asma' },
        { id: 9, condicion: 'Diabetes' },
        { id: 10, condicion: 'Hipertensión' },
        { id: 11, condicion: 'Problemas respiratorios' },
        { id: 12, condicion: 'Convulsiones' },
        { id: 13, condicion: 'Enfermedades de la sangre' },
        { id: 14, condicion: 'Hepatitis u otras enfermedades del hígado' },
        { id: 15, condicion: 'Limitaciones en actividad diaria' },
        { id: 16, condicion: 'Celiaquía' },
        { id: 17, condicion: 'Luxaciones' },
        { id: 18, condicion: 'Problemas de la columna' },
        { id: 19, condicion: 'Lesiones de cintura, rodillas o tobillos' },
        { id: 20, condicion: 'Lesiones de hombros o brazos' },
        { id: 21, condicion: 'Bajo cuidado médico' },
        { id: 22, condicion: 'Toma medicación actualmente' },
        { id: 23, condicion: 'Embarazo' },
        { id: 24, condicion: 'Otra condición que pueda perjudicar la salud' },
    ];

    const getConditionName = (id: number) => {
        return conditions_catalog.find(c => c.id === id)?.condicion || `Condición ${id}`;
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Cargando Ficha Médica...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[400px] p-8 text-center">
                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                    <span className="material-symbols-outlined text-4xl font-black">clinical_notes</span>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Sin Ficha Médica</h2>
                <p className="text-slate-400 max-w-md mb-8">No hemos encontrado una ficha médica vinculada a tu cuenta. Debes completar una inscripción para generar tu perfil de seguridad.</p>
                <button
                    onClick={() => onEdit?.()}
                    className="bg-primary text-background-dark px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                    Completar Inscripción
                </button>
            </div>
        );
    }

    // Components to render
    const GeneralSection = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MetricCard label="Peso" value={`${profile.peso} kg`} icon="weight" />
            <MetricCard label="Estatura" value={`${profile.estatura} cm`} icon="straighten" />
            <MetricCard label="Presión" value={profile.tension_arterial || '120/80'} icon="monitor_heart" />
            <MetricCard label="Obra Social" value={profile.obra_social || 'OSDE 310'} icon="medication_liquid" />

            <div className="md:col-span-2 bg-neutral-900 border border-white/5 p-8 rounded-[32px] space-y-4">
                <div className="flex items-center gap-3 text-slate-400 mb-4">
                    <span className="material-symbols-outlined font-black">clinical_notes</span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Observaciones Clínicas</h3>
                </div>
                <p className="text-white font-bold leading-relaxed italic">"{profile.observaciones || 'Sin observaciones registradas.'}"</p>
            </div>
        </div>
    );

    const ConditionsSection = () => (
        <div className="bg-neutral-900 border border-white/5 p-6 sm:p-8 rounded-[32px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Condiciones Médicas</h3>
                <span className="bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full uppercase w-fit">
                    {(profile.condiciones?.length || 0)} Hallazgos Detectados
                </span>
            </div>
            <div className="space-y-4">
                {(!profile.condiciones || profile.condiciones.length === 0) ? (
                    <p className="text-slate-400 font-medium">No se registran condiciones preexistentes del catálogo de seguridad de montaña.</p>
                ) : (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {profile.condiciones.map((cId: number) => (
                            <span key={cId} className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500">
                                {getConditionName(cId)}
                            </span>
                        ))}
                    </div>
                )}

                {profile.medicamentos?.length > 0 && (
                    <div className="pt-6 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Medicación Activa</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.medicamentos.map((m: any, idx: number) => (
                                <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="font-bold text-white uppercase tracking-tight">{m.name}</p>
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">{m.dosage}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const ContactsSection = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ContactCard
                name={profile.contacto_emergencia_1 || 'Nombre Contacto 1'}
                phone={profile.telefono_emergencia_1 || 'N/A'}
                relation="Primario"
            />
            <ContactCard
                name={profile.contacto_emergencia_2 || 'Nombre Contacto 2'}
                phone={profile.telefono_emergencia_2 || 'N/A'}
                relation="Secundario"
            />
        </div>
    );

    return (
        <div id={`medical-profile-${userId}`} className={`max-w-[1200px] mx-auto p-4 md:p-8 space-y-10 ${fullView ? 'bg-white pdf-layout no-animations' : 'animate-in fade-in duration-700'}`}>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-sm font-black">verified_user</span>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] truncate">Perfil de Seguridad</p>
                    </div>
                    <h1 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tight italic">Ficha Médica</h1>
                    <p className="text-slate-400 text-xs sm:text-base">Datos vitales para tu seguridad en expediciones de montaña.</p>
                </div>
                {onEdit && !fullView && (
                    <button
                        onClick={() => onEdit?.()}
                        className="flex items-center gap-2 px-6 py-3 bg-neutral-800 border border-white/5 text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-neutral-700 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Actualizar Datos
                    </button>
                )}
            </div>

            {/* Profile Overview Card */}
            <div className="bg-neutral-900 border border-white/5 rounded-[32px] p-8 shadow-2xl shadow-primary/5 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="h-32 w-32 rounded-[24px] overflow-hidden border-4 border-primary/20 bg-cover bg-center shadow-xl" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200')" }}></div>
                    <div className="text-center md:text-left space-y-3">
                        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3">
                            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight text-center sm:text-left">{profile.user?.full_name || 'Senderista'}</h2>
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/30">Verificado</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 text-red-500">
                                <span className="material-symbols-outlined text-[18px]">bloodtype</span>
                                <p className="text-sm font-black uppercase tracking-tight">{profile.grupo_sanguineo || 'N/A'}</p>
                            </div>
                            <div className="flex items-center gap-2 text-orange-500">
                                <span className="material-symbols-outlined text-[18px]">warning</span>
                                <p className="text-sm font-black uppercase tracking-tight">Alergia a: {profile.alergias || 'Ninguna'}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Última Actualización: {new Date(profile.updated_at).toLocaleDateString()} • ID: TG-{profile.id.slice(0, 4)}-{userId.slice(0, 3).toUpperCase()}</p>
                    </div>
                </div>
                {!fullView && (
                    <button className="group mt-4 md:mt-0 flex items-center gap-4 bg-primary text-background-dark px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-primary/20">
                        <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">qr_code_2</span>
                        <div className="text-left">
                            <p className="leading-none mb-1">Ver Pase Médico QR</p>
                            <p className="text-[9px] opacity-60 font-bold uppercase tracking-widest">Acceso offline activado</p>
                        </div>
                    </button>
                )}
            </div>

            {/* Content Tabs or Full View */}
            {fullView ? (
                <div className="space-y-12">
                    <div className="space-y-4">
                        <h3 className="text-primary font-black uppercase tracking-[0.3em] text-xs">I. Información General</h3>
                        <GeneralSection />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-primary font-black uppercase tracking-[0.3em] text-xs">II. Condiciones Médicas</h3>
                        <ConditionsSection />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-primary font-black uppercase tracking-[0.3em] text-xs">III. Contactos de Emergencia</h3>
                        <ContactsSection />
                    </div>
                </div>
            ) : (
                <div className="space-y-6 sm:space-y-8">
                    <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                        <nav className="flex gap-2 p-1.5 bg-neutral-900 rounded-2xl w-max border border-white/5 mx-auto sm:mx-0">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSection === item.id
                                        ? 'bg-primary text-background-dark shadow-lg shadow-primary/10'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-base sm:text-lg">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {activeSection === 'general' && <GeneralSection />}
                            {activeSection === 'conditions' && <ConditionsSection />}
                            {activeSection === 'contacts' && <ContactsSection />}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-neutral-900 rounded-[32px] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-20"><span className="material-symbols-outlined text-4xl">lock</span></div>
                                <h3 className="text-white text-xl font-black uppercase tracking-tight mb-8">Acceso Médico Offline</h3>

                                <div className="flex flex-col items-center gap-6 py-4">
                                    <div className="p-4 bg-white rounded-3xl shadow-inner group-hover:scale-105 transition-transform duration-500">
                                        <span className="material-symbols-outlined text-[100px] text-slate-900 font-black">qr_code_2</span>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-primary text-[10px] font-black uppercase tracking-widest leading-none">Pase de Expedición</p>
                                        <p className="text-white text-lg font-black uppercase tracking-wide">{profile.user?.full_name || 'Senderista'}</p>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <button className="w-full bg-primary text-background-dark py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                                        <span className="material-symbols-outlined text-lg">wallet</span>
                                        Guardar en Wallet
                                    </button>
                                    <button className="w-full bg-white/5 text-slate-300 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                                        <span className="material-symbols-outlined text-lg">print</span>
                                        Imprimir Carnet
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ label, value, icon }: any) => (
    <div className="bg-neutral-900 border border-white/5 p-5 sm:p-8 rounded-[32px] flex items-center gap-4 sm:gap-6 group hover:translate-y-[-4px] transition-all duration-300">
        <div className="size-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background-dark transition-all duration-500">
            <span className="material-symbols-outlined text-3xl font-black">{icon}</span>
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-black text-white uppercase tracking-tight">{value}</p>
        </div>
    </div>
);

const ContactCard = ({ name, phone, relation }: any) => (
    <div className="bg-neutral-900 border border-white/5 p-6 sm:p-8 rounded-[32px] space-y-4 hover:border-primary/40 transition-all duration-300">
        <div className="flex justify-between items-start">
            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined font-black">perm_contact_calendar</span>
            </div>
            <span className="bg-white/5 border border-white/5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">{relation}</span>
        </div>
        <div>
            <p className="text-xl font-black text-white uppercase tracking-tight">{name}</p>
            <p className="text-primary font-mono font-bold text-lg mt-1">{phone}</p>
        </div>
        <button className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest hover:underline pt-2">
            <span className="material-symbols-outlined text-sm font-black">call</span>
            Probar Conexión
        </button>
    </div>
);

export default MedicalProfilePage;
