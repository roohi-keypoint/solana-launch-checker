# Solana Launch Checker

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> A CLI tool to fetch the first deployment timestamp of a Solana program using its program ID.  
> Powered by Helius RPC and @solana/web3.js.

## ✨ Features

- ⏱️ Fetches the first deployment timestamp for any Solana program
- 🖥️ Simple CLI interface with verbose output option
- 🔄 Robust error handling and request retries with exponential backoff
- ⚡ Efficient transaction history traversal
- 📝 TypeScript, modern, and clean codebase

## 🚀 Getting Started

### Installation

```sh
yarn install
```

### Build

```sh
yarn build
```

### Testing

```sh
yarn test
```

This will run all tests in the project using Jest.

#### Test Coverage

```sh
yarn test:coverage
```

This generates coverage reports in the `coverage` directory, including HTML reports that can be viewed in a browser.

## 🖥️ Usage

```sh
yarn ts-node src/index.ts <PROGRAM_ID> [--verbose]
```

**Parameters:**
- `<PROGRAM_ID>`: The Solana program ID you want to check
- `--verbose`: (Optional) Get detailed logs of the process, including API calls and intermediate results

## 🐳 Docker

Build the image:
```sh
docker build -t solana-launch-checker .
```

Run a container:
```sh
docker run --rm -e HELIUS_API_KEY=your_helius_api_key solana-launch-checker <PROGRAM_ID>
```

---

## ⚙️ Environment Setup

This project requires a Helius API key to function properly.

### Setting up your API key:

1. Copy the example environment file:
   ```sh
   cp .env.example .env
   ```

2. Edit the `.env` file and add your API key:
   ```
   HELIUS_API_KEY=your_helius_api_key_here
   ```

> **Note:** The CLI will automatically use this key when running commands.

---

## 🏗️ Architecture

The project follows a modular architecture with clean separation of concerns:

### 📦 Core Components

| Component | Description |
|-----------|-------------|
| **Entry Point** <br>`index.ts` | Main CLI entry point that orchestrates the workflow |
| **Solana Service** <br>`services/solana.ts` | Handles all blockchain interactions using Helius RPC |
| **Utility Modules** | Collection of focused utility modules |

#### Utility Modules:

- `cli.ts`: Command-line argument parsing
- `logger.ts`: Configurable logging system
- `retry.ts`: Advanced retry mechanism with decorator pattern
- `format.ts`: Output formatting utilities
- `time.ts`: Time-related utilities including backoff calculations
- `env.ts`: Environment variable management

### 🧩 Key Design Patterns

- **Service Pattern**: Encapsulates external API interactions
- **Decorator Pattern**: Used for method retries
- **Factory Pattern**: For creating configured instances (loggers)
- **Configuration Objects**: For flexible service initialization

### 🔄 Data Flow

1. CLI arguments are parsed
2. Solana client initialized with provided configuration
3. Program signatures are retrieved in batches (pagination)
4. Oldest signature is identified
5. Transaction timestamp is fetched and formatted
6. Result is presented to the user

> The architecture prioritizes reliability through retry mechanisms, developer experience through verbose logging options, and maintainability through clean code separation.

---

## 👥 Contributing

Contributions are welcome! We appreciate your help in making this project better.

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork:
   ```
   git clone https://github.com/your-username/solana-launch-checker.git
   ```
3. **Create** your feature branch:
   ```
   git checkout -b feature/amazing-feature
   ```
4. **Commit** your changes:
   ```
   git commit -m 'Add some amazing feature'
   ```
5. **Push** to the branch:
   ```
   git push origin feature/amazing-feature
   ```
6. **Open** a Pull Request
