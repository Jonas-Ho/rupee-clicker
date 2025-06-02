let rupees = 0;
let rupeesPerClick = 1;
let dailyBonusStreak = 0;
let lastClaimedDate = null;
let prestigePoints = 0;
let prestigeMultiplier = 1;
let activePowerUps = [];
let activeEvents = [];
let hiredFigures = [];
let stocksUpdateCount = 0;
let currentAccount = "Guest";
let currentRegion = "north";
let rupeeHistory = [];
let uiState = {};
let rupeesChart = null;

const regions = {
    north: {
        name: "North India",
        buildings: {
            teaStall: { name: "Tea Stall", level: 0, baseCost: 10, rps: 1, rpc: 0, icon: "☕" },
            spiceFarm: { name: "Spice Farm", level: 0, baseCost: 300, rps: 5, rpc: 1, icon: "🌶️" },
            textileFactory: { name: "Textile Factory", level: 0, baseCost: 10000, rps: 20, rpc: 5, icon: "👕" }
        }
    },
    south: {
        name: "South India",
        buildings: {
            itHub: { name: "IT Hub", level: 0, baseCost: 50000, rps: 50, rpc: 10, icon: "💻" },
            templeComplex: { name: "Temple Complex", level: 0, baseCost: 25000, rps: 30, rpc: 5, icon: "🛕" }
        }
    },
    east: {
        name: "East India",
        buildings: {
            steelPlant: { name: "Steel Plant", level: 0, baseCost: 2e6, rps: 400, rpc: 50, icon: "🏭" },
            teaEstate: { name: "Tea Estate", level: 0, baseCost: 75000, rps: 100, rpc: 20, icon: "🍃" }
        }
    },
    west: {
        name: "West India",
        buildings: {
            bollywood: { name: "Bollywood Studio", level: 0, baseCost: 1e8, rps: 750, rpc: 200, icon: "🎬" },
            port: { name: "International Port", level: 0, baseCost: 500000, rps: 300, rpc: 100, icon: "⚓" }
        }
    },
    central: {
        name: "Central India",
        buildings: {
            coalMine: { name: "Coal Mine", level: 0, baseCost: 1e5, rps: 150, rpc: 30, icon: "⛏️" },
            solarFarm: { name: "Solar Farm", level: 0, baseCost: 3e5, rps: 200, rpc: 50, icon: "☀️" }
        }
    },
    northeast: {
        name: "Northeast",
        buildings: {
            teaResearch: { name: "Tea Research Center", level: 0, baseCost: 5e4, rps: 75, rpc: 15, icon: "🔬" },
            ecoTourism: { name: "Eco Tourism", level: 0, baseCost: 1e5, rps: 100, rpc: 25, icon: "🌿" }
        }
    }
};

const historicalFigures = [
    { name: "Ratan Tata", cost: 500000, effect: { factoryDiscount: 0.2 }, description: "Industrialist: Factories cost 20% less", icon: "👔" },
    { name: "APJ Abdul Kalam", cost: 1000000, effect: { techMultiplier: 1.5 }, description: "Missile Man: Tech buildings 50% stronger", icon: "🚀" },
    { name: "Gandhi", cost: 250000, effect: { peacefulMultiplier: 1.1 }, description: "Father of Nation: Peaceful income +10%", icon: "👴" },
    { name: "Indira Gandhi", cost: 750000, effect: { financialMultiplier: 1.25 }, description: "Iron Lady: Financial buildings 25% stronger", icon: "👩" }
];

const upgrades = {
    clickPower: { name: "Better Clicks", icon: "👆", description: "Improve your clicking power", baseCost: 100, level: 0, effect: { rpc: 5 }, affectedBy: ["Ratan Tata"] },
    autoClicker: { name: "Auto Clicker", icon: "🤖", description: "Automatically clicks for you", baseCost: 500, level: 0, effect: { rps: 1 }, affectedBy: ["APJ Abdul Kalam"] },
    bankInterest: { name: "Bank Interest", icon: "🏦", description: "Earn interest on your rupees", baseCost: 1000, level: 0, effect: { rps: 5 }, affectedBy: ["Indira Gandhi"] },
    spiceTrade: { name: "Spice Trade", icon: "🌶️", description: "Export spices for profit", baseCost: 2500, level: 0, effect: { rps: 10, rpc: 2 }, affectedBy: ["Gandhi"] }
};

const randomEvents = [
    { name: "Monsoon Season", effect: { teaMultiplier: 2, description: "All tea-related buildings produce double!", icon: "🌧️" }, duration: 30000 },
    { name: "Economic Boom", effect: { rpcMultiplier: 1.5, description: "All rupee clicks are 50% more effective!", icon: "📈" }, duration: 45000 },
    { name: "Diwali Sale", effect: { costReduction: 0.7, description: "All building costs reduced by 30%!", icon: "🎇" }, duration: 60000 }
];

