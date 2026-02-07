import { OPCODES, REGISTERS } from './isa.js';
import { toHex16 } from './utils.js';

export class CPU {
    constructor(memory, registers, consoleLogger) {
        this.mem = memory;
        this.reg = registers;
        this.log = consoleLogger;
        this.running = false;
        this.halted = false;
        this.instructionsExecuted = 0;
    }

    reset() {
        this.mem.reset();
        this.reg.reset();
        this.halted = false;
        this.instructionsExecuted = 0;
        this.log("CPU Reset.");
    }

    // Single Clock Cycle
    step() {
        if (this.halted) return false;

        const ip = this.reg.get(REGISTERS.IP);
        
        // 1. Fetch
        if (ip >= this.mem.size) {
            this.log("Error: IP out of bounds. Halting.", "error");
            this.halted = true;
            return false;
        }

        const opcode = this.mem.getByte(ip);
        this.reg.set(REGISTERS.IP, ip + 1); // Advance IP

        // 2. Decode & Execute
        try {
            this.execute(opcode);
            this.instructionsExecuted++;
        } catch (e) {
            this.log(`Runtime Error at ${toHex16(ip)}: ${e.message}`, "error");
            this.halted = true;
            return false;
        }

        return true;
    }

    fetchByte() {
        const ip = this.reg.get(REGISTERS.IP);
        const val = this.mem.getByte(ip);
        this.reg.set(REGISTERS.IP, ip + 1);
        return val;
    }

    fetchWord() {
        const ip = this.reg.get(REGISTERS.IP);
        const val = this.mem.getWord(ip);
        this.reg.set(REGISTERS.IP, ip + 2);
        return val;
    }

    execute(opcode) {
        switch (opcode) {
            case OPCODES.NOP:
                // Do nothing
                break;
            
            case OPCODES.HLT:
                this.halted = true;
                this.log("HLT instruction reached. Execution stopped.", "success");
                break;

            // --- MOVES ---
            case OPCODES.MOV_REG_IMM: {
                const reg = this.fetchByte();
                const val = this.fetchWord();
                this.reg.set(reg, val);
                break;
            }
            case OPCODES.MOV_REG_REG: {
                const byte = this.fetchByte();
                const dst = (byte >> 4) & 0x0F;
                const src = byte & 0x0F;
                this.reg.set(dst, this.reg.get(src));
                break;
            }
            case OPCODES.MOV_REG_MEM: {
                const reg = this.fetchByte();
                const addr = this.fetchWord();
                const val = this.mem.getWord(addr);
                this.reg.set(reg, val);
                break;
            }
            case OPCODES.MOV_MEM_REG: {
                const addr = this.fetchWord();
                const reg = this.fetchByte();
                const val = this.reg.get(reg);
                this.mem.setWord(addr, val);
                break;
            }
            case OPCODES.MOV_MEM_IMM: {
                const addr = this.fetchWord();
                const val = this.fetchWord();
                this.mem.setWord(addr, val);
                break;
            }

            // --- ARITHMETIC ---
            case OPCODES.ADD_REG_IMM: {
                const reg = this.fetchByte();
                const val = this.fetchWord();
                const current = this.reg.get(reg);
                const res = current + val;
                this.reg.set(reg, res & 0xFFFF);
                this.reg.updateFlags(res);
                break;
            }
            case OPCODES.ADD_REG_REG: {
                const byte = this.fetchByte();
                const dst = (byte >> 4) & 0x0F;
                const src = byte & 0x0F;
                const res = this.reg.get(dst) + this.reg.get(src);
                this.reg.set(dst, res & 0xFFFF);
                this.reg.updateFlags(res);
                break;
            }
            case OPCODES.SUB_REG_IMM: {
                const reg = this.fetchByte();
                const val = this.fetchWord();
                const current = this.reg.get(reg);
                const res = current - val;
                this.reg.set(reg, res & 0xFFFF);
                this.reg.updateFlags(res);
                break;
            }
            case OPCODES.INC_REG: {
                const reg = this.fetchByte();
                const res = this.reg.get(reg) + 1;
                this.reg.set(reg, res & 0xFFFF);
                this.reg.updateFlags(res);
                break;
            }
            case OPCODES.DEC_REG: {
                const reg = this.fetchByte();
                const res = this.reg.get(reg) - 1;
                this.reg.set(reg, res & 0xFFFF);
                this.reg.updateFlags(res);
                break;
            }

            // --- COMPARISON & JUMPS ---
            case OPCODES.CMP_REG_IMM: {
                const reg = this.fetchByte();
                const val = this.fetchWord();
                const res = this.reg.get(reg) - val;
                this.reg.updateFlags(res); // CMP only updates flags
                break;
            }
            case OPCODES.JMP_IMM: {
                const addr = this.fetchWord();
                this.reg.set(REGISTERS.IP, addr);
                break;
            }
            case OPCODES.JZ_IMM: {
                const addr = this.fetchWord();
                if (this.reg.flags.Z) this.reg.set(REGISTERS.IP, addr);
                else this.reg.set(REGISTERS.IP, this.reg.get(REGISTERS.IP)); // Continue (fetched addr already incremented IP)
                break;
            }
            case OPCODES.JNZ_IMM: {
                const addr = this.fetchWord();
                if (!this.reg.flags.Z) this.reg.set(REGISTERS.IP, addr);
                break;
            }

            // --- STACK ---
            case OPCODES.PUSH_IMM: {
                const val = this.fetchWord();
                let sp = this.reg.get(REGISTERS.SP);
                sp -= 2;
                this.mem.setWord(sp, val);
                this.reg.set(REGISTERS.SP, sp);
                break;
            }
            case OPCODES.PUSH_REG: {
                const reg = this.fetchByte();
                const val = this.reg.get(reg);
                let sp = this.reg.get(REGISTERS.SP);
                sp -= 2;
                this.mem.setWord(sp, val);
                this.reg.set(REGISTERS.SP, sp);
                break;
            }
            case OPCODES.POP_REG: {
                const reg = this.fetchByte();
                let sp = this.reg.get(REGISTERS.SP);
                const val = this.mem.getWord(sp);
                this.reg.set(reg, val);
                this.reg.set(REGISTERS.SP, sp + 2);
                break;
            }
            
            // --- CALL/RET ---
            case OPCODES.CALL_IMM: {
                const addr = this.fetchWord();
                let sp = this.reg.get(REGISTERS.SP);
                // Push return address (current IP)
                sp -= 2;
                this.mem.setWord(sp, this.reg.get(REGISTERS.IP));
                this.reg.set(REGISTERS.SP, sp);
                // Jump
                this.reg.set(REGISTERS.IP, addr);
                break;
            }
            case OPCODES.RET: {
                let sp = this.reg.get(REGISTERS.SP);
                const retAddr = this.mem.getWord(sp);
                this.reg.set(REGISTERS.SP, sp + 2);
                this.reg.set(REGISTERS.IP, retAddr);
                break;
            }

            default:
                throw new Error(`Unknown Opcode: ${toHex16(opcode)}`);
        }
    }
}