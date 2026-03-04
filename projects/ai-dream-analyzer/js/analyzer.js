export function analyzeDream(text) {

    const symbols = {
        water: "Water symbolizes emotions and subconscious thoughts.",
        flying: "Flying represents freedom and ambition.",
        falling: "Falling may indicate insecurity or loss of control.",
        fire: "Fire represents transformation or intense emotions.",
        darkness: "Darkness symbolizes uncertainty or fear."
    };

    let interpretation = "Your dream suggests: ";

    for(const key in symbols) {
        if(text.toLowerCase().includes(key)) {
            interpretation += symbols[key] + " ";
        }
    }

    if(interpretation === "Your dream suggests: ") {
        interpretation += "A journey of personal growth and hidden meanings.";
    }

    return interpretation;
}