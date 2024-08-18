# Solana Wallet Generator

## Description

The Solana Wallet Generator is a React-based web application that allows users to generate multiple Solana wallets from a single mnemonic phrase. Users can either use an automatically generated mnemonic or input their own custom mnemonic. The application provides both public and private keys for each generated wallet.

## Features

- Generate a random mnemonic phrase
- Option to use a custom mnemonic phrase
- Generate multiple Solana wallets from a single mnemonic
- Display public and private keys for each generated wallet
- User-friendly interface with clear instructions

## Technologies Used

- React
- TypeScript
- bip39 (for mnemonic generation and validation)
- ed25519-hd-key (for key derivation)
- @solana/web3.js (for Solana-specific functionality)
- tweetnacl (for cryptographic operations)
- UI components from a custom UI library (likely shadcn/ui based on import statements)

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies using npm or yarn:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

## Usage

1. Open the application in your web browser.
2. You'll see a generated mnemonic phrase displayed.
3. If you want to use your own mnemonic, toggle the "Use custom mnemonic" switch and enter your phrase.
4. Click the "Generate New Wallet" button to create a new wallet.
5. Each generated wallet will be displayed with its public and private keys.
6. Repeat step 4 to generate additional wallets using the same mnemonic.

## Security Considerations

- This application is for educational and testing purposes only.
- Never share your mnemonic phrase or private keys with anyone.
- For production use, consider implementing additional security measures and handling private keys server-side.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk.
