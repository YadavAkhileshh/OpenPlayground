export class Store {
    static save(scene) {
        const data = scene.map(c => ({
            type: c.type,
            x: c.position.x,
            y: c.position.y,
            rotation: c.rotation,
            // Component specific
            color: c.color,
            isOn: c.isOn,
            op: c.op,
            width: c.width,
            height: c.height
        }));

        localStorage.setItem('optical_circuit', JSON.stringify(data));
        console.log('Saved circuit layout.');
    }

    static load() {
        const json = localStorage.getItem('optical_circuit');
        if (!json) return null;

        try {
            return JSON.parse(json);
        } catch (e) {
            console.error('Failed to load circuit', e);
            return null;
        }
    }
}
