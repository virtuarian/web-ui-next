// src/types/agent.ts

export interface AgentOutput {
  action: any[]; // Placeholder - replace with actual Action type array
  current_state: { // Placeholder - replace with actual CurrentState type
    prev_action_evaluation: string; // Placeholder
    important_contents: string;    // Placeholder
    completed_contents: string;    // Placeholder
    thought: string;             // Placeholder
    summary: string;             // Placeholder
  };
}

export interface AgentStepInfo { // AgentStepInfo interface
 step_number: number;      // Placeholder
 task_progress: string;    // Placeholder
 memory: string;           // Placeholder
}

export interface ActionResult { // ActionResult interface
extracted_content: string | null; // Placeholder
error: string | null;           // Placeholder
is_done: boolean;             // Placeholder
}