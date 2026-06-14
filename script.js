const state = {
  count: 0,
  previousRanks: new Set(),
};

const elements = {
  hero: document.querySelector(".hero"),
  lesson: document.querySelector("#lesson"),
  quantityOptions: document.querySelectorAll(".quantity-option"),
  wordGrid: document.querySelector("#word-grid"),
  newWords: document.querySelector("#new-words"),
  changeCount: document.querySelector("#change-count"),
};

function randomIndex(length) {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] % length;
  }

  return Math.floor(Math.random() * length);
}

function chooseWords(count) {
  const selected = [];
  const usedRanks = new Set(state.previousRanks);

  while (selected.length < count) {
    const word = SPANISH_WORDS[randomIndex(SPANISH_WORDS.length)];

    if (!usedRanks.has(word.rank)) {
      selected.push(word);
      usedRanks.add(word.rank);
    }
  }

  state.previousRanks = new Set(selected.map((word) => word.rank));
  return selected;
}

function createCard(word, index) {
  const card = document.createElement("article");
  card.className = "word-card";
  card.style.animationDelay = `${index * 110}ms`;

  const meta = document.createElement("div");
  meta.className = "card-meta";

  const label = document.createElement("span");
  label.textContent = `Palabra ${index + 1}`;

  const rank = document.createElement("span");
  rank.textContent = `#${word.rank}`;
  rank.title = "Posición por frecuencia de uso";

  const wordText = document.createElement("strong");
  wordText.lang = "es";
  wordText.textContent = word.word;

  meta.append(label, rank);
  card.append(meta, wordText);
  return card;
}

function renderWords() {
  const fragment = document.createDocumentFragment();

  chooseWords(state.count).forEach((word, index) => {
    fragment.append(createCard(word, index));
  });

  elements.wordGrid.replaceChildren(fragment);
}

function startLesson(count) {
  state.count = count;
  elements.hero.hidden = true;
  elements.lesson.hidden = false;
  renderWords();
  elements.lesson.focus({ preventScroll: true });
}

function showPicker() {
  elements.lesson.hidden = true;
  elements.hero.hidden = false;
  elements.quantityOptions[0].focus();
}

elements.quantityOptions.forEach((button) => {
  button.addEventListener("click", () => {
    startLesson(Number(button.dataset.count));
  });
});

elements.newWords.addEventListener("click", renderWords);
elements.changeCount.addEventListener("click", showPicker);
