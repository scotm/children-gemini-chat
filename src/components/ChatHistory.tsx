import type { MessageType } from "@/app/page";

export function ChatHistory({ chatHistory }: { chatHistory: MessageType[] }) {
	return (
		<div className="flex flex-col gap-4">
			{chatHistory.map((msg) => (
				<div
					key={msg.id}
					className={`flex items-start gap-2 ${
						msg.sender === "user" ? "justify-end" : "justify-start"
					} animate-fade-in`}
				>
					{msg.sender === "bot" && (
						<div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
							AI
						</div>
					)}
					<div
						className={`p-3 rounded-lg max-w-[70%] ${
							msg.sender === "user"
								? "bg-blue-400 text-white"
								: "bg-yellow-100 text-gray-800"
						}`}
					>
						{msg.text}
					</div>
				</div>
			))}
			{chatHistory.length === 0 && (
				<p className="text-center text-gray-500">Start the conversation!</p>
			)}
		</div>
	);
}
