# Children Gemini Chat

This project is a chat application built with Next.js, React, and Tailwind CSS. It uses the Gemini API for chat functionality.

## Requirements

* [Bun](https://bun.sh/) (version 1.0 or higher)

## Installation

1. Clone the repository:

    ```bash
    git clone <repository_url>
    cd children-gemini-chat
    ```

2. Install dependencies using Bun:

    ```bash
    bun install
    ```

## Configuration

1. Create a `.env.local` file in the project root.

2. Add the following environment variables:

    ```plaintext
    GOOGLE_API_KEY=<your_google_api_key>
    ```

    You can obtain a Google API key from the [Google Cloud Console](https://console.cloud.google.com/). It should have Generative Language API enabled.

## Running the application

1. Start the development server:

    ```bash
    bun run dev
    ```

2. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Deployment

The project can be deployed to any platform that supports Next.js deployments, such as Vercel or Netlify.

1. Build the application:

    ```bash
    bun run build
    ```

2. Deploy the `out` directory to your chosen platform.

## Linting and Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

* To format the code, run:

    ```bash
    bunx @biomejs/biome format ./src --write
    ```

* To lint the code, run:

    ```bash
    bunx @biomejs/biome lint ./src
    ```

## Contributing

Contributions are welcome! Please submit a pull request with your changes.
