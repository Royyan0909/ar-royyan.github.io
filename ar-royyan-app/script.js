// --- APP STATE & LOCALSTORAGE ---
const todayStr = new Date().toISOString().split('T')[0];
let appData = JSON.parse(localStorage.getItem('ar_royyan_data')) || {
    lastDate: todayStr,
    streak: 0,
    checklist: { sholat: false, tilawah: false, sedekah: false, dzikir: false },
    tilawahMinutes: 0,
    tasbihCount: 0,
    dhikrName: 'Subhanallah',
    dhikrTarget: 33,
    journals: [],
    calendarChecked: {}
};

if (appData.lastDate !== todayStr) {
    appData.checklist = { sholat: false, tilawah: false, sedekah: false, dzikir: false };
    appData.lastDate = todayStr;
    localStorage.setItem('ar_royyan_data', JSON.stringify(appData));
}

function saveAppData() {
    localStorage.setItem('ar_royyan_data', JSON.stringify(appData));
}

// --- DARK MODE TOGGLE ---
function toggleDarkMode() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        icon.className = 'fa-solid fa-moon';
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        icon.className = 'fa-solid fa-sun';
    }
}
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    document.getElementById('theme-icon').className = 'fa-solid fa-sun';
}

// --- REALTIME CLOCK & GREETING ---
function updateClockAndGreeting() {
    const now = new Date();
    const wibOptions = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    document.getElementById('realtime-clock').innerText = new Intl.DateTimeFormat('id-ID', wibOptions).format(now) + ' WIB';

    const hour = parseInt(new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false }).format(now));
    let greeting = "Assalamu'alaikum";
    if (hour >= 3 && hour < 11) greeting = "Selamat Pagi 🌅";
    else if (hour >= 11 && hour < 15) greeting = "Selamat Siang ☀️";
    else if (hour >= 15 && hour < 18) greeting = "Selamat Sore 🌤️";
    else greeting = "Selamat Malam 🌙";
    document.getElementById('greeting-text').innerText = greeting;
}
setInterval(updateClockAndGreeting, 1000);
updateClockAndGreeting();

// --- MOTIVATIONAL QUOTES ---
const quotes = [
    ""Barangsiapa bersungguh-sungguh, maka sesungguhnya kesungguhan itu adalah untuk dirinya sendiri."",
    ""Dan bersabarlah kamu, karena sesungguhnya Allah tidak menyia-nyiakan pahala orang-orang yang berbuat baik."",
    ""Maka sesungguhnya bersama kesulitan itu ada kemudahan."",
    ""Sebaik-baik manusia di antaramu adalah yang paling baik akhlaknya.""
];
document.getElementById('motivational-quote').innerText = quotes[Math.floor(Math.random() * quotes.length)];

// --- TAB NAVIGATION ---
function switchTab(tabId) {
    ['beranda', 'quran', 'tasbih', 'refleksi'].forEach(id => {
        document.getElementById(`tab-${id}`).classList.add('hidden');
        document.getElementById(`nav-${id}`).className = "nav-btn flex flex-col items-center py-1.5 px-4 rounded-2xl text-zinc-400 hover:text-zinc-600 transition font-medium text-xs";
    });
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    document.getElementById(`nav-${tabId}`).className = "nav-btn flex flex-col items-center py-1.5 px-4 rounded-2xl text-sage transition font-semibold text-xs";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- QIBLA CALCULATOR & GEOLOCATION ---
function detectLocationAndQibla() {
    const info = document.getElementById('qibla-info');
    info.innerText = "Mendeteksi lokasi GPS...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            const kaabaLat = 21.4225;
            const kaabaLon = 39.8262;

            const phi1 = lat * Math.PI / 180;
            const phi2 = kaabaLat * Math.PI / 180;
            const deltaLambda = (kaabaLon - lon) * Math.PI / 180;

            const y = Math.sin(deltaLambda) * Math.cos(phi2);
            const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
            let qibla = Math.atan2(y, x) * 180 / Math.PI;
            qibla = (qibla + 360) % 360;

            info.innerText = `Arah Kiblat: ~${qibla.toFixed(1)}° dari Utara`;
        }, () => {
            info.innerText = "Gagal deteksi lokasi. Default: Barat Laut (~295°)";
        });
    } else {
        info.innerText = "Geolocation tidak didukung browser ini.";
    }
}
detectLocationAndQibla();

