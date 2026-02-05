import { useState, useMemo } from 'react';

const HeartIcon = ({ className, style, onIteration }) => (
    <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={style}
        onAnimationIteration={onIteration} // Detecta cuando la animación se repite
        fill="none"
        stroke="currentColor"
        strokeWidth="1.32"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M15.7,5.33a4.45,4.45,0,0,0-3.72,2A4.47,4.47,0,0,0,3.79,9.79c0,6.7,8.19,8.93,8.19,8.93s8.18-2.23,8.18-8.93A4.46,4.46,0,0,0,15.7,5.33Z" />
    </svg>
);

const HeartRain = () => {
    const COUNT = 9;

    // Usamos un objeto para rastrear la posición horizontal individual de cada corazón
    const [positions, setPositions] = useState(() =>
        Array.from({ length: COUNT }).map(() => Math.random() * 80 + '%')
    );

    const heartsConfig = useMemo(() => {
        return Array.from({ length: COUNT }).map((_, i) => ({
            id: i,
            size: Math.floor(Math.random() * 150) + 500 + 'px',
            duration: Math.floor(Math.random() * 10) + 20 + 's',
            delay: Math.random() * -20 + 's',
        }));
    }, []);

    // Función que cambia la posición de un corazón específico cuando termina su ciclo
    const handleIteration = (index) => {
        setPositions(prev => {
            const newPositions = [...prev];
            newPositions[index] = Math.random() * 80 + '%';
            return newPositions;
        });
    };

    return (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            {heartsConfig.map((config, i) => (
                <HeartIcon
                    key={config.id}
                    className="absolute animate-fall text-rose-200"
                    onIteration={() => handleIteration(i)}
                    style={{
                        top: '-600px', // Ajustado para que los corazones gigantes no "aparezcan" de golpe
                        left: positions[i],
                        width: config.size,
                        height: config.size,
                        animationDuration: config.duration,
                        animationDelay: config.delay,
                    }}
                />
            ))}
        </div>
    );
};

export default HeartRain;