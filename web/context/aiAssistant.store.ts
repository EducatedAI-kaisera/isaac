import { create } from 'zustand';

// Define the state shape with an interface
interface AIAssistantState {
	open: boolean;
	X: number;
	Y: number;
	openModal: () => void;
	closeModal: () => void;
	setCursorPosition: (X: number, Y: number) => void;
	AIOutput: string;
	setAIOutput: (AIOutput: string) => void;
	cachedSelection: any;
	setCachedSelection: (cachedSelection: any) => void;
}

// Create the store with the defined types
const useAIAssistantStore = create<AIAssistantState>(set => ({
	open: false,
	openModal: () => set({ open: true }),
	closeModal: () => set({ open: false }),
	X: 0,
	Y: 0,
	setCursorPosition: (X, Y) => {
		set({ X, Y });
	},
	AIOutput: '',
	setAIOutput: (AIOutput: string) => {
		set({ AIOutput });
	},
	cachedSelection: '',
	setCachedSelection: (cachedSelection: any) => {
		set({ cachedSelection });
	},
}));

export default useAIAssistantStore;
