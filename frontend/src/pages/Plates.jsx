import "../components/styles.css";
import React, { useState, useEffect } from 'react';

export default function Plates() {
    const [plates, setPlates] = useState([]);
    const [sortBy, setSortBy] = useState('quantity');

    
    useEffect(() => {
        const fetchPlates = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/buyplates/'+sortBy);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setPlates(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPlates();
    }, [sortBy]);

    return (
        <div className="home-bg">
            <button onClick={() => setSortBy('quantity')} disabled={sortBy === 'quantity'} className="sortButton">Sort by Quantity</button>
            <button onClick={() => setSortBy('price')} disabled={sortBy === 'price'} className="sortButton">Sort By Price</button>
            {plates.length === 0 ? (
                <p>No plates are currently in stock.</p>
            ) : (
                <table className="platetable">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plates.map((plate, index) => (
                            <tr key={index}>
                                <td className="platetd">{plate.description}</td>
                                <td>{plate.quantity}</td>
                                <td>${plate.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};