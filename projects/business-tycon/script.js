        (function() {
            // ---------- BUSINESS TYCOON CORE ----------
            // assets owned by player
            let cash = 10000;
            let turn = 1;

            // asset types
            const assetCatalog = [
                { id: 'lemonade', name: '🍋 lemonade stand', basePrice: 1200, income: 280, emoji: '🍋' },
                { id: 'coffee', name: '☕ coffee cart', basePrice: 2500, income: 550, emoji: '☕' },
                { id: 'foodtruck', name: '🌮 food truck', basePrice: 5000, income: 1100, emoji: '🌮' },
                { id: 'bakery', name: '🥐 bakery', basePrice: 8000, income: 1700, emoji: '🥐' },
                { id: 'gym', name: '🏋️ gym', basePrice: 15000, income: 3000, emoji: '🏋️' }
            ];

            // player's assets: array of objects with typeId and purchase price (for resale value)
            let ownedAssets = [];

            // market multipliers (random events affect prices/income)
            let priceMultiplier = 1.0;      // affects buy/sell prices
            let incomeMultiplier = 1.0;      // affects income per turn

            let currentEvent = "Market is stable. Start investing!";

            // ----- helper: update UI -----
            function refreshUI() {
                // cash display
                document.getElementById('cashDisplay').textContent = `$${cash.toLocaleString()}`;
                document.getElementById('cashReserve').textContent = `$${cash.toLocaleString()}`;
                document.getElementById('turnDisplay').textContent = `turn ${turn}`;

                // assets list
                const assetsContainer = document.getElementById('assetsContainer');
                if (ownedAssets.length === 0) {
                    assetsContainer.innerHTML = `<div class="asset-row" style="justify-content:center;">✨ you don't own any businesses yet. buy from the store!</div>`;
                } else {
                    let html = '';
                    // group by type for simplicity
                    const grouped = {};
                    ownedAssets.forEach(asset => {
                        if (!grouped[asset.typeId]) grouped[asset.typeId] = [];
                        grouped[asset.typeId].push(asset);
                    });

                    for (let typeId in grouped) {
                        const assetType = assetCatalog.find(a => a.id === typeId);
                        const count = grouped[typeId].length;
                        const avgPrice = grouped[typeId].reduce((sum, a) => sum + a.purchasePrice, 0) / count;
                        const incomeEst = assetType.income * count * incomeMultiplier;
                        html += `
                            <div class="asset-row">
                                <div class="asset-info">
                                    <span class="asset-name">${assetType.emoji} ${assetType.name}</span>
                                    <span class="asset-detail">x${count}</span>
                                    <span class="asset-detail">💰 ~$${Math.round(incomeEst)}/turn</span>
                                </div>
                                <div class="asset-actions">
                                    <button class="sell-btn" data-type="${typeId}">sell 1</button>
                                </div>
                            </div>
                        `;
                    }
                    assetsContainer.innerHTML = html;

                    // attach sell events
                    document.querySelectorAll('.sell-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const typeId = btn.dataset.type;
                            sellAsset(typeId);
                        });
                    });
                }

                // update store items with current price multiplier
                const storeContainer = document.getElementById('storeContainer');
                let storeHtml = '';
                assetCatalog.forEach(asset => {
                    let currentPrice = Math.round(asset.basePrice * priceMultiplier);
                    storeHtml += `
                        <div class="store-card">
                            <h3>${asset.emoji} ${asset.name}</h3>
                            <div style="font-size:1.4rem;">$${currentPrice}</div>
                            <div style="margin:0.2rem 0;">💵 income $${Math.round(asset.income * incomeMultiplier)}/turn</div>
                            <button class="buy-store-btn" data-type="${asset.id}" data-price="${currentPrice}">buy</button>
                        </div>
                    `;
                });
                storeContainer.innerHTML = storeHtml;

                document.querySelectorAll('.buy-store-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const typeId = btn.dataset.type;
                        const price = parseInt(btn.dataset.price, 10);
                        buyAsset(typeId, price);
                    });
                });

                // update totals
                const totalAssets = ownedAssets.length;
                document.getElementById('assetCount').textContent = totalAssets;

                const totalIncome = ownedAssets.reduce((sum, asset) => {
                    const type = assetCatalog.find(a => a.id === asset.typeId);
                    return sum + (type ? type.income : 0);
                }, 0);
                const modifiedIncome = Math.round(totalIncome * incomeMultiplier);
                document.getElementById('incomePerTurn').textContent = `$${modifiedIncome}`;

                // event message
                document.getElementById('eventMessage').textContent = currentEvent;
            }

            // ----- buy asset -----
            function buyAsset(typeId, price) {
                if (cash < price) {
                    currentEvent = "❌ not enough cash!";
                    refreshUI();
                    return;
                }
                const assetType = assetCatalog.find(a => a.id === typeId);
                if (!assetType) return;

                cash -= price;
                ownedAssets.push({ typeId: typeId, purchasePrice: price });
                currentEvent = `✅ bought one ${assetType.name} for $${price}.`;
                refreshUI();
            }

            // ----- sell asset (sell one of type) -----
            function sellAsset(typeId) {
                const index = ownedAssets.findIndex(a => a.typeId === typeId);
                if (index === -1) {
                    currentEvent = "⚠️ no asset of that type to sell.";
                    refreshUI();
                    return;
                }
                // sell at current market price (based on priceMultiplier) – you get base * multiplier
                const assetType = assetCatalog.find(a => a.id === typeId);
                const basePrice = assetType.basePrice;
                const sellPrice = Math.round(basePrice * priceMultiplier * 0.9); // 10% depreciation? or just market price: we use full multiplier
                // we'll use full multiplier (you can sell at current value)
                const finalSell = Math.round(basePrice * priceMultiplier);

                cash += finalSell;
                ownedAssets.splice(index, 1);
                currentEvent = `💰 sold one ${assetType.name} for $${finalSell}.`;
                refreshUI();
            }

            // ----- end turn: collect income, random event, update multipliers -----
            function endTurn() {
                // collect income
                let totalIncome = ownedAssets.reduce((sum, asset) => {
                    const type = assetCatalog.find(a => a.id === asset.typeId);
                    return sum + (type ? type.income : 0);
                }, 0);
                totalIncome = Math.round(totalIncome * incomeMultiplier);
                cash += totalIncome;

                // random event: change multipliers
                const eventRand = Math.random();
                let eventStr = '';

                if (eventRand < 0.2) {
                    // boom times: price increase, income increase
                    priceMultiplier = Math.min(2.0, priceMultiplier + 0.2);
                    incomeMultiplier = Math.min(2.0, incomeMultiplier + 0.15);
                    eventStr = `🚀 economic boom! prices +20%, income +15%`;
                } else if (eventRand < 0.4) {
                    // recession
                    priceMultiplier = Math.max(0.5, priceMultiplier - 0.15);
                    incomeMultiplier = Math.max(0.5, incomeMultiplier - 0.1);
                    eventStr = `📉 recession hits! prices -15%, income -10%`;
                } else if (eventRand < 0.6) {
                    // tax hike
                    cash = Math.max(0, cash - 800);
                    eventStr = `💰 tax day! you paid $800 in taxes.`;
                } else if (eventRand < 0.75) {
                    // investor dividend
                    const bonus = Math.round(cash * 0.05);
                    cash += bonus;
                    eventStr = `🎉 dividend payout! +$${bonus}`;
                } else {
                    // market stable, small fluctuation
                    const shift = (Math.random() * 0.1) - 0.05;
                    priceMultiplier = Math.max(0.5, Math.min(2.0, priceMultiplier + shift));
                    eventStr = `📊 market drifts slightly.`;
                }

                // ensure multipliers within bounds
                priceMultiplier = Math.max(0.5, Math.min(2.0, priceMultiplier));
                incomeMultiplier = Math.max(0.5, Math.min(2.0, incomeMultiplier));

                turn++;
                currentEvent = eventStr || "market stable.";

                // check win condition? no, just update
                refreshUI();
            }

            // ----- reset game -----
            function resetGame() {
                cash = 10000;
                turn = 1;
                ownedAssets = [];
                priceMultiplier = 1.0;
                incomeMultiplier = 1.0;
                currentEvent = "Game reset. Build your empire!";
                refreshUI();
            }

            // ----- attach global listeners -----
            document.getElementById('endTurnBtn').addEventListener('click', endTurn);
            document.getElementById('resetBtn').addEventListener('click', resetGame);

            // initial render
            refreshUI();
        })();