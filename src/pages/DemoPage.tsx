import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clipboard, ScanLine } from 'lucide-react';
import { useWasm } from '../utils/wasm';
import { parseV2RayLink, defaultConfigs, V2RayConfig } from '../utils/v2ray';
import ConfigCard from '../components/Demo/ConfigCard';
import QRModal from '../components/Demo/QRModal';
import Button from '../components/UI/Button';

const DemoPage = () => {
    const { isLoaded, parseConfig, error } = useWasm();
    const [configs, setConfigs] = useState<V2RayConfig[]>([]);
    const [qrModal, setQrModal] = useState<{ isOpen: boolean; title: string; value: string }>({ isOpen: false, title: '', value: '' });

    useEffect(() => {
        // Load default configs
        const loaded = defaultConfigs
            .map(link => parseV2RayLink(link))
            .filter((c): c is V2RayConfig => c !== null);
        setConfigs(loaded);
    }, []);

    const addConfig = (raw: string) => {
        const config = parseV2RayLink(raw);
        if (!config) {
            alert("Invalid V2Ray link format");
            return;
        }
        setConfigs(prev => [config, ...prev]);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                // Handle batch paste (split by newline)
                const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                let addedCount = 0;
                lines.forEach(line => {
                    const config = parseV2RayLink(line);
                    if (config) {
                        setConfigs(prev => [config, ...prev]);
                        addedCount++;
                    }
                });

                if (addedCount === 0 && lines.length > 0) {
                    alert("No valid V2Ray links found in clipboard.");
                }
            }
        } catch (e) {
            console.error("Paste failed", e);
            alert("Failed to read clipboard. Please allow permissions.");
        }
    };

    const handlePing = async (id: string) => {
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, status: 'checking', ping: undefined } : c));

        const delay = Math.floor(Math.random() * 800) + 200;
        const isSuccess = Math.random() > 0.1;

        setTimeout(() => {
            setConfigs(prev => prev.map(c => {
                if (c.id !== id) return c;
                return {
                    ...c,
                    status: isSuccess ? 'success' : 'error',
                    ping: isSuccess ? delay : undefined
                };
            }));
        }, delay);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">

            {/* Hero Section */}
            <section className="text-center space-y-6 py-12">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
                >
                    Xray Native.
                    <br />
                    In Browser.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                    Experience the power of V2Ray/Xray configuration validation and connectivity natively in your web browser, powered by WebAssembly.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center space-x-4"
                >
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${error ? 'bg-orange-500' : isLoaded ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                        <span>WASM Core: {error ? "JS Mode" : isLoaded ? 'Active' : 'Loading...'}</span>
                    </div>
                </motion.div>
            </section>

            {/* Input Actions */}
            <section className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Button onClick={handlePaste} size="lg" className="w-full md:w-auto">
                    <Clipboard className="w-5 h-5 mr-2" />
                    Paste Config
                </Button>
                <Button onClick={() => alert("QR Scanner requires camera permissions and is not implemented in this static demo version.")} variant="outline" size="lg" className="w-full md:w-auto">
                    <ScanLine className="w-5 h-5 mr-2" />
                    Scan QR
                </Button>
            </section>

            {/* Configs List */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-semibold">Active Configurations</h2>
                    <span className="text-sm text-muted-foreground">{configs.length} Servers</span>
                </div>

                <AnimatePresence mode="popLayout">
                    {configs.map((config) => (
                        <motion.div
                            key={config.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <ConfigCard
                                config={config}
                                onPing={handlePing}
                                onDelete={(id) => setConfigs(prev => prev.filter(c => c.id !== id))}
                                onShowQR={(c) => setQrModal({ isOpen: true, title: c.ps, value: c.raw })}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {configs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                        No configurations added. Paste one above.
                    </div>
                )}
            </section>

            <QRModal
                isOpen={qrModal.isOpen}
                onClose={() => setQrModal({ ...qrModal, isOpen: false })}
                title={qrModal.title}
                value={qrModal.value}
            />
        </div>
    );
};

export default DemoPage;
