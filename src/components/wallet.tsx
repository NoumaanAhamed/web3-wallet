import { useState, useEffect } from "react";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { ethers } from "ethers";
import bs58 from "bs58";
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

interface Wallet {
    publicKey: string;
    privateKey: string;
    blockchain: string;
}

type SupportedBlockchain = 'solana' | 'ethereum';

const DERIVATION_PATHS: Record<SupportedBlockchain, (index: number) => string> = {
    solana: (index: number) => `m/44'/501'/${index}'/0'`,
    ethereum: (index: number) => `m/44'/60'/${index}'/0'`,
};

const BlockchainWalletGenerator: React.FC = () => {
    const [mnemonic, setMnemonic] = useState<string>('');
    const [customMnemonic, setCustomMnemonic] = useState<string>('');
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isCustomMnemonic, setIsCustomMnemonic] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
    const [showPrivateKeys, setShowPrivateKeys] = useState<boolean[]>([]);
    const [selectedBlockchain, setSelectedBlockchain] = useState<SupportedBlockchain>('solana');

    useEffect(() => {
        if (!mnemonic) {
            setMnemonic(generateMnemonic());
        }
    }, [mnemonic]);

    useEffect(() => {
        // Clear wallets when blockchain is switched
        setWallets([]);
        setShowPrivateKeys([]);
    }, [selectedBlockchain]);

    const deriveWallet = (seed: Buffer, blockchain: SupportedBlockchain, index: number): Wallet => {
        const path = DERIVATION_PATHS[blockchain](index);

        if (blockchain === 'solana') {
            const derivedSeed = derivePath(path, seed.toString('hex')).key;
            const keypair = Keypair.fromSeed(derivedSeed);
            return {
                publicKey: keypair.publicKey.toBase58(),
                privateKey: bs58.encode(keypair.secretKey),
                blockchain
            };
        } else if (blockchain === 'ethereum') {
            const hdNode = ethers.HDNodeWallet.fromSeed(seed);
            const wallet = hdNode.derivePath(path);
            return {
                publicKey: wallet.address,
                privateKey: wallet.privateKey,
                blockchain
            };
        }

        throw new Error('Unsupported blockchain');
    };

    const generateWallet = () => {
        setError('');
        const mnemonicToUse = isCustomMnemonic ? customMnemonic : mnemonic;

        if (!validateMnemonic(mnemonicToUse)) {
            setError('Invalid mnemonic phrase. Please check and try again.');
            return;
        }

        const seed = mnemonicToSeedSync(mnemonicToUse);
        const newWallet = deriveWallet(seed, selectedBlockchain, wallets.length);
        setWallets(prevWallets => [...prevWallets, newWallet]);
        setShowPrivateKeys(prevState => [...prevState, false]);
    };

    const togglePrivateKey = (index: number) => {
        setShowPrivateKeys(prevState => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            return newState;
        });
    };

    const deleteWallet = (index: number) => {
        setWallets(prevWallets => prevWallets.filter((_, i) => i !== index));
        setShowPrivateKeys(prevState => prevState.filter((_, i) => i !== index));
    };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="min-h-screen bg-background text-foreground">
                <div className="container mx-auto p-4">
                    <div className="flex justify-end mb-4">
                        <ModeToggle />
                    </div>
                    <Card className="w-full max-w-2xl mx-auto">
                        <CardHeader>
                            <h2 className="text-2xl font-bold">Blockchain Wallet Generator</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <Select
                                    onValueChange={(value: string) => setSelectedBlockchain(value as SupportedBlockchain)}
                                    value={selectedBlockchain}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Blockchain" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="solana">Solana</SelectItem>
                                        <SelectItem value="ethereum">Ethereum</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="space-y-4">
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
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold">Generated Mnemonic:</h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowMnemonic(!showMnemonic)}
                                                >
                                                    {showMnemonic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <p className="break-words bg-gray-100 dark:bg-gray-800 p-3 rounded">
                                                {showMnemonic ? mnemonic : '••••• ••••• ••••• •••••'}
                                            </p>
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
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Generated Wallets:</h3>
                                        {wallets.map((wallet, index) => (
                                            <Card key={index} className="p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-semibold">
                                                        {wallet.blockchain.charAt(0).toUpperCase() + wallet.blockchain.slice(1)} Wallet {index + 1}
                                                    </h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteWallet(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    <p><strong>Public Key:</strong> {wallet.publicKey}</p>
                                                    <div className="flex items-center justify-between">
                                                        <strong>Private Key:</strong>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => togglePrivateKey(index)}
                                                        >
                                                            {showPrivateKeys[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                    <p className="break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                                        {showPrivateKeys[index] ? wallet.privateKey : '••••••••••••••••••••••••••••••••'}
                                                    </p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default BlockchainWalletGenerator;