# Browser Use WebUI (Next.js Version)

This is a Next.js implementation of the Browser Use WebUI, designed to provide a modern web interface for controlling browsers with AI assistance.

## Features

- 🌐 Modern UI built with Next.js 15 and TypeScript
- 🎨 Elegant design using Tailwind CSS and shadcn/ui components
- 🤖 Support for multiple LLM providers (OpenAI, Anthropic, Gemini, etc.)
- 🔄 Real-time browser control using WebSocket
- 📱 Responsive design for all screen sizes
- 🌙 Dark mode support
- 🐳 Docker support for easy deployment

## Prerequisites

- Node.js 18.17 or later
- Python 3.11 or later (for backend)
- Docker and Docker Compose (optional)

## Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/virtuarian/web-ui-next.git
cd web-ui-next
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file and add your API keys.

5. Start the development server:
```bash
npm run dev
```

### Docker Development

1. Clone the repository and copy environment variables:
```bash
git clone https://github.com/your-username/web-ui-next.git
cd web-ui-next
cp .env.example .env
```

2. Edit `.env` file and add your API keys.

3. Start the Docker containers:
```bash
docker-compose up -d
```

## Project Structure

```
web-ui-next/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/             # Utilities and shared logic
│   ├── hooks/           # Custom React hooks
│   ├── store/           # State management (Zustand)
│   └── types/           # TypeScript type definitions
├── public/              # Static files
└── python/             # Python backend
```

## Development

### Frontend Development

The frontend is built with:
- Next.js 15 for the framework
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for UI components
- Zustand for state management

### Backend Integration

The frontend communicates with the Python backend through:
- REST API for configuration and commands
- WebSocket for real-time browser updates
- Binary data for screenshots and recordings

## Configuration

### Environment Variables

- `NEXT_PUBLIC_WS_URL`: WebSocket server URL
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `CHROME_PATH`: Path to Chrome executable (optional)
- `CHROME_USER_DATA`: Chrome user data directory (optional)
- Various API keys for LLM providers

### Browser Settings

You can configure:
- Browser window size
- Headless mode
- Security settings
- Recording options
- Session persistence

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original [browser-use](https://github.com/browser-use/browser-use) project
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Next.js](https://nextjs.org/) team for the amazing framework