"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Will use later for chat messages

// Define a type for chat messages
interface MessageType {
	sender: "user" | "bot";
	text: string;
}

export default function Home() {
	const [message, setMessage] = useState("");
	const [chatHistory, setChatHistory] = useState<MessageType[]>([]); // Will use later for chat history
	const [isListening, setIsListening] = useState(false); // For STT indicator
	const [recognition, setRecognition] = useState<SpeechRecognition | null>(
		null,
	);

	// Implement STT logic here
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// With @types/dom-speech-recognition installed, types should be available
		if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			const recognitionInstance = new SpeechRecognition();
			recognitionInstance.continuous = false;
			recognitionInstance.interimResults = false;
			recognitionInstance.lang = "en-US"; // Set language

			recognitionInstance.onstart = () => {
				setIsListening(true);
			};

			// Explicitly type event using SpeechRecognitionEvent
			recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
				const transcript = event.results[0][0].transcript;
				setMessage(transcript);
				setIsListening(false);
			};

			// Explicitly type event using SpeechRecognitionErrorEvent
			recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
				console.error("Speech recognition error:", event.error);
				setIsListening(false);
			};

			recognitionInstance.onend = () => {
				setIsListening(false);
			};

			setRecognition(recognitionInstance);
		} else {
			console.warn("Speech Recognition not supported in this browser.");
			// Optionally disable the STT button or show a message
		}

		// Cleanup
		return () => {
			if (recognition) {
				recognition.stop();
			}
		};
	}, []); // Empty dependency array means this effect runs once on mount

	const toggleListening = () => {
		if (recognition) {
			if (isListening) {
				recognition.stop();
			} else {
				recognition.start();
			}
		}
	};

	const [selectedVoice, setSelectedVoice] =
		useState<SpeechSynthesisVoice | null>(null);

	// TODO: Implement sending message to API and handling streaming response

	// Implement TTS logic here
	const speakText = (text: string) => {
		if ("speechSynthesis" in window) {
			const utterance = new SpeechSynthesisUtterance(text);

			// TODO: Select a child-appropriate voice
			if (selectedVoice) {
				utterance.voice = selectedVoice;
			} else {
				// Use the first available voice if none is selected
				const voices = window.speechSynthesis.getVoices();
				if (voices.length > 0) {
					utterance.voice = voices[0];
				}
			}

			window.speechSynthesis.speak(utterance);
		} else {
			console.warn("Text-to-Speech not supported in this browser.");
		}
	};

	const handleSendMessage = async () => {
		if (!message.trim()) return; // Prevent sending empty messages

		const userMessage: MessageType = { sender: "user", text: message };
		setChatHistory((prevHistory) => [...prevHistory, userMessage]);
		setMessage(""); // Clear input immediately

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: message }),
			});

			if (!response.ok || !response.body) {
				console.error("Error sending message:", response.statusText);
				const errorMessage: MessageType = {
					sender: "bot",
					text: "Sorry, I couldn't process your message right now.",
				};
				setChatHistory((prevHistory) => [...prevHistory, errorMessage]);
				speakText(errorMessage.text);
				return;
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let botResponseText = "";
			const botMessage: MessageType = { sender: "bot", text: "" };

			// Add a placeholder for the bot's message and update it as chunks arrive
			setChatHistory((prevHistory) => [...prevHistory, botMessage]);

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				botResponseText += chunk;

				// Update the last message in chat history with the new chunk
				setChatHistory((prevHistory) => {
					const lastMessage = prevHistory[prevHistory.length - 1];
					if (lastMessage.sender === "bot") {
						return [
							...prevHistory.slice(0, -1),
							{ ...lastMessage, text: botResponseText },
						];
					}
					return prevHistory; // Should not happen if logic is correct
				});

				// Speak the chunk (optional, can speak full response at the end)
				// speakText(chunk); // Speaking chunk by chunk might be too fast/choppy
			}

			// Speak the full response after streaming is complete
			speakText(botResponseText);
		} catch (error) {
			console.error("Error handling streaming response:", error);
			const errorMessage: MessageType = {
				sender: "bot",
				text: "An error occurred while getting the response.",
			};
			setChatHistory((prevHistory) => [...prevHistory, errorMessage]);
			speakText(errorMessage.text);
		}
	};

	const [availableVoices, setAvailableVoices] = useState<
		SpeechSynthesisVoice[]
	>([]);

	// Add useEffect to load voices and set a default child voice
	useEffect(() => {
		const loadVoices = () => {
			const voices = window.speechSynthesis.getVoices();
			setAvailableVoices(voices);

			// Implement logic to select a child-appropriate voice
			let childVoice = voices.find(
				(voice) =>
					voice.name.toLowerCase().includes("child") ||
					voice.name.toLowerCase().includes("kid") ||
					voice.name.toLowerCase().includes("junior"),
				// Add other potential keywords or criteria
			);

			// If no specific child voice is found, try to find a standard female voice
			if (!childVoice) {
				childVoice = voices.find((voice) =>
					voice.name.toLowerCase().includes("female"),
				);
			}

			// If a suitable voice is found, set it, otherwise use the first available voice
			if (childVoice) {
				setSelectedVoice(childVoice);
			} else if (voices.length > 0) {
				setSelectedVoice(voices[0]);
			}
		};

		// Load voices initially
		loadVoices();

		// Voices might not be immediately available, listen for the 'voiceschanged' event
		if ("speechSynthesis" in window) {
			window.speechSynthesis.onvoiceschanged = loadVoices;
		}

		// Cleanup
		return () => {
			if ("speechSynthesis" in window) {
				window.speechSynthesis.onvoiceschanged = null;
			}
		};
	}, []); // Empty dependency array means this effect runs once on mount

	return (
		<div className="flex flex-col h-screen p-4">
			{/* Chat messages display area */}
			<ScrollArea className="flex-1 border rounded-md p-4 mb-4">
				<div className="flex flex-col gap-4">
					{chatHistory.map((msg, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: Using index as key temporarily until unique IDs are implemented
							key={index}
							className={`flex items-start gap-2 ${
								msg.sender === "user" ? "justify-end" : "justify-start"
							}`}
						>
							{/* Chatbot Avatar Placeholder */}
							{msg.sender === "bot" && (
								<div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
									AI
								</div>
							)}
							<div
								className={`p-3 rounded-lg max-w-[70%] ${
									msg.sender === "user"
										? "bg-blue-500 text-white"
										: "bg-gray-200 text-gray-800"
								}`}
							>
								{msg.text}
							</div>
							{/* User Avatar Placeholder (Optional) */}
							{/* {msg.sender === "user" && (
								<div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
									You
								</div>
							)} */}
						</div>
					))}
					{/* Placeholder message if chatHistory is empty */}
					{chatHistory.length === 0 && (
						<p className="text-center text-gray-500">Start the conversation!</p>
					)}
				</div>
			</ScrollArea>

			{/* Input area */}
			<div className="flex gap-2">
				<Input
					placeholder="Type your message or use voice input..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyPress={(e) => {
						if (e.key === "Enter") {
							handleSendMessage();
						}
					}}
				/>
				{/* STT Button */}
				<Button
					onClick={toggleListening}
					className={isListening ? "bg-red-500 hover:bg-red-600" : ""} // Change color when listening
				>
					{isListening ? "Listening..." : "Voice Input"}
				</Button>
				{/* Send Button - Will use later */}
				{/* <Button onClick={handleSendMessage}>Send</Button> */}
			</div>
		</div>
	);
}
