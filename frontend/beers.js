import { useEffect, useState } from 'react';

const BeersPage = () => {
    const [beers, setBeers] = useState([]);

    useEffect(() => {
        const fetchBeers = async () => {
            const response = await fetch('http://127.0.0.1:8000/beers'); // FastAPIのエンドポイント
            const data = await response.json();
            setBeers(data);
        };

        fetchBeers();
    }, []);

    return (
        <div>
            <h1>Shikoku Beers</h1>
            <ul>
                {beers.map(beer => (
                    <li key={beer.id}>{beer.name} - {beer.address}</li>
                ))}
            </ul>
        </div>
    );
};

export default BeersPage;