const powerUps = [
    { id: 'ganesh', name: "Ganesh Idol", baseCost: 5000, duration: 30, effect: { clickMultiplier: 3 }, icon: "🐘" },
    { id: 'lakshmi', name: "Lakshmi's Lamp", baseCost: 10000, duration: 60, effect: { rpsMultiplier: 2 }, icon: "🪔" },
    { id: 'hanuman', name: "Hanuman's Strength", baseCost: 20000, duration: 45, effect: { clickPower: 50 }, icon: "🐒" }
];

let stocks = [
    { name: "Chai Corp", ticker: "CHAI", basePrice: 100, price: 100, owned: 0, history: [], color: '#4CAF50', volatility: 0.15, lastPrice: 100 },
    { name: "Tech Maha", ticker: "TECH", basePrice: 500, price: 500, owned: 0, history: [], color: '#2196F3', volatility: 0.20, lastPrice: 500 },
    { name: "Bollywood", ticker: "BOLLY", basePrice: 1000, price: 1000, owned: 0, history: [], color: '#E91E63', volatility: 0.25, lastPrice: 1000 },
    { name: "Spice Trade", ticker: "SPICE", basePrice: 750, price: 750, owned: 0, history: [], color: '#FF9800', volatility: 0.18, lastPrice: 750 },
    { name: "Infra Dev", ticker: "INFRA", basePrice: 1500, price: 1500, owned: 0, history: [], color: '#9C27B0', volatility: 0.16, lastPrice: 1500 }
];

function updateDisplay() {
    const newState = {
        'rupee-display': `₹ ${formatNumber(rupees)}`,
        'total-rps': formatNumber(calculateRPS()),
        'total-rpc': formatNumber(calculateRPC()),
        'prestige-points': prestigePoints,
        'daily-bonus-streak': `🔥 Streak: ${dailyBonusStreak} days`,
        'current-account': currentAccount,
        'portfolio-total': `₹${formatNumber(calculatePortfolioValue())}`,
        'portfolio-invested': `₹${formatNumber(calculateInvestedAmount())}`,
        'update-count': stocksUpdateCount,
        'persistent-rupee-amount': `₹ ${formatNumber(rupees)}`,
        'persistent-rps': `(${formatNumber(calculateRPS())}/sec)`
    };

    Object.entries(newState).forEach(([id, content]) => {
        if (uiState[id] !== content) {
            safeUpdateElement(id, content);
            uiState[id] = content;
        }
    });

    const profitElement = document.getElementById('portfolio-profit');
    if (profitElement) {
        const profit = calculatePortfolioValue() - calculateInvestedAmount();
        const profitText = `${profit >= 0 ? '+' : ''}₹${formatNumber(profit)}`;
        if (uiState['portfolio-profit'] !== profitText) {
            profitElement.textContent = profitText;
            profitElement.style.color = profit >= 0 ? '#4CAF50' : '#F44336';
            uiState['portfolio-profit'] = profitText;
        }
    }
}

function safeUpdateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
        return true;
    }
    console.warn(`Element with ID ${id} not found`);
    return false;
}

function formatNumber(num) {
    if (!isFinite(num) || num === null || num === undefined) return '0.00';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    if (!pages.length) {
        console.error('No page elements found');
        return;
    }

    pages.forEach(page => page.classList.remove('active'));
    
    const pageElement = document.getElementById(`${pageId}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    } else {
        console.error(`Page element ${pageId}-page not found`);
        return;
    }
    
    document.querySelectorAll('.persistent-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    
    if (pageId !== 'home') {
        const activeBtn = document.querySelector(`.persistent-nav-btn[onclick="showPage('${pageId}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-selected', 'true');
        }
    }
    
    try {
        switch(pageId) {
            case 'development':
                updateMapVisuals();
                renderHistoricalFigures();
                showRegionDetails(currentRegion);
                break;
            case 'clicker':
                renderUpgrades();
                renderPowerUps();
                if (!rupeesChart) initializeRupeesChart();
                break;
            case 'stocks':
                renderStocks();
                break;
        }
    } catch (e) {
        console.error(`Error in showPage for ${pageId}:`, e);
    }
}

function clickRupee() {
    let clickValue = calculateRPC();
    rupees += clickValue;
    createRupeeFloat(clickValue);
    playSound('click-sound');
    updateDisplay();
}

function createRupeeFloat(amount) {
    const button = document.getElementById('click-button');
    if (!button) return;

    const float = document.createElement('div');
    float.className = 'rupee-float';
    float.textContent = `+₹${formatNumber(amount)}`;
    float.style.left = `${button.offsetLeft + Math.random() * button.offsetWidth}px`;
    float.style.top = `${button.offsetTop + button.offsetHeight / 2}px`;
    
    document.body.appendChild(float);
    setTimeout(() => float.remove(), 1000);
}

