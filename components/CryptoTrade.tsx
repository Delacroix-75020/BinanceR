'use client';

import { FC, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import LastPriceChart from './LastPriceChart';

interface CryptoData {
    symbol: string,
    lastPrice: number,
    quoteVolume: number,
    prevClosePrice: number,
    lastPriceList: string[]
}

interface Props {
    data: CryptoData[];
}

const CryptoTrade: FC<Props> = ({ data }) => {
    console.log('data:', data);
    
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const sortedCryptos = data
        .map(crypto => {
            const parts = crypto.symbol.split('USDT');
            return {
                ...crypto,
                symbol: parts[0],
                stablecoin: 'USDT'
            };
        })
        .filter(crypto => crypto.symbol.includes(searchTerm.toUpperCase()))
        .sort((a, b) => {
            if (sortBy === 'Symbol') {
                return sortOrder === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
            } else if (sortBy === 'Transactions totales') {
                return sortOrder === 'asc' ? a.quoteVolume - b.quoteVolume : b.quoteVolume - a.quoteVolume;
            } else if (sortBy === 'Variations') {
                return sortOrder === 'asc' ? a.prevClosePrice - a.lastPrice - (b.prevClosePrice - b.lastPrice) : (b.prevClosePrice - b.lastPrice) - (a.prevClosePrice - a.lastPrice);
            } else if (sortBy === 'LastPrice') {
                return sortOrder === 'asc' ? a.lastPrice - b.lastPrice : b.lastPrice - a.lastPrice;
            }
            return 0;
        });

    return (
        <div>
            <nav className="flex items-center justify-between bg-gray-800 p-4">
                <div className="flex items-center flex-shrink-0 text-white mr-6">
                    <span className="font-semibold text-xl tracking-tight ml-2">Crypto Trade</span>
                </div>
                <div className="flex">
                    <Input
                        className="mr-2 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        placeholder="Rechercher par symbole..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </nav>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]"></TableHead>
                        <TableHead className="text-center">
                            <Button onClick={() => handleSort('Symbol')}>
                                Symbol
                                {sortBy === 'Symbol' && (sortOrder === 'asc' ? <RiArrowUpSLine /> : <RiArrowDownSLine />)}
                            </Button>
                        </TableHead>
                        <TableHead className="text-center">
                            <Button onClick={() => handleSort('Transactions totales')}>
                                Transactions totales
                                {sortBy === 'Transactions totales' && (sortOrder === 'asc' ? <RiArrowUpSLine /> : <RiArrowDownSLine />)}
                            </Button>
                        </TableHead>
                        <TableHead className="text-center">
                            <Button onClick={() => handleSort('Variations')}>
                                Variations
                                {sortBy === 'Variations' && (sortOrder === 'asc' ? <RiArrowUpSLine /> : <RiArrowDownSLine />)}
                            </Button>
                        </TableHead>
                        <TableHead className="text-center">
                            <Button onClick={() => handleSort('LastPrice')}>
                                LastPrice
                                {sortBy === 'LastPrice' && (sortOrder === 'asc' ? <RiArrowUpSLine /> : <RiArrowDownSLine />)}
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedCryptos.map((crypto, index) => {
                        const variation = ((crypto.prevClosePrice - crypto.lastPrice) / crypto.prevClosePrice) * 100;
                        return (
                            <TableRow key={index}>
                                <TableCell className='flex justify-center'>
                                    <img src={`https://cdn.jsdelivr.net/gh/vadimmalykhin/binance-icons/crypto/${crypto.symbol.toLowerCase()}.svg`} alt={crypto.symbol} />
                                </TableCell>
                                <TableCell className="font-medium text-center">{crypto.symbol}/{crypto.stablecoin}</TableCell>
                                <TableCell className="text-center">{Number(crypto.quoteVolume).toFixed(3)}</TableCell>
                                <TableCell className={`font-bold text-center ${variation > 0 ? 'text-green-400' : 'text-red-400'}`}>{variation > 0 ? '+' : ''}{variation.toFixed(2)}%</TableCell>
                                <TableCell className="flex justify-center text-center">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="bg-gray-800 font-bold text-green-400 rounded-lg w-32 p-2">{Number(crypto.lastPrice).toFixed(3)} $</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[1000px]">
                                            <DialogHeader>
                                            <DialogTitle className='flex'><div className="flex justify-center items-center">Graph</div><img className="p-4" src={`https://cdn.jsdelivr.net/gh/vadimmalykhin/binance-icons/crypto/${crypto.symbol.toLowerCase()}.svg`} alt={crypto.symbol} />                                            </DialogTitle>
                                            <DialogDescription>
                                                Suivie des prix pour {crypto.symbol}/{crypto.stablecoin}
                                            </DialogDescription>
                                            </DialogHeader>
                                            <LastPriceChart lastPriceList={crypto.lastPriceList} />
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default CryptoTrade;
