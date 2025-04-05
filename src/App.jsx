import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

function App() {
    const [year, setYear] = useState(2025);
    const [message, setMessage] = useState('Система готова до стрибка...');
    const [epochClass, setEpochClass] = useState('');
    const [particles, setParticles] = useState([]);
    const [cursorTrail, setCursorTrail] = useState([]);
    const [customEpochs, setCustomEpochs] = useState(JSON.parse(localStorage.getItem('customEpochs')) || {});
    const [showForm, setShowForm] = useState(false);
    const [newEpoch, setNewEpoch] = useState({ name: '', year: '', message: '', color: '#ffffff', sound: '' });
    const [showYearInput, setShowYearInput] = useState(false);
    const [showIntro, setShowIntro] = useState(!localStorage.getItem('hasSeenIntro'));
    const [isTraveling, setIsTraveling] = useState(false);
    const [volume, setVolume] = useState(0.05);
    const audioRef = useRef(null);
    const hoverSoundRef = useRef(null);
    const travelSoundRef = useRef(null);

    useEffect(() => {
        try {
            hoverSoundRef.current = new Audio('/sounds/hover.mp3');
            travelSoundRef.current = new Audio('/sounds/travel.mp3');
        } catch (error) {
            console.error('Failed to load sound files:', error);
        }
    }, []);

    useEffect(() => {
        const cursor = document.querySelector('.custom-cursor');
        const handleMouseMove = (e) => {
            if (cursor) {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
            }
            const newTrailParticle = {
                id: Date.now() + Math.random(),
                x: e.clientX,
                y: e.clientY,
                size: Math.random() * 5 + 3,
                color: getCursorColor(),
                opacity: 1,
            };

            setCursorTrail((prev) => {
                const newTrail = [...prev, newTrailParticle].slice(-10);
                return newTrail.map((particle, index) => ({
                    ...particle,
                    opacity: 1 - (index / 10),
                }));
            });
        };

        const getCursorColor = () => {
            const colors = {
                ancient: '#FFD700',
                medieval: '#DAA520',
                modern: '#B0C4DE',
                eighties: '#FF00FF',
                future: '#00CED1',
                'unknown-epoch': '#BA55D3',
            };
            return colors[epochClass] || '#ffffff';
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [epochClass]);

    const defaultEpochs = {
        ancient: { yearRange: [-1000, 999], class: 'ancient', message: 'Ти в античному світі — храми сяють золотом, герої кличуть до подвигів, а боги дивляться з небес.', sound: 'ancient', color: '#FFD700' },
        medieval: { yearRange: [1000, 1500], class: 'medieval', message: 'Середньовіччя вітає тебе — замки гудять від битв, а лицарі точать мечі під крики ворон.', sound: 'medieval', color: '#8B4513' },
        modern: { yearRange: [1800, 1949], class: 'modern', message: 'Сучасна епоха — парові двигуни ревуть, а небо розрізають перші літаки.', sound: 'modern', color: '#4682B4' },
        eighties: { yearRange: [1980, 1989], class: 'eighties', message: '80-ті вриваються — неон блимає, синтезатори гудять, а VHS крутить ретро-хіти.', sound: 'eighties', color: '#FF00FF' },
        future: { yearRange: [2050, 3000], class: 'future', message: 'Майбутнє кличе — голограми мерехтять, а космос відкриває свої таємниці.', sound: 'future', color: '#00CED1' },
    };

    const epochs = useMemo(() => ({ ...defaultEpochs, ...customEpochs }), [customEpochs]);

    const yearImages = {
        1488: '/images/mc_petya_1488.webp',
        '-500': '/images/parthenon.jpg',
        '1200': '/images/medieval_castle.jpg',
        '1900': '/images/steam_engine.jpg',
        '1985': '/images/delorean.jpg',
        '2100': '/images/future_city.jpg',
    };

    const textClassMap = { ancient: 'ancient-text', medieval: 'medieval-text', modern: 'modern-text', eighties: 'eighties-text', future: 'future-text', 'unknown-epoch': 'unknown-text' };
    const buttonClassMap = { ancient: 'ancient-button', medieval: 'medieval-button', modern: 'modern-button', eighties: 'eighties-button', future: 'future-button', 'unknown-epoch': 'unknown-button' };

    const stopCurrentAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
    }, []);

    const playSound = useCallback((epochSound, selectedYear) => {
        stopCurrentAudio();
        if (!epochSound) return;

        const soundMap = {
            ancient: '/sounds/ancient-sound.mp3',
            medieval: '/sounds/medieval-sound.mp3',
            modern: '/sounds/modern-sound.mp3',
            eighties: '/sounds/eighties-sound.mp3',
            future: '/sounds/future-sound.mp3',
            unknown: '/sounds/unknown-sound.mp3',
        };

        let soundFile;

        if (selectedYear === 1488 && epochSound === 'medieval') {
            soundFile = '/sounds/videoplayback.mp3';
        } else {
            soundFile = soundMap[epochSound] || '/sounds/default-sound.mp3';
        }

        try {
            const audio = new Audio(soundFile);
            audio.volume = volume;
            audio.loop = true;
            audio.play().catch((error) => console.log("Помилка відтворення:", error));
            audioRef.current = audio;
        } catch (error) {
            console.error('Failed to load sound:', soundFile, error);
        }
    }, [volume]);

    const playHoverSound = () => {
        if (hoverSoundRef.current) {
            hoverSoundRef.current.currentTime = 0;
            hoverSoundRef.current.volume = 0.2;
            hoverSoundRef.current.play().catch(() => {});
        }
    };

    const playTravelSound = () => {
        if (travelSoundRef.current) {
            travelSoundRef.current.currentTime = 0;
            travelSoundRef.current.volume = 0.5;
            travelSoundRef.current.play().catch(() => {});
        }
    };

    const updateEpoch = useCallback((newYear) => {
        let foundEpoch = null;
        for (const [key, epoch] of Object.entries(epochs)) {
            if (epoch.yearRange) {
                const [startYear, endYear] = epoch.yearRange;
                if (newYear >= startYear && newYear <= endYear) {
                    foundEpoch = { key, ...epoch };
                    break;
                }
            } else if (Math.abs(newYear - epoch.year) <= 50) {
                foundEpoch = { key, ...epoch };
                break;
            }
        }
        if (foundEpoch) {
            setEpochClass(foundEpoch.class || foundEpoch.key);
            setMessage(foundEpoch.message);
            playSound(foundEpoch.sound || foundEpoch.class || foundEpoch.key, newYear);
        } else {
            setEpochClass('unknown-epoch');
            setMessage('Ти в часовому розломі — реальність тріщить, а час спотворюється.');
            playSound('unknown', newYear);
        }
    }, [epochs, playSound]);

    const createParticles = () => {
        const particleStyles = {
            ancient: { color: '#FFD700', sizeMultiplier: 1.5 },
            medieval: { color: '#DAA520', sizeMultiplier: 1.2 },
            modern: { color: '#B0C4DE', sizeMultiplier: 1 },
            eighties: { color: '#FF00FF', sizeMultiplier: 1.3, shape: 'square' },
            future: { color: '#00CED1', sizeMultiplier: 1.1 },
            'unknown-epoch': { color: '#BA55D3', sizeMultiplier: 1.4 },
        };

        const style = particleStyles[epochClass] || { color: '#fff', sizeMultiplier: 1 };
        const newParticles = Array.from({ length: 60 }, () => ({
            id: Math.random(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: (Math.random() * 6 + 2) * style.sizeMultiplier,
            speed: Math.random() * 3 + 1,
            color: style.color,
            shape: style.shape || 'circle',
        }));
        setParticles(newParticles);
    };

    useEffect(() => {
        const lastYear = localStorage.getItem('lastYear');
        if (lastYear) {
            const parsedYear = parseInt(lastYear);
            setYear(parsedYear);
            updateEpoch(parsedYear);
        }
        if (showIntro) {
            localStorage.setItem('hasSeenIntro', 'true');
        }
        createParticles();
    }, [showIntro, updateEpoch]);

    useEffect(() => {
        createParticles();
    }, [epochClass]);

    const changeEpoch = (direction) => {
        setIsTraveling(true);
        playTravelSound();
        let newYear;
        if (direction === 'past') {
            newYear = year - (Math.floor(Math.random() * 1000) + 100);
        } else if (direction === 'future') {
            newYear = year + (Math.floor(Math.random() * 1000) + 100);
        } else {
            newYear = Math.floor(Math.random() * 4000) - 1000;
        }
        setTimeout(() => {
            setYear(newYear);
            localStorage.setItem('lastYear', newYear);
            updateEpoch(newYear);
            setIsTraveling(false);
        }, 1500);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const epochKey = newEpoch.name.toLowerCase().replace(/\s+/g, '-');
        const newCustomEpoch = {
            [epochKey]: {
                year: parseInt(newEpoch.year),
                class: epochKey,
                message: newEpoch.message,
                sound: newEpoch.sound,
                color: newEpoch.color,
            },
        };
        setCustomEpochs({ ...customEpochs, ...newCustomEpoch });
        localStorage.setItem('customEpochs', JSON.stringify({ ...customEpochs, ...newCustomEpoch }));
        setShowForm(false);
        setNewEpoch({ name: '', year: '', message: '', color: '#ffffff', sound: '' });
    };

    const handleVolumeChange = useCallback((newVolume) => {
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    }, []);

    return (
        <div className={`time-machine ${epochClass} ${isTraveling ? 'isTraveling' : ''}`}>
            <div className="custom-cursor" />
            <motion.div className="particles">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="particle"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: particle.size,
                            height: particle.size,
                            background: `radial-gradient(circle, ${particle.color}, transparent)`,
                            borderRadius: particle.shape === 'square' ? '0' : '50%',
                        }}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: -window.innerHeight, opacity: [0, 1, 0] }}
                        transition={{ duration: particle.speed, repeat: Infinity }}
                    />
                ))}
            </motion.div>

            <motion.div className="cursor-trail">
                {cursorTrail.map((trail) => (
                    <motion.div
                        key={trail.id}
                        className="trail-particle"
                        style={{
                            position: 'fixed',
                            left: trail.x,
                            top: trail.y,
                            width: trail.size,
                            height: trail.size,
                            background: `radial-gradient(circle, ${trail.color}, transparent)`,
                            borderRadius: '50%',
                            opacity: trail.opacity,
                        }}
                        initial={{ scale: 1, opacity: trail.opacity }}
                        animate={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    />
                ))}
            </motion.div>

            <motion.div
                className="travel-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: isTraveling ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            />

            <motion.div
                className="portal-effect"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isTraveling ? 1 : 0, opacity: isTraveling ? 1 : 0 }}
                transition={{ duration: 0.8 }}
            />

            <div className="content-wrapper">
                <motion.div
                    className="control-panel"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                >
                    <motion.h1
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={textClassMap[epochClass] || 'time-text'}
                    >
                        Машина часу настрою
                    </motion.h1>

                    <motion.div
                        className="year-display"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span>{year}</span>
                    </motion.div>

                    <div className="button-grid">
                        {[
                            { text: '⬅ Минуле', action: () => changeEpoch('past') },
                            { text: 'Майбутнє ➡', action: () => changeEpoch('future') },
                            { text: 'Випадково 🎲', action: () => changeEpoch('random') },
                            { text: showForm ? 'Закрити' : 'Нова епоха', action: () => setShowForm(!showForm) },
                            { text: showYearInput ? 'Закрити' : 'Обрати рік', action: () => setShowYearInput(!showYearInput) },
                        ].map((btn, idx) => (
                            <motion.button
                                key={idx}
                                onClick={btn.action}
                                onHoverStart={playHoverSound}
                                whileHover={{ scale: 1.1, boxShadow: `0 0 30px ${epochs[epochClass]?.color || '#fff'}` }}
                                whileTap={{ scale: 0.95 }}
                                className={buttonClassMap[epochClass] || 'time-button'}
                            >
                                {btn.text}
                            </motion.button>
                        ))}
                    </div>

                    <motion.div className="volume-panel">
                        <span className={textClassMap[epochClass] || 'time-text'}>Гучність</span>
                        <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.01"
                            value={volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="volume-slider"
                        />
                    </motion.div>

                    <AnimatePresence>
                        {yearImages[year] && (
                            <motion.div
                                className="epoch-visual"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={{ duration: 0.6 }}
                            >
                                <img src={yearImages[year]} alt={`Епоха ${year}`} onError={(e) => console.error(`Failed to load image: ${yearImages[year]}`)} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                className="epoch-editor"
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                            >
                                <form onSubmit={handleFormSubmit}>
                                    <input type="text" placeholder="Назва епохи" value={newEpoch.name} onChange={(e) => setNewEpoch({ ...newEpoch, name: e.target.value })} required />
                                    <input type="number" placeholder="Рік" value={newEpoch.year} onChange={(e) => setNewEpoch({ ...newEpoch, year: e.target.value })} required />
                                    <textarea placeholder="Опис епохи" value={newEpoch.message} onChange={(e) => setNewEpoch({ ...newEpoch, message: e.target.value })} required />
                                    <input type="color" value={newEpoch.color} onChange={(e) => setNewEpoch({ ...newEpoch, color: e.target.value })} />
                                    <select value={newEpoch.sound || ""} onChange={(e) => setNewEpoch({ ...newEpoch, sound: e.target.value })}>
                                        <option value="">Звук</option>
                                        <option value="ancient">Античний</option>
                                        <option value="medieval">Середньовічний</option>
                                        <option value="modern">Сучасний</option>
                                        <option value="eighties">80-ті</option>
                                        <option value="future">Майбутнє</option>
                                    </select>
                                    <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        Створити
                                    </motion.button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showYearInput && (
                            <motion.div
                                className="year-selector"
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                            >
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const newYear = parseInt(e.target.year.value);
                                    if (isNaN(newYear)) return;
                                    setIsTraveling(true);
                                    playTravelSound();
                                    setTimeout(() => {
                                        setYear(newYear);
                                        localStorage.setItem('lastYear', newYear);
                                        updateEpoch(newYear);
                                        setShowYearInput(false);
                                        setIsTraveling(false);
                                    }, 1500);
                                }}>
                                    <input type="number" name="year" placeholder="Введи рік" required />
                                    <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        Стрибок
                                    </motion.button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        className="epoch-message"
                        key={message}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className={textClassMap[epochClass] || 'time-text'}>{message}</p>
                    </motion.div>
                </motion.div>
            </div>

            <div className="timeline">
                <div className="timeline-bar">
                    <div
                        className="timeline-marker"
                        style={{
                            left: `${((year + 1000) / 4000) * 100}%`,
                        }}
                    />
                </div>
                <div className="timeline-labels">
                    <span>-1000</span>
                    <span>0</span>
                    <span>1000</span>
                    <span>1500</span>
                    <span>1800</span>
                    <span>2000</span>
                    <span>2500</span>
                    <span>3000</span>
                </div>
            </div>

            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className="intro-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="intro-content"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 120 }}
                        >
                            <h2>Система часу онлайн</h2>
                            <p>Вибери епоху або створи свою власну для подорожі крізь віки.</p>
                            <motion.button
                                onClick={() => setShowIntro(false)}
                                whileHover={{ scale: 1.1, boxShadow: '0 0 30px #fff' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Активувати
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;