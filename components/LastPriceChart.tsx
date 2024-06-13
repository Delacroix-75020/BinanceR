import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const LastPriceChart = ({ lastPriceList }: { lastPriceList: string[] }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: lastPriceList.length }, (_, i) => i + 1),
                datasets: [{
                    label: 'Last Price',
                    data: lastPriceList.map(price => parseFloat(price)),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#333',
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Data Point',
                            color: '#333',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#333',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price',
                            color: '#333',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#333',
                            font: {
                                size: 12
                            }
                        },
                        beginAtZero: false
                    }
                }
            }
        });

        return () => {
            chart.destroy();
        };
    }, [lastPriceList]);

    return <canvas ref={chartRef}></canvas>;
};

export default LastPriceChart;
