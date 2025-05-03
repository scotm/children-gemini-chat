import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
	message: string;
	onMessageChange: (value: string) => void;
	onSend: () => void;
	isListening: boolean;
	onVoiceInput: () => void;
}

export function ChatInput({
	message,
	onMessageChange,
	onSend,
	isListening,
	onVoiceInput,
}: ChatInputProps) {
	return (
		<div className="flex gap-2">
			<Input
				placeholder="Type your message or use voice input..."
				value={message}
				onChange={(e) => onMessageChange(e.target.value)}
				onKeyPress={(e) => {
					if (e.key === "Enter") {
						onSend();
					}
				}}
			/>
			<Button
				onClick={onVoiceInput}
				className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
			>
				{isListening ? "Listening..." : "Voice Input"}
			</Button>
		</div>
	);
}
