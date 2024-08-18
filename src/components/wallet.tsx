import { useState, useEffect } from "react";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
// import nacl from "tweetnacl";
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Wallet {
    publicKey: string;
    privateKey: string;
}

const SolanaWalletGenerator: React.FC = () => {
    const [mnemonic, setMnemonic] = useState<string>('');
    const [customMnemonic, setCustomMnemonic] = useState<string>('');
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isCustomMnemonic, setIsCustomMnemonic] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!mnemonic) {
            setMnemonic(generateMnemonic());
        }
    }, [mnemonic]);

    const deriveSolanaWallet = (seed: Buffer, index: number): Wallet => {
        const path = `m/44'/501'/${index}'/0'`;
        const derivedSeed = derivePath(path, seed.toString('hex')).key;
        const keypair = Keypair.fromSeed(derivedSeed);
        return {
            publicKey: keypair.publicKey.toBase58(),
            privateKey: bs58.encode(keypair.secretKey),
        };
    };

    const generateWallet = () => {
        setError('');
        const mnemonicToUse = isCustomMnemonic ? customMnemonic : mnemonic;

        if (!validateMnemonic(mnemonicToUse)) {
            setError('Invalid mnemonic phrase. Please check and try again.');
            return;
        }

        const seed = mnemonicToSeedSync(mnemonicToUse);
        const newWallet = deriveSolanaWallet(seed, wallets.length);
        setWallets([...wallets, newWallet]);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <h2 className="text-2xl font-bold">Solana Wallet Generator</h2>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="custom-mnemonic"
                                checked={isCustomMnemonic}
                                onCheckedChange={setIsCustomMnemonic}
                            />
                            <Label htmlFor="custom-mnemonic">Use custom mnemonic</Label>
                        </div>
                        {isCustomMnemonic ? (
                            <Input
                                type="text"
                                value={customMnemonic}
                                onChange={(e) => setCustomMnemonic(e.target.value)}
                                placeholder="Enter your custom mnemonic phrase"
                            />
                        ) : (
                            <div>
                                <h3 className="text-lg font-semibold">Generated Mnemonic:</h3>
                                <p className="break-words bg-gray-100 p-2 rounded">{mnemonic}</p>
                            </div>
                        )}
                    </div>
                    <Button onClick={generateWallet} className="w-full">
                        Generate New Wallet
                    </Button>
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {wallets.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold">Generated Wallets:</h3>
                            {wallets.map((wallet, index) => (
                                <div key={index} className="mt-2 p-2 border rounded">
                                    <p><strong>Wallet {index + 1}</strong></p>
                                    <p><strong>Public Key:</strong> {wallet.publicKey}</p>
                                    <p><strong>Private Key:</strong> {wallet.privateKey}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default SolanaWalletGenerator;