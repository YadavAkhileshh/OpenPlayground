const fs = require('fs');

try {
    const data = fs.readFileSync('periodic_data.json', 'utf8');
    const { elements } = JSON.parse(data);

    const categoryMap = {
        "alkali metal": "alkali",
        "alkaline earth metal": "alkaline",
        "transition metal": "transition",
        "post-transition metal": "basic",
        "metalloid": "metalloid",
        "diatomic nonmetal": "nonmetal",
        "polyatomic nonmetal": "nonmetal",
        "noble gas": "noble",
        "lanthanide": "lanthanide",
        "actinide": "actinide",
        "unknown, probably transition metal": "transition",
        "unknown, probably post-transition metal": "basic",
        "unknown, probably metalloid": "metalloid",
        "unknown, predicted to be noble gas": "noble"
    };

    function formatConfig(config) {
        if (!config) return "";
        return config.replace(/([spdf])(\d+)/g, (match, orbital, num) => {
            const superNum = num.split('').map(n => ({
                '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
                '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
            }[n])).join('');
            return orbital + superNum;
        });
    }

    const simpleElements = elements.map(e => {
        let cat = categoryMap[e.category] || "unknown";
        if (cat === "unknown" && e.category.includes("nonmetal")) cat = "nonmetal";

        return {
            number: e.number,
            symbol: e.symbol,
            name: e.name,
            category: cat,
            mass: e.atomic_mass,
            config: formatConfig(e.electron_configuration_semantic),
            electronegativity: e.electronegativity_pauling,
            xpos: e.xpos,
            ypos: e.ypos
        };
    });

    const detailedElements = {};
    elements.forEach(e => {
        detailedElements[e.number] = {
            density: e.density ? `${e.density} ${e.phase === 'Gas' ? 'g/L' : 'g/cm³'}` : "Data not available",
            melting: e.melt ? `${(e.melt - 273.15).toFixed(2)} °C` : "Data not available",
            boiling: e.boil ? `${(e.boil - 273.15).toFixed(2)} °C` : "Data not available",
            phase: e.phase || "Unknown",
            radius: "Data not available",
            affinity: e.electron_affinity ? `${e.electron_affinity} kJ/mol` : "Data not available",
            ionization: e.ionization_energies && e.ionization_energies.length > 0 ? `${e.ionization_energies[0]} kJ/mol` : "Data not available",
            oxidation: "Data not available",
            crystal: "Unknown",
            history: e.summary || "No history available.",
            uses: "Common uses information not available in this dataset."
        };
    });

    // Create the content for data.js
    const dataContent = `// Auto-generated data file
const elements = ${JSON.stringify(simpleElements, null, 4)};

const elementDetails = ${JSON.stringify(detailedElements, null, 4)};
`;

    fs.writeFileSync('data.js', dataContent);
    console.log("Successfully created data.js");

} catch (err) {
    console.error("Error processing data:", err);
    process.exit(1);
}
