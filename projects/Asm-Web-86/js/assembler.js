import { OPCODES, REGISTERS, INSTRUCTION_SET } from './isa.js';
import { parseNumber, isRegister } from './utils.js';

/**
 * 2-Pass Assembler
 * Pass 1: Symbol Table generation (Labels)
 * Pass 2: Code Generation
 */
export class Assembler {
    constructor() {
        this.labels = {};
        this.offset = 0;
    }

    assemble(sourceCode) {
        this.labels = {};
        this.offset = 0;
        const lines = sourceCode.split('\n')
                                .map(l => l.trim())
                                .filter(l => l && !l.startsWith(';')); // Remove comments/empty

        // --- PASS 1: Calculate Labels ---
        let tempOffset = 0;
        
        lines.forEach((line, idx) => {
            // Strip inline comments
            if (line.includes(';')) line = line.split(';')[0].trim();
            
            // Check for Label
            if (line.endsWith(':')) {
                const labelName = line.slice(0, -1);
                this.labels[labelName] = tempOffset;
                return; 
            }

            const size = this.estimateInstructionSize(line, idx + 1);
            tempOffset += size;
        });

        // --- PASS 2: Generate Bytecode ---
        const machineCode = [];
        this.offset = 0;

        try {
            lines.forEach((line, idx) => {
                // Strip inline comments
                if (line.includes(';')) line = line.split(';')[0].trim();
                if (line.endsWith(':')) return; // Skip label definitions

                const bytes = this.parseLine(line, idx + 1);
                machineCode.push(...bytes);
                this.offset += bytes.length;
            });
            
            return { success: true, code: new Uint8Array(machineCode) };

        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // Helper: Split line into mnemonic and operands
    tokenize(line) {
        // Replace commas with spaces, split by space, remove empty
        const tokens = line.replace(/,/g, ' ').split(/\s+/);
        return { mnemonic: tokens[0].toLowerCase(), operands: tokens.slice(1) };
    }

    estimateInstructionSize(line, lineNum) {
        // Rough estimate, parsing logic logic is duplicated in Pass 2
        // Ideally we abstract parsing logic, but for simplicity we calculate based on type
        // Opcode (1 byte) + Args (1-4 bytes)
        return this.parseLine(line, lineNum, true).length;
    }

    parseLine(line, lineNum, dryRun = false) {
        const { mnemonic, operands } = this.tokenize(line);
        const def = INSTRUCTION_SET[mnemonic];

        if (!def) throw new Error(`Line ${lineNum}: Unknown instruction '${mnemonic}'`);

        // Case 1: No arguments (HLT, RET)
        if (def.type === 'implied') {
            return [def.opcode];
        }

        // Case 2: Array of overloads (MOV, ADD)
        if (Array.isArray(def)) {
            // Determine type of operands to match overload
            const opType = this.detectOperandTypes(operands);
            const match = def.find(d => d.type === opType);
            
            if (!match) throw new Error(`Line ${lineNum}: Invalid operands for '${mnemonic}'. Got: ${opType}`);
            
            return this.encodeInstruction(match.opcode, operands, match.type, lineNum);
        }

        // Case 3: Single definition with args (JMP, PUSH)
        if (def.type) {
             const opType = this.detectOperandTypes(operands);
             // Basic validation (simplified)
             return this.encodeInstruction(def.opcode, operands, def.type, lineNum);
        }
    }

    detectOperandTypes(ops) {
        if (ops.length === 0) return '';
        const types = ops.map(op => {
            if (isRegister(op)) return 'r';
            if (op.startsWith('[') && op.endsWith(']')) return 'm';
            return 'i';
        });
        return types.join(',');
    }

    encodeInstruction(opcode, ops, type, lineNum) {
        const bytes = [opcode];

        // Helper to encode 16-bit number
        const push16 = (num) => {
            bytes.push(num & 0xFF);
            bytes.push((num >> 8) & 0xFF);
        };

        if (type === 'r') {
            const reg = REGISTERS[ops[0].toUpperCase()];
            bytes.push(reg);
        } 
        else if (type === 'i') {
            let val = this.resolveValue(ops[0], lineNum);
            push16(val);
        }
        else if (type === 'r,r') {
            const dst = REGISTERS[ops[0].toUpperCase()];
            const src = REGISTERS[ops[1].toUpperCase()];
            bytes.push((dst << 4) | src); // Pack 2 registers into 1 byte (4 bits each)
        }
        else if (type === 'r,i') {
            const dst = REGISTERS[ops[0].toUpperCase()];
            bytes.push(dst);
            let val = this.resolveValue(ops[1], lineNum);
            push16(val);
        }
        else if (type === 'r,m') {
            const dst = REGISTERS[ops[0].toUpperCase()];
            bytes.push(dst);
            // Parse [addr]
            const addrStr = ops[1].slice(1, -1);
            let addr = this.resolveValue(addrStr, lineNum);
            push16(addr);
        }
        else if (type === 'm,r') {
            // Parse [addr]
            const addrStr = ops[0].slice(1, -1);
            let addr = this.resolveValue(addrStr, lineNum);
            push16(addr);
            const src = REGISTERS[ops[1].toUpperCase()];
            bytes.push(src);
        }
        else if (type === 'm,i') {
            const addrStr = ops[0].slice(1, -1);
            let addr = this.resolveValue(addrStr, lineNum);
            push16(addr);
            let val = this.resolveValue(ops[1], lineNum);
            push16(val);
        }

        return bytes;
    }

    resolveValue(str, lineNum) {
        // Check label
        if (this.labels.hasOwnProperty(str)) {
            return this.labels[str];
        }
        // Check number
        const num = parseNumber(str);
        if (isNaN(num)) throw new Error(`Line ${lineNum}: Invalid value '${str}'`);
        return num;
    }
}