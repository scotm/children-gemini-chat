"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { userProfiles, type UserProfile } from "@/lib/userProfile";
import { v4 as uuidv4 } from "uuid";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/lib/hooks/useSpeechSynthesis";
import { ProfileSelector } from "@/components/ProfileSelector";
import { ChatHistory } from "@/components/ChatHistory";
import { ChatInput } from "@/components/ChatInput";

export interface MessageType {
	id: string;
	sender: "user" | "bot";
	text: string;
}

export default function Home() {
	const [message, setMessage] = useState("");
	const [chatHistory, setChatHistory] = useState<MessageType[]>([]);
	const {
		isListening,
		transcript,
		error: speechError,
		toggleListening,
		resetTranscript,
	} = useSpeechRecognition({
		lang: "en-US",
		continuous: false,
		interimResults: false,
		onResult: (transcript, isFinal) => {
			if (isFinal && transcript) {
				setMessage(transcript);
				resetTranscript();
			}
		},
	});
	const [selectedProfile, setSelectedProfile] = useState<UserProfile>(
		userProfiles[0],
	);
	const {
		availableVoices,
		selectedVoice,
		setSelectedVoice,
		speak,
		speaking,
		stop: stopSpeaking,
	} = useSpeechSynthesis();

	const handleSendMessage = async () => {
		if (!message.trim()) return;

		const userMessage: MessageType = {
			id: uuidv4(),
			sender: "user",
			text: message,
		};
		setChatHistory((prevHistory) => [...prevHistory, userMessage]);
		setMessage("");

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: message,
					userProfile: selectedProfile,
				}),
			});

			if (!response.ok || !response.body) {
				console.error("Error sending message:", response.statusText);
				const errorMessage: MessageType = {
					id: uuidv4(),
					sender: "bot",
					text: "Sorry, I couldn't process your message right now.",
				};
				setChatHistory((prevHistory) => [...prevHistory, errorMessage]);
				speak(errorMessage.text);
				return;
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let botResponseText = "";
			const botMessageId = uuidv4();
			const botMessage: MessageType = {
				id: botMessageId,
				sender: "bot",
				text: "",
			};

			setChatHistory((prevHistory) => [...prevHistory, botMessage]);

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				botResponseText += chunk;

				setChatHistory((prevHistory) => {
					const lastMessage = prevHistory[prevHistory.length - 1];
					if (lastMessage.sender === "bot" && lastMessage.id === botMessageId) {
						return [
							...prevHistory.slice(0, -1),
							{ ...lastMessage, text: botResponseText },
						];
					}
					return prevHistory;
				});
			}

			speak(botResponseText);
			const audio = new Audio("/message.mp3");
			audio.play();
		} catch (error) {
			console.error("Error handling streaming response:", error);
			const errorMessage: MessageType = {
				id: uuidv4(),
				sender: "bot",
				text: "An error occurred while getting the response.",
			};
			setChatHistory((prevHistory) => [...prevHistory, errorMessage]);
			speak(errorMessage.text);
		}
	};

	const handleProfileChange = (profile: UserProfile) => {
		setSelectedProfile(profile);
	};

	return (
		<div className="flex flex-col h-screen p-4 sm:p-6 lg:p-8">
			<div className="mb-4">
				<ProfileSelector
					userProfiles={userProfiles}
					selectedProfile={selectedProfile}
					onProfileChange={handleProfileChange}
				/>
			</div>
			<ScrollArea className="flex-1 border rounded-md p-4 sm:p-6 mb-4">
				<ChatHistory chatHistory={chatHistory} />
			</ScrollArea>
			<ChatInput
				message={message}
				onMessageChange={setMessage}
				onSend={handleSendMessage}
				isListening={isListening}
				onVoiceInput={toggleListening}
			/>
		</div>
	);
}
