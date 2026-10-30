/* --- GAME STATE & VARS --- */
let pet = {
    name: "Mimi",
    color: "orange",
    hunger: 80,
    hygiene: 90,
    happiness: 85,
    energy: 70,
    coins: 100,
    isSleeping: false,
    inventory: { hat: false, bow: false, glasses: false },
    equipped: { hat: false, bow: false, glasses: false }
};

let selectedColor = "orange";
let soundEnabled = true;

/* Cat Color Schemes */
const catColors = {
    orange: { base: '#f97316', inner: '#ffedd5', stroke: '#c2410c' },
    black: { base: '#334155', inner: '#64748b', stroke: '#0f172a' },
    calico: { base: '#d97706', inner: '#fef3c7', stroke: '#92400e' },
    white: { base: '#f8fafc', inner: '#f1f5f9', stroke: '#cbd5e1' }
};

/* WEB AUDIO API SYNTHESIZER (Tanpa File Eksternal) */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
}

function playSound(type) {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    if (type === 'meow') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.35);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    } else if (type === 'purr') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'pop') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    } else if (type === 'coin') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }
}

/* --- INITIALIZATION & SAVE SYSTEM --- */
window.onload = function() {
    loadGame();
    setupCanvas();
    startGameLoop();
    updateRealTime();
    setInterval(updateRealTime, 1000);
};

function saveGame() {
    localStorage.setItem('virtualCatPetData', JSON.stringify(pet));
}

function loadGame() {
    const saved = localStorage.getItem('virtualCatPetData');
    if (saved) {
        try {
            pet = JSON.parse(saved);
            document.getElementById('startModal').classList.add('hidden');
            applyPetAppearance();
            updateUI();
        } catch(e) {
            console.error("Failed to load save", e);
        }
    }
}

function selectCatBreed(color) {
    selectedColor = color;
    ['Orange', 'Black', 'Calico', 'White'].forEach(c => {
        const btn = document.getElementById(`breed${c}`);
        if (c.toLowerCase() === color) {
            btn.classList.add('border-pink-400');
            btn.classList.remove('border-transparent');
        } else {
            btn.classList.remove('border-pink-400');
            btn.classList.add('border-transparent');
        }
    });
}

function startNewPet() {
    const nameInput = document.getElementById('inputPetName').value.trim();
    pet.name = nameInput || "Mimi";
    pet.color = selectedColor;
    pet.hunger = 80;
    pet.hygiene = 90;
    pet.happiness = 85;
    pet.energy = 70;
    pet.coins = 50;
    document.getElementById('startModal').classList.add('hidden');
    applyPetAppearance();
    saveGame();
    updateUI();
    playSound('meow');
    showSpeech("Meow! Salam kenal!");
}

function applyPetAppearance() {
    const colorScheme = catColors[pet.color] || catColors.orange;
    document.getElementById('catBodyBase').setAttribute('fill', colorScheme.base);
    document.getElementById('catHeadBase').setAttribute('fill', colorScheme.base);
    document.getElementById('catPawLeft').setAttribute('fill', colorScheme.base);
    document.getElementById('catPawRight').setAttribute('fill', colorScheme.base);
    document.getElementById('catEarLeft').setAttribute('fill', colorScheme.base);
    document.getElementById('catEarLeft').setAttribute('stroke', colorScheme.stroke);
    document.getElementById('catEarRight').setAttribute('fill', colorScheme.base);
    document.getElementById('catEarRight').setAttribute('stroke', colorScheme.stroke);
    document.getElementById('catTail').setAttribute('stroke', colorScheme.base);
    document.getElementById('accHat').classList.toggle('hidden', !pet.equipped.hat);
    document.getElementById('accBow').classList.toggle('hidden', !pet.equipped.bow);
    document.getElementById('accGlasses').classList.toggle('hidden', !pet.equipped.glasses);
    document.getElementById('petNameDisplay').innerText = pet.name;
}

/* --- GAME LOOP & STAT DECAY --- */
function startGameLoop() {
    setInterval(() => {
        if (!pet.isSleeping) {
            pet.hunger = Math.max(0, pet.hunger - 1);
            pet.hygiene = Math.max(0, pet.hygiene - 0.5);
            pet.happiness = Math.max(0, pet.happiness - 0.8);
            pet.energy = Math.max(0, pet.energy - 0.5);
        } else {
            pet.energy = Math.min(100, pet.energy + 4);
            pet.hunger = Math.max(0, pet.hunger - 0.3);
            if (pet.energy >= 100) {
                toggleSleep();
                showSpeech("Aku sudah segar kembali!");
            }
        }
        updateUI();
        saveGame();
    }, 3000);
}

