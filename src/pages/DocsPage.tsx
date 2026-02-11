import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, Globe, Shield, Zap } from 'lucide-react';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';

const DocsPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 space-y-16">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <h1 className="text-4xl md:text-5xl font-bold">Documentation</h1>
                <p className="text-xl text-muted-foreground">
                    Everything you need to know about Xray-js.
                </p>
            </motion.div>

            {/* Introduction */}
            <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                <div className="prose prose-invert max-w-none">
                    <h3>What is Xray-js?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Xray-js is a powerful, browser-based Xray configuration validator and editor powered by
                        <span className="text-white font-semibold"> WebAssembly</span>.
                        By compiling the actual Xray-core source code into WASM, we create a secure, client-side playground
                        that ensures 100% accuracy with native behavior, without sending your sensitive configurations to any
                        server.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="space-y-3">
                        <Shield className="w-8 h-8 text-white" />
                        <h4 className="font-bold">Client-Side Privacy</h4>
                        <p className="text-sm text-muted-foreground">All processing happens in your browser memory. No data leaves your device.</p>
                    </Card>
                    <Card className="space-y-3">
                        <Zap className="w-8 h-8 text-white" />
                        <h4 className="font-bold">Native Logic</h4>
                        <p className="text-sm text-muted-foreground">Uses the real Xray-core Go code, ensuring identical behavior to the binary.</p>
                    </Card>
                    <Card className="space-y-3">
                        <Globe className="w-8 h-8 text-white" />
                        <h4 className="font-bold">Universal Access</h4>
                        <p className="text-sm text-muted-foreground">Run complex V2Ray diagnostics from any device with a modern web browser.</p>
                    </Card>
                </div>
            </motion.section>

            {/* How it Works */}
            <motion.section
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6"
            >
                <h2 className="text-3xl font-bold flex items-center">
                    <Cpu className="w-8 h-8 mr-3" />
                    How it Works
                </h2>

                <div className="space-y-4 text-muted-foreground">
                    <p>
                        The project relies on the Go WebAssembly architecture. We use a patched version of
                        Xray-core that removes system-level dependencies (like raw socket syscalls) that
                        are unavailable in a browser environment.
                    </p>
                    <p>
                        The <code>main.wasm</code> binary is loaded asynchronously. When you input a config,
                        JavaScript passes it to the WASM instance, which runs the Xray config parsing
                        logic and returns the result or error.
                    </p>
                </div>
            </motion.section>

            {/* Build Instructions */}
            <motion.section
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6"
            >
                <h2 className="text-3xl font-bold flex items-center">
                    <Terminal className="w-8 h-8 mr-3" />
                    Building from Source
                </h2>

                <Card className="space-y-6">
                    <div className="space-y-2">
                        <Badge variant="outline">Prerequisite</Badge>
                        <h4 className="font-semibold text-white">Go 1.22+</h4>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">1. Clone the repository:</p>
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                            git clone https://github.com/IMROVOID/xray-js.git<br />
                            cd xray-js
                        </div>

                        <p className="text-sm text-muted-foreground">2. Build the WASM binary:</p>
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm space-y-2">
                            <div className="flex items-center text-xs text-muted-foreground mb-1">
                                <span className="mr-2"># Linux / macOS</span>
                            </div>
                            <div>make build</div>

                            <div className="flex items-center text-xs text-muted-foreground mb-1 mt-4">
                                <span className="mr-2"># Windows (PowerShell)</span>
                            </div>
                            <div>.\build.ps1</div>
                        </div>

                        <p className="text-sm text-muted-foreground">3. Run the Development Server:</p>
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                            npm install<br />
                            npm run dev
                        </div>
                    </div>
                </Card>
            </motion.section>

        </div>
    );
};

export default DocsPage;