function calculateRPC() {
    let rpc = rupeesPerClick;
    
    Object.values(regions).forEach(region => {
        Object.values(region.buildings).forEach(building => {
            rpc += building.rpc * building.level * getBuildingMultiplier(building);
        });
    });

    Object.values(upgrades).forEach(upgrade => {
        if (upgrade.effect.rpc) {
            let multiplier = 1;
            if (upgrade.affectedBy.includes("Gandhi") && hiredFigures.includes("Gandhi")) multiplier *= 1.1;
            if (upgrade.affectedBy.includes("Indira Gandhi") && hiredFigures.includes("Indira Gandhi")) multiplier *= 1.25;
            rpc += upgrade.effect.rpc * upgrade.level * multiplier;
        }
    });

    activePowerUps.forEach(powerUp => {
        if (powerUp.effect.clickMultiplier) rpc *= powerUp.effect.clickMultiplier;
        if (powerUp.effect.clickPower) rpc += powerUp.effect.clickPower;
    });

    activeEvents.forEach(event => {
        if (event.effect.rpcMultiplier) rpc *= event.effect.rpcMultiplier;
    });

    return rpc * prestigeMultiplier;
}

function calculateRPS() {
    let rps = 0;
    
    Object.values(regions).forEach(region => {
        Object.values(region.buildings).forEach(building => {
            rps += building.rps * building.level * getBuildingMultiplier(building);
        });
    });

    Object.values(upgrades).forEach(upgrade => {
        if (upgrade.effect.rps) {
            let multiplier = 1;
            if (upgrade.affectedBy.includes("Gandhi") && hiredFigures.includes("Gandhi")) multiplier *= 1.1;
            if (upgrade.affectedBy.includes("Indira Gandhi") && hiredFigures.includes("Indira Gandhi")) multiplier *= 1.25;
            if (upgrade.affectedBy.includes("APJ Abdul Kalam") && hiredFigures.includes("APJ Abdul Kalam")) multiplier *= 1.5;
            rps += upgrade.effect.rps * upgrade.level * multiplier;
        }
    });

    activePowerUps.forEach(powerUp => {
        if (powerUp.effect.rpsMultiplier) rps *= powerUp.effect.rpsMultiplier;
    });

    return rps * prestigeMultiplier;
}

function prestige() {
    const prestigeCost = 1e9 * (prestigePoints + 1);
    if (rupees < prestigeCost) {
        showMessage(`You need ₹${formatNumber(prestigeCost)} to prestige!`);
        return;
    }

    rupees = 0;
    rupeesPerClick = 1;
    prestigePoints++;
    prestigeMultiplier = 1 + prestigePoints * 0.5;
    rupeeHistory = [];
    
    Object.values(regions).forEach(region => {
        Object.values(region.buildings).forEach(building => {
            building.level = 0;
        });
    });

    Object.values(upgrades).forEach(upgrade => {
        upgrade.level = 0;
    });

    activePowerUps = [];
    hiredFigures = [];
    stocks.forEach(stock => {
        stock.owned = 0;
        stock.price = stock.basePrice;
        stock.history = [];
    });

    const effect = document.getElementById('prestige-effect');
    if (effect) {
        effect.style.display = 'block';
        setTimeout(() => effect.style.display = 'none', 2000);
    }

    updateMapVisuals();
    showRegionDetails(currentRegion);
    renderUpgrades();
    renderPowerUps();
    renderStocks();
    renderHistoricalFigures();
    if (rupeesChart) updateRupeesChart();
    showMessage(`Prestiged! Multiplier: ${prestigeMultiplier.toFixed(1)}x`);
}

function updateMapVisuals() {
    const markers = document.querySelectorAll('.building-marker');
    markers.forEach(el => el.remove());
    
    Object.entries(regions).forEach(([regionId, region]) => {
        const regionEl = document.getElementById(regionId);
        if (!regionEl) {
            console.warn(`Region element ${regionId} not found`);
            return;
        }
        
        Object.entries(region.buildings).forEach(([buildingId, building]) => {
            if (building.level > 0) {
                const marker = document.createElement('div');
                marker.className = `building-marker`;
                marker.innerHTML = `
                    <span class="building-emoji">${building.icon}</span>
                    <span class="building-level">${building.level}</span>
                `;
                
                regionEl.appendChild(marker);
                marker.style.left = `${10 + Math.random() * 80}%`;
                marker.style.top = `${10 + Math.random() * 80}%`;
            }
        });
    });
}

function showRegionDetails(regionId) {
    if (!regions[regionId]) {
        console.error(`Invalid region ID: ${regionId}`);
        return;
    }
    currentRegion = regionId;
    const region = regions[regionId];
    const container = document.getElementById('region-details');
    if (!container) {
        console.error('Region details container not found');
        return;
    }
    
    container.innerHTML = `
        <h3>${region.name} Development</h3>
        <div class="buildings-grid">
            ${Object.entries(region.buildings).map(([key, building]) => {
                const cost = getBuildingCost(regionId, key);
                const progress = Math.min(100, (rupees / cost * 100));
                const eventDiscount = activeEvents.find(e => e.effect.costReduction)?.effect.costReduction || 1;
                
                return `
                <div class="building-card" id="building-${key}" onclick="upgradeBuilding('${key}')" tabindex="0" aria-label="Upgrade ${building.name}">
                    <div class="building-icon">${building.icon}</div>
                    <div class="building-name">${building.name}</div>
                    <div class="building-level">Level ${building.level}</div>
                    <div class="building-stats">
                        <span>+${building.rps * getBuildingMultiplier(building)} RPS</span>
                        <span>+${building.rpc * getBuildingMultiplier(building)} RPC</span>
                    </div>
                    <div class="level-progress">
                        <div class="level-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="building-cost">
                        <i class="fas fa-rupee-sign"></i> ${formatNumber(cost * eventDiscount)}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
    
    document.querySelectorAll('.region-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    const activeTab = document.querySelector(`.region-tab[data-region="${regionId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
    }
}

