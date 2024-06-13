'use client';

import { useEffect, useState, useRef } from 'react';
import CryptoTrade from '@/components/CryptoTrade';
import { BASE_API_URL } from '@/lib/const';

export const dynamic = 'force-dynamic';

export default function CryptoPage() {
    const [data, setData] = useState([]);
    const audioRef = useRef<HTMLAudioElement>(null); // Référence à l'élément audio

    // Liste des chemins vers les fichiers audio
    const audioFiles = [
        'Call of Duty Modern Warfare 2 Challenge Track.mp3',
        'destroyed.mp3',
        'flaqt.mp3',
        'rizz-sounds.mp3',
        'granataaaa.mp3',
        'lets-do-this.mp3',
        'fart-with-reverb_NcgStsA.mp3',
        'bebou.mp3',
        'youtube-uwuuuuu.mp3',
        'headshot_6.mp3',
        'hugooo.mp3',
        'salut-princesse.mp3',
        'bebou.mp3'
    ];

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
                // Jouer le son après la mise à jour des données
                // Sélectionner aléatoirement un son de la liste
                const randomIndex = Math.floor(Math.random() * audioFiles.length);
                const randomAudio = audioFiles[randomIndex];

                // Changer la source de l'élément audio et jouer le son
                if (audioRef.current) {
                    audioRef.current.src = randomAudio;
                    audioRef.current.play();
                }

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
            <audio ref={audioRef} />
        </div>
    );
}
