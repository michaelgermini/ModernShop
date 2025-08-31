// Système de recherche avancée avec autocomplétion
class AdvancedSearchSystem {
    constructor() {
        this.searchHistory = [];
        this.popularSearches = [];
        this.init();
    }

    init() {
        this.loadSearchData();
        this.enhanceSearchUI();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    // Charger les données de recherche
    loadSearchData() {
        try {
            this.searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
            this.popularSearches = this.calculatePopularSearches();
        } catch (e) {
            this.searchHistory = [];
            this.popularSearches = [];
        }
    }

    // Sauvegarder les données de recherche
    saveSearchData() {
        try {
            localStorage.setItem('search_history', JSON.stringify(this.searchHistory.slice(0, 50))); // Garder les 50 dernières recherches
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde des données de recherche:', e);
        }
    }

    // Calculer les recherches populaires
    calculatePopularSearches() {
        const searchCounts = {};
        this.searchHistory.forEach(search => {
            searchCounts[search] = (searchCounts[search] || 0) + 1;
        });

        return Object.entries(searchCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([term]) => term);
    }

    // Améliorer l'interface de recherche
    enhanceSearchUI() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        // Créer le conteneur d'autocomplétion
        const autocompleteContainer = document.createElement('div');
        autocompleteContainer.className = 'autocomplete-container';
        autocompleteContainer.id = 'autocompleteContainer';

        // Insérer après le champ de recherche
        searchInput.parentNode.insertBefore(autocompleteContainer, searchInput.nextSibling);

        // Améliorer le champ de recherche
        searchInput.setAttribute('autocomplete', 'off');
        searchInput.setAttribute('spellcheck', 'false');

        // Ajouter des indicateurs visuels
        this.addSearchIndicators(searchInput);

        // Ajouter des boutons de recherche rapide
        this.addQuickSearchButtons();
    }

    addSearchIndicators(searchInput) {
        const searchBar = searchInput.parentNode;

        // Indicateur de chargement
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'search-loading';
        loadingIndicator.innerHTML = '<div class="loading-spinner"></div>';
        loadingIndicator.style.display = 'none';
        searchBar.appendChild(loadingIndicator);

        // Indicateur de résultats
        const resultsIndicator = document.createElement('div');
        resultsIndicator.className = 'search-results-count';
        resultsIndicator.id = 'searchResultsCount';
        searchBar.appendChild(resultsIndicator);
    }

    addQuickSearchButtons() {
        const searchFilters = document.querySelector('.search-filters');
        if (!searchFilters) return;

        const quickSearchSection = document.createElement('div');
        quickSearchSection.className = 'quick-search-section';
        quickSearchSection.innerHTML = `
            <div class="quick-search-buttons">
                <button class="quick-search-btn" onclick="advancedSearchSystem.quickSearch('t-shirt')">
                    <span class="material-icons">checkroom</span>
                    T-shirts
                </button>
                <button class="quick-search-btn" onclick="advancedSearchSystem.quickSearch('pull')">
                    <span class="material-icons">dry</span>
                    Pulls
                </button>
                <button class="quick-search-btn" onclick="advancedSearchSystem.quickSearch('jean')">
                    <span class="material-icons">content_cut</span>
                    Jeans
                </button>
                <button class="quick-search-btn" onclick="advancedSearchSystem.quickSearch('promo')">
                    <span class="material-icons">local_offer</span>
                    Promos
                </button>
            </div>
            <div class="popular-searches">
                <span class="popular-label">Recherches populaires:</span>
                <div class="popular-tags" id="popularTags"></div>
            </div>
        `;

        searchFilters.appendChild(quickSearchSection);
        this.updatePopularSearches();
    }

    updatePopularSearches() {
        const popularTags = document.getElementById('popularTags');
        if (!popularTags) return;

        if (this.popularSearches.length > 0) {
            popularTags.innerHTML = this.popularSearches
                .slice(0, 5)
                .map(term => `<span class="popular-tag" onclick="advancedSearchSystem.quickSearch('${term}')">${term}</span>`)
                .join('');
        } else {
            popularTags.innerHTML = '<span class="no-popular">Aucune recherche récente</span>';
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        let searchTimeout;

        // Recherche en temps réel avec debounce
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            if (query.length > 0) {
                searchTimeout = setTimeout(() => {
                    this.performSearch(query);
                }, 300);
            } else {
                this.hideAutocomplete();
                this.clearSearchResults();
            }
        });