/* --- UI UPDATES & EYES ANIMATION --- */
function updateUI() {
    document.getElementById('statHungerVal').innerText = `${Math.round(pet.hunger)}%`;
    document.getElementById('barHunger').style.width = `${pet.hunger}%`;
    document.getElementById('statHygieneVal').innerText = `${Math.round(pet.hygiene)}%`;
    document.getElementById('barHygiene').style.width = `${pet.hygiene}%`;
    document.getElementById('statHappinessVal').innerText = `${Math.round(pet.happiness)}%`;
    document.getElementById('barHappiness').style.width = `${pet.happiness}%`;
    document.getElementById('statEnergyVal').innerText = `${Math.round(pet.energy)}%`;
    document.getElementById('barEnergy').style.width = `${pet.energy}%`;
    document.getElementById('coinCount').innerText = pet.coins;

    document.getElementById('dirtyOverlay').style.opacity = pet.hygiene < 40 ? '1' : '0';
    document.getElementById('sleepZzz').style.opacity = pet.isSleeping ? '1' : '0';

    const eyesNormal = document.getElementById('eyesNormal');
    const eyesHappy = document.getElementById('eyesHappy');
    const eyesSleep = document.getElementById('eyesSleep');
    eyesNormal.classList.add('hidden');
    eyesHappy.classList.add('hidden');
    eyesSleep.classList.add('hidden');
    if (pet.isSleeping) {
        eyesSleep.classList.remove('hidden');
    } else if (pet.happiness > 70) {
        eyesHappy.classList.remove('hidden');
    } else {
        eyesNormal.classList.remove('hidden');
    }

    if (pet.hunger < 25) {
        showSpeech(`${pet.name} lapar sekali...`);
    } else if (pet.hygiene < 25) {
        showSpeech(`${pet.name} merasa gatal / kotor!`);
    } else if (pet.energy < 20 && !pet.isSleeping) {
        showSpeech(`${pet.name} sangat mengantuk...`);
    }
}

function showSpeech(text) {
    const speech = document.getElementById('catSpeech');
    document.getElementById('catSpeechText').innerText = text;
    speech.style.opacity = '1';
    setTimeout(() => { speech.style.opacity = '0'; }, 3000);
}

/* --- REAL TIME & DAY/NIGHT CYCLE --- */
function updateRealTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const isNight = hours >= 18 || hours < 6;
    document.getElementById('timeDisplay').innerText = `${hours}:${minutes} ${isNight ? 'MALAM' : 'SIANG'}`;
    const roomStage = document.getElementById('roomStage');
    if (isNight && !pet.isSleeping) {
        roomStage.classList.remove('bg-day');
        roomStage.classList.add('bg-night');
    } else if (!isNight && !pet.isSleeping) {
        roomStage.classList.remove('bg-night');
        roomStage.classList.add('bg-day');
    }
}

/* --- INTERACTION 1: PETTING / ELUS KUCING --- */
function handlePetInteraction(e) {
    if (pet.isSleeping) {
        showSpeech("Ssshh... sedang tidur!");
        return;
    }
    pet.happiness = Math.min(100, pet.happiness + 3);
    updateUI();
    playSound('purr');
    const mouthNormal = document.getElementById('mouthNormal');
    const mouthOpen = document.getElementById('mouthOpen');
    mouthNormal.classList.add('hidden');
    mouthOpen.classList.remove('hidden');
    setTimeout(() => {
        mouthNormal.classList.remove('hidden');
        mouthOpen.classList.add('hidden');
    }, 400);
    createParticle(e.clientX, e.clientY, '❤️');
}

function createParticle(x, y, symbol) {
    const el = document.createElement('div');
    el.className = 'particle text-2xl z-30';
    el.innerText = symbol;
    el.style.left = `${x - 12}px`;
    el.style.top = `${y - 12}px`;
    document.body.appendChild(el);
    setTimeout(() => { el.remove(); }, 1200);
}

/* --- INTERACTION 2: BERI MAKAN (FOOD) --- */
function openFoodMenu() {
    if (pet.isSleeping) return showSpeech("Kucing sedang tidur!");
    openModal('foodModal');
}

function feedPet(foodType, boost, cost) {
    if (pet.coins < cost) {
        alert("Koin kamu tidak cukup!");
        return;
    }
    pet.coins -= cost;
    pet.hunger = Math.min(100, pet.hunger + boost);
    updateUI();
    closeModal('foodModal');
    playSound('pop');
    showSpeech("Nyam nyam! Lezat sekali 🐟");
    const cat = document.getElementById('catCharacter');
    cat.classList.add('scale-110');
    setTimeout(() => cat.classList.remove('scale-110'), 300);
}

/* --- INTERACTION 3: MANDI (BATH) --- */
function startBathing() {
    if (pet.isSleeping) return showSpeech("Kucing sedang tidur!");
    pet.hygiene = 100;
    pet.happiness = Math.min(100, pet.happiness + 5);
    updateUI();
    playSound('pop');
    showSpeech("Segar sekali! Busa mandi 🧼");
    const stage = document.getElementById('roomStage');
    const rect = stage.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * rect.height;
            createParticle(x, y, '🫧');
        }, i * 80);
    }
}

