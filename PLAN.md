# AI Chatbot for Children - Plan

This document outlines the plan for designing and implementing an AI chatbot for children powered by Google Gemini Flash, using Next.js, Tailwind CSS, React, Biome, and shadcn/ui.

## 1. Chatbot Names

Here are some creative, memorable, and child-friendly names for the chatbot:

* SparkleChat
* WonderBot
* StoryFriend
* GiggleGenie
* BrightBuddy
* DreamWeaver
* CurioBot
* PlayPal
* ImagineerAI

## 2. Technology Stack

The core technology stack will include:

* **Frontend Framework:** Next.js (React)
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui (built on Tailwind CSS and Radix UI)
* **Code Formatting/Linting:** Biome
* **Package Manager:** Bun
* **AI Model:** Google Gemini Flash

Biome will be configured to enforce standard, widely accepted rules for React/Next.js and TypeScript projects.

## 3. System Prompt Definition

The mandatory system prompt will follow this template structure:

```plaintext
You are [Persona Definition], designed to interact with children.

The user is a [User Profile: age, key characteristics/interests].

# Rules
*   Language Style: [Specify clarity, friendliness, age-appropriateness].
*   Engagement Strategy: [Mandate the use of open-ended questions].
*   Safety Guardrails & Specific Handling Instructions: [Include rules for sensitive topics, maintaining childhood beliefs, avoiding scary content, encouraging discussion with trusted adults, etc.].
```

**Concrete Example System Prompt (for an 8-year-old, bright, curious, imaginative, and creative girl):**

```plaintext
You are SparkleBot, a friendly, curious, and encouraging chat companion designed to explore ideas and have fun conversations with children.

The user is an 8-year-old girl. She is bright, curious, imaginative, and creative.

# Rules
*   Communicate using clear, simple, and positive language suitable for an 8-year-old.
*   Be enthusiastic and encouraging.
*   Always ask open-ended questions to keep the conversation going and encourage her imagination.
*   Do not reveal the truth about figures like Santa Claus or the Tooth Fairy; uphold these childhood beliefs.
*   If the user asks about complex or mature topics (like romantic relationships, kissing, or upsetting world events), provide a very simple, sensitive, age-appropriate answer and gently encourage her to talk to a trusted grown-up (like a parent or teacher) about it too. Example response pattern: "That's a thoughtful question! Grown-ups often [brief, simple explanation]. It's a good idea to chat with your mom, dad, or another trusted grown-up about these things too, as they can explain more."
*   Avoid generating scary or overly complex stories. Keep themes light and positive.
*   Focus on creativity, learning through play, and imagination.
```

## 4. Functional Requirements

* **Streaming Responses:** AI-generated responses will be streamed token-by-token to the user interface.
* **Speech Capabilities:**
  * **Speech-to-Text (STT):** Integrate STT for voice input.
  * **Text-to-Speech (TTS):** Integrate TTS for audible chatbot responses using a child-appropriate voice.

## 5. User Interface (UI) and Visual Persona

Key design considerations for the UI and visual persona:

* Bright, cheerful, and attractive color palette.
* Clear, easy-to-read typography.
* Simple, intuitive, and uncluttered layout with large, tappable elements.
* Friendly and appealing visual persona/avatar.
* Subtle, playful animations and sound effects.
* Straightforward and visually guided navigation.

## 6. Detailed Implementation Requirements

This section breaks down the plan into specific, actionable requirements:

### 6.1. Project Setup and Dependencies

* Verify the integrity and standard Next.js structure of the current project directory.
* Confirm that Bun is configured as the project's package manager.
* Install the `@google/generative-ai` SDK as a project dependency.
* Ensure Tailwind CSS is correctly installed and configured within the Next.js project.
* Install and configure shadcn/ui components, starting with necessary components for a chat interface (e.g., Button, Input, ScrollArea).
* Research, select, and install appropriate libraries for Speech-to-Text (STT) and Text-to-Speech (TTS) functionality that are compatible with a Next.js frontend and potentially a Node.js backend if a server-side STT/TTS is chosen.
* Set up environment variables to securely store API keys required for Google Gemini and any chosen STT/TTS services.

### 6.2. Biome Configuration

* Configure the `biome.json` file to include formatting rules for consistent code style across the project.
* Configure Biome linting rules to enforce best practices for React, Next.js, and TypeScript code.
* Add npm/Bun scripts to `package.json` for easily running Biome formatting and linting checks.

### 6.3. Core Chat Functionality (Gemini Integration, Streaming)

* Create a new API route within the `src/app/api` directory (or a suitable location for API routes in the project structure) to handle incoming chat messages.
* Implement server-side logic within the API route to initialize the Google Gemini model using the provided API key.
* Construct the API request to the Gemini model, including the user's message and the dynamically generated system prompt.
* Configure the Gemini API call to receive responses as a stream.
* Implement server-side logic to forward the streamed tokens from the Gemini API to the frontend client.
* On the frontend, implement JavaScript/TypeScript code to establish a connection to the API route and receive the streamed tokens.
* Develop frontend logic to append and display the received tokens in the chat message area in real-time.

### 6.4. Speech Capabilities (STT, TTS)

* Implement Speech-to-Text (STT) functionality on the frontend, allowing users to provide voice input. This should include handling browser permissions for microphone access.
* Design and implement a clear UI indicator (e.g., a pulsing microphone icon) when STT is active and listening.
* Convert the transcribed text from STT into a string that can be sent as a user message.
* Implement Text-to-Speech (TTS) functionality on the frontend to audibly read out the chatbot's responses.
* Select and configure a specific voice for the TTS output that is friendly, clear, and appropriate for children.
* Ensure the TTS output plays automatically when a new chatbot message is received.

### 6.5. User Interface (UI) Development

* Design and implement the overall chat interface layout using Tailwind CSS, adhering to a bright and child-friendly color scheme.
* Implement responsive design principles so the UI is usable on different screen sizes.
* Develop a component for displaying individual chat messages, clearly distinguishing between user and chatbot messages.
* Implement a scrollable container for chat messages that automatically scrolls to the latest message.
* Develop an input area component that includes a text input field and a button for initiating STT.
* Design and implement the chatbot's visual avatar or persona within the UI.
* Incorporate subtle animations for message entry and streaming responses to enhance the user experience.

### 6.6. System Prompt Implementation

* Define a data structure or configuration file to store the system prompt template and potentially pre-defined user profiles or characteristics.
* Implement a function or utility to dynamically generate the complete system prompt string by combining the template with the specific user's profile information.
* Ensure this dynamic system prompt generation is called before each API request to the Gemini model.
