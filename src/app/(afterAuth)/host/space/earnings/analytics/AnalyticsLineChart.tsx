import { Line } from 'react-chartjs-2'

const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        intersect: false,
        mode: 'index' as const,
    },
    plugins: {
        tooltip: {
            enabled: true,
            backgroundColor: '#EAB308',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: '#EAB308',
            borderWidth: 1,
            cornerRadius: 4,
            displayColors: false,
            padding: 8,
            callbacks: {
                title: () => '',
                label: (context: any) => context.parsed.y.toString(),
            },
        },
        legend: {
            display: false,
        },
    },
    layout: {
        padding: {
            top: 0,
            bottom: -20,
        },
    },
    scales: {
        y: {
            beginAtZero: false,
            ticks: {
                callback: (value: any) => `${value}`,
                color: '#6B7280',
                font: {
                    size: 14,
                },
                padding: 15,
            },
            grid: {
                drawTicks: false,
                color: '#D2D2D2',
                lineWidth: 1,
            },
            border: {
                display: false,
            },
        },
        x: {
            grid: {
                display: false,
            },
            ticks: {
                padding: 30,
                color: '#6B7280',
                font: {
                    size: 14,
                },
            },
            border: {
                display: false,
            },
        },
    },
    elements: {
        point: {
            hoverBackgroundColor: '#EAB308',
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2,
        },
    },
};


const AnalyticsLineChart = ({chartData}: {chartData: any}) => {
  return (
    <Line data={chartData} options={options} />
  )
}

export default AnalyticsLineChart