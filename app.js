document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('conjugator-form');
    const input = document.getElementById('verb-input');
    const resultsContainer = document.getElementById('results');
    const errorMessage = document.getElementById('error-message');
    const verbTitle = document.getElementById('verb-title');
    const historyContainer = document.getElementById('search-history');
    const historyList = document.getElementById('history-list');
    
    let searchHistory = JSON.parse(localStorage.getItem('verbHistory')) || [];
    renderHistory();
    
    function updateHistory(verb) {
        searchHistory = searchHistory.filter(v => v !== verb);
        searchHistory.unshift(verb);
        if (searchHistory.length > 10) {
            searchHistory.pop();
        }
        localStorage.setItem('verbHistory', JSON.stringify(searchHistory));
        renderHistory();
    }

    function renderHistory() {
        if (searchHistory.length === 0) {
            historyContainer.classList.add('hidden');
            return;
        }
        
        historyContainer.classList.remove('hidden');
        historyList.innerHTML = '';
        
        searchHistory.forEach(verb => {
            const chip = document.createElement('button');
            chip.className = 'history-chip';
            chip.type = 'button';
            chip.textContent = verb;
            chip.addEventListener('click', () => {
                input.value = verb;
                form.dispatchEvent(new Event('submit', { cancelable: true }));
            });
            historyList.appendChild(chip);
        });
    }
    
    // Result elements
    const presentTense = document.getElementById('present-tense');
    const pastTense = document.getElementById('past-tense');
    const participleTense = document.getElementById('participle-tense');
    const gerundTense = document.getElementById('gerund-tense');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let verb = input.value.trim().toLowerCase();
        
        if (!verb) return;
        
        // Remove 'to ' if user entered it (e.g. 'to walk')
        if (verb.startsWith('to ')) {
            verb = verb.substring(3);
        }

        // Use compromise to analyze the word
        // Tagging it as a verb explicitly helps the engine
        let doc = window.nlp(verb).tag('Verb');
        let verbObj = doc.verbs();

        if (verbObj.length > 0) {
            const conjugations = verbObj.conjugate()[0];
            
            if (conjugations) {
                // Hide error, show results
                errorMessage.classList.add('hidden');
                
                // Reset animation
                resultsContainer.classList.remove('hidden');
                resultsContainer.style.animation = 'none';
                resultsContainer.offsetHeight; /* trigger reflow */
                resultsContainer.style.animation = null;

                // Update UI
                verbTitle.textContent = verb;
                
                // Compromise conjugation outputs
                presentTense.textContent = conjugations.PresentTense || verb;
                pastTense.textContent = conjugations.PastTense || verb + "ed";
                participleTense.textContent = conjugations.Participle || verb + "ed";
                gerundTense.textContent = conjugations.Gerund || verb + "ing";
                
                updateHistory(verb);
            } else {
                showError();
            }
        } else {
            // Fallback for completely unrecognized words
            showError();
        }
    });

    function showError() {
        resultsContainer.classList.add('hidden');
        errorMessage.classList.remove('hidden');
    }
});
