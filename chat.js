/* ANSWERS object keyed 1–6 */
const ANSWERS = {
  "1": "Investing means putting your money to work so it grows over time. Instead of letting it sit in a bank earning 3%, you invest it in businesses or funds that can return 10–12% annually.",
  "2": "An index fund is a basket that holds shares of the top companies in a country or the world. When you buy one, you own a tiny piece of all of them. One investment. Maximum diversification.",
  "3": "Start with three steps: 1) Open a brokerage account. 2) Choose a low-cost index fund. 3) Set up a monthly automatic investment. Even $10 per month builds the habit.",
  "4": "Compounding means your returns earn their own returns. $100 growing at 10% becomes $110 in year 1, then $121 in year 2 — not because you added money, but because the gains compound. Over 30 years this is life-changing.",
  "5": "You need $0 to start learning. To invest, most platforms allow you to start with as little as $1–$10. The amount matters less than the consistency.",
  "6": "A SIP (Systematic Investment Plan) is an automatic monthly investment. You set it once — $10, $50, $100 — and it invests automatically every month. Consistency is the entire strategy."
};

/* appendMessage(text, isUser) function — creates bubble, appends to chat-display, scrolls to bottom, animates */
function appendMessage(text, isUser) {
  const display = document.getElementById("chat-display");

  if (!display) return;

  const row = document.createElement("div");
  row.className = `chat-message ${isUser ? "user" : "bot"}`;

  if (!isUser) {
    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = "D";
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.textContent = text;
  row.appendChild(bubble);
  display.appendChild(row);

  requestAnimationFrame(() => {
    row.classList.add("show");
    display.scrollTo({
      top: display.scrollHeight,
      behavior: "smooth"
    });
  });
}

/* Chat button click handlers — disable briefly, append user message, setTimeout 600ms append bot message */
function setupChatButtons() {
  const buttons = document.querySelectorAll(".chat-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const questionId = button.dataset.q;
      const answer = ANSWERS[questionId];

      if (!answer) return;

      button.style.opacity = "0.5";
      button.style.pointerEvents = "none";
      appendMessage(button.textContent.trim(), true);

      window.setTimeout(() => {
        appendMessage(answer, false);
      }, 600);

      window.setTimeout(() => {
        button.style.opacity = "";
        button.style.pointerEvents = "";
      }, 800);
    });
  });
}

document.addEventListener("DOMContentLoaded", setupChatButtons);