// --- PRAYER TIMES & COUNTDOWN ---
let prayerTimesData = null;
let nextPrayerInfo = { name: '--', time: null };

async function fetchPrayerTimes() {
    try {
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Purwakarta&country=Indonesia&method=20');
        const data = await res.json();
        prayerTimesData = data.data.timings;
        renderPrayerTimes();
    } catch (e) {
        prayerTimesData = { Fajr: "04:15", Dhuhr: "11:50", Asr: "15:10", Maghrib: "18:02", Isha: "19:15" };
        renderPrayerTimes();
    }
}

function renderPrayerTimes() {
    if (!prayerTimesData) return;
    const prayers = [
        { key: 'Fajr', label: 'Subuh', time: prayerTimesData.Fajr },
        { key: 'Dhuhr', label: 'Dzuhur', time: prayerTimesData.Dhuhr },
        { key: 'Asr', label: 'Ashar', time: prayerTimesData.Asr },
        { key: 'Maghrib', label: 'Maghrib', time: prayerTimesData.Maghrib },
        { key: 'Isha', label: 'Isya', time: prayerTimesData.Isha }
    ];

    const container = document.getElementById('prayer-list');
    container.innerHTML = '';
    const now = new Date();
    let foundNext = false;

    prayers.forEach(p => {
        const [pHour, pMin] = p.time.split(':');
        const pDate = new Date();
        pDate.setHours(parseInt(pHour), parseInt(pMin), 0);
        const isPast = now > pDate;
        if (!isPast && !foundNext) {
            nextPrayerInfo = { name: p.label, time: pDate };
            foundNext = true;
        }

        container.innerHTML += `
            <div class="bg-beige dark:bg-zinc-900/50 p-2.5 rounded-2xl flex flex-col items-center justify-center border ${!isPast && foundNext && nextPrayerInfo.name === p.label ? 'border-sage ring-2 ring-sage/30' : 'border-transparent'}">
                <span class="text-[10px] text-zinc-400 font-medium">${p.label}</span>
                <span class="text-xs font-bold mt-1">${p.time}</span>
            </div>
        `;
    });

    if (!foundNext) {
        const pDate = new Date();
        pDate.setDate(pDate.getDate() + 1);
        const [pHour, pMin] = prayers[0].time.split(':');
        pDate.setHours(parseInt(pHour), parseInt(pMin), 0);
        nextPrayerInfo = { name: 'Subuh (Besok)', time: pDate };
    }
}

