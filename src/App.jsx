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
    const [selectedMedia, setSelectedMedia] = useState({ type: '', url: '' });
    const audioRef = useRef(null);
    const hoverSoundRef = useRef(null);
    const travelSoundRef = useRef(null);
    const timelineRef = useRef(null);
    const currentSoundKey = useRef(null);
    const currentEpochKey = useRef(null);

    // Initialize audio files with error handling
    useEffect(() => {
        try {
            hoverSoundRef.current = new Audio('/sounds/hover.mp3');
            travelSoundRef.current = new Audio('/sounds/travel.mp3');
        } catch (error) {
            console.error('Не вдалося завантажити звукові файли:', error);
            hoverSoundRef.current = null;
            travelSoundRef.current = null;
        }
    }, []);

    // Custom cursor and trail (optimized with throttling)
    useEffect(() => {
        const cursor = document.querySelector('.custom-cursor');
        let lastUpdate = 0;
        const handleMouseMove = (e) => {
            const now = Date.now();
            if (now - lastUpdate < 50) return; // Throttle updates to every 50ms
            lastUpdate = now;

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
                const newTrail = [...prev, newTrailParticle].slice(-5);
                return newTrail.map((particle, index) => ({
                    ...particle,
                    opacity: 1 - (index / 5),
                }));
            });
        };

        const getCursorColor = () => {
            const colors = {
                ancient: '#FFD700',
                medieval: '#DAA520',
                renaissance_early_modern: '#E97451',
                industrial_era: '#4A4A4A',
                modernism: '#B0C4DE',
                postwar_era: '#FF4040',
                eighties: '#FF00FF',
                digital_era: '#A9A9A9',
                future: '#00CED1',
                unknown_epoch: '#BA55D3',
            };
            return colors[epochClass] || '#ffffff';
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [epochClass]);

    const defaultEpochs = useMemo(() => ({
        ancient: {
            yearRange: [-1000, 500],
            class: 'ancient',
            message: 'Ти в Античності, де величні храми здіймаються до неба, а філософи, як Сократ і Аристотель, розмірковують про сенс життя. У Стародавній Греції і Римі воїни в броні б’ються за славу, а боги, як Зевс і Юпітер, наглядають за смертними. Повітря наповнене запахом оливкової олії і звуками ліри, а на ринках торгують спеціями з далеких земель.',
            details: 'Цей період охоплює розквіт Стародавнього Єгипту, Греції та Риму. Це час великих цивілізацій, перших демократій (Афіни), філософії, літератури (Гомер, Вергілій) і архітектури (Парфенон, Колізей). Період закінчується приблизно в 500 році, коли Західна Римська імперія падає (476 рік), що традиційно вважається початком Середньовіччя.',
            sound: 'ancient',
            color: '#FFD700',
            images: [
                '/images/ancient/ancient_statue.jpg',
                '/images/ancient/ancient_temple.jpg',
                '/images/ancient/ancient_vaza.jpg',
            ],
        },
        medieval: {
            yearRange: [501, 1499],
            class: 'medieval',
            message: 'Ти в Середньовіччі, де замки височіють над селами, а лицарі в обладунках б’ються на турнірах. У монастирях ченці переписують книги, а в містах чума забирає тисячі життів. Повітря наповнене запахом диму від вогнищ і звуками ковальських молотів, а на дорогах хрестоносці йдуть на Схід.',
            details: 'Цей період охоплює раннє Середньовіччя (після падіння Риму), Високе Середньовіччя (розквіт феодалізму, хрестові походи) і пізнє Середньовіччя (чорна смерть, занепад феодалізму). Закінчується в 1499 році, перед початком Відродження і епохи великих географічних відкриттів (Колумб відкрив Америку в 1492).',
            sound: 'medieval',
            color: '#DAA520',
            images: [
                '/images/medieval/1.jpg',
                '/images/medieval/2.jpg',
                '/images/medieval/3.jpg',
            ],
        },
        renaissance_early_modern: {
            yearRange: [1500, 1799],
            class: 'renaissance_early_modern',
            message: 'Ти в епоху Відродження та раннього Нового часу, де мистецтво і наука розквітають. У Флоренції Леонардо да Вінчі малює шедеври, а Галілей дивиться на зірки через телескоп. У 18-му столітті філософи, як Вольтер, сперечаються про свободу в кав’ярнях Парижа, а Моцарт пише симфонії. Повітря наповнене запахом фарб і звуками лютні, а Колумб відкриває нові землі.',
            details: 'Цей період охоплює Відродження (1500–1600), Реформацію, ранній Новий час і Просвітництво (1600–1799). Це час культурного відродження, географічних відкриттів (Колумб, Магеллан), наукових революцій (Коперник, Ньютон) і філософських змін (Вольтер, Руссо), які заклали основи сучасного світу. Закінчується перед Французькою революцією (1789) і початком індустріальної ери.',
            sound: 'renaissance',
            color: '#E97451',
            images: [
                '/images/renaissance/342.jpg',
                '/images/renaissance/1213.jpg',
            ],
        },
        industrial_era: {
            yearRange: [1800, 1899],
            class: 'industrial_era',
            message: 'Ти в Індустріальній ері, де парові двигуни гуркотять, а фабрики димлять у небо. У містах з’являються перші поїзди і телеграф, а люди в сюртуках і капелюхах поспішають на роботу. Повітря наповнене запахом вугілля і звуками клаксонів, а електрика починає освітлювати вулиці.',
            details: 'Цей період охоплює промислову революцію, коли парові машини, залізниці і фабрики змінили світ. Це час швидкого технологічного прогресу (телеграф, телефон), урбанізації та соціальних змін (скасування рабства, перші профспілки). Закінчується в 1899 році, перед початком 20-го століття, яке принесе нові технології.',
            sound: 'industrial',
            color: '#4A4A4A',
            images: [
                '/images/industrial/1.jpg',
                '/images/industrial/2.jpg',
            ],
        },
        modernism: {
            yearRange: [1900, 1949],
            class: 'modernism',
            message: 'Ти в епоху модернізму, де світ стрімко змінюється. У містах гудять перші автомобілі, а в небі літають літаки. Джаз звучить у салонах, а радіо доносить голоси з усього світу. Але це також час потрясінь: дві світові війни змінюють долі мільйонів, а люди в окопах мріють про мир.',
            details: 'Цей період охоплює першу половину 20-го століття, час швидкого технологічного прогресу (автомобілі, авіація, радіо), культурного розквіту (джаз, золотий вік Голлівуду) і глобальних конфліктів (Перша і Друга світові війни). Закінчується в 1949 році, перед початком післявоєнного відродження.',
            sound: 'modernism',
            color: '#B0C4DE',
            images: [
                '/images/modernism/1.jpg',
                '/images/modernism/2.jpg',
            ],
        },
        postwar_era: {
            yearRange: [1950, 1979],
            class: 'postwar_era',
            message: 'Ти в післявоєнній ері, де світ відбудовується після війни. У містах гудять рок-н-рол і звуки перших телевізорів, а молодь у джинсах танцює під Елвіса Преслі. У 1969 році людина ступає на Місяць, а в 1970-х дискотеки запалюють ночі. Повітря наповнене запахом бензину і звуками вінілових платівок.',
            details: 'Цей період охоплює післявоєнне відродження, розквіт поп-культури (рок-н-рол, хіпі), початок космічної ери (політ на Місяць) і холодну війну. Це час економічного зростання, технологічного прогресу (перші комп’ютери) і соціальних змін (рух за громадянські права). Закінчується в 1979 році, перед початком 80-х.',
            sound: 'postwar',
            color: '#FF4040',
            images: [
                '/images/postwar/1.jpg',
                '/images/postwar/2.jpg',
            ],
        },
        eighties: {
            yearRange: [1980, 1989],
            class: 'eighties',
            message: 'Ти в 80-х, де неон сяє яскравіше за сонце, а синтезатори задають ритм життя. У містах гудять аркадні автомати, а на екранах мерехтять VHS-касети. Люди в яскравих куртках танцюють під Майкла Джексона, а DeLorean мчить у майбутнє. Це час, коли мрії стають гучними.',
            details: 'Цей період — унікальний культурний вибух, час неону, синтезаторної музики, аркадних ігор і поп-культури (MTV, "Назад у майбутнє"). Це перехідний період між післявоєнним світом і цифровою ерою.',
            sound: 'eighties',
            color: '#FF00FF',
            images: [
                '/images/eighties/324324.jpg',
                '/images/eighties/198041270.jpg',
                '/images/eighties/las-vegas_1980s-1.jpg',
            ],
        },
        digital_era: {
            yearRange: [1990, 2025],
            class: 'digital_era',
            message: 'Ти в цифровій ері, де світ стає глобальним. У 1990-х інтернет з’єднує людей, а в 2000-х смартфони стають частиною життя. Соціальні мережі, стрімінг і штучний інтелект змінюють усе, а в 2020-х електромобілі та екотехнології формують новий світ. Повітря наповнене звуками сповіщень і гудінням дронів.',
            details: 'Цей період охоплює кінець 20-го століття і першу чверть 21-го століття, час цифрової революції (інтернет, смартфони, соціальні мережі), глобалізації та технологічного прогресу (штучний інтелект, електромобілі). Закінчується в 2025 році.',
            sound: 'digital',
            color: '#A9A9A9',
            images: [
                '/images/digital/dota.webp',
                '/images/digital/hello biden.mp4',
            ],
        },
        future: {
            yearRange: [2026, 3000],
            class: 'future',
            message: 'Ти в майбутньому, яке починається з перших кроків до зірок. У 2030-х дрони літають над містами, а люди носять AR-окуляри. До 2050-х голограми мерехтять у повітрі, космічні кораблі ширяють над містами зі скла, а колонії на Марсі стають реальністю. Люди в сріблястих костюмах спілкуються через нейроінтерфейси, а штучний інтелект знає твої думки наперед.',
            details: 'Цей період охоплює найближче майбутнє (2026–2049) і далеке майбутнє (2050–3000), з акцентом на футуристичні технології (голограми, космічні кораблі, нейроінтерфейси) і космічну експансію (колонії на Марсі, міжзоряні подорожі).',
            sound: 'future',
            color: '#00CED1',
            images: [
                '/images/future/1.jpg',
                '/images/future/2.png',
            ],
        },
    }), []);

    const epochs = useMemo(() => ({ ...defaultEpochs, ...customEpochs }), [customEpochs, defaultEpochs]);

    const yearImages = useMemo(() => ({
        1488: '/images/mc_petya_1488.webp',
        '-500': '/images/parthenon.jpg',
        '1200': '/images/medieval_castle.jpg',
        '1900': '/images/steam_engine.jpg',
        '1985': '/images/delorean.jpg',
        '2100': '/images/future_city.jpg',
    }), []);

    const textClassMap = useMemo(() => ({
        ancient: 'ancient-text',
        medieval: 'medieval-text',
        renaissance_early_modern: 'renaissance-text',
        industrial_era: 'industrial-text',
        modernism: 'modernism-text',
        postwar_era: 'postwar-text',
        eighties: 'eighties-text',
        digital_era: 'digital-text',
        future: 'future-text',
        unknown_epoch: 'unknown-text',
    }), []);

    const buttonClassMap = useMemo(() => ({
        ancient: 'ancient-button',
        medieval: 'medieval-button',
        renaissance_early_modern: 'renaissance-button',
        industrial_era: 'industrial-button',
        modernism: 'modernism-button',
        postwar_era: 'postwar-button',
        eighties: 'eighties-button',
        digital_era: 'digital-button',
        future: 'future-button',
        unknown_epoch: 'unknown-button',
    }), []);

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
            renaissance: '/sounds/renaissance-sound.mp3',
            industrial: '/sounds/industrial-sound.mp3',
            modernism: '/sounds/modernism-sound.mp3',
            postwar: '/sounds/postwar-sound.mp3',
            eighties: '/sounds/eighties-sound.mp3',
            digital: '/sounds/digital-sound.mp3',
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
            console.error('Не вдалося завантажити звук:', soundFile, error);
            audioRef.current = null;
        }
    }, [volume, stopCurrentAudio]);

    const playHoverSound = useCallback(() => {
        if (hoverSoundRef.current) {
            hoverSoundRef.current.currentTime = 0;
            hoverSoundRef.current.volume = 0.2;
            hoverSoundRef.current.play().catch(() => console.log('Не вдалося відтворити звук наведення'));
        }
    }, []);

    const playTravelSound = useCallback(() => {
        if (travelSoundRef.current) {
            travelSoundRef.current.currentTime = 0;
            travelSoundRef.current.volume = 0.5;
            travelSoundRef.current.play().catch(() => console.log('Не вдалося відтворити звук подорожі'));
        }
    }, []);

    const isVideo = useCallback((mediaUrl) => {
        return mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.ogg'));
    }, []);

    const updateEpoch = useCallback((newYear) => {
        let foundEpoch = null;
        let epochKey = null;
        for (const [key, epoch] of Object.entries(epochs)) {
            if (epoch.yearRange) {
                const [startYear, endYear] = epoch.yearRange;
                if (newYear >= startYear && newYear <= endYear) {
                    foundEpoch = { key, ...epoch };
                    epochKey = key;
                    break;
                }
            } else if (Math.abs(newYear - epoch.year) <= 50) {
                foundEpoch = { key, ...epoch };
                epochKey = key;
                break;
            }
        }

        if (foundEpoch && currentEpochKey.current !== epochKey) {
            setEpochClass(foundEpoch.class || foundEpoch.key);
            setMessage(foundEpoch.message);
            setDetails(foundEpoch.details || '');
            playSound(foundEpoch.sound || foundEpoch.class || foundEpoch.key, newYear);

            if (yearImages[newYear]) {
                setSelectedMedia({ type: 'image', url: yearImages[newYear] });
            } else if (foundEpoch.key === 'digital_era') {
                const videoMedia = foundEpoch.images.find(media => isVideo(media));
                if (videoMedia) {
                    setSelectedMedia({ type: 'video', url: videoMedia });
                } else if (foundEpoch.images && foundEpoch.images.length > 0) {
                    const randomImage = foundEpoch.images[Math.floor(Math.random() * foundEpoch.images.length)];
                    setSelectedMedia({ type: 'image', url: randomImage });
                } else {
                    setSelectedMedia({ type: '', url: '' });
                }
            } else if (foundEpoch.media && isVideo(foundEpoch.media)) {
                setSelectedMedia({ type: 'video', url: foundEpoch.media });
            } else if (foundEpoch.images && foundEpoch.images.length > 0) {
                const randomImage = foundEpoch.images[Math.floor(Math.random() * foundEpoch.images.length)];
                setSelectedMedia({ type: 'image', url: randomImage });
            } else {
                setSelectedMedia({ type: '', url: '' });
            }
            currentEpochKey.current = epochKey;
        } else if (!foundEpoch) {
            if (currentEpochKey.current !== 'unknown_epoch') {
                setEpochClass('unknown_epoch');
                setMessage('Ти в часовому розломі...');
                setDetails('Часові розломи — це аномалії...');
                playSound('unknown', newYear);
                setSelectedMedia({ type: '', url: '' });
                currentEpochKey.current = 'unknown_epoch';
            }
        }
    }, [epochs, playSound, isVideo, yearImages]);

    const createParticles = useCallback(() => {
        const particleStyles = {
            ancient: { color: '#FFD700', sizeMultiplier: 1.5 },
            medieval: { color: '#DAA520', sizeMultiplier: 1.2 },
            renaissance_early_modern: { color: '#E97451', sizeMultiplier: 1.3 },
            industrial_era: { color: '#4A4A4A', sizeMultiplier: 1.1 },
            modernism: { color: '#B0C4DE', sizeMultiplier: 1 },
            postwar_era: { color: '#FF4040', sizeMultiplier: 1.2 },
            eighties: { color: '#FF00FF', sizeMultiplier: 1.3, shape: 'square' },
            digital_era: { color: '#A9A9A9', sizeMultiplier: 1.1 },
            future: { color: '#00CED1', sizeMultiplier: 1.1 },
            unknown_epoch: { color: '#BA55D3', sizeMultiplier: 1.4 },
        };

        const style = particleStyles[epochClass] || { color: '#fff', sizeMultiplier: 1 };
        const newParticles = Array.from({ length: 20 }, () => ({
            id: Math.random(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: (Math.random() * 6 + 2) * style.sizeMultiplier,
            speed: Math.random() * 3 + 1,
            color: style.color,
            shape: style.shape || 'circle',
        }));
        setParticles(newParticles);
    }, [epochClass]);

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
    }, [showIntro, updateEpoch, createParticles]);

    useEffect(() => {
        createParticles();
    }, [epochClass, createParticles]);

    const changeEpoch = useCallback((direction) => {
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
    }, [year, playTravelSound, updateEpoch]);

    const handleFormSubmit = useCallback((e) => {
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
    }, [customEpochs, newEpoch]);

    // Debounce function for volume slider
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Fixed volume handler with debouncing
    const handleVolumeChange = useCallback(
        debounce((newVolume) => {
            setVolume(newVolume);
            if (audioRef.current) {
                audioRef.current.volume = newVolume;
            }
        }, 100),
        []
    );

    const MIN_YEAR = -1000;
    const MAX_YEAR = 3000;

    const getMarkerPosition = useCallback((year) => {
        const numericYear = parseInt(year, 10);
        if (isNaN(numericYear)) return 0;
        const clampedYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, numericYear));
        const totalRange = MAX_YEAR - MIN_YEAR;
        const yearPosition = (clampedYear - MIN_YEAR) / totalRange;
        return yearPosition * 100;
    }, []);

    const getYearFromPosition = useCallback((positionPercentage) => {
        const totalRange = MAX_YEAR - MIN_YEAR;
        const yearPosition = (positionPercentage / 100) * totalRange;
        return Math.round(MIN_YEAR + yearPosition);
    }, []);

    const handleTimelineClick = useCallback((e) => {
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
    }, [getYearFromPosition, playTravelSound, updateEpoch]);

    const handleMarkerDragStart = useCallback((e) => {
        e.preventDefault();
        document.addEventListener('mousemove', handleMarkerDrag);
        document.addEventListener('mouseup', handleMarkerDragEnd);
    }, []);

    const handleMarkerDrag = useCallback(
        debounce((e) => {
            if (!timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect();
            let position = (e.clientX - rect.left) / rect.width;
            position = Math.max(0, Math.min(1, position));
            const newYear = getYearFromPosition(position * 100);
            setYear(newYear);
        }, 50),
        [getYearFromPosition]
    );

    const handleMarkerDragEnd = useCallback(() => {
        document.removeEventListener('mousemove', handleMarkerDrag);
        document.removeEventListener('mouseup', handleMarkerDragEnd);
        setIsTraveling(true);
        playTravelSound();
        setTimeout(() => {
            localStorage.setItem('lastYear', year);
            updateEpoch(year);
            setIsTraveling(false);
        }, 1500);
    }, [year, playTravelSound, updateEpoch]);

    // Fixed year selector handler
    const handleYearSubmit = useCallback((e) => {
        e.preventDefault();
        const newYear = parseInt(e.target.year.value);
        if (isNaN(newYear)) {
            console.error('Невалідний рік');
            return;
        }
        setIsTraveling(true);
        playTravelSound();
        setTimeout(() => {
            setYear(newYear);
            localStorage.setItem('lastYear', newYear);
            updateEpoch(newYear);
            setShowYearInput(false);
            setIsTraveling(false);
        }, 1500);
    }, [playTravelSound, updateEpoch]);

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
                                            console.error(`Не вдалося завантажити відео: ${selectedMedia.url}`);
                                            const currentEpoch = epochs[epochClass];
                                            if (currentEpoch?.images && currentEpoch.images.length > 0) {
                                                const randomImage = currentEpoch.images[Math.floor(Math.random() * currentEpoch.images.length)];
                                                setSelectedMedia({ type: 'image', url: randomImage });
                                            } else {
                                                setSelectedMedia({ type: '', url: '' });
                                            }
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={selectedMedia.url}
                                        alt={`Епоха ${epochClass}`}
                                        onError={(e) => {
                                            console.error(`Не вдалося завантажити зображення: ${selectedMedia.url}`);
                                            setSelectedMedia({ type: '', url: '' });
                                        }}
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
                                        <option value="renaissance">Відродження</option>
                                        <option value="industrial">Індустріальний</option>
                                        <option value="modernism">Модернізм</option>
                                        <option value="postwar">Післявоєнний</option>
                                        <option value="eighties">80-ті</option>
                                        <option value="digital">Цифровий</option>
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
                                <form onSubmit={handleYearSubmit}>
                                    <input
                                        type="number"
                                        name="year"
                                        placeholder="Введи рік"
                                        required
                                    />
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
                        style={{ left: `${getMarkerPosition(year)}%` }}
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