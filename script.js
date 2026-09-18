// --- 1. Yükleme Ekranı ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.visibility = 'hidden'; }, 800);
    }, 1000); 
});

// --- 2. Müzik Kontrolü ---
const musicBtn = document.getElementById('music-btn');
const bgMusic = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        bgMusic.pause();
        musicIcon.textContent = '🎵';
        musicBtn.innerHTML = '<span id="music-icon">🎵</span> Müzik';
    } else {
        bgMusic.play().catch(e => console.log("Oynatma engellendi:", e));
        musicIcon.textContent = '🎶';
        musicBtn.innerHTML = '<span id="music-icon">🎶</span> Çalıyor';
    }
    isPlaying = !isPlaying;
});

// --- 3. Scroll Efektleri ---
const revealElements = document.querySelectorAll('.reveal');
const scrollIndicator = document.getElementById('scroll-indicator');

const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
const revealOnScroll = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, revealOptions);
revealElements.forEach(el => revealOnScroll.observe(el));

window.addEventListener('scroll', () => {
    if(window.scrollY > 50) {
        scrollIndicator.style.opacity = '0';
    } else {
        scrollIndicator.style.opacity = '1';
    }
});

// --- 4. Tıklama Patlaması ---
document.addEventListener('click', function(e) {
    if(e.target.tagName === 'CANVAS' || e.target.closest('button') || e.target.closest('.magic-heart')) return;
    
    const colors = ['#ef4444', '#fca5a5', '#ffffff'];
    for (let i = 0; i < 4; i++) {
        let burst = document.createElement('div');
        burst.classList.add('click-burst');
        burst.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        burst.style.left = e.pageX + 'px';
        burst.style.top = e.pageY + 'px';
        
        let x = (Math.random() - 0.5) * 100; 
        let y = (Math.random() - 0.5) * 100; 
        burst.style.setProperty('--x', x + 'px');
        burst.style.setProperty('--y', y + 'px');
        
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 600);
    }
});

// --- OYUN: Zaman Makinesi ---
let isWarpSpeed = false;
const warpBtn = document.getElementById('warp-btn');
const tmConsole = document.getElementById('tm-console');
const galleryContainer = document.getElementById('gallery-container');

if(warpBtn) {
    warpBtn.addEventListener('click', () => {
        // Konsolu gizle
        tmConsole.style.opacity = '0';
        setTimeout(() => { tmConsole.style.display = 'none'; }, 500);
        
        // Hızlandır (Yıldızlar aşağı akacak)
        isWarpSpeed = true;
        
        // 2.5 Saniye sonra anıları göster
        setTimeout(() => {
            isWarpSpeed = false;
            galleryContainer.classList.add('show');
            // Hafif aşağı kaydır
            window.scrollBy({ top: 150, behavior: 'smooth' });
        }, 2500);
    });
}

// --- Fotoğraf Çevirme Mantığı ---
const flipCards = document.querySelectorAll('.flip-card');
flipCards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        
        // İlk tıklandığında minik patlama
        if(card.classList.contains('flipped')) {
            let rect = card.getBoundingClientRect();
            triggerMiniExplosion(rect.left + rect.width/2, rect.top + rect.height/2);
        }
    });
});

// --- OYUN: Kazı Kazan ---
const sCanvas = document.getElementById('scratchCanvas');
const sCtx = sCanvas.getContext('2d', { willReadFrequently: true });
let isDrawing = false;

function initScratchCard() {
    sCanvas.width = sCanvas.parentElement.offsetWidth;
    sCanvas.height = sCanvas.parentElement.offsetHeight;
    
    let gradient = sCtx.createLinearGradient(0, 0, sCanvas.width, sCanvas.height);
    gradient.addColorStop(0, '#ef4444');
    gradient.addColorStop(1, '#7f1d1d');
    sCtx.fillStyle = gradient;
    sCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);
    
    sCtx.fillStyle = '#ffffff';
    sCtx.font = "bold 20px Outfit";
    sCtx.textAlign = "center";
    sCtx.textBaseline = "middle";
    sCtx.fillText("Kazımak için sürükle ✨", sCanvas.width/2, sCanvas.height/2);
}

