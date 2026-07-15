
const DEFAULT_AVAILABLE_MAPS = [
    // Beginner (Easy)
    { name: 'A Learnable Africa - Identify Every Country', difficulty: 'easy' },
    { name: 'A Learnable Asia - Identify Every Country', difficulty: 'easy' },
    { name: 'A Learnable Czechia/Slovakia GHGuessing', difficulty: 'easy' },
    { name: 'A Learnable Europe - Identify Every Country', difficulty: 'easy' },
    { name: 'A Learnable Google Car - Camera Generations', difficulty: 'easy' },
    { name: 'A Learnable Iceland Meta', difficulty: 'easy' },
    { name: 'A Learnable License Plates', difficulty: 'easy' },
    { name: 'A Learnable Meta - Hungary', difficulty: 'easy' },
    { name: 'A Learnable Meta - Indian Languages', difficulty: 'easy' },
    { name: 'A Learnable Meta - The Baltics', difficulty: 'easy' },
    { name: 'A Learnable Meta Africa - Beginner', difficulty: 'easy' },
    { name: 'A Learnable Meta America - Bollards (All)', difficulty: 'easy' },
    { name: 'A Learnable Meta Antarctica', difficulty: 'easy' },
    { name: 'A Learnable Meta Asia- Bollards (All)', difficulty: 'easy' },
    { name: 'A Learnable Meta Europe', difficulty: 'easy' },
    { name: 'A Learnable Meta Europe - Bollards (All)', difficulty: 'easy' },
    { name: 'A Learnable Meta Guardrails', difficulty: 'easy' },
    { name: 'A Learnable Meta Latin America - Beginner', difficulty: 'easy' },
    { name: 'A Learnable Meta South East Asia - Beginner', difficulty: 'easy' },
    { name: 'A Learnable Meta Spain', difficulty: 'easy' },
    { name: 'A Learnable Meta World - Basics', difficulty: 'easy' },
    { name: 'A Learnable Meta World - Beginner', difficulty: 'easy' },
    { name: 'A Learnable Meta World - Bollards', difficulty: 'easy' },
    { name: 'A Learnable Meta World - Google Cars - Basics', difficulty: 'easy' },
    { name: 'A Learnable Meta World - Google Cars - Beginner', difficulty: 'easy' },
    { name: 'A Learnable Meta World - Poles - Beginner', difficulty: 'easy' },
    { name: 'A Learnable Meta World - Stop Signs', difficulty: 'easy' },
    { name: 'A Learnable North & East Europe - Identify Every Country', difficulty: 'easy' },
    { name: 'A Learnable North & West Asia - Identify Every Country', difficulty: 'easy' },
    { name: 'A Learnable North America - Identify Every Country', difficulty: 'easy' },
    { name: 'A Learnable Oceania - Identify Every Country', difficulty: 'easy' },
    { name: 'A Learnable South & East Asia - Identify Every Country', difficulty: 'easy' },
    { name: 'A Learnable South & West Europe - Identify Every Country', difficulty: 'easy' },
    { name: 'A Learnable South America - Identify Every Country', difficulty: 'easy' },
    { name: 'A Learnable World - Architecture (Beginner)', difficulty: 'easy' },
    { name: 'A Learnable World - Chevrons', difficulty: 'easy' },
    { name: 'A Learnable World - Chevrons (Beginner)', difficulty: 'easy' },
    { name: 'A Learnable World - Roadlines (Beginner)', difficulty: 'easy' },
    { name: 'A learnable Meta - Canada Area Codes', difficulty: 'easy' },
    { name: 'A learnable Meta - Greenland Beginner', difficulty: 'easy' },
    { name: 'ALM -  Unique & Shared European & Slavic Letters', difficulty: 'easy' },
    { name: 'ALM - Pedestrian Crosswalk Signs (Europe)', difficulty: 'easy' },
    { name: 'ALM - Unique European & Slavic Letters', difficulty: 'easy' },
    { name: 'Brazil Phone Codes - chrispunkt´s Learnable', difficulty: 'easy' },
    { name: 'Greenland (Major) - BabeLincoln\'s Learnable', difficulty: 'easy' },
    { name: 'Japan - Learnable Guy-Wires', difficulty: 'easy' },
    { name: 'Japan Phone Codes - chrispunkt´s Learnable', difficulty: 'easy' },
    { name: 'Learnable island cars', difficulty: 'easy' },
    { name: 'Romance Languages - BabeLincoln\'s Learnable', difficulty: 'easy' },
    { name: 'Turkey - BabeLincoln\'s Learnable', difficulty: 'easy' },

    // Intermediate (Medium)
    { name: 'A Learnable Anglo-America', difficulty: 'medium' },
    { name: 'A Learnable Argentina', difficulty: 'medium' },
    { name: 'A Learnable Argentina - Landscape', difficulty: 'medium' },
    { name: 'A Learnable Austria - RegionGHGuessing', difficulty: 'medium' },
    { name: 'A Learnable Botswana - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable Brazil', difficulty: 'medium' },
    { name: 'A Learnable Bulgaria', difficulty: 'medium' },
    { name: 'A Learnable Canada', difficulty: 'medium' },
    { name: 'A Learnable Canada - License Plates', difficulty: 'medium' },
    { name: 'A Learnable Chile', difficulty: 'medium' },
    { name: 'A Learnable Croatia', difficulty: 'medium' },
    { name: 'A Learnable DACH Region - RegionGHGuessing', difficulty: 'medium' },
    { name: 'A Learnable Dominican Republic', difficulty: 'medium' },
    { name: 'A Learnable Ecuador', difficulty: 'medium' },
    { name: 'A Learnable Eswatini - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable Europe - Cities', difficulty: 'medium' },
    { name: 'A Learnable France – No car or camera metas', difficulty: 'medium' },
    { name: 'A Learnable Georgia Car Meta', difficulty: 'medium' },
    { name: 'A Learnable Germany - RegionGHGuessing', difficulty: 'medium' },
    { name: 'A Learnable Ghana', difficulty: 'medium' },
    { name: 'A Learnable Ghana - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable Greece - RegionGHGuessing', difficulty: 'medium' },
    { name: 'A Learnable Guatemala', difficulty: 'medium' },
    { name: 'A Learnable Indonesia - Intermediate', difficulty: 'medium' },
    { name: 'A Learnable Israel / West Bank - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable Italy - RegionGHGuessing', difficulty: 'medium' },
    { name: 'A Learnable Japan Meta - Transformers', difficulty: 'medium' },
    { name: 'A Learnable Jordan', difficulty: 'medium' },
    { name: 'A Learnable Kenya - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable Laos', difficulty: 'medium' },
    { name: 'A Learnable Lesotho - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable Madagascar', difficulty: 'medium' },
    { name: 'A Learnable Malaysia', difficulty: 'medium' },
    { name: 'A Learnable Meta - Indonesia', difficulty: 'medium' },
    { name: 'A Learnable Meta - Netherlands', difficulty: 'medium' },
    { name: 'A Learnable Meta - Nordic Buses', difficulty: 'medium' },
    { name: 'A Learnable Meta - Swedish Bus Stops', difficulty: 'medium' },
    { name: 'A Learnable Meta - USA State Highway Markers', difficulty: 'medium' },
    { name: 'A Learnable Meta Argentina', difficulty: 'medium' },
    { name: 'A Learnable Meta Australia', difficulty: 'medium' },
    { name: 'A Learnable Meta Bhutan', difficulty: 'medium' },
    { name: 'A Learnable Meta Brazil Poles', difficulty: 'medium' },
    { name: 'A Learnable Meta Germany', difficulty: 'medium' },
    { name: 'A Learnable Meta India', difficulty: 'medium' },
    { name: 'A Learnable Meta Japan', difficulty: 'medium' },
    { name: 'A Learnable Meta Japan - Plates', difficulty: 'medium' },
    { name: 'A Learnable Meta Kyrgyzstan', difficulty: 'medium' },
    { name: 'A Learnable Meta Latin America - Intermediate', difficulty: 'medium' },
    { name: 'A Learnable Meta Serbia', difficulty: 'medium' },
    { name: 'A Learnable Meta Vietnam', difficulty: 'medium' },
    { name: 'A Learnable Meta Vietnam Poles', difficulty: 'medium' },
    { name: 'A Learnable Meta World', difficulty: 'medium' },
    { name: 'A Learnable Meta World - Bollards (All)', difficulty: 'medium' },
    { name: 'A Learnable Meta World - Intermediate', difficulty: 'medium' },
    { name: 'A Learnable Mexican Area Codes', difficulty: 'medium' },
    { name: 'A Learnable Mexico', difficulty: 'medium' },
    { name: 'A Learnable Mexico - License Plates', difficulty: 'medium' },
    { name: 'A Learnable Mongolia Intermediate', difficulty: 'medium' },
    { name: 'A Learnable Montenegro', difficulty: 'medium' },
    { name: 'A Learnable Nepal', difficulty: 'medium' },
    { name: 'A Learnable Nigeria - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable Norway', difficulty: 'medium' },
    { name: 'A Learnable Norway - Landscape', difficulty: 'medium' },
    { name: 'A Learnable Oman', difficulty: 'medium' },
    { name: 'A Learnable Philippines', difficulty: 'medium' },
    { name: 'A Learnable Philippines - Motorcycle License Plate', difficulty: 'medium' },
    { name: 'A Learnable Qatar', difficulty: 'medium' },
    { name: 'A Learnable Reunion', difficulty: 'medium' },
    { name: 'A Learnable Romania', difficulty: 'medium' },
    { name: 'A Learnable Russia - No Car Metas - 1', difficulty: 'medium' },
    { name: 'A Learnable Russia - No Car Metas - 2', difficulty: 'medium' },
    { name: 'A Learnable Russia - No Car Metas - 3', difficulty: 'medium' },
    { name: 'A Learnable Russia - No Car Metas - All', difficulty: 'medium' },
    { name: 'A Learnable Rwanda - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable Senegal - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable Slovakia - RegionGHGuessing', difficulty: 'medium' },
    { name: 'A Learnable South Africa - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable South Korea', difficulty: 'medium' },
    { name: 'A Learnable Sweden', difficulty: 'medium' },
    { name: 'A Learnable Sweden - Landscape', difficulty: 'medium' },
    { name: 'A Learnable Switzerland - RegionGHGuessing', difficulty: 'medium' },
    { name: 'A Learnable Taiwan', difficulty: 'medium' },
    { name: 'A Learnable Thailand - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable Tunisia - Regionguessing', difficulty: 'medium' },
    { name: 'A Learnable USA - All', difficulty: 'medium' },
    { name: 'A Learnable USA - Intermediate', difficulty: 'medium' },
    { name: 'A Learnable USA - License Plates', difficulty: 'medium' },
    { name: 'A Learnable USA - Novice', difficulty: 'medium' },
    { name: 'A Learnable Ukraine', difficulty: 'medium' },
    { name: 'A Learnable United Kingdom', difficulty: 'medium' },
    { name: 'A Learnable Uruguay', difficulty: 'medium' },
    { name: 'A Learnable Vietnam', difficulty: 'medium' },
    { name: 'A Learnable Vietnam PlaceName Prefixes', difficulty: 'medium' },
    { name: 'A Learnable World - Architecture', difficulty: 'medium' },
    { name: 'A Learnable World - Roadlines', difficulty: 'medium' },
    { name: 'A Major Bajor Alaska', difficulty: 'medium' },
    { name: 'A Major Bajor Argentina', difficulty: 'medium' },
    { name: 'A Major Bajor Australia', difficulty: 'medium' },
    { name: 'A Major Bajor Chile', difficulty: 'medium' },
    { name: 'A Major Bajor Germany', difficulty: 'medium' },
    { name: 'A Major Bajor Indonesia', difficulty: 'medium' },
    { name: 'A Major Bajor Japan', difficulty: 'medium' },
    { name: 'A Major Bajor Norway', difficulty: 'medium' },
    { name: 'A Major Bajor Peru', difficulty: 'medium' },
    { name: 'A Major Bajor Turkey', difficulty: 'medium' },
    { name: 'A Major Bajor USA', difficulty: 'medium' },
    { name: 'A RMRG Learnable Bangladesh - Regionguessing', difficulty: 'medium' },
    { name: 'A RMRG Learnable Indonesia - Java', difficulty: 'medium' },
    { name: 'A RMRG Learnable Indonesia - Kalimantan', difficulty: 'medium' },
    { name: 'A RMRG Learnable Indonesia - Nusa Tenggara', difficulty: 'medium' },
    { name: 'A learnable Philippines trikes', difficulty: 'medium' },
    { name: 'ALM - Community road in Spain', difficulty: 'medium' },
    { name: 'ALM - South Africa', difficulty: 'medium' },
    { name: 'ALM Bangladesh', difficulty: 'medium' },
    { name: 'ALM Russia Car Metas', difficulty: 'medium' },
    { name: 'America Phone Area Codes - LVL 1', difficulty: 'medium' },
    { name: 'Area Codes (World - ALM)', difficulty: 'medium' },
    { name: 'Argentina - BabeLincoln\'s Learnable', difficulty: 'medium' },
    { name: 'Australia Licence Plate training', difficulty: 'medium' },
    { name: 'Indian Infrastructure Guide - Polemeta', difficulty: 'medium' },
    { name: 'Intro to Kazakhstan (A Learnable Meta)', difficulty: 'medium' },
    { name: 'Learnable bus stop signs', difficulty: 'medium' },
    { name: 'National Parks of Chile (Major Bajor Learnable)', difficulty: 'medium' },
    { name: 'Plonk It - Egypt', difficulty: 'medium' },
    { name: 'Plonk It Finland', difficulty: 'medium' },
    { name: 'Regionguessing Indonesia By Architecture', difficulty: 'medium' },
    { name: 'Ryan\'s Learnable Costa Rica Poles', difficulty: 'medium' },
    { name: 'South Africa Phone Codes - chrispunkt´s Learnable', difficulty: 'medium' },
    { name: 'Spanish Road Codes', difficulty: 'medium' },
    { name: 'USA Bollards / Reflectors', difficulty: 'medium' },
    { name: 'USA Windshield stickers', difficulty: 'medium' },
    { name: 'Ultimate Kazakhstan - Clue Collector', difficulty: 'medium' },
    { name: 'Ultimate Kazakhstan - Rookie Explorer', difficulty: 'medium' },

    // Advanced (Hard)
    { name: 'A Balanced Major Bajor World', difficulty: 'hard' },
    { name: 'A Comprehensive Canada - Cities', difficulty: 'hard' },
    { name: 'A Comprehensive Canada - Regionguessing', difficulty: 'hard' },
    { name: 'A Learnable Africa - Regionguessing', difficulty: 'hard' },
    { name: 'A Learnable Bangladesh - real-world metas only', difficulty: 'hard' },
    { name: 'A Learnable Botswana', difficulty: 'hard' },
    { name: 'A Learnable Cambodia - Advanced', difficulty: 'hard' },
    { name: 'A Learnable Chile', difficulty: 'hard' },
    { name: 'A Learnable Ghana - Advanced', difficulty: 'hard' },
    { name: 'A Learnable Japan - Advanced', difficulty: 'hard' },
    { name: 'A Learnable Japan Advanced Meta', difficulty: 'hard' },
    { name: 'A Learnable Japan Prefecture Kanji', difficulty: 'hard' },
    { name: 'A Learnable Kazakhstan - Advanced', difficulty: 'hard' },
    { name: 'A Learnable Kyrgyzstan Roads', difficulty: 'hard' },
    { name: 'A Learnable Meta - Philippines Provinces', difficulty: 'hard' },
    { name: 'A Learnable Meta All Poles', difficulty: 'hard' },
    { name: 'A Learnable Meta Brazil - Vegetation', difficulty: 'hard' },
    { name: 'A Learnable Meta Peru', difficulty: 'hard' },
    { name: 'A Learnable Meta Russia Cars (Gen 3)', difficulty: 'hard' },
    { name: 'A Learnable Mongolia - Advanced', difficulty: 'hard' },
    { name: 'A Learnable Namibia - Advanced', difficulty: 'hard' },
    { name: 'A Learnable New Zealand', difficulty: 'hard' },
    { name: 'A Learnable Peru', difficulty: 'hard' },
    { name: 'A Learnable Peru: Cities', difficulty: 'hard' },
    { name: 'A Learnable Peru: Coastal', difficulty: 'hard' },
    { name: 'A Learnable Peru: Highlands', difficulty: 'hard' },
    { name: 'A Learnable Peru: Jungle', difficulty: 'hard' },
    { name: 'A Learnable Peru: Poles', difficulty: 'hard' },
    { name: 'A Learnable Peru: Political Logos', difficulty: 'hard' },
    { name: 'A Learnable Peru: Roads', difficulty: 'hard' },
    { name: 'A Learnable Plant World', difficulty: 'hard' },
    { name: 'A Learnable Plant World - Cacti', difficulty: 'hard' },
    { name: 'A Learnable Plant World - Conifers', difficulty: 'hard' },
    { name: 'A Learnable Plant World - Palms', difficulty: 'hard' },
    { name: 'A Learnable Russia', difficulty: 'hard' },
    { name: 'A Learnable Russia+', difficulty: 'hard' },
    { name: 'A Learnable Russian Coverage (Gen 4)', difficulty: 'hard' },
    { name: 'A Learnable Uganda', difficulty: 'hard' },
    { name: 'A Learnable World - Identify Every Country', difficulty: 'hard' },
    { name: 'A Major Bajor American Samoa', difficulty: 'hard' },
    { name: 'A Major Bajor Brazil', difficulty: 'hard' },
    { name: 'A Major Bajor Colombia', difficulty: 'hard' },
    { name: 'A Major Bajor France', difficulty: 'hard' },
    { name: 'A Major Bajor Hawaii', difficulty: 'hard' },
    { name: 'A Major Bajor India', difficulty: 'hard' },
    { name: 'A Major Bajor India - Himalayan Conifers', difficulty: 'hard' },
    { name: 'A Major Bajor India - Landscape', difficulty: 'hard' },
    { name: 'A Major Bajor Mexico', difficulty: 'hard' },
    { name: 'A Major Bajor Oman', difficulty: 'hard' },
    { name: 'A Major Bajor Philippines', difficulty: 'hard' },
    { name: 'A Major Bajor Smallcam India', difficulty: 'hard' },
    { name: 'A Major Bajor World', difficulty: 'hard' },
    { name: 'A Major Bajor World - Agriculture', difficulty: 'hard' },
    { name: 'A Major Bajor World - Architecture', difficulty: 'hard' },
    { name: 'A Major Bajor World - Car Meta', difficulty: 'hard' },
    { name: 'A Major Bajor World - Coverage Meta', difficulty: 'hard' },
    { name: 'A Major Bajor World - Infrastructure', difficulty: 'hard' },
    { name: 'A Major Bajor World - Landscape', difficulty: 'hard' },
    { name: 'A Major Bajor World - Language', difficulty: 'hard' },
    { name: 'A Major Bajor World - Meta Clues', difficulty: 'hard' },
    { name: 'A Major Bajor World - Trekkers', difficulty: 'hard' },
    { name: 'A Major Bajor World - Vegetation', difficulty: 'hard' },
    { name: 'A RMRG Learnable - Turkey Regionguessing', difficulty: 'hard' },
    { name: 'A RMRG Learnable Indonesia - Sulawesi', difficulty: 'hard' },
    { name: 'A RMRG Learnable Regionguessing Romania', difficulty: 'hard' },
    { name: 'A Solved Botswana (Learnable Meta)', difficulty: 'hard' },
    { name: 'A Solved North Macedonia (Learnable Meta)', difficulty: 'hard' },
    { name: 'ALM - African Spotlights', difficulty: 'hard' },
    { name: 'ALM - Indonesia (All) Kabupaten', difficulty: 'hard' },
    { name: 'ALM - Indonesia (Java) Kabupaten', difficulty: 'hard' },
    { name: 'ALM - Indonesia (Kalimantan) Kabupaten', difficulty: 'hard' },
    { name: 'ALM - Indonesia (Lesser Sunda + Maluku) Kabupaten', difficulty: 'hard' },
    { name: 'ALM - Indonesia (Sulawesi) Kabupaten', difficulty: 'hard' },
    { name: 'ALM - Indonesia (Sumatra) Kabupaten', difficulty: 'hard' },
    { name: 'ALM - Kenya Counties', difficulty: 'hard' },
    { name: 'ALM - Nigeria States', difficulty: 'hard' },
    { name: 'ALM - Vegetación - USA', difficulty: 'hard' },
    { name: 'ALM Australia Roads', difficulty: 'hard' },
    { name: 'An Extreme Patagonia (Learnable Argentina)', difficulty: 'hard' },
    { name: 'Learnable Colombia', difficulty: 'hard' },
    { name: 'Learnable Landscapes', difficulty: 'hard' },
    { name: 'Learnable Mongolia Gen 4 car meta', difficulty: 'hard' },
    { name: 'Learnable Panama', difficulty: 'hard' },
    { name: 'Learnable Roads of Bolivia', difficulty: 'hard' },
    { name: 'Learnable Russian City and Town Names', difficulty: 'hard' },
    { name: 'Learnable roads of Kazakhstan', difficulty: 'hard' },
    { name: 'Practice Map', difficulty: 'hard' },
    { name: 'USA - Area Codes', difficulty: 'hard' },
    { name: 'USA License plates.', difficulty: 'hard' },
    { name: 'USA USA', difficulty: 'hard' },
    { name: 'Ultimate Kazakhstan - Geo Chameleon', difficulty: 'hard' },
    { name: 'Ultimate Kazakhstan - Pixel Detective', difficulty: 'hard' },
    { name: 'Unique Roads of Brazil', difficulty: 'hard' }
];

