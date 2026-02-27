/**
 * Custom Error Definitions
 */

class KernelError extends Error {
    constructor(message, code = 'E_KERNEL') {
        super(message);
        this.name = 'KernelError';
        this.code = code;
    }
}

class FileSystemError extends KernelError {
    constructor(message, code = 'E_FS') {
        super(message, code);
        this.name = 'FileSystemError';
    }
}

class ProcessError extends KernelError {
    constructor(message, code = 'E_PROC') {
        super(message, code);
        this.name = 'ProcessError';
    }
}

class SyntaxError extends KernelError {
    constructor(message, code = 'E_SYNTAX') {
        super(message, code);
        this.name = 'SyntaxError';
    }
}

window.Errors = {
    KernelError,
    FileSystemError,
    ProcessError,
    SyntaxError,

    // Common FS Errors
    ENOENT: (path) => new FileSystemError(`No such file or directory: ${path}`, 'ENOENT'),
    EACCES: (path) => new FileSystemError(`Permission denied: ${path}`, 'EACCES'),
    EEXIST: (path) => new FileSystemError(`File exists: ${path}`, 'EEXIST'),
    ENOTDIR: (path) => new FileSystemError(`Not a directory: ${path}`, 'ENOTDIR'),
    EISDIR: (path) => new FileSystemError(`Is a directory: ${path}`, 'EISDIR'),

    // Common Process Errors
    ESRCH: (pid) => new ProcessError(`No such process: ${pid}`, 'ESRCH'),
    EPERM: () => new ProcessError(`Operation not permitted`, 'EPERM'),

    // Shell Errors
    ECOMMAND: (cmd) => new KernelError(`command not found: ${cmd}`, 'ECOMMAND')
};
