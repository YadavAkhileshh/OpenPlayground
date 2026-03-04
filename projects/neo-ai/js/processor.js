export class ContentEngine {
    constructor() {
        this.templates = null;
    }

    async loadTemplates() {
        if (this.templates) return;
        const response = await fetch('js/templates.json');
        this.templates = await response.json();
    }

    async generate(prompt, platform, hookStyle, emotion, length = 2) {
        await this.loadTemplates();

        return new Promise((resolve) => {
            setTimeout(() => {
                const words = prompt.trim().split(' ');
                const topic = words.slice(0, 3).join(' ') || "The Project";
                const detail = words.length > 3 ? words.slice(3).join(' ') : "modern development";

                // 1. Select the core components
                const hook = this.getRandom(this.templates.hooks[hookStyle]);
                const emoData = this.templates.emotions[emotion];

                // Use the length parameter to vary content
                const bodyCount = Math.max(1, Math.min(3, length));
                const bodySentences = this.getRandomCount(emoData.sentences, bodyCount);
                const cta = this.getRandom(this.templates.ctas);
                const tags = this.getRandomCount(this.templates.hashtags, 3);

                // 2. Build the grammar for micro-variations
                const grammarData = {
                    "topic": [this.capitalize(topic)],
                    "detail": [detail.toLowerCase()],
                    "emotion_adj": emoData.adjectives,
                    "body": bodySentences,
                    "cta": [cta],
                    "hook": [hook]
                };

                // 3. Assemble the final structure
                const traceryLib = window.tracery;
                const grammar = traceryLib.createGrammar(grammarData);
                grammar.addModifiers(traceryLib.baseEngModifiers);

                // Construct post with stable structure but dynamic fills
                let post = grammar.flatten("#hook#\n\n#body#\n\n#cta#\n\n");

                // Add hashtags separately to avoid '#' parsing issues
                const hashtagLine = tags.map(t => `#${t}`).join(' ');
                post += hashtagLine;

                resolve(post);
            }, 600);
        });
    }

    getRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getRandomCount(arr, count) {
        let shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
