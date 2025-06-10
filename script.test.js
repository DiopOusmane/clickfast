/**
 * @jest-environment jsdom
 */
const { ClickFastGame } = require('./script.js');

describe('ClickFastGame', () => {
  let game;

  beforeEach(() => {
    // Simule une structure DOM minimale
    document.body.innerHTML = `
      <div id="current-clicks"></div>
      <div id="current-cps"></div>
      <div id="best-clicks"></div>
      <div id="best-cps"></div>
      <div id="timer-section" style="display:none;"></div>
      <div id="timer"></div>
      <div id="progress-fill"></div>
      <div id="progress-text"></div>
      <div id="game-section"></div>
      <div id="game-area"></div>
      <div id="pulse-ring"></div>
      <div id="results"></div>
      <div id="trophy"></div>
      <div id="results-title"></div>
      <div id="results-mode"></div>
      <div id="final-clicks"></div>
      <div id="final-cps"></div>
      <div id="personal-best"></div>
      <div id="new-record"></div>
      <div id="pb-clicks"></div>
      <div id="pb-cps"></div>
      <button id="play-again-btn"></button>
      <button id="control-btn"></button>
      <button class="mode-btn" data-mode="speed-10" data-duration="10"></button>
    `;

    game = new ClickFastGame();
  });

  test('initialises with default game state', () => {
    expect(game.gameState.clicks).toBe(0);
    expect(game.gameState.timeLeft).toBe(10);
    expect(game.gameState.isActive).toBe(false);
  });

  test('starts the game correctly', () => {
    game.startGame();
    expect(game.gameState.isActive).toBe(true);
    expect(game.gameInterval).not.toBe(null);
  });

  test('handles clicks and updates clicks count', () => {
    game.startGame();

    // Simuler un clic
    const fakeEvent = {
      clientX: 100,
      clientY: 100,
      preventDefault: () => {},
    };
    game.handleClick(fakeEvent);

    expect(game.gameState.clicks).toBe(1);
    expect(game.currentClicksEl.textContent).toBe("1");
  });

  test('calculates correct CPS', () => {
    const cps = game.calculateCPS(20, 5);
    expect(cps).toBe(4.0);
  });

  test('saves a new personal best correctly', () => {
    game.gameState.selectedMode = 'speed-10';
    game.savePersonalBest({
      mode: 'speed-10',
      clicks: 42,
      cps: 4.2,
      date: new Date().toISOString()
    });

    const best = game.getPersonalBest('speed-10');
    expect(best.clicks).toBe(42);
  });
});