// script.js (Adaptado para Warijó - Textos UI cambiados)

document.addEventListener('DOMContentLoaded', () => {

    // --- DECLARACIÓN DE VARIABLES PARA DATOS ---
    let lexiconData = [];
    let phrasesData = [];
    let currentCategoryFilter = 'all';

    // --- MAPEO DE ICONOS PARA CATEGORÍAS ---
    const categoryIcons = {
        'Naturaleza': '🌳',
        'Comida y bebida': '🍎',
        'Verbos': '🏃‍♂️',
        'Animales': '🐾',
        'Partes del cuerpo': '🖐️',
        'Objetos': '🔨',
        'Personas': '🧍‍♀️',
        'Vestimenta': '🧦',
        'all': ''
    };
    const defaultCategoryIcon = '🏷️';

    // --- ELEMENTOS DEL DOM ---
    const loadingMessageEl = document.getElementById('loading-message');
    const errorMessageEl = document.getElementById('error-message');
    const mainContentEl = document.getElementById('main-content');
    const navButtons = document.querySelectorAll('nav button');
    const contentSections = document.querySelectorAll('.content-section');

    // Lexicon Elements
    const lexiconGrid = document.getElementById('lexicon-grid');
    const lexiconSearchInput = document.getElementById('lexicon-search'); // Placeholder se cambiará en JS
    const categoryFiltersContainer = document.getElementById('category-filters');

    // Phrases Elements
    const phrasesList = document.getElementById('phrases-list');

    // Memorama Elements
    const memoramaSetup = document.getElementById('memorama-setup');
    const memoramaGameArea = document.getElementById('memorama-game-area');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const memoramaGrid = document.getElementById('memorama-grid');
    const memoramaAttemptsEl = document.getElementById('memorama-attempts');
    const resetMemoramaBtn = document.getElementById('reset-memorama');
    const memoramaWinMessage = document.getElementById('memorama-win-message');
    const memoramaDataErrorEl = document.getElementById('memorama-data-error');

    // Quiz Elements
    const quizContainer = document.getElementById('quiz-container');
    const quizSetup = document.getElementById('quiz-setup');
    const quizLengthSelect = document.getElementById('quiz-length');
    const quizCategorySelect = document.getElementById('quiz-category');
    const startQuizBtn = document.getElementById('start-quiz');
    const quizQuestionArea = document.getElementById('quiz-question-area');
    const quizImageContainer = document.getElementById('quiz-image-container');
    const quizQuestionEl = document.getElementById('quiz-question');
    const quizOptionsEl = document.getElementById('quiz-options');
    const quizTextInputArea = document.getElementById('quiz-text-input-area');
    const quizTextAnswerInput = document.getElementById('quiz-text-answer'); // Placeholder se cambiará en JS
    const submitTextAnswerBtn = document.getElementById('submit-text-answer');
    const quizFeedbackEl = document.getElementById('quiz-feedback');
    const nextQuestionBtn = document.getElementById('next-question');
    const quizResultsEl = document.getElementById('quiz-results');
    const quizScoreEl = document.getElementById('quiz-score');
    const quizTotalEl = document.getElementById('quiz-total');
    const restartQuizBtn = document.getElementById('restart-quiz');
    const retryMissedQuizBtn = document.getElementById('retry-missed-quiz');
    const quizDataErrorEl = document.getElementById('quiz-data-error');

    // Flashcards Elements
    const flashcardsContainer = document.getElementById('flashcards-container');
    const flashcardsSetupControls = document.getElementById('flashcards-setup-controls');
    const flashcardCategorySelect = document.getElementById('flashcard-category');
    const flashcardsDataErrorEl = document.getElementById('flashcards-data-error');
    const flashcardsLoadingEl = document.getElementById('flashcards-loading');
    const flashcardsErrorEl = document.getElementById('flashcards-error');
    const flashcardAreaEl = document.getElementById('flashcard-area');
    const flashcardCounterEl = document.getElementById('flashcard-counter');
    const flashcardEl = document.getElementById('flashcard');
    const flashcardFrontEl = document.getElementById('flashcard-front');
    const flashcardBackEl = document.getElementById('flashcard-back');
    const prevFlashcardBtn = document.getElementById('prev-flashcard-btn');
    const flipFlashcardBtn = document.getElementById('flip-flashcard-btn');
    const nextFlashcardBtn = document.getElementById('next-flashcard-btn');
    const shuffleFlashcardsBtn = document.getElementById('shuffle-flashcards-btn');

    // --- VARIABLES GLOBALES JUEGOS ---
    let memoramaActive = false;
    let mCards = [];
    let mFlippedElements = [];
    let mMatchedPairsCount = 0;
    let mTotalPairs = 0;
    let mAttempts = 0;
    let mLockBoard = false;
    let allQuizQuestions = [];
    let currentQuizSet = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizActive = false;
    let missedQuestions = [];
    let flashcardData = [];
    let currentFlashcardIndex = 0;
    let isFlashcardFlipped = false;

    // --- Clave para la palabra Warijó en data.json ---
    // !!! IMPORTANTE: Cambia esto si usas una clave diferente a "warijo" en tu data.json
    // Si en tu JSON usas "raramuri" como clave para las palabras warijó, déjalo como está.
    // Si usas "warijo" como clave, cambia "raramuri" por "warijo" aquí abajo.
    const languageKey = "raramuri"; // CAMBIA ESTO A "warijo" o la clave que uses en data.json

    // --- Nombre del Idioma para UI ---
    // Usado en placeholders y preguntas. Cambia esto si quieres que aparezca diferente.
    const languageNameForUI = "Warijó"; // Puedes cambiarlo a "Guarijío", etc.


    // --- FUNCIÓN PARA CARGAR DATOS ---
    async function loadData() {
        try {
            loadingMessageEl.style.display = 'block';
            errorMessageEl.style.display = 'none';
            mainContentEl.style.display = 'none';

            const response = await fetch('data.json', { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`Error HTTP al cargar data.json: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();

            if (!data || typeof data !== 'object' || !Array.isArray(data.lexicon) || !Array.isArray(data.phrases)) {
                throw new Error("El archivo data.json no tiene el formato esperado (debe contener arrays 'lexicon' y 'phrases').");
            }

             // Validación adicional: Verificar si el lexicon tiene la clave de idioma esperada en al menos un item
             if (data.lexicon.length > 0 && data.lexicon.every(item => typeof item[languageKey] === 'undefined')) {
                 console.warn(`ADVERTENCIA: La clave de idioma configurada "${languageKey}" no se encontró en ningún item del lexicon en data.json. Verifica la variable 'languageKey' en script.js o las claves en tu data.json.`);
                 // Podrías lanzar un error si es crítico:
                 // throw new Error(`La clave de idioma "${languageKey}" no se encuentra en data.json/lexicon.`);
             }
              // Validación adicional: Verificar si las frases tienen la clave de idioma esperada en al menos un item
             if (data.phrases.length > 0 && data.phrases.every(item => typeof item[languageKey] === 'undefined')) {
                 console.warn(`ADVERTENCIA: La clave de idioma configurada "${languageKey}" no se encontró en ninguna frase en data.json. Verifica la variable 'languageKey' en script.js o las claves en tu data.json.`);
             }

            lexiconData = data.lexicon;
            phrasesData = data.phrases;
            console.log("Datos cargados exitosamente:", { lexicon: lexiconData.length, phrases: phrasesData.length });

            loadingMessageEl.style.display = 'none';
            mainContentEl.style.display = 'block';
            errorMessageEl.style.display = 'none';

            initializeApplication();

        } catch (error) {
            console.error("Error al cargar/procesar datos:", error);
            loadingMessageEl.style.display = 'none';
            errorMessageEl.textContent = `Error cargando datos: ${error.message}. Verifica data.json y la consola (F12) para más detalles.`;
            errorMessageEl.style.display = 'block';
            mainContentEl.style.display = 'none';
        }
    }

    // --- FUNCIONES GENERALES DE LA APLICACIÓN ---
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function normalizeAnswer(text) {
         return text ? String(text).toLowerCase().trim() : '';
    }

    function setupNavigation() {
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionId = button.getAttribute('data-section');
                contentSections.forEach(section => section.classList.remove('active'));
                navButtons.forEach(btn => btn.classList.remove('active'));
                const currentSection = document.getElementById(sectionId);
                if (currentSection) currentSection.classList.add('active');
                else console.error(`Section ${sectionId} not found.`);
                button.classList.add('active');

                if (sectionId === 'memorama') resetMemoramaView();
                else if (sectionId === 'quiz') resetQuizView();
                else if (sectionId === 'flashcards') initializeFlashcardsView();
            });
        });
        const aboutButton = document.querySelector('nav button[data-section="about"]');
        const aboutSection = document.getElementById('about');
        if (aboutButton && aboutSection) {
            aboutButton.classList.add('active');
            aboutSection.classList.add('active');
        } else if (navButtons.length > 0 && contentSections.length > 0) {
            navButtons[0].classList.add('active');
            contentSections[0].classList.add('active');
        }
    }

    function populateCategorySelect(selectElement, categories) {
         if (!selectElement || !categories) { console.warn("Selector o categorías no disponibles para poblar."); return; }
         selectElement.innerHTML = '';
         const allOption = document.createElement('option');
         allOption.value = 'all';
         allOption.textContent = 'Todas las categorías';
         selectElement.appendChild(allOption);
         categories.filter(cat => cat !== 'all').forEach(category => {
             const option = document.createElement('option');
             option.value = category;
             option.textContent = category;
             selectElement.appendChild(option);
         });
         console.log(`Selector ${selectElement.id} poblado con ${selectElement.options.length} opciones.`);
    }

    // =============================================
    // ========= SECCIÓN LÉXICO ====================
    // =============================================
    function getUniqueCategories(data) {
        const categories = new Set();
        data.forEach(item => {
            if (item.category && item.category.trim() !== '') {
                categories.add(item.category.trim());
            }
        });
        return Array.from(categories).sort();
    }

    function populateCategoryFilters() {
        if (!categoryFiltersContainer || !lexiconData) {
            console.warn("Lexicon filter container or lexicon data not available.");
            if(categoryFiltersContainer) categoryFiltersContainer.innerHTML = '';
            return;
        }
        const uniqueCategories = getUniqueCategories(lexiconData);
        const categoriesForButtons = ['all', ...uniqueCategories];
        categoryFiltersContainer.innerHTML = '';
        if (categoriesForButtons.length <= 1) {
             console.log("No categories defined in data.json to show Lexicon filters.");
             categoryFiltersContainer.style.display = 'none';
             return;
        }
        categoryFiltersContainer.style.display = 'flex';
        categoriesForButtons.forEach(category => {
            const button = document.createElement('button');
            const categoryName = category === 'all' ? 'Todos' : category;
            let icon = '';
            if (category === 'all') icon = categoryIcons['all'] || '';
            else icon = categoryIcons[category] || defaultCategoryIcon;
            button.textContent = icon ? `${icon} ${categoryName}` : categoryName;
            button.dataset.category = category;
            button.classList.add('category-filter-btn');
            if (category === currentCategoryFilter) button.classList.add('active');
            button.addEventListener('click', handleCategoryFilterClick);
            categoryFiltersContainer.appendChild(button);
        });
    }

    function handleCategoryFilterClick(event) {
        currentCategoryFilter = event.target.dataset.category;
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        filterAndDisplayLexicon();
    }

    function displayLexiconItems(itemsToShow) {
        if (!lexiconGrid) return;
        lexiconGrid.innerHTML = '';

        if (!itemsToShow || itemsToShow.length === 0) {
             const isFiltered = (lexiconSearchInput && lexiconSearchInput.value) || currentCategoryFilter !== 'all';
             const message = isFiltered ? 'No se encontraron coincidencias para los filtros aplicados.' : 'No hay datos léxicos para mostrar.';
            lexiconGrid.innerHTML = `<p class="text-center text-secondary" style="grid-column: 1 / -1;">${message}</p>`;
            return;
        }

        itemsToShow.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('lexicon-item');
            const imgSrc = item.image || 'images/placeholder.png';
            const spanishText = item.spanish || '???';
            const languageWord = item[languageKey] || '???'; // Usa la clave de idioma definida

            div.innerHTML = `
                <img src="${imgSrc}" alt="${spanishText || languageWord}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Error al cargar: ${languageWord}';">
                <p class="language-word">${languageWord}</p> <!-- Clase genérica -->
                <p class="spanish-word">${spanishText}</p>`;
            lexiconGrid.appendChild(div);
        });
    }

    function filterAndDisplayLexicon() {
        if (!lexiconData) return;
        const searchTerm = lexiconSearchInput ? lexiconSearchInput.value.toLowerCase().trim() : '';
        let filteredItems = lexiconData;

        if (currentCategoryFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.category && item.category === currentCategoryFilter);
        }

        if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
                // Busca en la clave de idioma definida
                ((item[languageKey] ? item[languageKey].toLowerCase() : '').includes(searchTerm) ||
                 (item.spanish ? item.spanish.toLowerCase() : '').includes(searchTerm))
            );
        }
        displayLexiconItems(filteredItems);
    }

    function setupSearch() {
        if (lexiconSearchInput) {
            // Actualiza el placeholder usando la variable languageNameForUI
            lexiconSearchInput.placeholder = `Buscar palabra (${languageNameForUI} o Español)...`;
            lexiconSearchInput.addEventListener('input', filterAndDisplayLexicon);
        } else {
            console.error("Elemento #lexicon-search no encontrado.");
        }
    }

    // =============================================
    // ========= FIN SECCIÓN LÉXICO ================
    // =============================================

    // -- Frases --
    function populatePhrases() {
        if (!phrasesList) return;
        phrasesList.innerHTML = '';

        if (!phrasesData || phrasesData.length === 0) {
            phrasesList.innerHTML = '<li class="text-secondary">No hay frases disponibles.</li>';
            return;
        }

        phrasesData.forEach(phrase => {
            // Usa la clave de idioma definida para la frase
            if (phrase[languageKey] && phrase.spanish) {
                const li = document.createElement('li');
                // Clase genérica para la frase en el idioma
                li.innerHTML = `<span class="language-phrase">${phrase[languageKey]}</span><span class="spanish-phrase">${phrase.spanish}</span>`;
                phrasesList.appendChild(li);
            }
        });
    }

    // =============================================
    // ========= SECCIÓN MEMORAMA ==================
    // =============================================
    function resetMemoramaView() {
        console.log("[Memorama] Reseteando Vista");
        if (memoramaSetup) memoramaSetup.style.display = 'block';
        if (memoramaGameArea) memoramaGameArea.style.display = 'none';
        if (memoramaWinMessage) memoramaWinMessage.style.display = 'none';
        if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none';
        if (memoramaGrid) memoramaGrid.innerHTML = '';
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        memoramaActive = false; mCards = []; mFlippedElements = []; mMatchedPairsCount = 0;
        mTotalPairs = 0; mAttempts = 0; mLockBoard = false;
        if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = '0';
    }

    function createMemoramaFaceContent(cardInfo, faceElement) {
        if (!cardInfo || !faceElement) { console.error("[Memorama Critico] Faltan parámetros."); return; }
        faceElement.innerHTML = '';
        try {
            if (cardInfo.type === 'image' && cardInfo.value) {
                const img = document.createElement('img');
                img.src = cardInfo.value;
                img.alt = cardInfo.altText || "Imagen Memorama";
                img.loading = 'lazy';
                img.onerror = function() {
                    console.error(`[Memorama Critical] Falló carga IMG: ${this.src} (ID: ${cardInfo.id})`);
                    this.style.display = 'none';
                    const errorP = document.createElement('p'); errorP.textContent = 'Error Img!'; errorP.style.color = 'red'; errorP.style.fontSize = '10px';
                    faceElement.appendChild(errorP);
                };
                faceElement.appendChild(img);
            }
            else if (cardInfo.type === 'text' && cardInfo.value) {
                const textP = document.createElement('p');
                textP.textContent = cardInfo.value;
                faceElement.appendChild(textP);
            }
            else {
                console.warn(`[Memorama Warn] Contenido inválido (ID: ${cardInfo.id}):`, cardInfo);
                const fallbackP = document.createElement('p'); fallbackP.textContent = '??'; fallbackP.style.opacity = '0.5';
                faceElement.appendChild(fallbackP);
            }
        } catch (e) {
            console.error("[Memorama Critico] Excepción en createMemoramaFaceContent:", e, cardInfo);
            try { faceElement.innerHTML = '<p style="color:red; font-size:10px;">Error JS!</p>'; } catch (fe) {}
        }
    }

    function prepareCardData(requestedPairs) {
        // Filtra usando la clave de idioma definida
        const validItems = lexiconData.filter(item => item && item.id != null && item.image && item[languageKey] && item.spanish);

        if (validItems.length < requestedPairs) {
            console.warn(`[Memorama] Datos insuficientes: ${validItems.length} items válidos, se necesitan ${requestedPairs} pares.`);
            if (memoramaDataErrorEl) {
                memoramaDataErrorEl.textContent = `Datos insuficientes (${validItems.length}) con imagen para ${requestedPairs} pares. Añade más entradas con imagen al léxico.`;
                memoramaDataErrorEl.style.display = 'block';
            }
             if (memoramaGameArea) memoramaGameArea.style.display = 'none';
             if (memoramaSetup) memoramaSetup.style.display = 'block';
             difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            return null;
        }
        if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none';
        const shuffledValidItems = shuffleArray(validItems);
        const itemsForGame = shuffledValidItems.slice(0, requestedPairs);
        return itemsForGame;
    }

    function buildMemoramaGrid() {
        if (!memoramaGrid) { console.error("[Memorama Error] #memorama-grid no encontrado."); return; }
        memoramaGrid.innerHTML = '';
        mCards.forEach((cardData, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card');
            if (cardData.id === undefined || cardData.id === null) {
                console.error(`[Memorama Error] ID indefinido carta ${index}`, cardData); return;
            }
            cardElement.dataset.id = cardData.id;
            cardElement.dataset.index = index;
            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');
            createMemoramaFaceContent(cardData, frontFace);
            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-back');
            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);
            cardElement.addEventListener('click', handleMemoramaCardClick);
            memoramaGrid.appendChild(cardElement);
        });
        let columns = Math.ceil(Math.sqrt(mCards.length));
        columns = Math.max(2, Math.min(columns, 5));
        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        console.log(`[Memorama] Grid construido con ${columns} columnas.`);
    }

    function startMemorama(numPairs) {
        console.log(`[Memorama] Iniciando startMemorama con ${numPairs} pares.`);
        resetMemoramaView();
        const itemsForGame = prepareCardData(numPairs);
        if (!itemsForGame) { memoramaActive = false; return; }

        mTotalPairs = itemsForGame.length; memoramaActive = true; mCards = []; mAttempts = 0;
        mMatchedPairsCount = 0; mFlippedElements = []; mLockBoard = false;
        if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts;
        if (memoramaWinMessage) memoramaWinMessage.style.display = 'none';

        // Crea pares usando la clave de idioma definida
        itemsForGame.forEach(item => {
            mCards.push({ id: item.id, type: 'image', value: item.image, altText: item.spanish });
            mCards.push({ id: item.id, type: 'text', value: item[languageKey] }); // Usa la clave de idioma
        });

        mCards = shuffleArray(mCards);
        buildMemoramaGrid();
        if (memoramaSetup) memoramaSetup.style.display = 'none';
        if (memoramaGameArea) memoramaGameArea.style.display = 'block';
        console.log(`[Memorama] Juego listo con ${mTotalPairs} pares y ${mCards.length} cartas.`);
    }

    function handleMemoramaCardClick(event) {
        if (!memoramaActive || mLockBoard || !event.currentTarget) return;
        const clickedCardElement = event.currentTarget;
        if (clickedCardElement.classList.contains('flipped') || clickedCardElement.classList.contains('matched')) return;
        clickedCardElement.classList.add('flipped');
        mFlippedElements.push(clickedCardElement);
        if (mFlippedElements.length === 2) {
            mLockBoard = true;
            mAttempts++;
            if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts;
            checkMemoramaMatch();
        }
    }

    function checkMemoramaMatch() {
        const [card1, card2] = mFlippedElements;
        if (!card1 || !card2) {
            console.error("[Memorama Critico] Faltan cartas en checkMemoramaMatch.");
            mFlippedElements = []; mLockBoard = false; return;
        }
        const isMatch = card1.dataset.id === card2.dataset.id;
        if (isMatch) {
            mMatchedPairsCount++;
            setTimeout(() => {
                card1.classList.add('matched'); card2.classList.add('matched');
                mFlippedElements = []; mLockBoard = false;
                if (mMatchedPairsCount === mTotalPairs) {
                    console.log("[Memorama] ¡Juego Ganado!");
                    if (memoramaWinMessage) {
                        memoramaWinMessage.textContent = `¡Felicidades! Encontraste ${mTotalPairs} pares en ${mAttempts} intentos.`;
                        memoramaWinMessage.style.display = 'block';
                    }
                    memoramaActive = false;
                }
            }, 300);
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped'); card2.classList.remove('flipped');
                mFlippedElements = []; mLockBoard = false;
            }, 1000);
        }
    }

    function setupMemoramaControls() {
        if (!memoramaSetup || !resetMemoramaBtn || difficultyButtons.length === 0) {
            console.error("[Memorama Critico] Faltan elementos HTML para controles."); return;
        }
        console.log("[Memorama] Configurando controles.");
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pairs = parseInt(button.getAttribute('data-pairs'));
                if (isNaN(pairs) || pairs <= 0) { console.error("[Memorama Error] data-pairs inválido:", button); return; }
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                startMemorama(pairs);
            });
        });
        resetMemoramaBtn.addEventListener('click', () => {
            console.log("[Memorama] Botón Reset presionado.");
            const selectedBtn = document.querySelector('#memorama-setup .difficulty-btn.selected');
            if (selectedBtn) {
                const pairs = parseInt(selectedBtn.getAttribute('data-pairs'));
                if (!isNaN(pairs) && pairs > 0) { startMemorama(pairs); }
                else { resetMemoramaView(); }
            } else { resetMemoramaView(); }
        });
    }
    // =============================================
    // ===== FIN SECCIÓN MEMORAMA ==================
    // =============================================

    // =============================================
    // ========= SECCIÓN QUIZ ======================
    // =============================================
     function getWrongOptions(correctItem, count, sourceData, field) {
        if (!correctItem || !field || !sourceData) return [];
         const correctValueNorm = normalizeAnswer(correctItem[field]);
         const wrongAnswerPool = sourceData.filter(item =>
             item && item.id !== correctItem.id && item[field] &&
             normalizeAnswer(item[field]) !== correctValueNorm
         );
         const shuffledWrongs = shuffleArray([...wrongAnswerPool]);
         let options = new Set();
         for (const item of shuffledWrongs) {
             if (options.size >= count) break;
             options.add(item[field]);
         }
         let attempts = 0;
         const maxAttempts = sourceData.length * 2;
         while (options.size < count && attempts < maxAttempts) {
             const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
             if (randomItem && randomItem[field] && normalizeAnswer(randomItem[field]) !== correctValueNorm) {
                  options.add(randomItem[field]);
             }
             attempts++;
         }
         return Array.from(options);
     }

    function generateQuizQuestions(numQuestions) {
        const selectedCategory = quizCategorySelect ? quizCategorySelect.value : 'all';
        console.log(`[Quiz] Generating questions for category: "${selectedCategory}"`);

        // Filtra usando la clave de idioma definida
        const categoryFilteredItems = lexiconData.filter(item =>
            item && item.id != null && item[languageKey] && item.spanish &&
            (selectedCategory === 'all' || (item.category && item.category === selectedCategory))
        );

        if (categoryFilteredItems.length < 2) {
            console.warn(`[Quiz] Datos insuficientes para la categoría "${selectedCategory}" (${categoryFilteredItems.length}).`);
            if(quizDataErrorEl) {
                const categoryDisplayName = selectedCategory === 'all' ? 'Todas las categorías' : `la categoría "${selectedCategory}"`;
                quizDataErrorEl.textContent = `Datos insuficientes (${categoryFilteredItems.length}) para ${categoryDisplayName}. Se necesitan al menos 2 entradas léxicas completas con categoría asignada.`;
                quizDataErrorEl.style.display = 'block';
            }
            return [];
        } else {
             if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';
        }

        const availableLexiconItems = categoryFilteredItems;
        const availableImageItems = availableLexiconItems.filter(item => item.image);
        const potentialQuestions = [];

        // Genera preguntas usando la clave de idioma definida y textos actualizados
        availableLexiconItems.forEach(item => {
            // Pregunta Idioma -> Español
            potentialQuestions.push({ type: 'MC_LangSp', item: item, question: `¿Qué significa "${item[languageKey]}"?`, answer: item.spanish });
             // Pregunta Español -> Idioma
            potentialQuestions.push({ type: 'MC_SpLang', item: item, question: `¿Cómo se dice "${item.spanish}" en ${languageNameForUI}?`, answer: item[languageKey] });
            // Pregunta Texto Español -> Idioma
            potentialQuestions.push({ type: 'TXT_SpLang', item: item, question: `Escribe cómo se dice "${item.spanish}" en ${languageNameForUI}:`, answer: item[languageKey] });
        });
        availableImageItems.forEach(item => {
            // Pregunta Imagen -> Idioma
            potentialQuestions.push({ type: 'MC_ImgLang', item: item, question: `¿Qué es esto en ${languageNameForUI}?`, answer: item[languageKey], image: item.image });
            // Pregunta Texto Imagen -> Idioma
            potentialQuestions.push({ type: 'TXT_ImgLang', item: item, question: `Escribe en ${languageNameForUI} qué ves en la imagen:`, answer: item[languageKey], image: item.image });
        });


        const shuffledPotentialQuestions = shuffleArray(potentialQuestions);
        let questionsToGenerate = 0;
        const totalPotential = shuffledPotentialQuestions.length;

        if (totalPotential === 0) {
             console.warn(`[Quiz] No se pudieron generar preguntas para la categoría "${selectedCategory}" después de filtrar.`);
             if(quizDataErrorEl) {
                 const categoryDisplayName = selectedCategory === 'all' ? 'estas categorías' : `la categoría "${selectedCategory}"`;
                 quizDataErrorEl.textContent = `No se pudieron generar preguntas con los datos disponibles para ${categoryDisplayName}.`;
                 quizDataErrorEl.style.display = 'block';
             }
             return [];
        }

        if (numQuestions === 'all') questionsToGenerate = totalPotential;
        else questionsToGenerate = Math.min(parseInt(numQuestions), totalPotential);
        questionsToGenerate = Math.max(1, questionsToGenerate);

        const finalQuestions = shuffledPotentialQuestions.slice(0, questionsToGenerate);

        finalQuestions.forEach(q => {
            if (q.type.startsWith('MC_')) {
                let wrongOptions = [];
                let field = ''; // Campo para opciones incorrectas (spanish o languageKey)

                if (q.type === 'MC_LangSp') field = 'spanish';
                // Usa la clave de idioma para estos tipos
                else if (q.type === 'MC_SpLang' || q.type === 'MC_ImgLang') field = languageKey;

                if (field && q.item) {
                     const potentialWrongPool = categoryFilteredItems.filter(item => item && item.id !== q.item.id);
                     wrongOptions = getWrongOptions(q.item, 3, potentialWrongPool, field);
                     const allOptions = [q.answer, ...wrongOptions];
                     const uniqueOptions = Array.from(new Set(allOptions));
                     q.options = shuffleArray(uniqueOptions.slice(0, 4));
                } else {
                     q.options = [q.answer];
                     console.warn("No se pudieron generar opciones MC válidas para:", q);
                }
                if (!Array.isArray(q.options) || q.options.length < 2) {
                     console.warn("Pregunta MC generada con menos de 2 opciones:", q);
                }
            }
        });

        const validFinalQuestions = finalQuestions;
        console.log("[Quiz] Preguntas generadas:", validFinalQuestions);
        return validFinalQuestions;
     }

    function startQuiz(isRetry = false) {
         quizActive = true; score = 0; currentQuestionIndex = 0;
         if (!isRetry) {
             const selectedLength = quizLengthSelect ? quizLengthSelect.value : '5';
             allQuizQuestions = generateQuizQuestions(selectedLength);
             currentQuizSet = allQuizQuestions;
             missedQuestions = [];
         }
         else {
             currentQuizSet = shuffleArray([...missedQuestions]);
             missedQuestions = [];
             if (currentQuizSet.length === 0) {
                 alert("¡Felicidades! No hubo preguntas falladas en el último intento.");
                 resetQuizView(); return;
             }
             console.log("[Quiz] Reintentando:", currentQuizSet);
             if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';
         }

         if (!currentQuizSet || currentQuizSet.length === 0) {
             console.log("[Quiz] No hay preguntas disponibles en el set actual.");
             // generateQuizQuestions o la alerta de reintento ya mostraron el mensaje
             if(quizQuestionArea) quizQuestionArea.style.display = 'none';
             if(quizSetup) quizSetup.style.display = 'block';
             if(quizResultsEl) quizResultsEl.style.display = 'none';
             if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
             quizActive = false; return;
         }

         if(quizSetup) quizSetup.style.display = 'none';
         if(quizResultsEl) quizResultsEl.style.display = 'none';
         if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
         if(quizQuestionArea) quizQuestionArea.style.display = 'block';
         if(nextQuestionBtn) nextQuestionBtn.style.display = 'none';
         displayQuestion();
     }

    function displayQuestion() {
        if (currentQuestionIndex >= currentQuizSet.length) { showResults(); return; }
        quizActive = true;
        const q = currentQuizSet[currentQuestionIndex];

        if (!q || typeof q.type === 'undefined' || typeof q.question === 'undefined' || typeof q.answer === 'undefined') {
             console.error("[Quiz Error] Pregunta inválida:", q);
             if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error al cargar pregunta."; quizFeedbackEl.className = 'incorrect'; }
             quizActive = false;
             if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
             setTimeout(goToNextQuestion, 1000); return;
        }

        if(quizQuestionEl) quizQuestionEl.textContent = q.question;
        if(quizImageContainer) quizImageContainer.innerHTML = '';
        if(quizOptionsEl) { quizOptionsEl.innerHTML = ''; quizOptionsEl.style.display = 'none'; }
        if(quizTextInputArea) quizTextInputArea.style.display = 'none';
        if(quizTextAnswerInput) {
            quizTextAnswerInput.value = ''; quizTextAnswerInput.className = '';
            quizTextAnswerInput.disabled = false;
            // Actualiza placeholder usando la variable languageNameForUI
            quizTextAnswerInput.placeholder = `Escribe la palabra en ${languageNameForUI}...`;
        }
        if(submitTextAnswerBtn) submitTextAnswerBtn.disabled = false;
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; }
        if(nextQuestionBtn) nextQuestionBtn.style.display = 'none';

        if (q.image && quizImageContainer) {
             const img = document.createElement('img');
             img.src = q.image;
             img.alt = `Imagen para la pregunta: ${q.question}`;
             img.loading = 'lazy';
             img.onerror = function() {
                 console.error(`[Quiz Error] IMG no cargada: ${this.src}`);
                 this.alt = 'Error al cargar imagen'; this.src='images/placeholder.png';
             };
             quizImageContainer.appendChild(img);
        }

        // Configura UI basada en el tipo de pregunta (usando los tipos genéricos LangSp, SpLang, etc.)
        if (q.type.startsWith('MC_') && quizOptionsEl) {
            quizOptionsEl.style.display = 'block';
            if (!Array.isArray(q.options) || q.options.length < 2) {
                 console.error("[Quiz Error] Pregunta MC sin opciones válidas:", q);
                 quizOptionsEl.innerHTML = '<p style="color:var(--error-red);">Error al mostrar opciones.</p>';
                 quizActive = false; if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
            }
            else {
                 q.options.forEach(option => {
                     const button = document.createElement('button');
                     button.textContent = option; button.disabled = false;
                     button.addEventListener('click', handleMCAnswer);
                     quizOptionsEl.appendChild(button);
                 });
            }
        } else if (q.type.startsWith('TXT_') && quizTextInputArea && quizTextAnswerInput && submitTextAnswerBtn) {
            quizTextInputArea.style.display = 'flex';
            setTimeout(() => { if (quizTextAnswerInput) quizTextAnswerInput.focus(); }, 100);
        } else {
             console.error("[Quiz Error] Tipo de pregunta desconocido o elementos DOM faltantes:", q.type, q);
             if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error: Tipo de pregunta desconocido."; quizFeedbackEl.className = 'incorrect'; }
             quizActive = false; if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
        }
    }

    function handleMCAnswer(event) {
        if (!quizActive || !quizOptionsEl || !quizFeedbackEl || !nextQuestionBtn) return;
        quizActive = false;
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.textContent;
        const currentQuestion = currentQuizSet[currentQuestionIndex];

        if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
             console.error("[Quiz Error] handleMCAnswer: Invalid current question or answer.");
             if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error interno."; quizFeedbackEl.className = 'incorrect'; }
             const optionButtons = quizOptionsEl.querySelectorAll('button');
             optionButtons.forEach(btn => btn.disabled = true);
             if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block'; return;
        }

        const correctAnswer = currentQuestion.answer;
        const optionButtons = quizOptionsEl.querySelectorAll('button');
        optionButtons.forEach(btn => btn.disabled = true);

        if (selectedAnswer === correctAnswer) {
            score++;
            selectedButton.classList.add('correct');
            quizFeedbackEl.textContent = '¡Correcto!';
            quizFeedbackEl.className = 'correct';
        } else {
            selectedButton.classList.add('incorrect');
            quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong>${correctAnswer}</strong>`;
            quizFeedbackEl.className = 'incorrect';
            if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                 missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
            }
            optionButtons.forEach(btn => { if (btn.textContent === correctAnswer) btn.classList.add('correct'); });
        }
        if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
    }

    function handleTextAnswer() {
         if (!quizActive || !quizTextAnswerInput || !submitTextAnswerBtn || !quizFeedbackEl || !nextQuestionBtn) return;
         quizActive = false;
         const currentQuestion = currentQuizSet[currentQuestionIndex];

         if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
             console.error("[Quiz Error] handleTextAnswer: Invalid current question or answer.");
             if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error interno."; quizFeedbackEl.className = 'incorrect'; }
             if (quizTextAnswerInput) quizTextAnswerInput.disabled = true;
             if (submitTextAnswerBtn) submitTextAnswerBtn.disabled = true;
             if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block'; return;
         }

         const userAnswer = normalizeAnswer(quizTextAnswerInput.value);
         const correctAnswerNorm = normalizeAnswer(currentQuestion.answer);
         const originalCorrectAnswer = currentQuestion.answer;

         if (quizTextAnswerInput) quizTextAnswerInput.disabled = true;
         if (submitTextAnswerBtn) submitTextAnswerBtn.disabled = true;

         if (userAnswer === correctAnswerNorm && userAnswer !== '') {
             score++;
             if (quizTextAnswerInput) quizTextAnswerInput.classList.add('correct');
             quizFeedbackEl.textContent = '¡Correcto!';
             quizFeedbackEl.className = 'correct';
         }
         else {
             if (quizTextAnswerInput) quizTextAnswerInput.classList.add('incorrect');
             quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong>${originalCorrectAnswer}</strong>`;
             quizFeedbackEl.className = 'incorrect';
             if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                 missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
             }
         }
         if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
     }

    function goToNextQuestion() {
        currentQuestionIndex++;
        setTimeout(displayQuestion, 50);
    }

    function showResults() {
        if(quizQuestionArea) quizQuestionArea.style.display = 'none';
        if(quizResultsEl) quizResultsEl.style.display = 'block';
        if(quizScoreEl) quizScoreEl.textContent = score;
        if(quizTotalEl && currentQuizSet) quizTotalEl.textContent = currentQuizSet.length;
        quizActive = false;
        const wasMainQuizRound = (currentQuizSet === allQuizQuestions);
        if (missedQuestions.length > 0 && wasMainQuizRound && retryMissedQuizBtn) {
            retryMissedQuizBtn.style.display = 'inline-block';
        } else if(retryMissedQuizBtn) {
            retryMissedQuizBtn.style.display = 'none';
        }
    }

    function resetQuizView() {
        quizActive = false; allQuizQuestions = []; currentQuizSet = []; missedQuestions = [];
        score = 0; currentQuestionIndex = 0;

        if(quizSetup) quizSetup.style.display = 'block';
        if(quizQuestionArea) quizQuestionArea.style.display = 'none';
        if(quizResultsEl) quizResultsEl.style.display = 'none';
        if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';

        if(quizCategorySelect) {
             if(quizCategorySelect.options.length > 0) quizCategorySelect.value = 'all';
             if(lexiconData.length > 0 && quizCategorySelect.options.length <= 1) { // Check <= 1 because 'all' exists
                  const uniqueCategories = getUniqueCategories(lexiconData);
                  populateCategorySelect(quizCategorySelect, uniqueCategories);
             }
             quizCategorySelect.disabled = (quizCategorySelect.options.length <= 1);
        }
        if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';

        if(quizImageContainer) quizImageContainer.innerHTML = '';
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; }
        if(quizOptionsEl) quizOptionsEl.innerHTML = '';
        if(quizTextInputArea) quizTextInputArea.style.display = 'none';
        if(quizTextAnswerInput) { quizTextAnswerInput.value = ''; quizTextAnswerInput.className = ''; }
        if(quizQuestionEl) quizQuestionEl.textContent = '';
        if(quizLengthSelect) quizLengthSelect.value = "5";
        console.log("[Quiz] Vista reseteada.");
    }

    function setupQuizControls() {
        if (!startQuizBtn || !nextQuestionBtn || !restartQuizBtn || !retryMissedQuizBtn || !submitTextAnswerBtn || !quizTextAnswerInput || !quizLengthSelect || !quizCategorySelect) {
            console.error("[Quiz Error] Faltan elementos HTML esenciales.");
             if (errorMessageEl) {
                 errorMessageEl.textContent = "Error: Algunos controles del Quiz no se encontraron.";
                 errorMessageEl.style.display = 'block';
             }
            return;
        }
        console.log("[Quiz] Configurando controles.");
        startQuizBtn.addEventListener('click', () => startQuiz(false));
        nextQuestionBtn.addEventListener('click', goToNextQuestion);
        restartQuizBtn.addEventListener('click', resetQuizView);
        retryMissedQuizBtn.addEventListener('click', () => startQuiz(true));
        submitTextAnswerBtn.addEventListener('click', handleTextAnswer);
        quizTextAnswerInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !submitTextAnswerBtn.disabled) handleTextAnswer();
        });
        quizCategorySelect.addEventListener('change', () => {
            console.log("[Quiz] Categoría cambiada. Reseteando vista.");
            resetQuizView();
        });
    }
    // =============================================
    // ========= FIN SECCIÓN QUIZ ==================
    // =============================================

    // =============================================
    // ========= SECCIÓN FLASHCARDS ================
    // =============================================
    function prepareFlashcardData() {
        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'block';
        if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
        if (flashcardsErrorEl) flashcardsErrorEl.style.display = 'none';
        if (flashcardsDataErrorEl) flashcardsDataErrorEl.style.display = 'none';

        const selectedCategory = flashcardCategorySelect ? flashcardCategorySelect.value : 'all';
        console.log(`[Flashcards] Preparing cards for category: "${selectedCategory}"`);

        // Filtra usando la clave de idioma definida
        const categoryFilteredLexicon = lexiconData.filter(item =>
            item && item.id != null && item[languageKey] && (item.spanish || item.image) &&
            (selectedCategory === 'all' || (item.category && item.category === selectedCategory))
        );

        console.log(`[Flashcards] Items válidos para categoría "${selectedCategory}": ${categoryFilteredLexicon.length}`);

        if (categoryFilteredLexicon.length === 0) {
             console.warn(`[Flashcards] No hay datos disponibles para la categoría "${selectedCategory}".`);
             if (flashcardsDataErrorEl) {
                 const categoryDisplayName = selectedCategory === 'all' ? 'todas las categorías' : `la categoría "${selectedCategory}"`;
                 flashcardsDataErrorEl.textContent = `No hay datos disponibles para ${categoryDisplayName}.`;
                 flashcardsDataErrorEl.style.display = 'block';
             }
             if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
             flashcardData = [];
             return false;
        }

        if (flashcardsDataErrorEl) flashcardsDataErrorEl.style.display = 'none';
        flashcardData = shuffleArray([...categoryFilteredLexicon]);
        currentFlashcardIndex = 0;
        isFlashcardFlipped = false;
        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
        if (flashcardAreaEl) flashcardAreaEl.style.display = 'block';
        return true;
    }

     function displayCurrentFlashcard() {
        if (!flashcardData || flashcardData.length === 0 || !flashcardAreaEl || flashcardAreaEl.style.display === 'none') {
             console.log("[Flashcards] No data or area not visible.");
             if (flashcardCounterEl) flashcardCounterEl.textContent = '';
             return;
        }
        if (currentFlashcardIndex < 0 || currentFlashcardIndex >= flashcardData.length) {
             console.error(`[Flashcards] Invalid index: ${currentFlashcardIndex}. Resetting.`);
             currentFlashcardIndex = 0;
             if (!flashcardData[currentFlashcardIndex]) {
                 console.error("[Flashcards] Data missing at index 0 after reset.");
                  if (flashcardsErrorEl) { flashcardsErrorEl.textContent = 'Error al mostrar tarjeta.'; flashcardsErrorEl.style.display = 'block'; }
                  if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
                 return;
             }
        }
        const cardData = flashcardData[currentFlashcardIndex];
        if (flashcardEl) flashcardEl.classList.remove('flipped');
        isFlashcardFlipped = false;

        if (flashcardFrontEl) {
             flashcardFrontEl.innerHTML = '';
            if (cardData.image) {
                const img = document.createElement('img');
                img.src = cardData.image;
                img.alt = cardData.spanish || 'Flashcard Image';
                img.loading = 'lazy';
                img.onerror = function() {
                    console.error(`[Flashcards] Image failed: ${this.src}`);
                    this.alt = 'Error al cargar imagen'; this.src='images/placeholder.png';
                };
                flashcardFrontEl.appendChild(img);
            } else if (cardData.spanish) {
                 flashcardFrontEl.textContent = cardData.spanish;
            } else {
                 flashcardFrontEl.textContent = '???';
            }
        }

        // Muestra la palabra en el idioma (usando languageKey) en la cara trasera
        if (flashcardBackEl) {
             flashcardBackEl.textContent = cardData[languageKey] || '???';
        }

        if (flashcardCounterEl) {
             flashcardCounterEl.textContent = `Tarjeta ${currentFlashcardIndex + 1} de ${flashcardData.length}`;
        }
    }

    function flipFlashcard() {
        if (!flashcardEl) return;
        flashcardEl.classList.toggle('flipped');
        isFlashcardFlipped = !isFlashcardFlipped;
    }

    function nextFlashcard() {
        if (!flashcardData || flashcardData.length === 0) return;
        currentFlashcardIndex++;
        if (currentFlashcardIndex >= flashcardData.length) currentFlashcardIndex = 0;
        displayCurrentFlashcard();
    }

    function prevFlashcard() {
        if (!flashcardData || flashcardData.length === 0) return;
        currentFlashcardIndex--;
        if (currentFlashcardIndex < 0) currentFlashcardIndex = flashcardData.length - 1;
        displayCurrentFlashcard();
    }

     function shuffleFlashcards() {
         console.log("[Flashcards] Shuffling cards...");
         if (prepareFlashcardData()) {
              displayCurrentFlashcard();
         }
     }

    function setupFlashcardsControls() {
        if (!flashcardEl || !prevFlashcardBtn || !flipFlashcardBtn || !nextFlashcardBtn || !shuffleFlashcardsBtn || !flashcardCategorySelect || !flashcardsSetupControls || !flashcardsDataErrorEl) {
             console.error("Missing essential Flashcard control elements.");
             if (flashcardsErrorEl) {
                 flashcardsErrorEl.textContent = "Error: Algunos controles de Flashcards no se encontraron.";
                 flashcardsErrorEl.style.display = 'block';
             }
             if(flashcardsSetupControls) flashcardsSetupControls.style.display = 'none';
             return;
        }
        console.log("[Flashcards] Configurando controles.");
        flashcardEl.addEventListener('click', flipFlashcard);
        flipFlashcardBtn.addEventListener('click', flipFlashcard);
        nextFlashcardBtn.addEventListener('click', nextFlashcard);
        prevFlashcardBtn.addEventListener('click', prevFlashcard);
        shuffleFlashcardsBtn.addEventListener('click', shuffleFlashcards);
        flashcardCategorySelect.addEventListener('change', () => {
            console.log("[Flashcards] Categoría cambiada. Recargando.");
            const dataPrepared = prepareFlashcardData();
            if (dataPrepared) displayCurrentFlashcard();
        });
    }

     function initializeFlashcardsView() {
         console.log("[Flashcards] Initializing view...");
         if(lexiconData.length > 0 && flashcardCategorySelect && flashcardCategorySelect.options.length <= 1) { // Check <= 1
              const uniqueCategories = getUniqueCategories(lexiconData);
              populateCategorySelect(flashcardCategorySelect, uniqueCategories);
         }
         else if (lexiconData.length === 0) {
              console.warn("[Flashcards] No lexicon data available.");
               if(flashcardCategorySelect) flashcardCategorySelect.disabled = true;
               if(flashcardsSetupControls) flashcardsSetupControls.style.display = 'block';
               if (flashcardsDataErrorEl) {
                   flashcardsDataErrorEl.textContent = 'No hay datos léxicos disponibles para Flashcards.';
                   flashcardsDataErrorEl.style.display = 'block';
               }
               if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
               if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
               return;
         }

         const dataPrepared = prepareFlashcardData();
         if(dataPrepared) displayCurrentFlashcard();
     }
    // =============================================
    // ========= FIN SECCIÓN FLASHCARDS ============
    // =============================================

    // --- Initialization Application ---
    function initializeApplication() {
        // Re-check essential elements
        if (!mainContentEl || !navButtons || !contentSections || !lexiconGrid || !phrasesList || !memoramaGrid || !quizContainer || !flashcardsContainer || !categoryFiltersContainer || !quizCategorySelect || !flashcardCategorySelect || !flashcardsSetupControls || !flashcardsDataErrorEl || !quizDataErrorEl) {
            console.error("Critical Error: Missing essential HTML elements during initialization.");
            if(errorMessageEl) {
                 errorMessageEl.textContent = "Error crítico al iniciar: Faltan elementos HTML esenciales. Consulta la consola (F12).";
                 errorMessageEl.style.display = 'block';
            }
            if(loadingMessageEl) loadingMessageEl.style.display = 'none';
            if(mainContentEl) mainContentEl.style.display = 'none';
            return;
        }
        console.log("HTML elements check passed. Initializing application modules...");

        setupNavigation();
        populatePhrases(); // Populates based on languageKey
        setupSearch(); // Sets placeholder based on languageNameForUI
        populateCategoryFilters(); // Uses category names from data
        filterAndDisplayLexicon(); // Displays based on languageKey

        if(lexiconData.length > 0) {
            const uniqueCategories = getUniqueCategories(lexiconData);
            populateCategorySelect(quizCategorySelect, uniqueCategories);
            populateCategorySelect(flashcardCategorySelect, uniqueCategories);
             if(quizCategorySelect) quizCategorySelect.disabled = (quizCategorySelect.options.length <= 1); // Disable if only "All"
             if(flashcardCategorySelect) flashcardCategorySelect.disabled = (flashcardCategorySelect.options.length <= 1); // Disable if only "All"
        } else {
             console.warn("No lexicon data. Category selects disabled.");
             if(quizCategorySelect) quizCategorySelect.disabled = true;
             if(flashcardCategorySelect) flashcardCategorySelect.disabled = true;
             // Show setup areas but display errors within them
             if(flashcardsSetupControls) flashcardsSetupControls.style.display = 'block';
             if (flashcardsDataErrorEl) {
                 flashcardsDataErrorEl.textContent = `No hay datos léxicos disponibles para ${languageNameForUI}.`;
                 flashcardsDataErrorEl.style.display = 'block';
             }
              if(quizSetup) quizSetup.style.display = 'block';
              if(quizDataErrorEl) {
                 quizDataErrorEl.textContent = `No hay datos léxicos disponibles para ${languageNameForUI}.`;
                 quizDataErrorEl.style.display = 'block';
              }
              // Ensure game areas are hidden if setup shows errors
              if(quizQuestionArea) quizQuestionArea.style.display = 'none';
              if(quizResultsEl) quizResultsEl.style.display = 'none';
              if(flashcardAreaEl) flashcardAreaEl.style.display = 'none';
        }

        setupMemoramaControls();
        setupQuizControls();
        setupFlashcardsControls();

        console.log("Aplicación inicializada correctamente.");
    }

    // --- Punto de Entrada ---
    loadData();

}); // Fin DOMContentLoaded