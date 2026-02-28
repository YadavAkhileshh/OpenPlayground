class Material {
    constructor(color = { r: 200, g: 200, b: 200 }, options = {}) {
        this.color = color;
        this.specular = options.specular || 0.5;
        this.shininess = options.shininess || 32;
        this.emissive = options.emissive || 0;
        this.opacity = options.opacity !== undefined ? options.opacity : 1.0;
        this.wireframe = options.wireframe || false;
    }

    clone() {
        return new Material(
            { r: this.color.r, g: this.color.g, b: this.color.b },
            {
                specular: this.specular,
                shininess: this.shininess,
                emissive: this.emissive,
                opacity: this.opacity,
                wireframe: this.wireframe
            }
        );
    }

    static default() {
        return new Material();
    }

    static gold() {
        return new Material({ r: 255, g: 215, b: 0 }, { specular: 0.8, shininess: 64 });
    }

    static silver() {
        return new Material({ r: 192, g: 192, b: 192 }, { specular: 0.9, shininess: 50 });
    }

    static redPlastic() {
        return new Material({ r: 255, g: 50, b: 50 }, { specular: 0.5, shininess: 10 });
    }

    static blueSteel() {
        return new Material({ r: 100, g: 149, b: 237 }, { specular: 0.7, shininess: 40 });
    }
}