        // Navigation au clavier
        searchInput.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Fermer l'autocomplétion en cliquant ailleurs
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target)) {
                this.hideAutocomplete();
            }
        });

        // Effacer la recherche
        const clearBtn = document.querySelector('.search-icon');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.focus();
                this.clearSearchResults();
                this.hideAutocomplete();
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K ou Cmd+K pour focus sur la recherche
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Échap pour effacer la recherche
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('searchInput');
                if (searchInput && document.activeElement === searchInput) {
                    searchInput.value = '';
                    this.clearSearchResults();
                    this.hideAutocomplete();
                }
            }
        });
    }

    performSearch(query) {
        if (!query || query.length < 2) return;

        // Afficher l'indicateur de chargement
        this.showLoadingIndicator();

        // Ajouter à l'historique
        this.addToSearchHistory(query);

        // Effectuer la recherche
        setTimeout(() => {
            this.executeSearch(query);
            this.hideLoadingIndicator();
        }, 200);
    }

    executeSearch(query) {
        // Générer des suggestions d'autocomplétion
        const suggestions = this.generateSuggestions(query);

        if (suggestions.length > 0) {
            this.showAutocomplete(suggestions);
        } else {
            this.hideAutocomplete();
        }

        // Mettre à jour les résultats de recherche
        this.updateSearchResults(query);
    }

    generateSuggestions(query) {
        if (!window.allProducts) return [];

        const suggestions = [];
        const queryLower = query.toLowerCase();

        // Suggestions de produits
        window.allProducts.forEach(product => {
            if (product.name.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    type: 'product',
                    text: product.name,
                    value: product.name,
                    product: product
                });
            }
        });

        // Suggestions de catégories
        const categories = ['men', 'women', 'accessories'];
        categories.forEach(category => {
            if (category.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    type: 'category',
                    text: `Catégorie: ${category}`,
                    value: category
                });
            }
        });

        // Suggestions de recherche récente
        this.searchHistory
            .filter(term => term.toLowerCase().includes(queryLower))
            .slice(0, 3)
            .forEach(term => {
                suggestions.push({
                    type: 'history',
                    text: term,
                    value: term
                });
            });

        return suggestions.slice(0, 8); // Maximum 8 suggestions
    }

    showAutocomplete(suggestions) {
        const container = document.getElementById('autocompleteContainer');
        if (!container) return;

        let html = '<div class="autocomplete-list">';

        suggestions.forEach((suggestion, index) => {
            const icon = this.getSuggestionIcon(suggestion.type);
            html += `
                <div class="autocomplete-item ${index === 0 ? 'selected' : ''}"
                     onclick="advancedSearchSystem.selectSuggestion('${suggestion.value}')">
                    <span class="suggestion-icon">${icon}</span>
                    <span class="suggestion-text">${suggestion.text}</span>
                    <span class="suggestion-type">${suggestion.type}</span>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
        container.style.display = 'block';
    }

    hideAutocomplete() {
        const container = document.getElementById('autocompleteContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    getSuggestionIcon(type) {
        switch (type) {
            case 'product': return '🛍️';
            case 'category': return '📁';
            case 'history': return '🕐';
            default: return '🔍';
        }
    }

    selectSuggestion(value) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = value;
            this.hideAutocomplete();
            this.performSearch(value);
            searchInput.focus();
        }
    }

    handleKeyboardNavigation(e) {
        const container = document.getElementById('autocompleteContainer');
        if (!container || container.style.display === 'none') return;

        const items = container.querySelectorAll('.autocomplete-item');
        const selectedItem = container.querySelector('.autocomplete-item.selected');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (selectedItem) {
                const nextItem = selectedItem.nextElementSibling;
                if (nextItem) {
                    selectedItem.classList.remove('selected');
                    nextItem.classList.add('selected');
                }
            } else if (items.length > 0) {
                items[0].classList.add('selected');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (selectedItem) {
                const prevItem = selectedItem.previousElementSibling;
                if (prevItem) {
                    selectedItem.classList.remove('selected');
                    prevItem.classList.add('selected');
                }
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedItem) {
                const text = selectedItem.querySelector('.suggestion-text').textContent;
                this.selectSuggestion(text);
            }
        }
    }

    updateSearchResults(query) {
        // Mettre à jour le compteur de résultats
        const resultsCount = document.getElementById('searchResultsCount');
        if (resultsCount && window.products) {
            const count = window.products.length;
            if (query && count > 0) {
                resultsCount.textContent = `${count} résultat(s) pour "${query}"`;
                resultsCount.style.display = 'block';
            } else {
                resultsCount.style.display = 'none';
            }
        }
    }

    clearSearchResults() {
        const resultsCount = document.getElementById('searchResultsCount');
        if (resultsCount) {
            resultsCount.style.display = 'none';
        }
    }

    showLoadingIndicator() {
        const loadingIndicator = document.querySelector('.search-loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
    }

    hideLoadingIndicator() {
        const loadingIndicator = document.querySelector('.search-loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }

    addToSearchHistory(query) {
        // Éviter les doublons consécutifs
        if (this.searchHistory[this.searchHistory.length - 1] !== query) {
            this.searchHistory.push(query);
            this.saveSearchData();
            this.popularSearches = this.calculatePopularSearches();
            this.updatePopularSearches();
        }
    }

    quickSearch(term) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = term;
            this.performSearch(term);
            searchInput.focus();
        }
    }

    // Recherche vocale (si supporté)
    setupVoiceSearch() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const voiceBtn = document.createElement('button');
            voiceBtn.className = 'voice-search-btn';
            voiceBtn.innerHTML = '<span class="material-icons">mic</span>';
            voiceBtn.onclick = () => this.startVoiceSearch();

            const searchBar = document.querySelector('.search-bar');
            if (searchBar) {
                searchBar.appendChild(voiceBtn);
            }
        }
    }

    startVoiceSearch() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'fr-FR';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = transcript;
                this.performSearch(transcript);
            }
        };

        recognition.start();
    }

    // Méthodes publiques
    getSearchHistory() {
        return this.searchHistory;
    }

    getPopularSearches() {
        return this.popularSearches;
    }

    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchData();
        this.updatePopularSearches();
        this.showNotification('Historique de recherche effacé', 'info');
    }
}

// CSS pour le système de recherche avancée
const advancedSearchCSS = `
<style>
/* Autocomplete Container */
.autocomplete-container {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    z-index: 1000;
    display: none;
    max-height: 300px;
    overflow-y: auto;
}

.autocomplete-list {
    padding: 8px 0;
}

.autocomplete-item {
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: background-color 0.2s ease;
}

.autocomplete-item:hover,
.autocomplete-item.selected {
    background-color: #f8f9fa;
}

.suggestion-icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
}

.suggestion-text {
    flex: 1;
    font-weight: 500;
}

.suggestion-type {
    font-size: 12px;
    color: #666;
    background: #e0e0e0;
    padding: 2px 8px;
    border-radius: 12px;
    text-transform: capitalize;
}

/* Search Loading Indicator */
.search-loading {
    position: absolute;
    right: 45px;
    top: 50%;
    transform: translateY(-50%);
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e0e0e0;
    border-top: 2px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Search Results Count */
.search-results-count {
    position: absolute;
    right: 45px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: #666;
    background: white;
    padding: 4px 8px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: none;
    white-space: nowrap;
}

/* Quick Search Section */
.quick-search-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e0e0e0;
}

.quick-search-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.quick-search-btn {
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    color: #333;
    border: 1px solid #ddd;
    padding: 10px 16px;
    border-radius: 25px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.quick-search-btn:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.quick-search-btn .material-icons {
    font-size: 18px;
}

/* Popular Searches */
.popular-searches {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.popular-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
}

.popular-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.popular-tag {
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.popular-tag:hover {
    background: #1976d2;
    color: white;
    transform: translateY(-1px);
}

.no-popular {
    color: #999;
    font-style: italic;
}

/* Voice Search Button */
.voice-search-btn {
    position: absolute;
    right: 70px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #667eea;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.voice-search-btn:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-50%) scale(1.1);
}

.voice-search-btn .material-icons {
    font-size: 20px;
}

/* Animations */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
    .quick-search-buttons {
        justify-content: center;
    }

    .quick-search-btn {
        padding: 8px 12px;
        font-size: 12px;
    }

    .autocomplete-container {
        left: 10px;
        right: 10px;
    }

    .search-results-count {
        display: none;
    }

    .voice-search-btn {
        display: none;
    }
}

/* Focus styles for accessibility */
.autocomplete-item:focus,
.quick-search-btn:focus,
.popular-tag:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .autocomplete-item:hover,
    .autocomplete-item.selected {
        background-color: #000;
        color: #fff;
    }

    .popular-tag:hover {
        background: #000;
        color: #fff;
    }
}
</style>
`;

// Ajouter le CSS au document
document.addEventListener('DOMContentLoaded', function() {
    document.head.insertAdjacentHTML('beforeend', advancedSearchCSS);
});

// Initialiser le système de recherche avancée
document.addEventListener('DOMContentLoaded', function() {
    window.advancedSearchSystem = new AdvancedSearchSystem();
});