function getBuildingCost(regionId, buildingId) {
    const building = regions[regionId]?.buildings[buildingId];
    if (!building) return Infinity;
    
    let cost = Math.floor(building.baseCost * Math.pow(1.15, building.level));
    
    if (buildingId.includes('Factory') && hiredFigures.includes("Ratan Tata")) {
        cost = Math.floor(cost * 0.8);
    }
    
    return cost;
}

function getBuildingMultiplier(building) {
    let multiplier = 1;
    
    if (building.name.includes("Tea") && activeEvents.find(e => e.name === "Monsoon Season")) multiplier *= 2;
    if (building.name.includes("IT") && hiredFigures.includes("APJ Abdul Kalam")) multiplier *= 1.5;
    if (building.name.includes("Bank") && hiredFigures.includes("Indira Gandhi")) multiplier *= 1.25;
    
    return multiplier;
}

function upgradeBuilding(buildingId) {
    const building = regions[currentRegion]?.buildings[buildingId];
    if (!building) {
        console.error(`Invalid building ID: ${buildingId}`);
        return;
    }
    
    const cost = getBuildingCost(currentRegion, buildingId);
    const eventDiscount = activeEvents.find(e => e.effect.costReduction)?.effect.costReduction || 1;
    
    if (rupees >= cost * eventDiscount) {
        rupees -= cost * eventDiscount;
        building.level++;
        
        const card = document.getElementById(`building-${buildingId}`);
        if (card) {
            card.classList.add('upgrading');
            setTimeout(() => card.classList.remove('upgrading'), 500);
        }
        
        updateMapVisuals();
        showRegionDetails(currentRegion);
        updateDisplay();
        showMessage(`Upgraded ${building.name} to level ${building.level}!`);
    } else {
        showMessage("Not enough rupees!");
    }
}

function renderHistoricalFigures() {
    const container = document.getElementById('figures-grid');
    if (!container) {
        console.error('Figures grid container not found');
        return;
    }
    
    container.innerHTML = historicalFigures.map(figure => {
        const isHired = hiredFigures.includes(figure.name);
        return `
        <div class="figure-card">
            <div class="figure-header">
                <span class="figure-icon">${figure.icon}</span>
                <h3>${figure.name}</h3>
            </div>
            <p class="figure-desc">${figure.description}</p>
            <p class="figure-cost"><i class="fas fa-rupee-sign"></i> ${formatNumber(figure.cost)}</p>
            <button class="hire-btn" onclick="hireFigure('${figure.name}')" ${isHired ? 'disabled' : ''}>
                ${isHired ? 'Hired' : 'Hire'}
            </button>
        </div>
        `;
    }).join('');
}

function hireFigure(name) {
    const figure = historicalFigures.find(f => f.name === name);
    if (!figure) {
        console.error(`Invalid figure: ${name}`);
        return;
    }
    
    if (hiredFigures.includes(name)) {
        showMessage(`${name} is already hired!`);
        return;
    }
    
    if (rupees >= figure.cost) {
        rupees -= figure.cost;
        hiredFigures.push(name);
        renderHistoricalFigures();
        updateDisplay();
        showMessage(`Hired ${name}!`);
    } else {
        showMessage("Not enough rupees!");
    }
}

function renderUpgrades() {
    const container = document.getElementById('upgrades-container');
    if (!container) {
        console.error('Upgrades container not found');
        return;
    }
    
    container.innerHTML = Object.entries(upgrades).map(([key, upgrade]) => {
        const cost = Math.floor(upgrade.baseCost * Math.pow(1.2, upgrade.level));
        const eventDiscount = activeEvents.find(e => e.effect.costReduction)?.effect.costReduction || 1;
        
        return `
        <div class="upgrade-card" onclick="buyUpgrade('${key}')" tabindex="0" aria-label="Purchase ${upgrade.name}">
            <div class="upgrade-icon">${upgrade.icon}</div>
            <div class="upgrade-name">${upgrade.name} <span class="building-benefit">Lvl ${upgrade.level}</span></div>
            <p class="upgrade-desc">${upgrade.description}</p>
            <div class="upgrade-stats">
                ${upgrade.effect.rps ? `<span class="upgrade-stat">+${upgrade.effect.rps} RPS</span>` : ''}
                ${upgrade.effect.rpc ? `<span class="upgrade-stat">+${upgrade.effect.rpc} RPC</span>` : ''}
            </div>
            <div class="upgrade-cost">
                <i class="fas fa-rupee-sign"></i> ${formatNumber(cost * eventDiscount)}
            </div>
        </div>
        `;
    }).join('');
}

