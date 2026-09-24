import { UserProfile } from '@shared/types';
import { Server } from 'socket.io';

declare global {
    namespace Express {
        export export interface
            user?: UserProfile;
            io?: Server;
        }
    }
}
