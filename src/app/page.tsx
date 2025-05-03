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

interface MessageType {
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
				<Select
					onValueChange={(value) => {
						const profile = userProfiles.find(
							(p) => p.age.toString() === value,
						);
						if (profile) {
							handleProfileChange(profile);
						}
					}}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select profile" />
					</SelectTrigger>
					<SelectContent>
						{userProfiles.map((profile) => (
							<SelectItem key={profile.age} value={profile.age.toString()}>
								{profile.age} years old
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<ScrollArea className="flex-1 border rounded-md p-4 sm:p-6 mb-4">
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
			</ScrollArea>

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
				<Button
					onClick={toggleListening}
					className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
				>
					{isListening ? "Listening..." : "Voice Input"}
				</Button>
			</div>
		</div>
	);
}