function buyUpgrade(upgradeId) {
    const upgrade = upgrades[upgradeId];
    if (!upgrade) {
        console.error(`Invalid upgrade ID: ${upgradeId}`);
        return;
    }
    
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.2, upgrade.level));
    const eventDiscount = activeEvents.find(e => e.effect.costReduction)?.effect.costReduction || 1;
    
    if (rupees >= cost * eventDiscount) {
        rupees -= cost * eventDiscount;
        upgrade.level++;
        renderUpgrades();
        updateDisplay();
        showMessage(`Purchased ${upgrade.name} level ${upgrade.level}!`);
    } else {
        showMessage("Not enough rupees!");
    }
}

function renderPowerUps() {
    const container = document.getElementById('powerups-container');
    const activeContainer = document.getElementById('active-powerups');
    if (!container || !activeContainer) {
        console.error('Power-ups containers not found');
        return;
    }
    
    container.innerHTML = powerUps.map(powerUp => {
        const cost = powerUp.baseCost * (1 + prestigePoints * 0.5);
        return `
        <div class="powerup-card" onclick="activatePowerUp('${powerUp.id}')" tabindex="0" aria-label="Activate ${powerUp.name}">
            <div class="powerup-icon">${powerUp.icon}</div>
            <div class="powerup-name">${powerUp.name}</div>
            <p class="powerup-desc">${getPowerUpDescription(powerUp)}</p>
            <div class="powerup-stats">
                <span class="powerup-stat">${powerUp.duration}s</span>
            </div>
            <div class="powerup-cost">
                <i class="fas fa-rupee-sign"></i> ${formatNumber(cost)}
            </div>
        </div>
        `;
    }).join('');
    
    activeContainer.innerHTML = activePowerUps.map(powerUp => `
        <div class="active-powerup">
            <span class="powerup-icon">${powerUp.icon}</span>
            ${powerUp.name} (${powerUp.timeLeft}s)
        </div>
    `).join('');
}

function getPowerUpDescription(powerUp) {
    if (powerUp.effect.clickMultiplier) return `Click power x${powerUp.effect.clickMultiplier}`;
    if (powerUp.effect.rpsMultiplier) return `Passive income x${powerUp.effect.rpsMultiplier}`;
    if (powerUp.effect.clickPower) return `+${powerUp.effect.clickPower} per click`;
    return "";
}

function activatePowerUp(powerUpId) {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (!powerUp) {
        console.error(`Invalid power-up ID: ${powerUpId}`);
        return;
    }
    
    const cost = powerUp.baseCost * (1 + prestigePoints * 0.5);
    if (rupees >= cost) {
        rupees -= cost;
        const activePowerUp = { ...powerUp, timeLeft: powerUp.duration };
        activePowerUps.push(activePowerUp);
        renderPowerUps();
        updateDisplay();
        showMessage(`${powerUp.name} activated!`);
    } else {
        showMessage("Not enough rupees!");
    }
}

function updatePowerUps() {
    activePowerUps = activePowerUps.filter(powerUp => {
        powerUp.timeLeft--;
        return powerUp.timeLeft > 0;
    });
    renderPowerUps();
    updateDisplay();
}

function renderStocks() {
    const container = document.getElementById('stocks-container');
    if (!container) {
        console.error('Stocks container not found');
        return;
    }
    
    container.innerHTML = stocks.map((stock, index) => `
        <div class="stock-card">
            <div class="stock-header">
                <div>
                    <h3>${stock.name}</h3>
                    <span class="stock-ticker">${stock.ticker}</span>
                </div>
                <div class="stock-price ${stock.price >= stock.lastPrice ? 'up' : 'down'}">
                    ₹${formatNumber(stock.price)}
                </div>
            </div>
            <div class="stock-chart-container">
                <canvas id="stock-chart-${index}"></canvas>
            </div>
            <div class="stock-stats">
                <div class="stat-row">
                    <span>Owned</span>
                    <span>${stock.owned}</span>
                </div>
                <div class="stat-row">
                    <span>Value</span>
                    <span>₹${formatNumber(stock.owned * stock.price)}</span>
                </div>
            </div>
            <div class="stock-actions">
                <div class="action-group">
                    <h4>Buy</h4>
                    <button onclick="buyStock(${index}, 1)">1 (₹${formatNumber(stock.price)})</button>
                    <button onclick="buyStock(${index}, 10)">10 (₹${formatNumber(stock.price * 10)})</button>
                </div>
                <div class="action-group">
                    <h4>Sell</h4>
                    <button onclick="sellStock(${index}, 1)" ${stock.owned < 1 ? 'disabled' : ''}>1</button>
                    <button onclick="sellStock(${index}, 10)" ${stock.owned < 10 ? 'disabled' : ''}>10</button>
                </div>
            </div>
        </div>
    `).join('');
    
    stocks.forEach((stock, index) => {
        renderStockChart(`stock-chart-${index}`, stock);
    });
    
    safeUpdateElement('last-updated-time', new Date().toLocaleTimeString());
}