window.addEventListener('resize', initScratchCard);
initScratchCard();

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

function startDrawing(e) { isDrawing = true; scratch(e); }
function stopDrawing() { isDrawing = false; }
function scratch(e) {
    if (!isDrawing) return;
    if(e.type.includes('touch')) e.preventDefault(); 
    
    const pos = getMousePos(sCanvas, e);
    sCtx.globalCompositeOperation = 'destination-out';
    sCtx.beginPath();
    sCtx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
    sCtx.fill();
    sCtx.globalCompositeOperation = 'source-over';
}

sCanvas.addEventListener('mousedown', startDrawing);
sCanvas.addEventListener('mousemove', scratch);
sCanvas.addEventListener('mouseup', stopDrawing);
sCanvas.addEventListener('mouseleave', stopDrawing);
sCanvas.addEventListener('touchstart', startDrawing, {passive: false});
sCanvas.addEventListener('touchmove', scratch, {passive: false});
sCanvas.addEventListener('touchend', stopDrawing);


// --- OYUN: Sihirli Kalp Yakalama ---
const magicHeartsContainer = document.getElementById('magic-hearts-container');
const magicHeartCount = document.getElementById('magic-heart-count');
const gameUi = document.getElementById('game-ui');
const lockedOverlay = document.getElementById('locked-overlay');
const unlockedContent = document.getElementById('unlocked-content');
let foundHearts = 0;
const totalHearts = 3;

function spawnMagicHeart() {
    const heart = document.createElement('div');
    heart.classList.add('magic-heart');
    heart.innerHTML = '❤️';
    
    heart.style.left = Math.random() * (window.innerWidth - 60) + 'px';
    heart.style.top = Math.random() * (window.innerHeight - 60) + 'px';
    heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
    
    heart.addEventListener('click', () => {
        foundHearts++;
        magicHeartCount.textContent = foundHearts + ' / ' + totalHearts;
        heart.remove();
        
        gameUi.classList.add('show');
        setTimeout(()=> { if(foundHearts < totalHearts) gameUi.classList.remove('show'); }, 2000);
        
        triggerMiniExplosion(heart.getBoundingClientRect().left, heart.getBoundingClientRect().top);

        if(foundHearts >= totalHearts) unlockSurprise();
    });
    magicHeartsContainer.appendChild(heart);
}

function unlockSurprise() {
    gameUi.innerHTML = "✨ DİLEK PASTASI AÇILDI! ✨";
    gameUi.classList.add('show');
    
    lockedOverlay.style.opacity = '0';
    setTimeout(() => { 
        lockedOverlay.style.visibility = 'hidden'; 
        unlockedContent.classList.add('show');
    }, 1000);
    setTimeout(() => { gameUi.classList.remove('show'); }, 3000);
}

setTimeout(() => { spawnMagicHeart(); }, 2000);
setTimeout(() => { spawnMagicHeart(); }, 5000);
setTimeout(() => { spawnMagicHeart(); }, 8000);


// --- Havai Fişek / Patlama Sistemi ---
function triggerMiniExplosion(x, y) {
    const colors = ['#ef4444', '#fca5a5', '#ffffff'];
    for(let i=0; i<15; i++) {
        let p = document.createElement('div');
        p.classList.add('explosion-particle');
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.width = Math.random() * 6 + 4 + 'px';
        p.style.height = p.style.width;
        p.style.left = x + 'px';
        p.style.top = y + 'px';

        let angle = Math.random() * Math.PI * 2;
        let velocity = Math.random() * 150 + 30; 
        p.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');
        
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1500);
    }
}

function triggerBigExplosion(x, y) {
    const colors = ['#ef4444', '#fca5a5', '#ffffff', '#dc2626'];
    for(let i=0; i<50; i++) {
        let p = document.createElement('div');
        p.classList.add('explosion-particle');
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.width = Math.random() * 8 + 4 + 'px';
        p.style.height = p.style.width;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.boxShadow = `0 0 10px ${p.style.backgroundColor}`;

        let angle = Math.random() * Math.PI * 2;
        let velocity = Math.random() * 300 + 50; 
        p.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');
        
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1500);
    }
}

