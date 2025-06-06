class ClickFastGame {
    constructor() {
        this.gameState = {
            clicks: 0,
            timeLeft: 10,
            cps: 0,
            isActive: false,
            isCompleted: false,
            selectedMode: 'speed-10',
            selectedDuration: 10
        };
        
        this.gameStartTime = null;
        this.gameInterval = null;
        this.clickEffects = [];
        
        this.initializeElements();
        this.bindEvents();
        this.loadPersonalBests();
        this.updateDisplay();
    }
    
    initializeElements() {
        // Stats elements
        this.currentClicksEl = document.getElementById('current-clicks');
        this.currentCpsEl = document.getElementById('current-cps');
        this.bestClicksEl = document.getElementById('best-clicks');
        this.bestCpsEl = document.getElementById('best-cps');
        
        // Timer elements
        this.timerSection = document.getElementById('timer-section');
        this.timerEl = document.getElementById('timer');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        // Game elements
        this.gameSection = document.getElementById('game-section');
        this.gameArea = document.getElementById('game-area');
        this.pulseRing = document.getElementById('pulse-ring');
        
        // Results elements
        this.resultsSection = document.getElementById('results');
        this.trophy = document.getElementById('trophy');
        this.resultsTitle = document.getElementById('results-title');
        this.resultsMode = document.getElementById('results-mode');
        this.finalClicks = document.getElementById('final-clicks');
        this.finalCps = document.getElementById('final-cps');
        this.personalBest = document.getElementById('personal-best');
        this.newRecord = document.getElementById('new-record');
        this.pbClicks = document.getElementById('pb-clicks');
        this.pbCps = document.getElementById('pb-cps');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        // Control elements
        this.controlBtn = document.getElementById('control-btn');
        this.modeButtons = document.querySelectorAll('.mode-btn');
    }
    
    bindEvents() {
        // Mode selection
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.gameState.isActive) {
                    this.selectMode(btn.dataset.mode, parseInt(btn.dataset.duration));
                }
            });
        });
        
        // Game area click
        this.gameArea.addEventListener('click', (e) => this.handleClick(e));
        
        // Control button
        this.controlBtn.addEventListener('click', () => this.handleControlClick());
        
        // Play again button
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        
        // Prevent context menu on game area
        this.gameArea.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    selectMode(mode, duration) {
        this.gameState.selectedMode = mode;
        this.gameState.selectedDuration = duration;
        this.gameState.timeLeft = duration;
        
        // Update active mode button
        this.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        this.loadPersonalBests();
        this.updateDisplay();
    }
    
    handleControlClick() {
        if (!this.gameState.isActive) {
            this.startGame();
        } else {
            this.stopGame();
        }
    }
    
    startGame() {
        this.gameState = {
            ...this.gameState,
            clicks: 0,
            timeLeft: this.gameState.selectedDuration,
            cps: 0,
            isActive: true,
            isCompleted: false
        };
        
        this.gameStartTime = Date.now();
        this.clearClickEffects();
        
        // Update UI
        this.updateDisplay();
        this.showTimer();
        this.hideResults();
        this.updateControlButton();
        this.updateModeButtons();
        
        // Start game timer
        this.gameInterval = setInterval(() => {
            this.updateGameTimer();
        }, 100);
        
        // Add active state to game area
        this.gameArea.classList.add('active');
        this.pulseRing.classList.add('active');
    }
    
    stopGame() {
        this.gameState.isActive = false;
        this.clearGameInterval();
        this.resetGame();
    }
    
    updateGameTimer() {
        this.gameState.timeLeft = Math.max(0, this.gameState.timeLeft - 0.1);
        
        const timeElapsed = this.gameState.selectedDuration - this.gameState.timeLeft;
        this.gameState.cps = this.calculateCPS(this.gameState.clicks, timeElapsed);
        
        this.updateDisplay();
        this.updateTimer();
        this.updateProgress();
        
        if (this.gameState.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameState.isActive = false;
        this.gameState.isCompleted = true;
        this.clearGameInterval();
        
        // Remove active states
        this.gameArea.classList.remove('active');
        this.pulseRing.classList.remove('active');
        
        // Check for new record
        const isNewRecord = this.checkNewRecord();
        
        // Show results
        this.showResults(isNewRecord);
        this.hideTimer();
        this.updateControlButton();
        this.updateModeButtons();
    }
    
    handleClick(event) {
        if (!this.gameState.isActive) return;
        
        const rect = this.gameArea.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Add click effect
        this.addClickEffect(x, y);
        
        // Play sound and haptic feedback
        this.playClickSound();
        this.triggerHapticFeedback();
        
        // Update clicks
        this.gameState.clicks++;
        this.updateDisplay();
    }
    
    addClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        effect.style.transform = 'translate(-50%, -50%)';
        
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        
        const pulse = document.createElement('div');
        pulse.className = 'click-pulse';
        
        effect.appendChild(ripple);
        effect.appendChild(pulse);
        this.gameArea.appendChild(effect);
        
        // Remove effect after animation
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1000);
    }
    
    clearClickEffects() {
        const effects = this.gameArea.querySelectorAll('.click-effect');
        effects.forEach(effect => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        });
    }
    
    playClickSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (error) {
            // Silently fail if audio context is not available
        }
    }
    
    triggerHapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }
    
    calculateCPS(clicks, timeElapsed) {
        return timeElapsed > 0 ? Number((clicks / timeElapsed).toFixed(2)) : 0;
    }
    
    formatTime(seconds) {
        return seconds.toFixed(1);
    }
    
    updateDisplay() {
        this.currentClicksEl.textContent = this.gameState.clicks;
        this.currentCpsEl.textContent = this.gameState.cps;
    }
    
    updateTimer() {
        const timeText = this.formatTime(this.gameState.timeLeft) + 's';
        this.timerEl.textContent = timeText;
        
        // Add low time warning
        if (this.gameState.timeLeft <= 3 && this.gameState.timeLeft > 0) {
            this.timerEl.classList.add('low-time');
        } else {
            this.timerEl.classList.remove('low-time');
        }
    }
    
    updateProgress() {
        const progress = ((this.gameState.selectedDuration - this.gameState.timeLeft) / this.gameState.selectedDuration) * 100;
        this.progressFill.style.width = progress + '%';
        this.progressText.textContent = Math.round(progress) + '% complété';
        
        // Add low time warning to progress bar
        if (this.gameState.timeLeft <= 3 && this.gameState.timeLeft > 0) {
            this.progressFill.classList.add('low-time');
        } else {
            this.progressFill.classList.remove('low-time');
        }
    }
    
    updateControlButton() {
        if (this.gameState.isCompleted) {
            this.controlBtn.style.display = 'none';
        } else if (this.gameState.isActive) {
            this.controlBtn.textContent = 'Arrêter';
            this.controlBtn.className = 'control-btn secondary';
            this.controlBtn.style.display = 'inline-block';
        } else {
            this.controlBtn.textContent = this.gameState.clicks > 0 ? 'Recommencer' : 'Commencer le Défi';
            this.controlBtn.className = 'control-btn';
            this.controlBtn.style.display = 'inline-block';
        }
    }
    
    updateModeButtons() {
        this.modeButtons.forEach(btn => {
            if (this.gameState.isActive) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        });
    }
    
    showTimer() {
        this.timerSection.style.display = 'block';
        this.updateTimer();
        this.updateProgress();
    }
    
    hideTimer() {
        this.timerSection.style.display = 'none';
    }
    
    showResults(isNewRecord) {
        this.resultsSection.style.display = 'block';
        
        // Update results data
        this.finalClicks.textContent = this.gameState.clicks;
        this.finalCps.textContent = this.gameState.cps;
        
        // Update mode name
        const modeNames = {
            'speed-10': '10 Secondes',
            'endurance-30': '30 Secondes',
            'marathon-60': '60 Secondes'
        };
        this.resultsMode.textContent = modeNames[this.gameState.selectedMode];
        
        // Handle new record
        if (isNewRecord) {
            this.resultsTitle.textContent = '🎉 Nouveau Record!';
            this.trophy.textContent = '🏆';
            this.trophy.classList.add('new-record');
            this.newRecord.style.display = 'block';
            this.personalBest.style.display = 'none';
        } else {
            this.resultsTitle.textContent = 'Partie Terminée!';
            this.trophy.textContent = '🏆';
            this.trophy.classList.remove('new-record');
            this.newRecord.style.display = 'none';
            
            // Show previous best if exists
            const best = this.getPersonalBest(this.gameState.selectedMode);
            if (best) {
                this.personalBest.style.display = 'block';
                this.pbClicks.textContent = best.clicks;
                this.pbCps.textContent = best.cps;
            } else {
                this.personalBest.style.display = 'none';
            }
        }
    }
    
    hideResults() {
        this.resultsSection.style.display = 'none';
    }
    
    resetGame() {
        this.gameState = {
            ...this.gameState,
            clicks: 0,
            timeLeft: this.gameState.selectedDuration,
            cps: 0,
            isActive: false,
            isCompleted: false
        };
        
        this.clearGameInterval();
        this.clearClickEffects();
        
        // Remove active states
        this.gameArea.classList.remove('active');
        this.pulseRing.classList.remove('active');
        
        // Update UI
        this.updateDisplay();
        this.hideTimer();
        this.hideResults();
        this.updateControlButton();
        this.updateModeButtons();
    }
    
    clearGameInterval() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }
    
    // Personal Best Management
    savePersonalBest(best) {
        const existing = this.getPersonalBests();
        const updated = existing.filter(pb => pb.mode !== best.mode);
        updated.push(best);
        localStorage.setItem('clickfast-bests', JSON.stringify(updated));
        this.loadPersonalBests();
    }
    
    getPersonalBests() {
        const stored = localStorage.getItem('clickfast-bests');
        return stored ? JSON.parse(stored) : [];
    }
    
    getPersonalBest(mode) {
        const bests = this.getPersonalBests();
        return bests.find(pb => pb.mode === mode) || null;
    }
    
    checkNewRecord() {
        const currentBest = this.getPersonalBest(this.gameState.selectedMode);
        const isNewBest = !currentBest || this.gameState.clicks > currentBest.clicks;
        
        if (isNewBest) {
            const newBest = {
                mode: this.gameState.selectedMode,
                clicks: this.gameState.clicks,
                cps: this.gameState.cps,
                date: new Date().toISOString()
            };
            this.savePersonalBest(newBest);
            return true;
        }
        
        return false;
    }
    
    loadPersonalBests() {
        const best = this.getPersonalBest(this.gameState.selectedMode);
        if (best) {
            this.bestClicksEl.textContent = best.clicks;
            this.bestCpsEl.textContent = best.cps;
        } else {
            this.bestClicksEl.textContent = '---';
            this.bestCpsEl.textContent = '---';
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ClickFastGame();
});