function updateCountdown() {
    if (!nextPrayerInfo.time) return;
    const diff = nextPrayerInfo.time - new Date();
    if (diff <= 0) { fetchPrayerTimes(); return; }
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('next-prayer-name').innerText = nextPrayerInfo.name;
    document.getElementById('prayer-countdown').innerText = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
setInterval(updateCountdown, 1000);
fetchPrayerTimes();

// --- DAILY CHECKLIST & STREAK ---
const checklistItemsDef = [
    { id: 'sholat', label: 'Sholat 5 Waktu Berjamaah / Tepat Waktu' },
    { id: 'tilawah', label: 'Tilawah Al-Qur'an (Min. 15 Menit)' },
    { id: 'sedekah', label: 'Sedekah Subuh / Berbuat Kebaikan' },
    { id: 'dzikir', label: 'Dzikir Pagi & Petang' }
];

function renderChecklist() {
    const container = document.getElementById('checklist-container');
    container.innerHTML = '';
    let completedCount = 0;

    checklistItemsDef.forEach(item => {
        const isChecked = appData.checklist[item.id];
        if (isChecked) completedCount++;

        container.innerHTML += `
            <label class="flex items-center justify-between p-3 bg-beige/60 dark:bg-zinc-900/50 rounded-2xl cursor-pointer hover:bg-beige transition">
                <div class="flex items-center space-x-3">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleChecklist('${item.id}')" class="w-5 h-5 rounded-lg text-sage accent-sage focus:ring-sage">
                    <span class="text-xs font-medium ${isChecked ? 'line-through text-zinc-400' : ''}">${item.label}</span>
                </div>
                <span class="text-[10px] ${isChecked ? 'text-sage font-bold' : 'text-zinc-400'}">${isChecked ? 'Selesai' : 'Belum'}</span>
            </label>
        `;
    });

    const percent = Math.round((completedCount / checklistItemsDef.length) * 100);
    document.getElementById('progress-percent').innerText = percent + '%';
    document.getElementById('progress-bar').style.width = percent + '%';

    if (percent === 100 && appData.streak === 0) appData.streak = 1;
    document.getElementById('streak-count').innerText = appData.streak;
}

function toggleChecklist(id) {
    appData.checklist[id] = !appData.checklist[id];
    const allChecked = Object.values(appData.checklist).every(v => v);
    if (allChecked) {
        appData.streak = Math.max(1, appData.streak + 1);
        appData.calendarChecked[todayStr] = true;
    } else {
        delete appData.calendarChecked[todayStr];
    }
    saveAppData();
    renderChecklist();
    renderCalendar();
}
renderChecklist();

// --- CALENDAR ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    document.getElementById('calendar-title').innerText = `Kalender ${monthNames[month]} ${year}`;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].forEach(d => {
        grid.innerHTML += `<div class="font-bold text-zinc-400 py-1">${d}</div>`;
    });

    for (let i = 0; i < firstDayIndex; i++) grid.innerHTML += `<div></div>`;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const isChecked = appData.calendarChecked[dateStr];
        let bgClass = "bg-beige dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300";
        if (isChecked) bgClass = "bg-sage text-white font-bold shadow-sm";
        else if (isToday) bgClass = "border-2 border-sage text-sage font-bold";

        grid.innerHTML += `<div class="py-2 rounded-xl text-xs flex items-center justify-center ${bgClass}">${day}</div>`;
    }
}
renderCalendar();

// --- QURAN DIGITAL ---
let allSurahs = [];
async function fetchSurahs() {
    try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        allSurahs = data.data;
        renderSurahList(allSurahs);
    } catch (e) {
        document.getElementById('surah-list').innerHTML = '<div class="text-center py-10 text-red-400 text-xs">Gagal memuat data Al-Qur'an.</div>';
    }
}

function renderSurahList(surahs) {
    const container = document.getElementById('surah-list');
    container.innerHTML = '';
    surahs.forEach(surah => {
        container.innerHTML += `
            <div onclick="openSurahDetail(${surah.nomor})" class="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between cursor-pointer hover:border-sage transition shadow-sm">
                <div class="flex items-center space-x-3.5">
                    <div class="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center font-bold text-xs">${surah.nomor}</div>
                    <div>
                        <h4 class="font-bold text-sm">${surah.namaLatin}</h4>
                        <p class="text-xs text-zinc-400">${surah.arti} • ${surah.jumlahAyat} Ayat</p>
                    </div>
                </div>
                <span class="arabic-font text-lg font-bold text-sage">${surah.nama}</span>
            </div>
        `;
    });
}

function filterSurah() {
    const keyword = document.getElementById('quran-search').value.toLowerCase();
    renderSurahList(allSurahs.filter(s => s.namaLatin.toLowerCase().includes(keyword) || s.arti.toLowerCase().includes(keyword)));
}
fetchSurahs();

async function openSurahDetail(nomor) {
    const modal = document.getElementById('surah-modal');
    const container = document.getElementById('modal-verses-container');
    modal.classList.remove('hidden');
    container.innerHTML = '<div class="text-center py-10 text-zinc-400 text-sm">Memuat ayat...</div>';

    try {
        const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
        const data = await res.json();
        const surah = data.data;

        document.getElementById('modal-surah-title').innerText = `${surah.nomor}. Surah ${surah.namaLatin} (${surah.nama})`;
        document.getElementById('modal-surah-subtitle').innerText = `${surah.arti} • ${surah.jumlahAyat} Ayat`;
        setupAudioPlayer(surah.namaLatin, surah.audioFull['05'] || Object.values(surah.audioFull)[0]);

        container.innerHTML = '';
        surah.ayat.forEach(ayat => {
            container.innerHTML += `
                <div class="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-3 shadow-sm">
                    <span class="w-6 h-6 rounded-full bg-sage/10 text-sage flex items-center justify-center font-bold text-xs">${ayat.nomor}</span>
                    <p class="arabic-font text-2xl text-right leading-loose font-bold">${ayat.teksArab}</p>
                    <p class="text-xs text-zinc-500 italic">${ayat.teksLatin}</p>
                    <p class="text-xs text-zinc-700 dark:text-zinc-300">${ayat.teksIndonesia}</p>
                </div>
            `;
        });
    } catch (e) {
        container.innerHTML = '<div class="text-center py-10 text-red-400 text-xs">Gagal memuat detail surah.</div>';
    }
}