const blowBtn = document.getElementById('blow-btn');
const flame = document.getElementById('flame');
const wishMessage = document.getElementById('wish-message');

if(blowBtn) {
    blowBtn.addEventListener('click', (e) => {
        flame.style.opacity = '0';
        setTimeout(() => { flame.style.display = 'none'; }, 500);
        
        blowBtn.style.display = 'none';
        wishMessage.classList.add('show');
        
        let rect = blowBtn.getBoundingClientRect();
        triggerBigExplosion(rect.left + rect.width/2, rect.top);
        
        setTimeout(() => triggerBigExplosion(window.innerWidth * 0.2, window.innerHeight * 0.5), 400);
        setTimeout(() => triggerBigExplosion(window.innerWidth * 0.8, window.innerHeight * 0.4), 800);
        setTimeout(() => triggerBigExplosion(window.innerWidth * 0.5, window.innerHeight * 0.3), 1200);
    });
}


// --- TEK CANVAS ARKA PLAN ---
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d', { alpha: false }); 
let width, height;
let particles = [];
let fallingHearts = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const isMobile = width < 768;
const starCount = isMobile ? 50 : 120;
const fallingHeartCount = isMobile ? 10 : 20;

const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
bgGradient.addColorStop(0, '#110202');
bgGradient.addColorStop(1, '#2a0808');

class Star {
    constructor() {
        this.x = Math.random() * width; this.y = Math.random() * height;
        this.size = Math.random() * 2; 
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.brightness = Math.random(); this.twinkle = 0.02 + Math.random() * 0.03;
        this.color = Math.random() > 0.5 ? '#fca5a5' : '#ffffff'; 
    }
    update() {
        if(isWarpSpeed) {
            this.y += 25; // ZAMAN MAKİNESİ HIZI (Aşağı Doğru İnanılmaz Hız)
        } else {
            this.y += this.speedY - 0.1;
        }
        
        if (this.y < 0) this.y = height;
        if (this.y > height) {
            this.y = 0;
            this.x = Math.random() * width;
        }
        
        this.brightness += this.twinkle;
        if(this.brightness > 1 || this.brightness < 0) this.twinkle = -this.twinkle;
    }
    draw() {
        ctx.beginPath(); 
        
        if(isWarpSpeed) {
            // Hız çizgisi görünümü
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y - 40);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size;
            ctx.stroke();
        } else {
            // Normal yıldız görünümü
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color; 
            ctx.globalAlpha = Math.abs(this.brightness) * 0.8;
            ctx.fill(); 
        }
        ctx.globalAlpha = 1;
    }
}

class CanvasHeart {
    constructor() {
        this.reset(true);
    }
    reset(randomY = false) {
        this.x = Math.random() * width;
        this.y = randomY ? Math.random() * height : -50;
        this.size = Math.random() * 15 + 10; 
        this.speedY = Math.random() * 1.5 + 0.5; 
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.emoji = Math.random() > 0.3 ? '❤️' : '✨';
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
        if(isWarpSpeed) {
            this.y += 35; // Hızlanma
        } else {
            this.y += this.speedY;
        }
        
        this.rotation += this.rotationSpeed;
        if(this.y > height + 50) this.reset();
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        
        if(isWarpSpeed) {
            // Hızlanınca hafif şeffaflaşsınlar ve uzasınlar
            ctx.scale(0.5, 3);
            ctx.globalAlpha = 0.2;
        } else {
            ctx.globalAlpha = this.opacity;
        }
        
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}

for (let i = 0; i < starCount; i++) particles.push(new Star());
for (let i = 0; i < fallingHeartCount; i++) fallingHearts.push(new CanvasHeart());

function animateCanvas() {
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    particles.forEach(p => { p.update(); p.draw(); });
    fallingHearts.forEach(h => { h.update(); h.draw(); });
    
    requestAnimationFrame(animateCanvas);
}
animateCanvas();
