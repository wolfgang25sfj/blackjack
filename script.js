//playerhand dealerhand og gameactive start screen med values og verdien av et kortstokk

const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let deck = [];
let playerHand = [];
let dealerHand = [];
let gameActive = false;

const messageEl = document.getElementById('message');
const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const newGameBtn = document.getElementById('new-game');
const hitBtn = document.getElementById('hit');
const standBtn = document.getElementById('stand');
// deck creation
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    deck = deck.sort(() => Math.random() - 0.5);
}
//value of face cards
function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return 11;
    return parseInt(card.value);
}
// value of hand
function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    for (let card of hand) {
        if (card.value === 'A') aces++;
        score += getCardValue(card);
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}
// display function
function displayCard(card, container, hidden = false) {
    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    cardEl.textContent = hidden ? '🂠' : `${card.value}${card.suit}`;
    container.appendChild(cardEl);
}
// update display if pull
function updateDisplay() {
    dealerCardsEl.innerHTML = '';
    playerCardsEl.innerHTML = '';
    dealerHand.forEach((card, index) => {
        displayCard(card, dealerCardsEl, index === 0 && gameActive);
    });
    playerHand.forEach(card => displayCard(card, playerCardsEl));
    dealerScoreEl.textContent = gameActive ? '?' : calculateScore(dealerHand);
    playerScoreEl.textContent = calculateScore(playerHand);
}
// end of game with update for winner
function endGame(message) {
    gameActive = false;
    messageEl.textContent = message;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    newGameBtn.disabled = false;
    updateDisplay();
}
// startfunction
function startGame() {
    createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    gameActive = true;
    hitBtn.disabled = false;
    standBtn.disabled = false;
    newGameBtn.disabled = true;
    messageEl.textContent = 'Hit or Stand?';
    updateDisplay();
    if (calculateScore(playerHand) === 21) {
        endGame('Blackjack! You win!');
    }
}
// hit function
function hit() {
    playerHand.push(deck.pop());
    updateDisplay();
    const playerScore = calculateScore(playerHand);
    if (playerScore > 21) {
        endGame('Bust! You lose.');
    }
}
// stand function and display functions for win loss and push (tie)
function stand() {
    gameActive = false;
    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }
    updateDisplay();
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);
    if (dealerScore > 21) {
        endGame('Dealer busts! You win!');
    } else if (dealerScore > playerScore) {
        endGame('Dealer wins.');
    } else if (playerScore > dealerScore) {
        endGame('You win!');
    } else {
        endGame('Push (tie).');
    }
}
// button values with event
newGameBtn.addEventListener('click', startGame);
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);