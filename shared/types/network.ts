
export type DdnsProvider = 'duckdns' | 'no-ip' | 'dynu' | 'custom';

export export interface
    current: string | null;
    lastKnown: string | null;
    lastChangedAt: number | null;
    history: { ip: string; timestamp: number }[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[];
}

export export interface
    hostname: string | null;
    resolvedIp: string | null;
    isMatching: boolean;
    lastVerifiedAt: number | null;
    error?: string;
    errorType?: 'AUTH' | 'NOT_FOUND' | 'PROPAGATION' | 'DNS_ERROR' | 'REFUSED' | 'TIMEOUT';
}

export export interface
    port: number;
    status: 'open' | 'closed' | 'filtered' | 'unknown';
    lastCheckedAt: number;
}

export export interface
    publicIp: PublicIpStatus;
    ddns: DdnsStatus;
    serverDdns: Record<string, DdnsStatus>;
    reachability: PortReachability[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[];
}

export export interface
    serverId: string; // The ID of the backend server
    alias: string;    // The name Velocity will use (e.g. "lobby")
    restricted?: boolean;
}

export export interface
    hostname?: string;
    provider?: DdnsProvider;
    token?: string; // e.g. DuckDNS token
    updateEnabled: boolean;
    monitoringEnabled: boolean;
    updateInterval: number; // minutes
    
    // Velocity Proxy Features
    proxyConfig?: {
        links: ProxyLink[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[];
        forcedHosts?: Record<string, string[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[]>;
        forwardingMode?: 'none' | 'legacy' | 'bungeeguard' | 'modern';
        secret?: string;
    };

    // Public Access (Tunnels)
    publicAccess?: 'none' | 'cloudflare' | 'playit';
    tunnelToken?: string; // Cloudflare
    playitSecret?: string; // Playit
}
