import { BrowserState } from '@/types/browser';
import { ActionResult } from '@/types/agent';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export class CustomAgentMessagePrompt {
    constructor(
        public state: BrowserState,
        public result: ActionResult[] | null = null,
        public includeAttributes: string[] = [],
        public maxErrorLength: number = 400,
    ) { }

    public get_user_message(): HumanMessage {


        console.log("Current browser state:", this.state);

        const tabs = this.state.tabs || []; // tabsがundefinedの場合は空配列を設定
        const elementTree = this.state.element_tree || { clickable_elements_to_string: () => '' }; // デフォルトの関数を設定

        // urlがundefinedの場合はデフォルトのメッセージを設定
        const currentUrl = this.state.url || 'No URL available';

        let stateDescription = `
1. Current URL: ${currentUrl}
2. Available Tabs: ${tabs.length > 0 ? tabs?.join(', ') : 'No tabs available'}
3. Interacted Elements: ${elementTree.clickable_elements_to_string(this.includeAttributes)}
`;

        if (this.result) {
            for (let i = 0; i < this.result.length; i++) {
                const result = this.result[i];
                if (result.extracted_content) {
                    stateDescription += `\nResult of action ${i + 1}: ${result.extracted_content}`;
                }
                if (result.error) {
                    const error = result.error.slice(-this.maxErrorLength);
                    stateDescription += `\nError of action ${i + 1}: ...${error}`;
                }
            }
        }

        return new HumanMessage({
            content: stateDescription,
        });
    }
}

export class CustomSystemPrompt {
    public important_rules(): string {
        return new SystemMessage({
            content: 'Please follow the important rules for the agent.'
        });
    }
}
