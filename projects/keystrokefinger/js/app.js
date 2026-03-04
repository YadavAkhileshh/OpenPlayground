/**
 * KeystrokeFingerprint - App Entry Point
 */

import { InterfaceController } from './ui/interface.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("KeystrokeFingerprint Initializing...");
    const app = new InterfaceController();

    // Greeting
    console.log("%c BIOMETRIC SYSTEM ONLINE ", "background: #000; color: #0f0; font-size: 16px; padding: 4px;");
});
