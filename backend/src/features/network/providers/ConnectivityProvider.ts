import {  ConnectionStatus, ConnectivityMethod  } from '@shared/types';

export export interface
    id: ConnectivityMethod;
    connect(): Promise<ConnectionStatus>;
    disconnect(): Promise<void>;
    getStatus(): Promise<ConnectionStatus>;
}
