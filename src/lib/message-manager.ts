// src/lib/message-manager.ts

export class MessageManager {
    private messages: any[]; // Array to store messages

    constructor() {
        this.messages = []; // Initialize messages array in constructor
    }

    addStateMessage(state: any, lastResult: any, stepInfo: any): void {
        // Implementation for add_state_message
        console.log("MessageManager.addStateMessage() - START", state, lastResult, stepInfo);
        const message = { // Create message object
            state: state,
            lastResult: lastResult,
            stepInfo: stepInfo,
            timestamp: new Date().toISOString(), // Add timestamp to message
        };
        this.messages.push(message); // Add message to messages array
        console.log("MessageManager.addStateMessage() - Added message:", message); // Log added message
        console.log("MessageManager.addStateMessage() - END");
    }

    getMessages(): any[] {
        // Implementation for get_messages
        console.log("MessageManager.getMessages() - START");
        console.log("MessageManager.getMessages() - Returning messages:", this.messages); // Log messages being returned
        console.log("MessageManager.getMessages() - END");
        return this.messages; // Return messages array
    }
}