function closeSurahModal() { document.getElementById('surah-modal').classList.add('hidden'); }

const audioElement = document.getElementById('audio-element');
let isPlayingAudio = false;

function setupAudioPlayer(title, url) {
    document.getElementById('player-title').innerText = `Surah ${title}`;
    audioElement.src = url;
    audioElement.pause();
    isPlayingAudio = false;
    updatePlayButtonIcon();
    document.getElementById('audio-player-bar').classList.remove('hidden');
    document.getElementById('audio-player-bar').classList.add('flex');
}

function togglePlayAudio() {
    if (isPlayingAudio) { audioElement.pause(); isPlayingAudio = false; }
    else { audioElement.play(); isPlayingAudio = true; }
    updatePlayButtonIcon();
}

function updatePlayButtonIcon() {
    document.getElementById('player-play-btn').innerHTML = isPlayingAudio ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
}

function onAudioEnded() { isPlayingAudio = false; updatePlayButtonIcon(); }
function closeAudioPlayer() { audioElement.pause(); isPlayingAudio = false; document.getElementById('audio-player-bar').classList.add('hidden'); }

function addTilawahTime() {
    appData.tilawahMinutes = Math.min(60, appData.tilawahMinutes + 5);
    saveAppData();
    document.getElementById('tilawah-minutes').innerText = appData.tilawahMinutes;
    if (appData.tilawahMinutes >= 15) { appData.checklist.tilawah = true; saveAppData(); renderChecklist(); }
}
document.getElementById('tilawah-minutes').innerText = appData.tilawahMinutes;

// --- TASBIH DIGITAL ---
let audioCtx = null;
function playClickSound() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
}

function setDhikr(name, target) {
    appData.dhikrName = name; appData.dhikrTarget = target; appData.tasbihCount = 0;
    saveAppData();
    document.getElementById('current-dhikr-name').innerText = name;
    document.getElementById('tasbih-counter').innerText = 0;
}

function incrementTasbih() {
    appData.tasbihCount++;
    if (navigator.vibrate) navigator.vibrate(30);
    playClickSound();
    document.getElementById('tasbih-counter').innerText = appData.tasbihCount;
    saveAppData();
    if (appData.tasbihCount >= appData.dhikrTarget) { appData.checklist.dzikir = true; saveAppData(); renderChecklist(); }
}

function resetTasbih() { appData.tasbihCount = 0; saveAppData(); document.getElementById('tasbih-counter').innerText = 0; }
document.getElementById('current-dhikr-name').innerText = appData.dhikrName;
document.getElementById('tasbih-counter').innerText = appData.tasbihCount;

// --- REFLEKSI HARIAN / JOURNAL ---
function saveJournal() {
    const text = document.getElementById('journal-input').value.trim();
    if (!text) return;
    appData.journals.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        text: text
    });
    saveAppData();
    document.getElementById('journal-input').value = '';
    renderJournals();
}

function renderJournals() {
    const container = document.getElementById('journal-list');
    if (!appData.journals || appData.journals.length === 0) {
        container.innerHTML = '<div class="text-center py-6 text-zinc-400 text-xs">Belum ada catatan refleksi.</div>';
        return;
    }
    container.innerHTML = '';
    appData.journals.forEach(j => {
        container.innerHTML += `
            <div class="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-2 shadow-sm">
                <div class="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                    <span><i class="fa-solid fa-calendar mr-1"></i> ${j.date}</span>
                    <button onclick="deleteJournal(${j.id})" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button>
                </div>
                <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">${j.text}</p>
            </div>
        `;
    });
}

function deleteJournal(id) {
    appData.journals = appData.journals.filter(j => j.id !== id);
    saveAppData();
    renderJournals();
}
renderJournals();
