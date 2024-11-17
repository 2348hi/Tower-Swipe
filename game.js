// Add these variables at the top of game.js
let canvas, ctx;
let canvasWidth = 500;
let canvasHeight = 700;
let blockHeight = 40;
let currentBlock;
let gameSpeed = 2; // Speed of block falling
let placedBlocks = []; // Array to store placed blocks
let score = 0;
let isDragging = false;
let touchStartX = 0;
let isGameOver = false;
let startingPlatform;
let baseSpeed = 2;      // Starting speed
let maxSpeed = 8;       // Maximum speed
let speedIncrease = 0.3; // Slightly increased for more noticeable speed changes

document.addEventListener('DOMContentLoaded', () => {
    // Get button elements
    const startButton = document.getElementById('startButton');
    const startScreen = document.getElementById('startScreen');
    const gameCanvas = document.getElementById('gameCanvas');

    // Debug logging
    console.log('Canvas element:', gameCanvas);

    // Set up canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set explicit dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    console.log('Canvas dimensions:', canvas.width, canvas.height);
    console.log('Canvas context:', ctx);

    // Add click event listener to start button
    startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        // Hide start screen
        startScreen.classList.add('hidden');
        // Show game canvas
        gameCanvas.classList.remove('hidden');
        // Start the game
        startGame();
    });

    // Add keyboard controls
    document.addEventListener('keydown', handleKeyPress);

    // Add touch and mouse event listeners to the canvas
    canvas.addEventListener('mousedown', startDragging);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('mouseleave', stopDragging);

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDragging);
});

function handleKeyPress(event) {
    if (!currentBlock || currentBlock.placed) return;

    switch (event.key) {
        case 'ArrowLeft':
            if (currentBlock.x > 0) {
                currentBlock.x -= 10;
            }
            break;
        case 'ArrowRight':
            if (currentBlock.x + currentBlock.width < canvasWidth) {
                currentBlock.x += 10;
            }
            break;
        case 'ArrowDown':
            gameSpeed = maxSpeed + 2; // Faster than max normal speed
            break;
    }
}

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowDown') {
        // Reset to current level-appropriate speed instead of base speed
        gameSpeed = Math.min(maxSpeed, baseSpeed + (score / 50) * speedIncrease);
    }
});

function startGame() {
    console.log('Starting game');
    // Create starting platform
    startingPlatform = {
        x: canvasWidth / 2 - 50, // Center the platform
        y: canvasHeight - 40,    // Near bottom
        width: 100,
        height: blockHeight
    };
    
    // Initialize game state
    createNewBlock();
    // Start game loop
    requestAnimationFrame(gameLoop);
}

function createNewBlock() {
    // Random x position, but ensure block stays within canvas bounds
    const minX = 0;
    const maxX = canvasWidth - 100; // 100 is block width
    const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    
    // Calculate new game speed based on score
    // Every 20 points (2 blocks) increases speed
    gameSpeed = Math.min(maxSpeed, baseSpeed + (score / 20) * speedIncrease);
    
    currentBlock = {
        x: randomX,
        y: 0,
        width: 100,
        height: blockHeight,
        placed: false
    };
}

function gameLoop() {
    if (isGameOver) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw starting platform
    ctx.fillStyle = '#00ff9d';
    ctx.fillRect(startingPlatform.x, startingPlatform.y, 
                startingPlatform.width, startingPlatform.height);
    
    // Update block position
    if (currentBlock && !currentBlock.placed) {
        currentBlock.y += gameSpeed;
        
        // Check for collision with bottom or other blocks
        if (checkCollision()) {
            currentBlock.placed = true;
            placedBlocks.push(currentBlock);
            score += 10;
            document.getElementById('scoreValue').textContent = score;
            
            // Check for game over
            if (checkGameOver()) {
                gameOver();
                return;
            }
            
            createNewBlock();
        }
    }
    
    // Draw placed blocks
    placedBlocks.forEach(block => {
        ctx.fillStyle = '#00ff9d';
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });
    
    // Draw current block
    if (currentBlock) {
        ctx.fillStyle = '#00ff9d';
        ctx.fillRect(currentBlock.x, currentBlock.y, 
                    currentBlock.width, currentBlock.height);
    }
    
    requestAnimationFrame(gameLoop);
}

function checkCollision() {
    // Check if it's the first block and hitting bottom
    if (placedBlocks.length === 0 && 
        currentBlock.y + currentBlock.height >= startingPlatform.y) {
        
        // Check if block aligns with starting platform
        const overlap = Math.min(
            currentBlock.x + currentBlock.width - startingPlatform.x,
            startingPlatform.x + startingPlatform.width - currentBlock.x
        );
        
        if (overlap < 20) { // Not enough overlap
            gameOver();
            return false;
        }
        return true;
    }
    
    // If it's not the first block and touches the bottom, game over
    if (placedBlocks.length > 0 && currentBlock.y + currentBlock.height >= canvasHeight) {
        gameOver();
        return false;
    }
    
    // Check collision with placed blocks
    return placedBlocks.some(block => {
        return (currentBlock.y + currentBlock.height >= block.y &&
                currentBlock.x < block.x + block.width &&
                currentBlock.x + currentBlock.width > block.x);
    });
}

function checkGameOver() {
    // Check if any placed block is too high
    return placedBlocks.some(block => block.y <= 50); // Game over if blocks reach near top
}

function gameOver() {
    isGameOver = true;
    
    // Show death screen
    const deathScreen = document.getElementById('deathScreen');
    const finalScoreElement = document.getElementById('finalScore');
    finalScoreElement.textContent = score;
    deathScreen.classList.remove('hidden');
    
    // Add event listener to restart button if not already added
    const restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', resetGame);
}

function resetGame() {
    // Reset all game variables
    isGameOver = false;
    score = 0;
    placedBlocks = [];
    gameSpeed = baseSpeed; // Reset speed to starting speed
    document.getElementById('scoreValue').textContent = '0';
    
    // Hide death screen
    document.getElementById('deathScreen').classList.add('hidden');
    
    // Start fresh with new starting platform
    startGame();
}

function startDragging(e) {
    isDragging = true;
    touchStartX = e.clientX - currentBlock.x;
}

function drag(e) {
    if (isDragging && currentBlock && !currentBlock.placed) {
        let newX = e.clientX - touchStartX;
        
        // Keep block within canvas bounds
        newX = Math.max(0, Math.min(newX, canvasWidth - currentBlock.width));
        currentBlock.x = newX;
    }
}

function stopDragging() {
    isDragging = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    if (currentBlock && !currentBlock.placed) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        touchStartX = touch.clientX - rect.left - currentBlock.x;
        isDragging = true;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (isDragging && currentBlock && !currentBlock.placed) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        let newX = touch.clientX - rect.left - touchStartX;
        
        // Keep block within canvas bounds
        newX = Math.max(0, Math.min(newX, canvasWidth - currentBlock.width));
        currentBlock.x = newX;
    }
} 