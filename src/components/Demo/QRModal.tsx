import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../UI/Button';

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    value: string;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, title, value }) => {
    // using qrserver api for simplicity
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-black border border-white/20 rounded-2xl shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white truncate pr-4">{title}</h3>
                            <Button size="icon" variant="ghost" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex justify-center p-4 bg-white rounded-xl mb-4">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(value)}`}
                                alt="QR Code"
                                className="w-64 h-64"
                            />
                        </div>

                        <div className="bg-white/5 p-3 rounded-lg overflow-hidden">
                            <p className="text-xs text-muted-foreground break-all font-mono line-clamp-3">
                                {value}
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default QRModal;
