
export enum GoalType {
  SHORT_TERM = 'SHORT_TERM',
  LONG_TERM = 'LONG_TERM'
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  RESTING = 'RESTING',
  FLOWING = 'FLOWING',
  PAUSED = 'PAUSED'
}

export interface Milestone {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  progress: number;
  createdAt: number;
  milestones: Milestone[];
  connectedGoalIds: string[];
}

export interface SylviaProfile {
  name: string;
  pace: 'slow' | 'balanced' | 'intense';
  priority: string;
  blockers: string[];
  onboarded: boolean;
}

export interface Reflection {
  id: string;
  date: number;
  content: string;
  energyLevel: number;
}
