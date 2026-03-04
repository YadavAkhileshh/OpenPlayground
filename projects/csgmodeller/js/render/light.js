class Light {
    constructor(x, y, z, intensity = 1.0) {
        this.direction = new Vector3(x, y, z).normalize();
        this.intensity = intensity;
    }
}
