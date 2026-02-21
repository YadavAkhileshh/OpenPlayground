/**
 * Main application entrypoint - glues everything together and runs the loop
 */
window.onload = () => {
    // 1. Initialize Event Bus
    const bus = new EventBus();

    // 2. Init Logger
    const logger = new Logger('global');
    window.logger = logger;

    logger.info('FLASHCRASH SYSTEM INITIALIZING...');

    // 3. Init Market Mechanics
    const lob = new LimitOrderBook();
    const matchingEngine = new MatchingEngine(lob, bus);
    const latencySimulator = new LatencySimulator();
    const flashCrashSim = new FlashCrashSim(null, bus); // hook bot manager later
    const marketFeed = new MarketFeed(lob, bus, CONFIG);
    const metrics = new Metrics(bus);
    const volCalc = new VolatilityCalculator(metrics, bus);
    const imbCalc = new LiquidityImbalance();

    // 4. Init Bots
    const botManager = new BotManager(matchingEngine, lob, bus, latencySimulator);
    flashCrashSim.botManager = botManager;

    // 5. Init UI
    const alertSystem = new AlertSystem(bus);
    const uiManager = new UIManager(bus, metrics, volCalc, latencySimulator);
    const domPanel = new DOMPanel();
    const botPanel = new BotPanel(bus, botManager);
    const rendererManager = new RendererManager(metrics, volCalc, lob, domPanel);

    // Seed the market with some bots to start the chaos
    logger.info('DEPLOYING ALGORITHMIC MARKET MAKERS');
    for (let i = 0; i < 5; i++) {
        botManager.addBot(CONSTANTS.BOT_TYPES.MARKET_MAKER, { maxSize: 2.0 });
    }
    botManager.addBot(CONSTANTS.BOT_TYPES.ARBITRAGE);
    botManager.addBot(CONSTANTS.BOT_TYPES.MOMENTUM);

    for (let i = 0; i < 3; i++) {
        botManager.addBot(CONSTANTS.BOT_TYPES.NOISE);
    }

    // User triggered event
    bus.on('USER_FLASH_CRASH', () => {
        flashCrashSim.trigger();
    });

    // 6. Application Loop
    let lastLogicTime = performance.now();
    let tickAccumulator = 0;

    function loop(time) {
        requestAnimationFrame(loop);

        const deltaReal = time - lastLogicTime;
        lastLogicTime = time;

        tickAccumulator += deltaReal;

        const updatesNum = Math.floor(tickAccumulator / CONFIG.TICK_RATE_MS);

        // Logic Tick (fixed timestep)
        for (let i = 0; i < updatesNum; i++) {
            const dt = CONFIG.TICK_RATE_MS;
            TimeClass.tick(); // advance sim time

            latencySimulator.tick();
            botManager.tick();
            flashCrashSim.tick();
            marketFeed.tick();
            metrics.tick(dt);
            volCalc.tick();

            tickAccumulator -= dt;
        }

        // Imbalance updates per frame is okay
        const imb = imbCalc.calculate(lob.getSnapshot(10));
        domPanel.updateImbalance(imb);

        rendererManager.tick(lob.getSnapshot(10));

        // Render Frame
        rendererManager.render();
    }

    // Initialize initial state (e.g. crossing orders slightly to form a spread)
    matchingEngine.processOrder(new Order('system', CONSTANTS.ORDER_TYPES.LIMIT, CONSTANTS.SIDES.BID, CONFIG.INITIAL_PRICE - 5, 100));
    matchingEngine.processOrder(new Order('system', CONSTANTS.ORDER_TYPES.LIMIT, CONSTANTS.SIDES.ASK, CONFIG.INITIAL_PRICE + 5, 100));

    logger.info('ENGINE READY. INITIATING HIGH FREQUENCY MATCHING.');

    // Start Loop
    requestAnimationFrame(loop);
};
