const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let deck = [];
let playerHand = [];
let dealerHand = [];
let gameActive = false;
let playerWallet = 1000;
let houseWallet = 10000;
let currentBet = 0;

const messageEl = document.getElementById('message');
const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const playerWalletEl = document.getElementById('player-wallet');
const houseWalletEl = document.getElementById('house-wallet');
const betInputEl = document.getElementById('bet-input');
const chipsEl = document.getElementById('chips-container');
const newGameBtn = document.getElementById('new-game');
const hitBtn = document.getElementById('hit');
const standBtn = document.getElementById('stand');
const doubleBtn = document.getElementById('double');

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

// value of face cards
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

// display chips
function displayChips(amount) {
    chipsEl.innerHTML = '';
    if (amount > 0) {
        const chip = document.createElement('img');
        chip.classList.add('chip');
        chip.src = 'chip.png'; // Replace with actual path to poker chip image
        chip.alt = 'Poker Chip';
        chipsEl.appendChild(chip);

        const betLabel = document.createElement('div');
        betLabel.classList.add('bet-label');
        betLabel.textContent = `$${amount}`;
        chipsEl.appendChild(betLabel);
    }
}

// update wallets display
function updateWallets() {
    playerWalletEl.textContent = playerWallet;
    houseWalletEl.textContent = houseWallet;
}

// end of game with update for winner
function endGame(message, payoutMultiplier) {
    gameActive = false;
    messageEl.textContent = message;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    doubleBtn.disabled = true;
    newGameBtn.disabled = false;

    // Handle payout
    playerWallet += payoutMultiplier * currentBet;
    if (payoutMultiplier === 0) {
        // Lose: house gains the bet
        houseWallet += currentBet;
    } else if (payoutMultiplier > 1) {
        // Win: house loses the profit
        houseWallet -= (payoutMultiplier - 1) * currentBet;
    }
    // Push: no change to house

    updateWallets();
    updateDisplay();

    // Check bankruptcy
    if (playerWallet <= 0) {
        messageEl.textContent += ' You are bankrupt! Game Over.';
        newGameBtn.disabled = true;
    } else if (houseWallet <= 0) {
        messageEl.textContent = 'You bankrupted the house! Congratulations!';
        newGameBtn.disabled = true;
    }
}

// startfunction
function startGame() {
    const bet = parseInt(betInputEl.value);
    if (isNaN(bet) || bet < 5 || bet > playerWallet) {
        alert('Invalid bet! Must be at least $5 and not exceed your wallet.');
        return;
    }
    currentBet = bet;
    playerWallet -= bet;
    displayChips(currentBet);
    updateWallets();

    createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    gameActive = true;
    hitBtn.disabled = false;
    standBtn.disabled = false;
    doubleBtn.disabled = false;
    newGameBtn.disabled = true;
    messageEl.textContent = 'Hit or Stand?';
    updateDisplay();

    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    // Check for Blackjack
    if (playerScore === 21 && playerHand.length === 2) {
        if (dealerScore === 21 && dealerHand.length === 2) {
            endGame('Both Blackjack! Push (tie).', 1);
        } else {
            endGame('Blackjack! You win!', 2.5);
        }
        return;
    }
    if (dealerScore === 21 && dealerHand.length === 2) {
        endGame('Dealer Blackjack. You lose.', 0);
        return;
    }
}

// hit function
function hit() {
    if (!gameActive) return;
    playerHand.push(deck.pop());
    updateDisplay();
    doubleBtn.disabled = true; // Can't double after hit
    const playerScore = calculateScore(playerHand);
    if (playerScore > 21) {
        endGame('Bust! You lose.', 0);
    }
}

// double down
function doubleDown() {
    if (!gameActive || playerWallet < currentBet || playerHand.length !== 2) return;
    playerWallet -= currentBet;
    currentBet *= 2;
    displayChips(currentBet);
    updateWallets();
    hit();
    if (gameActive) {
        stand();
    }
}

// stand function and display functions for win loss and push (tie)
function stand() {
    if (!gameActive) return;
    gameActive = false;
    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }
    updateDisplay();
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);
    if (dealerScore > 21) {
        endGame('Dealer busts! You win!', 2);
    } else if (dealerScore > playerScore) {
        endGame('Dealer wins.', 0);
    } else if (playerScore > dealerScore) {
        endGame('You win!', 2);
    } else {
        endGame('Push (tie).', 1);
    }
}

// button events
newGameBtn.addEventListener('click', startGame);
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);
doubleBtn.addEventListener('click', doubleDown);

// Initialize wallets
updateWallets();