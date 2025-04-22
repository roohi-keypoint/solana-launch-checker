# solana-launch-checker

A CLI tool to fetch the first deployment timestamp of a Solana program using its program ID. Powered by Helius RPC and @solana/web3.js.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features
- Fetches the first deployment timestamp for any Solana program
- Simple CLI interface
- TypeScript, modern, and clean codebase

## Installation

```sh
yarn install
```

## Build

```sh
yarn build
```

## Testing

```sh
yarn test
```

This will run all tests in the project using Jest.

## Usage

```sh
yarn ts-node src/index.ts <PROGRAM_ID>
```

Replace `<PROGRAM_ID>` with the Solana program ID you want to check.


## License
MIT

---

## Environment Variables

This project requires a Helius API key. Set it in an environment variable named `HELIUS_API_KEY`.

1. Copy the `.env.example` file to `.env`:

   ```sh
   cp .env.example .env
   ```

2. Edit `.env` and replace `your_helius_api_key_here` with your actual Helius API key.

The CLI will automatically use this key when running commands.

---

Contributions welcome.