/* --- INTERACTION 4: TIDUR (SLEEP) --- */
function toggleSleep() {
    pet.isSleeping = !pet.isSleeping;
    const nightOverlay = document.getElementById('nightOverlay');
    const sleepBtnText = document.getElementById('sleepBtnText');
    if (pet.isSleeping) {
        nightOverlay.style.opacity = '1';
        sleepBtnText.innerText = 'Bangun';
        showSpeech("Selamat tidur... Zzz");
        playSound('purr');
    } else {
        nightOverlay.style.opacity = '0';
        sleepBtnText.innerText = 'Tidur';
        showSpeech("Hoammm... Halo!");
        playSound('meow');
    }
    updateUI();
    saveGame();
}

/* --- INTERACTION 5: SHOP SYSTEM --- */
function openShop() {
    updateShopUI();
    openModal('shopModal');
}

function updateShopUI() {
    const btnHat = document.getElementById('btnBuyHat');
    const btnBow = document.getElementById('btnBuyBow');
    const btnGlasses = document.getElementById('btnBuyGlasses');
    if (pet.inventory.hat) {
        btnHat.innerText = pet.equipped.hat ? "Lepas" : "Pakai";
        btnHat.className = pet.equipped.hat ? "bg-slate-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold cute-btn" : "bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold cute-btn";
    }
    if (pet.inventory.bow) {
        btnBow.innerText = pet.equipped.bow ? "Lepas" : "Pakai";
        btnBow.className = pet.equipped.bow ? "bg-slate-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold cute-btn" : "bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold cute-btn";
    }
    if (pet.inventory.glasses) {
        btnGlasses.innerText = pet.equipped.glasses ? "Lepas" : "Pakai";
        btnGlasses.className = pet.equipped.glasses ? "bg-slate-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold cute-btn" : "bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold cute-btn";
    }
}

function buyAccessory(item, price) {
    if (pet.inventory[item]) {
        pet.equipped[item] = !pet.equipped[item];
    } else {
        if (pet.coins < price) {
            alert("Koin kamu tidak cukup!");
            return;
        }
        pet.coins -= price;
        pet.inventory[item] = true;
        pet.equipped[item] = true;
        playSound('coin');
    }
    applyPetAppearance();
    updateUI();
    updateShopUI();
    saveGame();
}

/* --- MINI GAME: CATCH THE YARN --- */
let gameTimerInterval = null;
let gameScore = 0;
let gameTimeLeft = 15;

function openMinigame() {
    if (pet.isSleeping) return showSpeech("Kucing sedang tidur!");
    openModal('minigameModal');
    gameScore = 0;
    gameTimeLeft = 15;
    document.getElementById('gameScore').innerText = gameScore;
    document.getElementById('gameTimer').innerText = `${gameTimeLeft}s`;
    moveYarn();
    gameTimerInterval = setInterval(() => {
        gameTimeLeft--;
        document.getElementById('gameTimer').innerText = `${gameTimeLeft}s`;
        if (gameTimeLeft <= 0) endMinigame();
    }, 1000);
}

function moveYarn() {
    const playArea = document.getElementById('gamePlayArea');
    const yarn = document.getElementById('yarnTarget');
    const maxX = playArea.clientWidth - 50;
    const maxY = playArea.clientHeight - 50;
    const randomX = Math.max(25, Math.floor(Math.random() * maxX));
    const randomY = Math.max(25, Math.floor(Math.random() * maxY));
    yarn.style.left = `${randomX}px`;
    yarn.style.top = `${randomY}px`;
}

function catchYarn(e) {
    e.stopPropagation();
    gameScore += 1;
    document.getElementById('gameScore').innerText = gameScore;
    playSound('pop');
    createParticle(e.clientX, e.clientY, '⭐');
    moveYarn();
}

function endMinigame() {
    clearInterval(gameTimerInterval);
    closeModal('minigameModal');
    const coinsEarned = gameScore * 3;
    pet.coins += coinsEarned;
    pet.happiness = Math.min(100, pet.happiness + 15);
    pet.energy = Math.max(0, pet.energy - 10);
    if (coinsEarned > 0) playSound('coin');
    updateUI();
    saveGame();
    showSpeech(`Selesai main! Dapat 🪙 ${coinsEarned} Koin!`);
}

/* --- MODAL HELPERS --- */
function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('opacity-0', 'pointer-events-none');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('opacity-0', 'pointer-events-none');
}

/* --- CANVAS FX BACKDROP --- */
function setupCanvas() {
    const canvas = document.getElementById('effectsCanvas');
    const ctx = canvas.getContext('2d');
    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);
}
