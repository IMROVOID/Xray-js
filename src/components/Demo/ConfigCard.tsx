import React, { useState } from 'react';
import { Copy, QrCode, Activity, Check, AlertCircle, Trash2, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import { V2RayConfig } from '../../utils/v2ray';

interface ConfigCardProps {
    config: V2RayConfig;
    onPing: (id: string) => void;
    onDelete?: (id: string) => void;
    onShowQR: (config: V2RayConfig) => void;
}

const ConfigCard: React.FC<ConfigCardProps> = ({ config, onPing, onDelete, onShowQR }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(config.raw);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const statusColor = {
        idle: 'text-muted-foreground',
        checking: 'text-yellow-500 animate-pulse',
        success: 'text-green-500',
        error: 'text-red-500'
    };

    return (
        <Card className="group relative flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6" hoverEffect>

            {/* Icon & Info */}
            <div className="flex items-center w-full md:w-auto overflow-hidden">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mr-4 flex-shrink-0">
                    <Server className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <h3 className="font-semibold text-lg truncate text-white">{config.ps}</h3>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{config.type.toUpperCase()}</Badge>
                        <span className="truncate max-w-[150px]">{config.add}:{config.port}</span>
                    </div>
                </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex items-center justify-between w-full md:w-auto md:space-x-6">

                {/* Ping Status */}
                <div className="flex items-center space-x-2 min-w-[80px] justify-end">
                    {config.ping !== undefined && config.status === 'success' && (
                        <span className="text-green-400 font-mono font-bold">{config.ping}ms</span>
                    )}
                    <Activity className={`w-4 h-4 ${statusColor[config.status || 'idle']}`} />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                    <Button size="icon" variant="ghost" onClick={() => onPing(config.id)} title="Ping Server">
                        <Activity className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onShowQR(config)} title="Show QR Code">
                        <QrCode className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleCopy} title="Copy Link">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    {onDelete && (
                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => onDelete(config.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default ConfigCard;
