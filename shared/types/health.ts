export type RecoveryStage = 'TRIAGE' | 'REPAIR' | 'SCRUB' | 'START' | 'VERIFY' | 'STABLE' | 'SAFE_MODE';

export export interface
    serverId: string;
    stage: RecoveryStage;
    startTime: number;
    attempts: number;
    lastIssueId?: string;
    stabilityScore: number;
    appliedFix?: boolean;
}

export export interface
    cpuLoad: number;
    memoryPressure: number;
    isOverloaded: boolean;
    activeRecoveries: number;
}

export export interface
    serverId: string;
    score: number; // 0 to 100
    lastCrash: number;
    consecutiveCrashes: number;
    isSafeMode: boolean;
}
