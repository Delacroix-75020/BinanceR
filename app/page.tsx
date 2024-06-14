'use client';

import { useEffect, useState, useRef } from 'react';
import CryptoTrade from '@/components/CryptoTrade';
import { BASE_API_URL } from '@/lib/const';

export const dynamic = 'force-dynamic';

export default function CryptoPage() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Fonction pour récupérer les données
        const fetchData = async () => {
            try {
                const response = await fetch(`${BASE_API_URL}/api/getcrypto`, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }
                const result = await response.json();
                console.log('Données:', result.data);
                
                setData(result.data.filter((crypto: { symbol: string; }) => crypto.symbol.endsWith('USDT')));

            } catch (error) {
                console.error('Erreur:', error);
            }
        };

        // Récupérer les données initiales au chargement de la page
        fetchData();

        // Configurer le polling à un intervalle régulier (par exemple, toutes les 5 secondes)
        const intervalId = setInterval(fetchData, 5000); // 5000 ms = 5 secondes

        // Nettoyer l'intervalle lorsque le composant est démonté
        return () => clearInterval(intervalId);

    }, []);
    
    return (
        <div>
            <CryptoTrade data={data} />
        </div>
    );
}
