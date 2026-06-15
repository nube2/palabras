const state = {
  count: 0,
  level: null,
  currentSentence: null,
  previousSentence: null,
};

const elements = {
  hero: document.querySelector(".hero"),
  lesson: document.querySelector("#lesson"),
  levelOptions: document.querySelectorAll(".level-option"),
  quantityOptions: document.querySelectorAll(".quantity-option"),
  wordGrid: document.querySelector("#word-grid"),
  helpButton: document.querySelector("#help-button"),
  sentenceReveal: document.querySelector("#sentence-reveal"),
  sentenceLevel: document.querySelector("#sentence-level"),
  sentenceText: document.querySelector("#sentence-text"),
  newWords: document.querySelector("#new-words"),
  changeOptions: document.querySelector("#change-options"),
};

function randomIndex(length) {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] % length;
  }

  return Math.floor(Math.random() * length);
}

function chooseSentence(level, count) {
  const eligibleSentences = SPANISH_SENTENCES[level]
    .filter((text) => extractUniqueWords(text).length >= count)
    .map((text) => ({ level, text }));
  let sentence;

  do {
    sentence = eligibleSentences[randomIndex(eligibleSentences.length)];
  } while (
    eligibleSentences.length > 1 &&
    sentence.text === state.previousSentence?.text
  );

  state.previousSentence = sentence;
  return sentence;
}

function extractUniqueWords(sentence) {
  const words = sentence.match(/\p{L}+(?:['’]\p{L}+)*/gu) ?? [];
  const uniqueWords = new Map();

  words.forEach((word) => {
    const key = word.toLocaleLowerCase("es");
    const letterCount = key.match(/\p{L}/gu)?.length ?? 0;

    if (
      letterCount >= 4 &&
      !uniqueWords.has(key)
    ) {
      uniqueWords.set(key, word);
    }
  });

  return [...uniqueWords.values()];
}

function chooseWords(sentence, count) {
  const availableWords = extractUniqueWords(sentence);
  const selected = [];

  while (selected.length < count) {
    const index = randomIndex(availableWords.length);
    selected.push(availableWords.splice(index, 1)[0]);
  }

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

  const wordText = document.createElement("strong");
  wordText.lang = "es";
  wordText.textContent = word.toLocaleLowerCase("es");

  meta.append(label);
  card.append(meta, wordText);
  return card;
}

function renderWords() {
  const fragment = document.createDocumentFragment();
  const sentence = chooseSentence(state.level, state.count);

  chooseWords(sentence.text, state.count).forEach((word, index) => {
    fragment.append(createCard(word, index));
  });

  state.currentSentence = sentence;
  elements.wordGrid.replaceChildren(fragment);
  elements.sentenceReveal.hidden = true;
  elements.helpButton.hidden = false;
  elements.helpButton.setAttribute("aria-expanded", "false");
}

function revealSentence() {
  elements.sentenceLevel.textContent = `Nivel ${state.currentSentence.level}`;
  elements.sentenceText.textContent = state.currentSentence.text;
  elements.sentenceReveal.hidden = false;
  elements.helpButton.hidden = true;
  elements.helpButton.setAttribute("aria-expanded", "true");
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
  elements.levelOptions[0].focus();
}

elements.levelOptions.forEach((button) => {
  button.addEventListener("click", () => {
    state.level = button.dataset.level;

    elements.levelOptions.forEach((option) => {
      option.setAttribute(
        "aria-pressed",
        String(option.dataset.level === state.level),
      );
    });

    elements.quantityOptions.forEach((option) => {
      option.disabled = false;
    });

    elements.quantityOptions[0].focus();
  });
});

elements.quantityOptions.forEach((button) => {
  button.addEventListener("click", () => {
    startLesson(Number(button.dataset.count));
  });
});

elements.helpButton.addEventListener("click", revealSentence);
elements.newWords.addEventListener("click", renderWords);
elements.changeOptions.addEventListener("click", showPicker);
