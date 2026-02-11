
export interface V2RayConfig {
    id: string;
    ps: string; // Remarks/Name
    add: string; // Address
    port: string | number;
    type: 'vless' | 'vmess' | 'trojan' | 'ss';
    net?: string; // transport (ws, tcp, etc)
    tls?: string;
    raw: string; // Original link
    ping?: number; // Latency in ms
    status?: 'idle' | 'checking' | 'success' | 'error';
}

export const parseV2RayLink = (link: string): V2RayConfig | null => {
    try {
        const url = new URL(link);
        const protocol = url.protocol.replace(':', '');

        // Basic Parsing for Demo Purposes
        // Note: Real world parsing is complex. We are doing "best effort" for the demo.

        let config: V2RayConfig = {
            id: crypto.randomUUID(),
            ps: decodeURIComponent(url.hash.slice(1)) || 'Unnamed Server',
            add: url.hostname,
            port: url.port,
            type: protocol as any,
            net: url.searchParams.get('type') || 'tcp',
            tls: url.searchParams.get('security') || 'none',
            raw: link,
            status: 'idle'
        };

        if (protocol === 'ss') {
            const userInfo = decodeURIComponent(atob(url.username).trim());
            // SS format can be messy, simplifying for demo
            config.ps = decodeURIComponent(url.hash.slice(1)) || 'Shadowsocks';
        }

        return config;
    } catch (e) {
        console.warn("Failed to parse link", link, e);
        // Try base64 decode check for vmess usually
        return null;
    }
};

export const defaultConfigs: string[] = [
    "vless://48ff2b70-e180-582f-8866-d9a2edeed5f5@51.158.206.98:23576?encryption=none&flow=xtls-rprx-vision&security=reality&sni=fuck.rkn&fp=chrome&pbk=1y5h2FGWKXTJ9xLPCqPo6Mw7RxoZzh6fGkEQKNxpZ3s&sid=01&type=tcp&headerType=none#Default_VLESS_1",
    "trojan://humanity@172.64.152.23:443?security=tls&sni=www.creationlong.org&type=ws&host=www.creationlong.org&path=%2Fassignment#Trojan_WS_1",
    "trojan://humanity@172.64.152.23:443?security=tls&sni=www.calmlunch.com&type=ws&host=www.calmlunch.com&path=%2Fassignment#Trojan_WS_2",
    "ss://Y2hhY2hhMjAtaWV0Zi1wb2x5MTMwNTpvWklvQTY5UTh5aGNRVjhrYTNQYTNB@82.38.31.101:8080#Shadowsocks_Demo",
    "vless://48ff2b70-e180-582f-8866-d9a2edeed5f5@51.158.206.93:23576?encryption=none&flow=xtls-rprx-vision&security=reality&sni=fuck.rkn&fp=chrome&pbk=1y5h2FGWKXTJ9xLPCqPo6Mw7RxoZzh6fGkEQKNxpZ3s&sid=01&type=tcp&headerType=none#Default_VLESS_2"
];