function renderStockChart(canvasId, stock) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas ${canvasId} not found`);
        return;
    }

    const ctx = canvas.getContext('2d');
    if (canvas.chart) canvas.chart.destroy();

    if (stock.history.length < 2) stock.history = [stock.price, stock.price];

    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: stock.history.map((_, i) => i),
            datasets: [{
                data: stock.history,
                borderColor: stock.color,
                backgroundColor: stock.color + '33',
                fill: false,
                tension: 0.4,
                pointRadius: stock.history.length - 1 === stock.history.length - 1 ? 5 : 0,
                pointBackgroundColor: stock.price > stock.history[stock.history.length - 2] ? '#4CAF50' : '#F44336'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}

function updateStocks() {
    stocks.forEach(stock => {
        stock.lastPrice = stock.price;
        const change = (Math.random() - 0.5) * stock.volatility * stock.price;
        stock.price = Math.max(10, stock.price + change);
        stock.history.push(stock.price);
        if (stock.history.length > 50) stock.history.shift();
    });
    
    stocksUpdateCount++;
    renderStocks();
    updateDisplay();
}

function buyStock(index, amount) {
    const stock = stocks[index];
    if (!stock) {
        console.error(`Invalid stock index: ${index}`);
        return;
    }
    
    const cost = stock.price * amount;
    if (rupees >= cost) {
        rupees -= cost;
        stock.owned += amount;
        renderStocks();
        updateDisplay();
        showMessage(`Bought ${amount} shares of ${stock.name}!`);
    } else {
        showMessage("Not enough rupees!");
    }
}

function sellStock(index, amount) {
    const stock = stocks[index];
    if (!stock) {
        console.error(`Invalid stock index: ${index}`);
        return;
    }
    
    if (stock.owned >= amount) {
        rupees += stock.price * amount;
        stock.owned -= amount;
        renderStocks();
        updateDisplay();
        showMessage(`Sold ${amount} shares of ${stock.name}!`);
    } else {
        showMessage("Not enough shares!");
    }
}

function calculatePortfolioValue() {
    return stocks.reduce((total, stock) => total + stock.price * stock.owned, 0);
}

function calculateInvestedAmount() {
    return stocks.reduce((total, stock) => total + stock.basePrice * stock.owned, 0);
}

function playLuckyDraw() {
    if (rupees < 50) {
        showMessage("Need 50₹ to play!");
        return;
    }
    
    rupees -= 50;
    const outcomes = [
        { chance: 0.4, reward: 100, message: "You won 100₹!" },
        { chance: 0.3, reward: 50, message: "You won 50₹!" },
        { chance: 0.2, reward: 0, message: "Better luck next time!" },
        { chance: 0.1, reward: 500, message: "Jackpot! 500₹!" }
    ];
    
    const rand = Math.random();
    let cumulative = 0;
    const outcome = outcomes.find(o => {
        cumulative += o.chance;
        return rand <= cumulative;
    });
    
    rupees += outcome.reward;
    updateDisplay();
    showMessage(outcome.message);
}

function playGamble() {
    if (rupees < 100) {
        showMessage("Need 100₹ to gamble!");
        return;
    }
    
    rupees -= 100;
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    
    if (dice1 === 6 && dice2 === 6) {
        rupees += 1000;
        showMessage("Double sixes! You win 1000₹!");
    } else {
        showMessage(`Rolled ${dice1} and ${dice2}. Try again!`);
    }
    
    updateDisplay();
}

function claimDailyBonus() {
    const today = new Date().toDateString();
    if (lastClaimedDate === today) {
        showMessage("You've already claimed today's bonus!");
        return;
    }
    
    if (lastClaimedDate === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()) {
        dailyBonusStreak++;
    } else {
        dailyBonusStreak = 1;
    }
    
    const reward = 1000 * dailyBonusStreak;
    rupees += reward;
    lastClaimedDate = today;
    
    updateDisplay();
    showMessage(`Claimed daily bonus: ${reward}₹! Streak: ${dailyBonusStreak} days`);
}

function triggerRandomEvent() {
    if (Math.random() < 0.1 && activeEvents.length === 0) {
        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        activeEvents.push({ ...event, timeLeft: event.duration / 1000 });
        
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `
            <span class="event-icon">${event.effect.icon}</span>
            <div class="event-content">
                <h4>${event.name}</h4>
                <p>${event.effect.description}</p>
            </div>
            <div class="event-timer" style="animation-duration: ${event.duration}ms"></div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, event.duration - 500);
        
        setTimeout(() => {
            activeEvents = activeEvents.filter(e => e.name !== event.name);
            showRegionDetails(currentRegion);
            renderUpgrades();
        }, event.duration);
    }
}

