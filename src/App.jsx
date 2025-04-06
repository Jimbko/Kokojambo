import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

function App() {
    const [year, setYear] = useState(2025);
    const [message, setMessage] = useState('Система готова до стрибка...');
    const [details, setDetails] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [epochClass, setEpochClass] = useState('');
    const [particles, setParticles] = useState([]);
    const [cursorTrail, setCursorTrail] = useState([]);
    const [customEpochs, setCustomEpochs] = useState(JSON.parse(localStorage.getItem('customEpochs')) || {});
    const [showForm, setShowForm] = useState(false);
    const [newEpoch, setNewEpoch] = useState({ name: '', year: '', message: '', details: '', color: '#ffffff', sound: '', image: '' });
    const [showYearInput, setShowYearInput] = useState(false);
    const [showIntro, setShowIntro] = useState(!localStorage.getItem('hasSeenIntro'));
    const [isTraveling, setIsTraveling] = useState(false);
    const [volume, setVolume] = useState(0.05);
    const [selectedMedia, setSelectedMedia] = useState({ type: '', url: '' }); // Новий стан для обраного медіа
    const audioRef = useRef(null);
    const hoverSoundRef = useRef(null);
    const travelSoundRef = useRef(null);
    const timelineRef = useRef(null);
    const currentSoundKey = useRef(null);

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
        ancient: {
            yearRange: [-1000, 999],
            class: 'ancient',
            message: 'Ти опинився в античному світі, де величні мармурові храми сяють під палючим сонцем. Повітря наповнене запахом оливкових гаїв і димом жертвоприношень. Вдалині чути звуки ліри, а натовпи в білих туніках гудять на агорі, обговорюючи філософію та політику. Герої готуються до подвигів, а боги, здається, спостерігають за тобою з небес Олімпу.',
            details: 'Античність — це час розквіту Стародавньої Греції та Риму, коли будувалися величні храми, такі як Парфенон, а філософи, як Сократ і Платон, закладали основи західної думки. Люди вірили в богів, які впливали на їхнє життя, і приносили жертви, щоб заспокоїти їхній гнів. Війни, як Троянська, і подвиги героїв, як Геракл, стали легендами. Життя було суворим, але сповненим краси і мистецтва.',
            sound: 'ancient',
            color: '#FFD700',
            images: [
                '/images/ancient/ancient_statue.jpg',
                '/images/ancient/ancient_temple.jpg',
                '/images/ancient/ancient_vaza.jpg',
            ],
        },
        medieval: {
            yearRange: [1000, 1500],
            class: 'medieval',
            message: 'Ти в епоху Середньовіччя, де похмурі кам’яні замки височіють над зеленими долинами. Повітря пронизане запахом вогнищ і звуками ковальських молотів, що гудуть у ритмі війни. Лицарі в блискучих обладунках готуються до турнірів, а селяни співають старовинні балади, працюючи в полях. Над усім літають ворони, що передвіщають битви, а в монастирях ченці переписують священні тексти при світлі свічок.',
            details: 'Середньовіччя — це час феодалізму, хрестових походів і чуми, що забрала мільйони життів. Королі та барони боролися за владу, а церква була центром духовного і політичного життя. У цей період з’явилися перші університети, а готична архітектура, як собор Нотр-Дам, вражала уяву. Життя було суворим: селяни працювали на землі, а лицарі дотримувалися кодексу честі. Водночас це була епоха містики, коли вірили в драконів і відьом.',
            sound: 'medieval',
            color: '#8B4513',
            images: [
                '/images/medieval/1.jpg',
                '/images/medieval/2.jpg',
                '/images/medieval/3.jpg',
            ],
        },
        modern: {
            yearRange: [1800, 1949],
            class: 'modern',
            message: 'Ти в сучасній епосі, де промислова революція змінює світ. Повітря наповнене димом фабрик, а парові двигуни гуркотять, рухаючи поїзди через безкрайні рівнини. У містах гудять натовпи, одягнені в капелюхи та сюртуки, а в небі з’являються перші літаки, що розрізають хмари. Вечорами в салонах грають джаз, а винахідники, як Едісон, запалюють світ електрикою.',
            details: 'Сучасна епоха — це час великих змін, коли промислова революція принесла машини, фабрики і залізниці. Люди переселялися в міста, де з’являлися перші електричні лампи та телефони. Це також період великих війн, таких як Перша світова, і соціальних змін, коли жінки почали боротися за свої права. Наука процвітала: Дарвін пояснив еволюцію, а Ейнштейн розробив теорію відносності. Культура також змінювалася — джаз і кінематограф стали новими символами часу.',
            sound: 'modern',
            color: '#4682B4',
            media: '/images/modern/hello biden.mp4',
            images: ['/images/modern/dota.jpg'],
        },
        eighties: {
            yearRange: [1980, 1989],
            class: 'eighties',
            message: 'Ти в яскравих 80-х, де неон сяє в нічному місті, а синтезатори гудять мелодіями, що пронизують душу. Молодь у рваних джинсах і з начесаним волоссям танцює під хіти Майкла Джексона, а VHS-програвачі крутять "Назад у майбутнє". У повітрі витає запах лаку для волосся, а аркадні автомати миготять у темних залах, запрошуючи зіграти в Pac-Man.',
            details: '1980-ті — це епоха культурного вибуху, коли поп-музика, MTV і неонові кольори визначали стиль життя. Технології стрімко розвивалися: з’явилися перші персональні комп’ютери, як IBM PC, і культові ігрові консолі, як Nintendo. У світі політики це був час Холодної війни, але також і культурного обміну через музику і кіно. Фільми, як "Термінатор" і "Клуб "Сніданок"", стали культовими, а мода з наплічниками та яскравими легінсами залишила свій слід.',
            sound: 'eighties',
            color: '#FF00FF',
            images: [
                '/images/eighties/324324.jpg',
                '/images/eighties/198041270.jpg',
                '/images/eighties/las-vegas_1980s-1.jpg',
            ],
        },
        future: {
            yearRange: [2050, 3000],
            class: 'future',
            message: 'Ти в далекому майбутньому, де голограми мерехтять у повітрі, а космічні кораблі безшумно ширяють над містами зі скла та світла. Повітря пронизане гудінням дронів, що доставляють товари, а люди в облягаючих сріблястих костюмах спілкуються через нейроінтерфейси. На горизонті видно колонії на Марсі, а штучний інтелект, здається, знає твої думки наперед.',
            details: 'Майбутнє, яке ми уявляємо, — це час, коли технології досягли неймовірного рівня. Люди колонізували інші планети, а штучний інтелект став частиною повсякденного життя, допомагаючи в усьому — від медицини до розваг. Енергія стала чистою завдяки термоядерним реакторам, а міста перетворилися на вертикальні екосистеми з зеленими дахами. Водночас людство стикається з новими викликами: етичними дилемами щодо генної інженерії та питанням, що означає бути людиною в світі, де межа між органічним і штучним розмивається.',
            sound: 'future',
            color: '#00CED1',
            images: [
                '/images/future/1.jpg',
                '/images/future/2.png',
            ],
        },
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
            currentSoundKey.current = null;
        }
    }, []);

    const playSound = useCallback((epochSound, selectedYear) => {
        if (currentSoundKey.current === epochSound && audioRef.current) {
            audioRef.current.volume = volume;
            return;
        }

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

        let soundFile = soundMap[epochSound] || '/sounds/default-sound.mp3';
        if (selectedYear === 1488 && epochSound === 'medieval') {
            soundFile = '/sounds/videoplayback.mp3';
        }

        try {
            const audio = new Audio(soundFile);
            audio.volume = volume;
            audio.loop = true;
            audio.play().catch((error) => console.log("Помилка відтворення:", error));
            audioRef.current = audio;
            currentSoundKey.current = epochSound;
        } catch (error) {
            console.error('Failed to load sound:', soundFile, error);
        }
    }, [volume, stopCurrentAudio]);

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
            setDetails(foundEpoch.details || '');
            playSound(foundEpoch.sound || foundEpoch.class || foundEpoch.key, newYear);

            // Оновлюємо медіа лише при зміні епохи
            if (yearImages[newYear]) {
                setSelectedMedia({ type: 'image', url: yearImages[newYear] });
            } else if (foundEpoch.media && isVideo(foundEpoch.media)) {
                setSelectedMedia({ type: 'video', url: foundEpoch.media });
            } else if (foundEpoch.images && foundEpoch.images.length > 0) {
                const randomImage = foundEpoch.images[Math.floor(Math.random() * foundEpoch.images.length)];
                setSelectedMedia({ type: 'image', url: randomImage });
            } else {
                setSelectedMedia({ type: '', url: '' });
            }
        } else {
            setEpochClass('unknown-epoch');
            setMessage('Ти в часовому розломі, де реальність тріщить по швах, а час спотворюється, мов розплавлене скло. Навколо тебе миготять уламки різних епох: античні колони змішуються з неоновими вивісками 80-х, а в небі зависають космічні кораблі, що розчиняються в тумані. Повітря пронизане дивним гудінням, і ти відчуваєш, як сам час шепоче тобі незрозумілі слова.');
            setDetails('Часові розломи — це аномалії, де різні епохи зливаються в хаотичну суміш. Тут немає законів фізики, а реальність постійно змінюється. Ти можеш побачити лицаря, який тримає лазерний меч, або динозавра, що біжить повз футуристичне місто. Це місце небезпечне, але сповнене таємниць: кажуть, що в розломах заховані артефакти, які можуть змінити хід історії.');
            playSound('unknown', newYear);
            setSelectedMedia({ type: '', url: '' });
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
                details: newEpoch.details,
                sound: newEpoch.sound,
                color: newEpoch.color,
                image: newEpoch.image || '',
            },
        };
        setCustomEpochs({ ...customEpochs, ...newCustomEpoch });
        localStorage.setItem('customEpochs', JSON.stringify({ ...customEpochs, ...newCustomEpoch }));
        setShowForm(false);
        setNewEpoch({ name: '', year: '', message: '', details: '', color: '#ffffff', sound: '', image: '' });
    };

    const handleVolumeChange = useCallback((newVolume) => {
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    }, []);

    const isVideo = (mediaUrl) => {
        return mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.ogg'));
    };

    const MIN_YEAR = -1000;
    const MAX_YEAR = 3000;

    const getMarkerPosition = (year) => {
        const numericYear = parseInt(year, 10);
        if (isNaN(numericYear)) return 0;
        const clampedYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, numericYear));
        const totalRange = MAX_YEAR - MIN_YEAR;
        const yearPosition = clampedYear - MIN_YEAR;
        return (yearPosition / totalRange) * 100;
    };

    const getYearFromPosition = (positionPercentage) => {
        const totalRange = MAX_YEAR - MIN_YEAR;
        return Math.round(MIN_YEAR + (positionPercentage / 100) * totalRange);
    };

    const handleTimelineClick = (e) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        const newYear = getYearFromPosition(position * 100);
        setIsTraveling(true);
        playTravelSound();
        setTimeout(() => {
            setYear(newYear);
            localStorage.setItem('lastYear', newYear);
            updateEpoch(newYear);
            setIsTraveling(false);
        }, 1500);
    };

    const handleMarkerDragStart = (e) => {
        e.preventDefault();
        document.addEventListener('mousemove', handleMarkerDrag);
        document.addEventListener('mouseup', handleMarkerDragEnd);
    };

    const handleMarkerDrag = (e) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        let position = (e.clientX - rect.left) / rect.width;
        position = Math.max(0, Math.min(1, position));
        const newYear = getYearFromPosition(position * 100);
        setYear(newYear);
    };

    const handleMarkerDragEnd = () => {
        document.removeEventListener('mousemove', handleMarkerDrag);
        document.removeEventListener('mouseup', handleMarkerDragEnd);
        setIsTraveling(true);
        playTravelSound();
        setTimeout(() => {
            localStorage.setItem('lastYear', year);
            updateEpoch(year);
            setIsTraveling(false);
        }, 1500);
    };

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
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="volume-slider"
                        />
                    </motion.div>

                    <AnimatePresence>
                        {selectedMedia.url && (
                            <motion.div
                                className="epoch-visual"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={{ duration: 0.6 }}
                            >
                                {selectedMedia.type === 'video' ? (
                                    <video
                                        src={selectedMedia.url}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                        onError={(e) => {
                                            console.error(`Failed to load video: ${selectedMedia.url}`);
                                            const currentEpoch = epochs[epochClass];
                                            if (currentEpoch?.images && currentEpoch.images.length > 0) {
                                                const randomImage = currentEpoch.images[Math.floor(Math.random() * currentEpoch.images.length)];
                                                setSelectedMedia({ type: 'image', url: randomImage });
                                            }
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={selectedMedia.url}
                                        alt={`Епоха ${epochClass}`}
                                        onError={(e) => console.error(`Failed to load image: ${selectedMedia.url}`)}
                                    />
                                )}
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
                                    <input
                                        type="text"
                                        placeholder="Назва епохи"
                                        value={newEpoch.name}
                                        onChange={(e) => setNewEpoch({ ...newEpoch, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Рік"
                                        value={newEpoch.year}
                                        onChange={(e) => setNewEpoch({ ...newEpoch, year: e.target.value })}
                                        required
                                    />
                                    <textarea
                                        placeholder="Опис епохи"
                                        value={newEpoch.message}
                                        onChange={(e) => setNewEpoch({ ...newEpoch, message: e.target.value })}
                                        required
                                    />
                                    <textarea
                                        placeholder="Деталі епохи (історичний контекст)"
                                        value={newEpoch.details}
                                        onChange={(e) => setNewEpoch({ ...newEpoch, details: e.target.value })}
                                    />
                                    <input
                                        type="color"
                                        value={newEpoch.color}
                                        onChange={(e) => setNewEpoch({ ...newEpoch, color: e.target.value })}
                                    />
                                    <select
                                        value={newEpoch.sound || ""}
                                        onChange={(e) => setNewEpoch({ ...newEpoch, sound: e.target.value })}
                                    >
                                        <option value="">Звук</option>
                                        <option value="ancient">Античний</option>
                                        <option value="medieval">Середньовічний</option>
                                        <option value="modern">Сучасний</option>
                                        <option value="eighties">80-ті</option>
                                        <option value="future">Майбутнє</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Шлях до зображення (наприклад, /images/custom/image.jpg)"
                                        value={newEpoch.image}
                                        onChange={(e) => setNewEpoch({ ...newEpoch, image: e.target.value })}
                                    />
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
                                <form
                                    onSubmit={(e) => {
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
                                    }}
                                >
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
                        {details && (
                            <>
                                <motion.button
                                    onClick={() => setShowDetails(!showDetails)}
                                    onHoverStart={playHoverSound}
                                    whileHover={{ scale: 1.1, boxShadow: `0 0 30px ${epochs[epochClass]?.color || '#fff'}` }}
                                    whileTap={{ scale: 0.95 }}
                                    className={buttonClassMap[epochClass] || 'time-button'}
                                    style={{ marginTop: '20px' }}
                                >
                                    {showDetails ? 'Сховати деталі' : 'Дізнатися більше'}
                                </motion.button>
                                <AnimatePresence>
                                    {showDetails && (
                                        <motion.div
                                            className="epoch-details"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <p className={textClassMap[epochClass] || 'time-text'}>{details}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            <div className="timeline" ref={timelineRef} onClick={handleTimelineClick}>
                <div className="timeline-bar">
                    <motion.div
                        className="timeline-marker"
                        animate={{ left: `${getMarkerPosition(year)}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        onMouseDown={handleMarkerDragStart}
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