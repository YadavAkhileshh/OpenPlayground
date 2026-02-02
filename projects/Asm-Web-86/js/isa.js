/**
 * Instruction Set Architecture Definitions
 * Maps mnemonics to internal Opcodes and defining instruction structures.
 */

// Define OpCodes (Operations)
export const OPCODES = {
    NOP: 0x00,
    MOV_REG_REG: 0x10, // MOV AX, BX
    MOV_REG_IMM: 0x11, // MOV AX, 1234
    MOV_REG_MEM: 0x12, // MOV AX, [1000]
    MOV_MEM_REG: 0x13, // MOV [1000], AX
    MOV_MEM_IMM: 0x14, // MOV [1000], 50
    
    ADD_REG_REG: 0x20,
    ADD_REG_IMM: 0x21,
    SUB_REG_REG: 0x22,
    SUB_REG_IMM: 0x23,
    INC_REG:     0x24,
    DEC_REG:     0x25,
    
    AND_REG_REG: 0x30,
    OR_REG_REG:  0x31,
    XOR_REG_REG: 0x32,
    NOT_REG:     0x33,
    
    CMP_REG_REG: 0x40,
    CMP_REG_IMM: 0x41,
    
    JMP_IMM:     0x50, // Unconditional Jump
    JZ_IMM:      0x51, // Jump if Zero (JE)
    JNZ_IMM:     0x52, // Jump if Not Zero (JNE)
    JS_IMM:      0x53, // Jump if Sign (Negative)
    JC_IMM:      0x54, // Jump if Carry
    
    PUSH_REG:    0x60,
    PUSH_IMM:    0x61,
    POP_REG:     0x62,
    
    CALL_IMM:    0x70,
    RET:         0x71,
    
    HLT:         0xFF  // Halt execution
};

// Register Map
export const REGISTERS = {
    AX: 0,
    BX: 1,
    CX: 2,
    DX: 3,
    IP: 4, // Instruction Pointer
    SP: 5  // Stack Pointer
};

export const REGISTER_NAMES = ['AX', 'BX', 'CX', 'DX', 'IP', 'SP'];

// Instruction Metadata for Assembler
// type: 0=no_args, 1=reg, 2=imm, 3=reg,reg, 4=reg,imm, 5=reg,mem, 6=mem,reg, 7=mem,imm
export const INSTRUCTION_SET = {
    'nop': { opcode: OPCODES.NOP, type: 'implied' },
    'hlt': { opcode: OPCODES.HLT, type: 'implied' },
    'ret': { opcode: OPCODES.RET, type: 'implied' },
    
    'inc': { opcode: OPCODES.INC_REG, type: 'r' },
    'dec': { opcode: OPCODES.DEC_REG, type: 'r' },
    'not': { opcode: OPCODES.NOT_REG, type: 'r' },
    'push': [{ type: 'r', opcode: OPCODES.PUSH_REG }, { type: 'i', opcode: OPCODES.PUSH_IMM }],
    'pop':  { opcode: OPCODES.POP_REG, type: 'r' },
    
    'jmp': { opcode: OPCODES.JMP_IMM, type: 'i' }, // i = label/imm
    'jz':  { opcode: OPCODES.JZ_IMM, type: 'i' },
    'je':  { opcode: OPCODES.JZ_IMM, type: 'i' }, // Alias
    'jnz': { opcode: OPCODES.JNZ_IMM, type: 'i' },
    'jne': { opcode: OPCODES.JNZ_IMM, type: 'i' }, // Alias
    'js':  { opcode: OPCODES.JS_IMM, type: 'i' },
    'call':{ opcode: OPCODES.CALL_IMM, type: 'i' },

    'mov': [
        { type: 'r,r', opcode: OPCODES.MOV_REG_REG },
        { type: 'r,i', opcode: OPCODES.MOV_REG_IMM },
        { type: 'r,m', opcode: OPCODES.MOV_REG_MEM },
        { type: 'm,r', opcode: OPCODES.MOV_MEM_REG },
        { type: 'm,i', opcode: OPCODES.MOV_MEM_IMM }
    ],
    'add': [
        { type: 'r,r', opcode: OPCODES.ADD_REG_REG },
        { type: 'r,i', opcode: OPCODES.ADD_REG_IMM }
    ],
    'sub': [
        { type: 'r,r', opcode: OPCODES.SUB_REG_REG },
        { type: 'r,i', opcode: OPCODES.SUB_REG_IMM }
    ],
    'cmp': [
        { type: 'r,r', opcode: OPCODES.CMP_REG_REG },
        { type: 'r,i', opcode: OPCODES.CMP_REG_IMM }
    ],
    'and': [{ type: 'r,r', opcode: OPCODES.AND_REG_REG }],
    'or':  [{ type: 'r,r', opcode: OPCODES.OR_REG_REG }],
    'xor': [{ type: 'r,r', opcode: OPCODES.XOR_REG_REG }]
};