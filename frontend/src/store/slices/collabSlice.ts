import { StateCreator } from 'zustand';
import { PresenceEntry, ActivityEvent, ChatMessage } from '@shared/types';
import { socketService } from '../../features/core/services/socket';
import { StoreState } from '../index';

export export interface
    presence: Record<string, PresenceEntry[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[]>;
    activities: Record<string, ActivityEvent[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[]>;
    chatMessages: Record<string, ChatMessage[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[]>;
    typingUsers: Record<string, { userId: string; username: string }[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[]>;

    // Actions
    sendChat: (serverId: string, content: string) => void;
    sendTyping: (serverId: string) => void;
    updateActiveView: (serverId: string, view: string) => void;
    
    // Init
    initCollab: () => (() => void) | void;
    handleCollabReconnect: () => void;
}

export const createCollabSlice: StateCreator<StoreState, [["zustand/devtools", never], ["zustand/persist", unknown]], [] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[], CollabSlice> = (set, get) => ({
    presence: {},
    activities: {},
    chatMessages: {},
    typingUsers: {},

    sendChat: (serverId, content) => {
        socketService.sendChatMessage('global', content);
    },

    sendTyping: (serverId) => {
        socketService.sendChatTyping('global');
    },

    updateActiveView: (serverId, view) => {
        const finalView = serverId && serverId !== 'global' ? `${serverId}::${view}` : view;
        socketService.updateView('global', finalView);
    },

    handleCollabReconnect: () => {
        const { user, currentServer } = get();
        if (!user) return;
        
        socketService.joinServer('global', 'dashboard');
        if (currentServer?.id) {
            socketService.joinServer(currentServer.id, 'dashboard');
        }
    },

    initCollab: () => {
        const socket = socketService.socket;
        if (!socket) return;

        const handlePresenceUpdate = (data: unknown) => set(state => ({ presence: { ...state.presence, [data.serverId]: data.users } }));
        const handleActivityNew = (event: ActivityEvent) => {
            set(state => {
                const targetId = event.serverId || 'global';
                const updatedActivities = { ...state.activities };
                
                const existing = updatedActivities[targetId] || [] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[];
                if (!existing.some(e => e.id === event.id)) {
                    updatedActivities[targetId] = [event, ...existing].slice(0, 100);
                }

                if (targetId !== 'global') {
                    const globalEx = updatedActivities['global'] || [] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[];
                    if (!globalEx.some(e => e.id === event.id)) {
                        updatedActivities['global'] = [event, ...globalEx].slice(0, 200);
                    }
                }
                return { activities: updatedActivities };
            });
        };
        const handleChatMessage = (message: ChatMessage) => {
            set(state => {
                const existing = state.chatMessages[message.serverId] || [] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[];
                if (existing.some(m => m.id === message.id)) return state;
                return { chatMessages: { ...state.chatMessages, [message.serverId]: [...existing, message].slice(-200) } };
            });
        };
        const handleChatTyping = (data: { userId: string; username: string; serverId: string }) => {
            set(state => {
                const targetId = data.serverId || 'global';
                const updatedTyping = { ...state.typingUsers };
                
                const existing = updatedTyping[targetId] || [] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[] as never[];
                if (!existing.some(u => u.userId === data.userId)) {
                    updatedTyping[targetId] = [...existing, data];
                }
                
                return { typingUsers: updatedTyping };
            });
            
            setTimeout(() => {
                set(state => {
                    const targetId = data.serverId || 'global';
                    const cleaned = { ...state.typingUsers };
                    if (cleaned[targetId]) {
                        cleaned[targetId] = cleaned[targetId].filter(u => u.userId !== data.userId);
                    }
                    return { typingUsers: cleaned };
                });
            }, 3000);
        };
        const handleReconnect = () => get().handleCollabReconnect();
        const handleConnect = () => get().handleCollabReconnect();

        socket.on('presence:update', handlePresenceUpdate);
        socket.on('activity:new', handleActivityNew);
        socket.on('chat:message', handleChatMessage);
        socket.on('chat:typing', handleChatTyping);
        socket.on('reconnect', handleReconnect);
        socket.on('connect', handleConnect);
        
        return () => {
             socket.off('presence:update', handlePresenceUpdate);
             socket.off('activity:new', handleActivityNew);
             socket.off('chat:message', handleChatMessage);
             socket.off('chat:typing', handleChatTyping);
             socket.off('reconnect', handleReconnect);
             socket.off('connect', handleConnect);
        };
    }
});
