import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WalletDetails {
    publicKey: string;
    balance: number;
    blockchain: string;
}

export const WalletDetails: React.FC = () => {
    const { blockchain, publicKey } = useParams<{ blockchain: string; publicKey: string }>();
    const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);

    useEffect(() => {
        const fetchWalletBalance = async () => {
            try {
                if (blockchain && publicKey) {
                    if (blockchain === 'ethereum') {
                        const ethResponse = await axios.post(
                            process.env.ETHEREUM_RPC_URL || import.meta.env.VITE_ETHEREUM_RPC_URL,
                            {
                                jsonrpc: '2.0',
                                id: 1,
                                method: 'eth_getBalance',
                                params: [publicKey, 'latest'],
                            }
                        );
                        const ethBalance = parseFloat(ethers.formatEther(ethResponse.data.result));
                        setWalletDetails({ publicKey, balance: ethBalance, blockchain: 'ethereum' });
                    } else if (blockchain === 'solana') {
                        const solResponse = await axios.post(
                            process.env.SOLANA_RPC_URL || import.meta.env.VITE_SOLANA_RPC_URL,
                            {
                                jsonrpc: '2.0',
                                id: 1,
                                method: 'getBalance',
                                params: [publicKey],
                            }
                        );
                        const solBalance = solResponse.data.result.value / Math.pow(10, 9);
                        setWalletDetails({ publicKey, balance: solBalance, blockchain: 'solana' });
                    }
                }
            } catch (error) {
                console.error('Error fetching wallet balance:', error);
            }
        };

        fetchWalletBalance();
    }, [blockchain, publicKey]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Wallet Details</h1>
            {walletDetails ? (
                <Card>
                    <CardHeader>{walletDetails.blockchain.toUpperCase()} Wallet</CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <p className="font-medium">Public Key:</p>
                            <p className="text-gray-600">{walletDetails.publicKey}</p>
                        </div>
                        <div className="mb-4">
                            <p className="font-medium">Balance:</p>
                            <p className="text-gray-600">{walletDetails.balance.toFixed(4)} {walletDetails.blockchain.toUpperCase()}</p>
                        </div>
                        <div className="flex justify-between">
                            <Button>Send</Button>
                            <Button>Receive</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <p>Loading wallet details...</p>
            )}
        </div>
    );
};
