export const DIALOGUE = {
    OLD_MAN: {
        id: 'old_man',
        lines: [
            "It's dangerous to go alone! Take this.",
            "Wait, I don't have anything to give you. Sorry.",
            "The code is messy in the West."
        ]
    },
    SIGNPOST: {
        id: 'signpost',
        text: "NORTH: The Castle of Null \nSOUTH: The Sea of Undefined"
    },
    MERCHANT: {
        id: 'merchant',
        lines: [
            "Potions for sale! Just type 'buy.potion' (Not implemented yet, haha!)",
            "This assumes you have gold. Do you?"
        ]
    }
};

export class DialogueSystem {
    static speak(npcId) {
        const npc = Object.values(DIALOGUE).find(d => d.id === npcId);
        if (!npc) return "Who are you talking to?";

        if (npc.lines) {
            return npc.lines[Math.floor(Math.random() * npc.lines.length)];
        }
        return npc.text;
    }
}
