const symbols = ["f", "a", "m", "c", "s", "🍒", "💎", "🍊", "⭐"];
const finalWord = ["f", "a", "m", "c", "s"];
function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}
function isEmoji(symbol) {
    return ["🍒", "💎", "🍊", "⭐"].includes(symbol);
}
async function startLoading() {
    const reels = [
        document.getElementById("reel1"),
        document.getElementById("reel2"),
        document.getElementById("reel3"),
        document.getElementById("reel4"),
        document.getElementById("reel5"),
    ];
    const betText = document.getElementById("bet-text");
    for (let i = 0; i < reels.length; i++) {
        reels[i].classList.add("spinning");
        reels[i].textContent = getRandomSymbol();
        if (isEmoji(reels[i].textContent)) {
            reels[i].classList.add("emoji");
            reels[i].classList.remove("letter");
        } else {
            reels[i].classList.add("letter");
            reels[i].classList.remove("emoji");
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
    }
    const spinDuration = 100;
    const interval = 30;
    const steps = spinDuration / interval;
    for (let i = 0; i < steps; i++) {
        reels.forEach((reel) => {
            if (reel.classList.contains("spinning")) {
                const newSymbol = getRandomSymbol();
                reel.textContent = newSymbol;
                if (isEmoji(newSymbol)) {
                    reel.classList.add("emoji");
                    reel.classList.remove("letter");
                } else {
                    reel.classList.add("letter");
                    reel.classList.remove("emoji");
                }
            }
        });
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
    for (let i = 0; i < reels.length; i++) {
        reels[i].classList.remove("spinning", "emoji", "letter");
        reels[i].classList.add("settling");
        reels[i].textContent = finalWord[i];
        await new Promise((resolve) => setTimeout(resolve, 400));
        reels[i].classList.remove("settling");
    }
    betText.classList.add("slide-in");
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Задержка перед редиректом
    window.location.href = "/FAMCSbet/index.html"; // Автоматический переход к игре
}
window.onload = startLoading;