class GeoGuessrTracker {
    constructor() {
        this.maps = this.loadMaps();
        this.availableMaps = this.loadAvailableMaps();
        if (this.availableMaps.length === 0) {
            this.availableMaps = DEFAULT_AVAILABLE_MAPS;
            this.saveAvailableMaps();
        }
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.availableSearch = '';
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.renderAvailableMaps();
        this.renderMaps();
        this.updateStats();
    }

    cacheElements() {
        this.mapsList = document.getElementById('mapsList');
        this.availableMapsList = document.getElementById('availableMapsList');
        this.availableSearchInput = document.getElementById('availableSearch');

        this.totalMapsEl = document.getElementById('totalMaps');
        this.easyCountEl = document.getElementById('easyCount');
        this.mediumCountEl = document.getElementById('mediumCount');
        this.hardCountEl = document.getElementById('hardCount');
        this.streakDaysEl = document.getElementById('streakDays');

        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.searchInput = document.getElementById('searchInput');
        this.scoreAvgEl = document.getElementById('scoreAvg');

        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.importFile = document.getElementById('importFile');
    }

    setupEventListeners() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.availableSearchInput.addEventListener('input', (e) => this.handleAvailableSearch(e));

        this.exportBtn.addEventListener('click', () => this.exportData());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.handleImport(e));
        this.clearBtn.addEventListener('click', () => this.clearAllData());
    }

    markMapComplete(availableMapName, difficulty) {
        const id = Date.now();
        const today = new Date().toISOString().split('T')[0];

        const mapData = {
            id: id,
            name: availableMapName,
            difficulty: difficulty,
            score: null,
            date: today,
            createdAt: new Date().toISOString()
        };

        this.maps.unshift(mapData);
        this.saveMaps();
        this.renderAvailableMaps();
        this.renderMaps();
        this.updateStats();
    }

    unmarkMapComplete(mapName) {
        this.maps = this.maps.filter(m => m.name !== mapName);
        this.saveMaps();
        this.renderAvailableMaps();
        this.renderMaps();
        this.updateStats();
    }

    getCompletedMapNames() {
        return new Set(this.maps.map(m => m.name));
    }

    renderAvailableMaps() {
        const completedNames = this.getCompletedMapNames();
        let filtered = this.availableMaps;

        if (this.availableSearch) {
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(this.availableSearch.toLowerCase())
            );
        }

        if (filtered.length === 0) {
            this.availableMapsList.innerHTML = '<div class="empty-state"><p>No maps found</p></div>';
            return;
        }

        this.availableMapsList.innerHTML = filtered.map(map => {
            const isCompleted = completedNames.has(map.name);
            return `
                <div class="available-map-card ${isCompleted ? 'completed' : ''}">
                    <div class="available-map-header">
                        <div class="available-map-name">${this.escapeHtml(map.name)}</div>
                        <div class="available-map-difficulty ${map.difficulty}">
                            ${this.getDifficultyLabel(map.difficulty)}
                        </div>
                    </div>
                    <button class="mark-button ${isCompleted ? 'completed' : ''}"
                        onclick="tracker.${isCompleted ? 'unmarkMapComplete' : 'markMapComplete'}('${this.escapeAttr(map.name)}', '${map.difficulty}')">
                        ${isCompleted ? '✅ Completed' : '➕ Mark completed'}
                    </button>
                </div>
            `;
        }).join('');
    }

    handleAvailableSearch(e) {
        this.availableSearch = e.target.value;
        this.renderAvailableMaps();
    }

    handleFilterClick(e) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderMaps();
    }

    handleSearch(e) {
        this.currentSearch = e.target.value.toLowerCase();
        this.renderMaps();
    }

    getFilteredMaps() {
        let filtered = this.maps;

        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(m => m.difficulty === this.currentFilter);
        }

        if (this.currentSearch) {
            filtered = filtered.filter(m => m.name.toLowerCase().includes(this.currentSearch));
        }

        return filtered;
    }

    renderMaps() {
        const filteredMaps = this.getFilteredMaps();

        if (filteredMaps.length === 0) {
            this.mapsList.innerHTML = '<div class="empty-state"><p>No completed maps</p></div>';
            return;
        }

        this.mapsList.innerHTML = filteredMaps.map(map => `
            <div class="map-card ${map.difficulty}">
                <div class="map-header">
                    <h3 class="map-name">${this.escapeHtml(map.name)}</h3>
                    <span class="difficulty-badge ${map.difficulty}">${this.getDifficultyLabel(map.difficulty)}</span>
                </div>
                <div class="map-info">
                    ${map.score !== null ? `
                        <div class="info-row">
                            <span class="info-label">Score</span>
                            <span class="info-value score-value">${map.score.toLocaleString()}</span>
                        </div>
                    ` : ''}
                    <div class="info-row">
                        <span class="info-label">Date</span>
                        <span class="info-value">${this.formatDate(map.date)}</span>
                    </div>
                </div>
                <div class="map-actions">
                    <button class="btn-small btn-edit" onclick="tracker.editMap(${map.id})">✏️ Edit score</button>
                    <button class="btn-small btn-delete" onclick="tracker.deleteMap(${map.id})">🗑️ Unmark</button>
                </div>
            </div>
        `).join('');
    }

    editMap(id) {
        const map = this.getMapById(id);
        if (!map) return;

        const score = prompt('Enter score (0-25000):', map.score || '');
        if (score !== null) {
            map.score = score ? parseInt(score) : null;
            this.saveMaps();
            this.renderMaps();
            this.updateStats();
        }
    }

    deleteMap(id) {
        const map = this.getMapById(id);
        if (!map) return;

        if (confirm(`Unmark "${map.name}"?`)) {
            this.maps = this.maps.filter(m => m.id !== id);
            this.saveMaps();
            this.renderAvailableMaps();
            this.renderMaps();
            this.updateStats();
        }
    }

    updateStats() {
        const total = this.maps.length;
        const easy = this.maps.filter(m => m.difficulty === 'easy').length;
        const medium = this.maps.filter(m => m.difficulty === 'medium').length;
        const hard = this.maps.filter(m => m.difficulty === 'hard').length;

        this.totalMapsEl.textContent = total;
        this.easyCountEl.textContent = easy;
        this.mediumCountEl.textContent = medium;
        this.hardCountEl.textContent = hard;

        this.updateStreak();

        const scores = this.maps
            .filter(m => m.score !== null)
            .map(m => m.score);
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
        this.scoreAvgEl.textContent = avgScore.toLocaleString();

        this.updateDifficultyChart(easy, medium, hard);
    }

    updateStreak() {
        if (this.maps.length === 0) {
            this.streakDaysEl.textContent = '0';
            return;
        }

        let streak = 0;
        const today = new Date();
        const sortedByDate = [...this.maps].sort((a, b) => new Date(b.date) - new Date(a.date));

        for (let i = 0; i < sortedByDate.length; i++) {
            const mapDate = new Date(sortedByDate[i].date);
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);

            if (mapDate.toDateString() === expectedDate.toDateString()) {
                streak++;
            } else {
                break;
            }
        }

        this.streakDaysEl.textContent = streak;
    }

    updateDifficultyChart(easy, medium, hard) {
        const total = easy + medium + hard;
        const container = document.getElementById('difficultyChart');

        if (total === 0) {
            container.innerHTML = '<div class="chart-title">By difficulty</div><p style="text-align: center; color: var(--text-secondary);">No data</p>';
            return;
        }

        const easyPercent = (easy / total) * 100;
        const mediumPercent = (medium / total) * 100;
        const hardPercent = (hard / total) * 100;

        container.innerHTML = `
            <div class="chart-title">By difficulty</div>
            <div class="difficulty-bars">
                ${easy > 0 ? `
                    <div class="bar-item">
                        <div class="bar-label">Easy</div>
                        <div class="bar-track">
                            <div class="bar-fill easy" style="width: ${easyPercent}%">${easy}</div>
                        </div>
                    </div>
                ` : ''}
                ${medium > 0 ? `
                    <div class="bar-item">
                        <div class="bar-label">Medium</div>
                        <div class="bar-track">
                            <div class="bar-fill medium" style="width: ${mediumPercent}%">${medium}</div>
                        </div>
                    </div>
                ` : ''}
                ${hard > 0 ? `
                    <div class="bar-item">
                        <div class="bar-label">Hard</div>
                        <div class="bar-track">
                            <div class="bar-fill hard" style="width: ${hardPercent}%">${hard}</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    exportData() {
        const dataStr = JSON.stringify(this.maps, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `geoguessr-tracker-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    if (confirm(`Merge ${imported.length} map(s)?`)) {
                        this.maps = [...this.maps, ...imported];
                        const seen = new Set();
                        this.maps = this.maps.filter(m => {
                            if (seen.has(m.id)) return false;
                            seen.add(m.id);
                            return true;
                        });
                        this.saveMaps();
                        this.renderAvailableMaps();
                        this.renderMaps();
                        this.updateStats();
                        alert('Data imported successfully!');
                    }
                }
            } catch (error) {
                alert('Error importing: ' + error.message);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    clearAllData() {
        if (confirm('Delete ALL maps?')) {
            if (confirm('Are you sure? This cannot be undone.')) {
                this.maps = [];
                this.saveMaps();
                this.renderAvailableMaps();
                this.renderMaps();
                this.updateStats();
            }
        }
    }

    getMapById(id) {
        return this.maps.find(m => m.id === id);
    }

    formatDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getDifficultyLabel(difficulty) {
        const labels = {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard'
        };
        return labels[difficulty] || difficulty;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeAttr(text) {
        return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    saveMaps() {
        localStorage.setItem('geoguessrMaps', JSON.stringify(this.maps));
    }

    loadMaps() {
        const stored = localStorage.getItem('geoguessrMaps');
        return stored ? JSON.parse(stored) : [];
    }

    saveAvailableMaps() {
        localStorage.setItem('geoguessrAvailableMaps', JSON.stringify(this.availableMaps));
    }

    loadAvailableMaps() {
        const stored = localStorage.getItem('geoguessrAvailableMaps');
        return stored ? JSON.parse(stored) : [];
    }
}

let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new GeoGuessrTracker();
});
