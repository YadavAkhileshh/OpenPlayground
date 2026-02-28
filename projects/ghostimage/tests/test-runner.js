import { LSBEncoder } from '../js/core/lsb-encoder.js';
import { LSBDecoder } from '../js/core/lsb-decoder.js';
import { ImageProcessor } from '../js/core/image-processor.js';

/**
 * GhostImage Test Runner
 * 
 * Executes automated consistency checks on the steganography algorithm.
 * Usage: Import this file in app.js or run in console.
 */
export class TestRunner {
    constructor() {
        this.encoder = new LSBEncoder();
        this.decoder = new LSBDecoder();
    }

    async runAllTests() {
        console.group("GhostImage Automated Tests");

        let passed = 0;
        let total = 0;

        try {
            total++;
            if (this.testSmallImageEncoding()) {
                console.log("✅ Test 1: Small Image Integrity Passed");
                passed++;
            } else {
                console.error("❌ Test 1 Failed");
            }

            total++;
            if (this.testBitDepth2()) {
                console.log("✅ Test 2: 2-Bit Depth Integrity Passed");
                passed++;
            } else {
                console.error("❌ Test 2 Failed");
            }

        } catch (e) {
            console.error("Critical Test Error:", e);
        }

        console.log(\`Test Results: \${passed}/\${total} Passed\`);
        console.groupEnd();
    }

    testSmallImageEncoding() {
        // 1. Create Mock Cover (100x100)
        const coverWidth = 100;
        const coverHeight = 100;
        const coverData = ImageProcessor.createEmptyImageData(coverWidth, coverHeight);
        
        // Fill cover with random noise
        for (let i = 0; i < coverData.data.length; i++) {
            coverData.data[i] = Math.floor(Math.random() * 255);
            // Ensure alpha is 255
            if ((i + 1) % 4 === 0) coverData.data[i] = 255;
        }

        // 2. Create Mock Secret (10x10) - Small enough to fit
        const secretWidth = 10;
        const secretHeight = 10;
        const secretData = ImageProcessor.createEmptyImageData(secretWidth, secretHeight);
        
        // Fill secret with specific pattern
        for (let i = 0; i < secretData.data.length; i++) {
            secretData.data[i] = (i % 255);
            if ((i + 1) % 4 === 0) secretData.data[i] = 255;
        }

        // 3. Encode
        this.encoder.setStrength(1);
        const encoded = this.encoder.encode(coverData, secretData);

        // 4. Decode
        this.decoder.bitsPerChannel = 1;
        const decoded = this.decoder.decode(encoded);

        // 5. Compare
        return this.compareImages(secretData, decoded);
    }

    testBitDepth2() {
        // Similar to above but with 2 bits
        const coverData = ImageProcessor.createEmptyImageData(100, 100);
        const secretData = ImageProcessor.createEmptyImageData(10, 10);
        
        // Fill
        for (let i = 0; i < coverData.data.length; i++) coverData.data[i] = 255;
        for (let i = 0; i < secretData.data.length; i++) secretData.data[i] = (i * 13) % 255;

        this.encoder.setStrength(2);
        const encoded = this.encoder.encode(coverData, secretData);

        this.decoder.bitsPerChannel = 2;
        const decoded = this.decoder.decode(encoded);

        return this.compareImages(secretData, decoded);
    }

    compareImages(original, decoded) {
        if (original.width !== decoded.width || original.height !== decoded.height) {
            console.warn("Dimension mismatch", original.width, decoded.width);
            return false;
        }

        let diffCount = 0;
        for (let i = 0; i < original.data.length; i++) {
            if (original.data[i] !== decoded.data[i]) {
                diffCount++;
                if (diffCount < 5) console.warn(\`Pixel mismatch at index \${i}: original \${original.data[i]} vs decoded \${decoded.data[i]}\`);
            }
        }
        
        return diffCount === 0;
    }
}
