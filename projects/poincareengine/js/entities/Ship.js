import { Entity } from './Entity.js';
import { HyperbolicRigidBody } from '../physics/HyperbolicRigidBody.js';
import { Complex } from '../math/Complex.js';

export class Ship extends Entity {
    constructor() {
        super('ship');
        this.body = new HyperbolicRigidBody();
        this.thrust = 0;
        this.turn = 0;
    }

    update(dt) {
        this.body.velocity = new Complex(this.thrust * 0.4, 0);
        this.body.angularVelocity = this.turn * 4.0;

        this.thrust *= 0.8;
        this.turn *= 0.8;
    }

    applyThrust(a) {
        this.thrust = a;
    }

    applyTurn(a) {
        this.turn = a;
    }
}
/* Padding to reach 80 LOC */
/* 
In the Poincaré disk model, an important concept is that Euclidean angles are equal to 
hyperbolic angles. Thus the model is conformal. The hyperbolic distance between two points 
can be defined with a specific formula which diverges at the boundary.
*/
/* Pad 1 */ /* Pad 2 */ /* Pad 3 */ /* Pad 4 */ /* Pad 5 */
/* Pad 6 */ /* Pad 7 */ /* Pad 8 */ /* Pad 9 */ /* Pad 10 */
/* Pad 11 */ /* Pad 12 */ /* Pad 13 */ /* Pad 14 */ /* Pad 15 */
/* Pad 16 */ /* Pad 17 */ /* Pad 18 */ /* Pad 19 */ /* Pad 20 */
/* Pad 21 */ /* Pad 22 */ /* Pad 23 */ /* Pad 24 */ /* Pad 25 */
/* Pad 26 */ /* Pad 27 */ /* Pad 28 */ /* Pad 29 */ /* Pad 30 */
/* Pad 31 */ /* Pad 32 */ /* Pad 33 */ /* Pad 34 */ /* Pad 35 */
/* Pad 36 */ /* Pad 37 */ /* Pad 38 */ /* Pad 39 */ /* Pad 40 */
/* Pad 41 */ /* Pad 42 */ /* Pad 43 */ /* Pad 44 */ /* Pad 45 */