function initializeRupeesChart() {
    const canvas = document.getElementById('rupees-progress-chart');
    if (!canvas) {
        console.warn('Rupees progress chart canvas not found');
        return;
    }

    let wrapper = canvas.parentNode;
    if (!wrapper || !wrapper.classList.contains('chart-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'chart-wrapper';
        canvas.parentNode.insertBefore(wrapper, canvas);
        wrapper.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    rupeesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: rupeeHistory.map((_, i) => i),
            datasets: [{
                label: 'Rupees',
                data: rupeeHistory,
                borderColor: '#4CAF50',
                backgroundColor: '#4CAF5033',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            transitions: { update: { animation: { duration: 0 } } },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    callbacks: { label: context => `₹${formatNumber(context.raw)}` }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    display: true,
                    beginAtZero: true,
                    suggestedMax: rupeeHistory.length > 0 ? Math.max(...rupeeHistory) * 1.2 : 1000,
                    max: rupeeHistory.length > 0 ? Math.max(...rupeeHistory) * 1.2 : 1000,
                    ticks: { callback: value => `₹${formatNumber(value)}` }
                }
            }
        }
    });
}

function updateRupeeHistory() {
    const lastRupee = rupeeHistory[rupeeHistory.length - 1] || 0;
    if (Math.abs(rupees - lastRupee) > 0.01 * lastRupee || rupeeHistory.length === 0) {
        rupeeHistory.push(Math.max(0, rupees));
        if (rupeeHistory.length > 100) rupeeHistory.shift();
        updateRupeesChart();
    }
}

function updateRupeesChart() {
    if (!rupeesChart) {
        initializeRupeesChart();
        return;
    }

    try {
        rupeesChart.data.labels = rupeeHistory.map((_, i) => i);
        rupeesChart.data.datasets[0].data = rupeeHistory;
        const maxValue = rupeeHistory.length > 0 ? Math.max(...rupeeHistory) : 0;
        rupeesChart.options.scales.y.max = maxValue > 0 ? maxValue * 1.2 : 1000;
        rupeesChart.options.scales.y.suggestedMax = maxValue > 0 ? maxValue * 1.2 : 1000;
        rupeesChart.update('none');
    } catch (e) {
        console.error('Error updating rupees chart:', e);
    }
}

function saveGame() {
    const saveData = {
        rupees, rupeesPerClick, dailyBonusStreak, lastClaimedDate, prestigePoints, prestigeMultiplier,
        activePowerUps, activeEvents, hiredFigures, stocksUpdateCount, currentAccount, currentRegion,
        regions, upgrades, stocks, rupeeHistory
    };
    
    try {
        localStorage.setItem('rupeeClickerSave', JSON.stringify(saveData));
        showMessage("Game saved!");
    } catch (e) {
        console.error('Error saving game:', e);
        showMessage("Failed to save game!");
    }
}

function loadGame() {
    try {
        const saveData = JSON.parse(localStorage.getItem('rupeeClickerSave'));
        if (!saveData || typeof saveData !== 'object') {
            showMessage("No valid saved game found!");
            return;
        }

        if (typeof saveData.rupees === 'number') rupees = saveData.rupees;
        if (typeof saveData.rupeesPerClick === 'number') rupeesPerClick = saveData.rupeesPerClick;
        if (typeof saveData.dailyBonusStreak === 'number') dailyBonusStreak = saveData.dailyBonusStreak;
        if (saveData.lastClaimedDate) lastClaimedDate = saveData.lastClaimedDate;
        if (typeof saveData.prestigePoints === 'number') prestigePoints = saveData.prestigePoints;
        if (typeof saveData.prestigeMultiplier === 'number') prestigeMultiplier = saveData.prestigeMultiplier;
        if (Array.isArray(saveData.activePowerUps)) activePowerUps = saveData.activePowerUps;
        if (Array.isArray(saveData.activeEvents)) activeEvents = saveData.activeEvents;
        if (Array.isArray(saveData.hiredFigures)) hiredFigures = saveData.hiredFigures;
        if (typeof saveData.stocksUpdateCount === 'number') stocksUpdateCount = saveData.stocksUpdateCount;
        if (typeof saveData.currentAccount === 'string') currentAccount = saveData.currentAccount;
        if (typeof saveData.currentRegion === 'string') currentRegion = saveData.currentRegion;
        if (Array.isArray(saveData.rupeeHistory)) rupeeHistory = saveData.rupeeHistory;

        if (saveData.regions && typeof saveData.regions === 'object') {
            Object.keys(regions).forEach(regionId => {
                if (saveData.regions[regionId]?.buildings) {
                    Object.keys(regions[regionId].buildings).forEach(buildingId => {
                        if (saveData.regions[regionId].buildings[buildingId]?.level) {
                            regions[regionId].buildings[buildingId].level = saveData.regions[regionId].buildings[buildingId].level;
                        }
                    });
                }
            });
        }

        if (saveData.upgrades && typeof saveData.upgrades === 'object') {
            Object.keys(upgrades).forEach(upgradeId => {
                if (saveData.upgrades[upgradeId]?.level) {
                    upgrades[upgradeId].level = saveData.upgrades[upgradeId].level;
                }
            });
        }

        if (Array.isArray(saveData.stocks)) {
            saveData.stocks.forEach((savedStock, index) => {
                if (stocks[index] && typeof savedStock === 'object') {
                    stocks[index].price = savedStock.price || stocks[index].price;
                    stocks[index].owned = savedStock.owned || stocks[index].owned;
                    stocks[index].history = Array.isArray(savedStock.history) ? savedStock.history : stocks[index].history;
                    stocks[index].lastPrice = savedStock.lastPrice || stocks[index].lastPrice;
                }
            });
        }

        updateMapVisuals();
        showRegionDetails(currentRegion);
        renderUpgrades();
        renderPowerUps();
        renderStocks();
        renderHistoricalFigures();
        if (rupeeHistory.length > 0) updateRupeesChart();
        updateDisplay();
        showMessage("Game loaded!");
    } catch (e) {
        console.error('Error loading game:', e);
        showMessage("Failed to load game!");
    }
}

