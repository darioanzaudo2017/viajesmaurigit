import React, { useState, useEffect } from 'react';
import { useRegistration } from '../hooks/useRegistration';
import { supabase } from '../api/supabase';

interface RegistrationPageProps {
    userId: string;
    tripId?: string;
    onComplete?: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ userId, tripId, onComplete }) => {
    const {
        step, setStep, formData, updateField, toggleCondition,
        submitRegistration, submitting, alreadyRegistered, checkingStatus
    } = useRegistration(tripId || 'GENERAL', userId);

    const [tripInfo, setTripInfo] = useState<any>(null);
    const [availableTrips, setAvailableTrips] = useState<any[]>([]);
    const [selectedTripId, setSelectedTripId] = useState<string>(tripId || 'GENERAL');

    useEffect(() => {
        // Fetch all trips for selection if none provided
        supabase.from('viajes').select('id, titulo').eq('estado', 'published').then(({ data }) => {
            if (data) setAvailableTrips(data);
        });

        if (tripId && tripId !== 'GENERAL') {
            supabase.from('viajes').select('*').eq('id', tripId).single().then(({ data }) => {
                if (data) setTripInfo(data);
            });
            setSelectedTripId(tripId);
        }
    }, [tripId]);

    // Update trip details when selection changes in "General" mode
    useEffect(() => {
        const checkSelection = async () => {
            if (selectedTripId && selectedTripId !== 'GENERAL') {
                // 1. Get Trip Info
                const { data: trip } = await supabase.from('viajes').select('*').eq('id', selectedTripId).single();
                if (trip) setTripInfo(trip);

                // 2. Check if already registered for THIS selected trip
                const { data: registration } = await supabase
                    .from('inscripciones')
                    .select('id')
                    .eq('viaje_id', selectedTripId)
                    .eq('user_id', userId)
                    .maybeSingle();

                if (registration) {
                    // We don't want to use alreadyRegistered from hook directly because it's tied to the initial tripId
                    // But for the UI, we can use a local state or just let the user know
                    alert(`Ya estás inscrito en ${trip?.titulo}. Te redirigiremos a tu ficha.`);
                    setSelectedTripId('GENERAL');
                }
            } else {
                setTripInfo(null);
            }
        };

        if (tripId === 'GENERAL' || !tripId) {
            checkSelection();
        }
    }, [selectedTripId, userId, tripId]);

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

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const provinces = [
        'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa',
        'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta',
        'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán', 'CABA'
    ];
    const menuOptions = ['General', 'Vegetariano', 'Vegano', 'Celíaco', 'Sin Sal'];

    if (checkingStatus) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-[#102218]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Verificando Estado...</p>
                </div>
            </div>
        );
    }

    if (alreadyRegistered && step < 4) {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-20 text-center space-y-8 animate-in fade-in duration-700">
                <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
                    <span className="material-symbols-outlined text-5xl">verified</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Ya estás Inscrito</h2>
                <p className="text-[#92c9a9] text-lg font-medium">Ya registramos tu participación para <b>{tripInfo?.titulo || 'esta expedición'}</b>. No es necesario completar el formulario nuevamente.</p>
                <div className="pt-6">
                    <button
                        onClick={() => onComplete?.()}
                        className="px-10 py-4 bg-primary text-black font-black rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all uppercase tracking-widest text-sm"
                    >
                        Volver al Panel
                    </button>
                </div>
            </div>
        );
    }

    const handleFinalize = async () => {
        const result = await submitRegistration(selectedTripId !== 'GENERAL' ? selectedTripId : undefined);
        if (result.success) {
            setStep(4);
        } else {
            alert("Error al guardar: " + (result.error as any).message);
        }
    };

    const addMedication = () => {
        const meds = [...(formData.medications || [])];
        meds.push({ name: '', dosage: '' });
        updateField('medications', meds);
    };

    const updateMedication = (index: number, field: 'name' | 'dosage', value: string) => {
        const meds = [...(formData.medications || [])];
        meds[index] = { ...meds[index], [field]: value };
        updateField('medications', meds);
    };

    const removeMedication = (index: number) => {
        const meds = (formData.medications || []).filter((_, i) => i !== index);
        updateField('medications', meds);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Trip Selection (Only if GENERAL) */}
                        {(!tripId || tripId === 'GENERAL') && (
                            <section className="bg-primary/5 rounded-xl border-2 border-dashed border-primary/30 p-6">
                                <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">event_available</span>
                                    Selecciona tu Expedición
                                </h2>
                                <p className="text-[#92c9a9] text-sm mb-6">Para completar la inscripción, por favor elige a qué viaje deseas anotarte.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableTrips.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTripId(t.id)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedTripId === t.id
                                                ? 'border-primary bg-primary/10 text-slate-900 dark:text-white'
                                                : 'border-white/10 hover:border-primary/50 text-[#92c9a9]'}`}
                                        >
                                            <p className="font-bold uppercase tracking-tight">{t.titulo}</p>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setSelectedTripId('GENERAL')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedTripId === 'GENERAL'
                                            ? 'border-white/40 bg-white/5 text-slate-900 dark:text-white'
                                            : 'border-white/10 hover:border-white/30 text-[#92c9a9]'}`}
                                    >
                                        <p className="font-bold uppercase tracking-tight">Solo Actualizar Ficha Médica</p>
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* Residence Information */}
                        <section className="bg-white dark:bg-[#1a2e23] rounded-xl border border-[#e7f3ec] dark:border-[#1e3a2a] shadow-sm overflow-hidden">
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                    <span className="material-symbols-outlined text-primary">home_pin</span>
                                    Lugar de Residencia
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Domicilio (Calle y Número)</label>
                                    <input
                                        className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:ring-primary transition-all"
                                        placeholder="Ej: Av. Colón 123, 4to B"
                                        type="text"
                                        value={formData.domicilio}
                                        onChange={(e) => updateField('domicilio', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Localidad</label>
                                        <input
                                            className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:ring-primary transition-all"
                                            placeholder="Ej: Córdoba"
                                            type="text"
                                            value={formData.localidad}
                                            onChange={(e) => updateField('localidad', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Provincia</label>
                                        <select
                                            className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:ring-primary transition-all cursor-pointer"
                                            value={formData.provincia}
                                            onChange={(e) => updateField('provincia', e.target.value)}
                                        >
                                            <option value="">Seleccionar Provincia</option>
                                            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Emergency Contacts */}
                        <section className="bg-white dark:bg-[#1a2e23] rounded-xl border border-[#e7f3ec] dark:border-[#1e3a2a] shadow-sm overflow-hidden">
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                    <span className="material-symbols-outlined text-primary">contact_emergency</span>
                                    Emergencias y Seguro
                                </h2>
                            </div>
                            <div className="p-6 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Obra Social / Seguro Médico</label>
                                    <input
                                        className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-primary transition-all outline-none"
                                        placeholder="Ej: OSDE, Swiss Medical, Apross"
                                        type="text"
                                        value={formData.obra_social}
                                        onChange={(e) => updateField('obra_social', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-primary font-bold text-xs uppercase tracking-widest">Contacto Primario</h3>
                                        <div className="space-y-4">
                                            <input
                                                className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none"
                                                placeholder="Nombre Completo"
                                                value={formData.emergency_contact_1}
                                                onChange={(e) => updateField('emergency_contact_1', e.target.value)}
                                            />
                                            <input
                                                className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none"
                                                placeholder="Teléfono"
                                                type="tel"
                                                value={formData.phone_emergency_1}
                                                onChange={(e) => updateField('phone_emergency_1', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-primary font-bold text-xs uppercase tracking-widest">Contacto Secundario</h3>
                                        <div className="space-y-4">
                                            <input
                                                className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none"
                                                placeholder="Nombre Completo"
                                                value={formData.emergency_contact_2}
                                                onChange={(e) => updateField('emergency_contact_2', e.target.value)}
                                            />
                                            <input
                                                className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none"
                                                placeholder="Teléfono"
                                                type="tel"
                                                value={formData.phone_emergency_2}
                                                onChange={(e) => updateField('phone_emergency_2', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Food preference */}
                        <section className="bg-white dark:bg-[#1a2e23] rounded-xl shadow-sm border border-[#e7f3ec] dark:border-[#1e3a2a] p-6">
                            <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight mb-6">Preferencia de Menú</h2>
                            <div className="flex flex-wrap gap-3">
                                {menuOptions.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => updateField('menu', m)}
                                        className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${formData.menu === m
                                            ? 'border-primary bg-primary/10 text-slate-900 dark:text-white'
                                            : 'border-[#2a4435] text-[#92c9a9] hover:border-primary'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Blood Type Section */}
                        <section className="bg-white dark:bg-[#1a2e23] rounded-xl shadow-sm border border-[#e7f3ec] dark:border-[#1e3a2a] p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight mb-6">Grupo Sanguíneo</h2>
                            </div>
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                {bloodTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => updateField('grupo_sanguineo', type)}
                                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${formData.grupo_sanguineo === type
                                            ? 'border-primary bg-primary/10 text-slate-900 dark:text-white'
                                            : 'border-[#2a4435] hover:border-primary text-[#92c9a9]'
                                            }`}
                                    >
                                        <span className="font-bold text-lg">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Allergies Section */}
                        <section className="bg-white dark:bg-[#1a2e23] rounded-xl shadow-sm border border-[#e7f3ec] dark:border-[#1e3a2a] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight">Alergias Críticas</h2>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        className="rounded border-gray-600 bg-zinc-800 text-primary w-5 h-5"
                                        type="checkbox"
                                        checked={formData.alergias === 'Ninguna'}
                                        onChange={(e) => updateField('alergias', e.target.checked ? 'Ninguna' : '')}
                                    />
                                    <span className="text-sm font-medium text-[#92c9a9]">Sin alergias</span>
                                </label>
                            </div>
                            <textarea
                                className="w-full bg-background-light dark:bg-[#102218] border border-[#2a4435] rounded-lg px-4 py-3 text-slate-900 dark:text-white outline-none min-h-[100px]"
                                placeholder="Ej: Penicilina, Maní, Abejas..."
                                value={formData.alergias === 'Ninguna' ? '' : formData.alergias}
                                disabled={formData.alergias === 'Ninguna'}
                                onChange={(e) => updateField('alergias', e.target.value)}
                            />
                        </section>

                        {/* Medications */}
                        <section className="bg-white dark:bg-[#1a2e23] rounded-xl shadow-sm border border-[#e7f3ec] dark:border-[#1e3a2a] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight">Medicación Actual</h2>
                                <button onClick={addMedication} className="flex items-center gap-1 text-primary text-sm font-bold">
                                    <span className="material-symbols-outlined text-base">add_circle</span>
                                    Agregar
                                </button>
                            </div>
                            <div className="space-y-4">
                                {(formData.medications || []).map((med, index) => (
                                    <div key={index} className="flex gap-4">
                                        <input
                                            className="flex-1 bg-background-light dark:bg-[#102218] border border-[#2a4435] rounded-lg px-4 py-3 text-slate-900 dark:text-white outline-none"
                                            placeholder="Medicamento"
                                            value={med.name}
                                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                        />
                                        <input
                                            className="w-48 bg-background-light dark:bg-[#102218] border border-[#2a4435] rounded-lg px-4 py-3 text-slate-900 dark:text-white outline-none"
                                            placeholder="Dosis"
                                            value={med.dosage}
                                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                        />
                                        <button onClick={() => removeMedication(index)} className="text-red-400">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Physical Stats section */}
                        <section className="bg-white dark:bg-[#1a2e23] rounded-xl border border-[#e7f3ec] dark:border-[#1e3a2a] shadow-sm overflow-hidden">
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                    <span className="material-symbols-outlined text-primary">analytics</span>
                                    Métricas Físicas
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Peso (kg)</label>
                                    <input className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 rounded-lg p-3 text-slate-900 dark:text-white outline-none" type="number" value={formData.peso || ''} onChange={(e) => updateField('peso', parseFloat(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Estatura (cm)</label>
                                    <input className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 rounded-lg p-3 text-slate-900 dark:text-white outline-none" type="number" value={formData.estatura || ''} onChange={(e) => updateField('estatura', parseFloat(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Presión Arterial</label>
                                    <input className="w-full bg-background-light dark:bg-zinc-800 border-zinc-300 rounded-lg p-3 text-slate-900 dark:text-white outline-none" placeholder="120/80" value={formData.tension_arterial} onChange={(e) => updateField('tension_arterial', e.target.value)} />
                                </div>
                            </div>
                        </section>

                        {/* Conditions Section */}
                        <section className="bg-white dark:bg-[#1a2e23] rounded-xl border border-[#e7f3ec] dark:border-[#1e3a2a] shadow-sm overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-4">Condiciones Preexistentes</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {conditions_catalog.map((item) => (
                                        <label key={item.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${formData.condiciones.includes(item.id) ? 'bg-primary/10 border-primary block text-slate-900 dark:text-white' : 'border-[#2a4435] text-[#92c9a9]'}`}>
                                            <input type="checkbox" className="hidden" checked={formData.condiciones.includes(item.id)} onChange={() => toggleCondition(item.id)} />
                                            <span className="material-symbols-outlined text-sm">{formData.condiciones.includes(item.id) ? 'check_box' : 'check_box_outline_blank'}</span>
                                            <span className="text-sm font-medium">{item.condicion}</span>
                                        </label>
                                    ))}
                                </div>
                                <textarea
                                    className="w-full mt-6 bg-background-light dark:bg-zinc-800 border-zinc-300 rounded-lg p-4 text-slate-900 dark:text-white outline-none min-h-[120px]"
                                    placeholder="Observaciones de salud relevantes..."
                                    value={formData.observaciones}
                                    onChange={(e) => updateField('observaciones', e.target.value)}
                                />
                            </div>
                        </section>
                    </div>
                );
            case 4:
                return (
                    <section className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-10 text-center space-y-6">
                            <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                                <span className="material-symbols-outlined text-6xl">cloud_done</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">¡Registro Completado!</h3>
                            <p className="text-[#92c9a9] max-w-md mx-auto">Tus datos médicos y de inscripción para <b>{selectedTripId !== 'GENERAL' ? tripInfo?.titulo : 'tu perfil general'}</b> han sido guardados con éxito.</p>
                            <button
                                onClick={() => onComplete?.()}
                                className="mt-8 px-12 py-4 bg-primary text-black font-black rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
                            >
                                Volver al Panel
                            </button>
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return "Residencia y Emergencias";
            case 2: return "Alimentación y Salud Crítica";
            case 3: return "Métricas y Preexistencias";
            case 4: return "Confirmación";
            default: return "";
        }
    };

    return (
        <div className="relative min-h-screen bg-background-light dark:bg-[#102218] text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <main className="relative z-10 max-w-[1280px] mx-auto px-6 py-10">
                <div className="max-w-[1100px] mx-auto">
                    <div className="mb-10 space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {selectedTripId !== 'GENERAL' ? `Inscripción: ${tripInfo?.titulo || '...'}` : 'Actualización Ficha Médica'}
                        </h1>
                        <div className="flex items-center gap-6">
                            <div className="h-2 flex-1 bg-[#2a4435] rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${(step / 4) * 100}%` }}></div>
                            </div>
                            <span className="text-primary font-black text-sm">{Math.round((step / 4) * 100)}%</span>
                        </div>
                        <p className="text-xs text-primary font-bold uppercase tracking-widest">Paso {step}: {getStepTitle()}</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-10">
                        <div className="flex-1 space-y-8">
                            {renderStepContent()}

                            {step < 4 && (
                                <div className="flex items-center justify-between pt-6 border-t border-[#1e3a2a]">
                                    <button
                                        onClick={() => step > 1 && setStep(step - 1)}
                                        className="px-8 py-4 rounded-xl border border-zinc-700 font-bold text-sm text-slate-900 dark:text-white hover:bg-zinc-800 disabled:opacity-20"
                                        disabled={step === 1 || submitting}
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => step === 3 ? handleFinalize() : setStep(step + 1)}
                                        disabled={submitting}
                                        className="bg-primary text-black px-12 py-4 rounded-xl font-black text-base shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                                    >
                                        {submitting ? 'Guardando...' : step === 3 ? 'Finalizar Todo' : 'Siguiente Paso'}
                                        {!submitting && <span className="material-symbols-outlined">arrow_forward</span>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar Summary */}
                        <aside className="w-full lg:w-[320px] shrink-0 sticky top-28 h-fit">
                            <div className="bg-[#1a2e23] border border-[#1e3a2a] rounded-xl p-6 space-y-6">
                                <h3 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">verified_user</span>
                                    Seguridad Trek
                                </h3>
                                {selectedTripId !== 'GENERAL' && (
                                    <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                        <p className="text-[10px] text-primary uppercase font-black tracking-widest">Viaje Seleccionado</p>
                                        <p className="text-slate-900 dark:text-white font-bold text-sm tracking-tight">{tripInfo?.titulo || 'Cargando...'}</p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <p className="text-[10px] text-[#92c9a9] uppercase font-black">Estado del Proceso</p>
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                        <p className="text-xs text-slate-900 dark:text-white font-bold">Inscripción en Curso</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <p className="text-[10px] text-[#92c9a9] uppercase font-black mb-1">Borrador</p>
                                        <p className="text-xs text-primary font-bold">Autoguardado Local Activo</p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegistrationPage;
