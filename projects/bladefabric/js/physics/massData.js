// massData.js
export class MassData {
    constructor() {
        this.mass = 0;
        this.invMass = 0;
        this.inertia = 0;
        this.invInertia = 0;
    }

    set(mass, inertia) {
        this.mass = mass;
        this.invMass = mass > 0 ? 1.0 / mass : 0;

        this.inertia = inertia;
        this.invInertia = inertia > 0 ? 1.0 / inertia : 0;
    }

    clone() {
        const md = new MassData();
        md.mass = this.mass;
        md.invMass = this.invMass;
        md.inertia = this.inertia;
        md.invInertia = this.invInertia;
        return md;
    }
}