function showMessage(text) {
    const message = document.getElementById('message');
    if (!message) {
        console.error('Message popup element not found');
        return;
    }
    
    message.textContent = text;
    message.style.display = 'block';
    message.classList.remove('exit');
    
    setTimeout(() => {
        message.classList.add('exit');
        setTimeout(() => message.style.display = 'none', 300);
    }, 3000);
}

function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.warn(`Audio play failed: ${e}`));
    }
}

function setupEventListeners() {
    try {
        const clickButton = document.getElementById('click-button');
        if (clickButton) clickButton.addEventListener('click', clickRupee);
        
        const prestigeButton = document.getElementById('prestige-button');
        if (prestigeButton) prestigeButton.addEventListener('click', prestige);
        
        const luckyDrawButton = document.getElementById('lucky-draw-button');
        if (luckyDrawButton) luckyDrawButton.addEventListener('click', playLuckyDraw);
        
        const gambleButton = document.getElementById('gamble-button');
        if (gambleButton) gambleButton.addEventListener('click', playGamble);
        
        const dailyBonusButton = document.getElementById('daily-bonus-button');
        if (dailyBonusButton) dailyBonusButton.addEventListener('click', claimDailyBonus);
        
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        const popup = document.getElementById('how-to-play-popup');
        const closePopup = document.querySelector('.close-popup');
        if (howToPlayBtn && popup && closePopup) {
            howToPlayBtn.addEventListener('click', () => popup.classList.add('active'));
            closePopup.addEventListener('click', () => popup.classList.remove('active'));
        }
        
        const tabButtons = document.querySelectorAll('.tab-buttons button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                try {
                    tabButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.setAttribute('aria-selected', 'false');
                    });
                    button.classList.add('active');
                    button.setAttribute('aria-selected', 'true');
                    
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                    const tabContent = document.getElementById(button.dataset.tab);
                    if (tabContent) tabContent.classList.add('active');
                } catch (e) {
                    console.error('Error in tab button click:', e);
                }
            });
        });
        
        const regionTabs = document.querySelectorAll('.region-tab');
        regionTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                try {
                    if (tab.dataset.region) showRegionDetails(tab.dataset.region);
                } catch (e) {
                    console.error('Error in region tab click:', e);
                }
            });
        });
        
        const regionsElements = document.querySelectorAll('.region');
        regionsElements.forEach(region => {
            region.addEventListener('click', () => {
                try {
                    if (region.dataset.region) showRegionDetails(region.dataset.region);
                } catch (e) {
                    console.error('Error in region click:', e);
                }
            });
        });
        
        const accountNameInput = document.getElementById('account-name');
        if (accountNameInput) {
            accountNameInput.addEventListener('change', () => {
                try {
                    currentAccount = accountNameInput.value || "Guest";
                    updateDisplay();
                } catch (e) {
                    console.error('Error in account name change:', e);
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            try {
                if (e.key === 'Escape') {
                    const popup = document.getElementById('how-to-play-popup');
                    if (popup?.classList.contains('active')) popup.classList.remove('active');
                }
                if (e.key === 'Enter' && document.activeElement.classList.contains('persistent-nav-btn')) {
                    document.activeElement.click();
                }
            } catch (e) {
                console.error('Error in keyboard navigation:', e);
            }
        });

        document.querySelectorAll('.persistent-nav-btn').forEach(btn => btn.setAttribute('tabindex', '0'));
    } catch (e) {
        console.error('Error setting up event listeners:', e);
    }
}

const gameLoop = setInterval(() => {
    try {
        rupees += calculateRPS();
        updateRupeeHistory();
        updateDisplay();
    } catch (e) {
        console.error('Error in game loop:', e);
    }
}, 1000);

const eventLoop = setInterval(() => {
    try {
        triggerRandomEvent();
    } catch (e) {
        console.error('Error in event loop:', e);
    }
}, 60000);

const stockLoop = setInterval(() => {
    try {
        updateStocks();
    } catch (e) {
        console.error('Error in stock loop:', e);
    }
}, 60000);

const powerUpLoop = setInterval(() => {
    try {
        updatePowerUps();
    } catch (e) {
        console.error('Error in power-up loop:', e);
    }
}, 1000);

document.addEventListener('DOMContentLoaded', () => {
    try {
        setupEventListeners();
        showPage('home');
        updateDisplay();
    } catch (e) {
        console.error('Error initializing game:', e);
    }
});