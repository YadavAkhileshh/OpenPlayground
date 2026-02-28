/**
 * Global Constants
 */

const CONSTANTS = {
    // OS Identification
    OS_NAME: 'DOMKernel',
    OS_VERSION: '1.0.0',
    
    // File System limits
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILENAME_LENGTH: 255,
    MAX_INODES: 4096,
    
    // VFS Details
    ROOT_INODE: 1,
    DB_NAME: 'DOMKernel_VFS',
    DB_VERSION: 1,
    STORE_INODES: 'inodes',
    STORE_BLOCKS: 'blocks',
    STORE_SUPER: 'superblock',
    
    // Process limits
    MAX_PIDS: 32768,
    WORKER_POOL_SIZE: navigator.hardwareConcurrency || 4,
    
    // Default Environments
    DEFAULT_ENV: {
        'PATH': '/bin:/usr/bin',
        'HOME': '/home/user',
        'USER': 'user',
        'SHELL': '/bin/sh',
        'TERM': 'dom-term'
    },
    
    // Event Names
    EVENTS: {
        FS_READY: 'fs:ready',
        FS_CREATED: 'fs:created',
        FS_DELETED: 'fs:deleted',
        FS_MODIFIED: 'fs:modified',
        PROCESS_START: 'proc:start',
        PROCESS_EXIT: 'proc:exit',
        UI_WINDOW_OPEN: 'ui:window:open',
        UI_WINDOW_CLOSE: 'ui:window:close',
        UI_WINDOW_FOCUS: 'ui:window:focus',
        SYS_BOOT_DONE: 'sys:boot:done'
    },
    
    // File Types
    FILE_TYPES: {
        REGULAR: 0,
        DIRECTORY: 1,
        SYMLINK: 2,
        EXECUTABLE: 3,
        CHAR_DEVICE: 4
    },
    
    // Permission bits (Octal style)
    PERMISSIONS: {
        READ: 4,
        WRITE: 2,
        EXECUTE: 1
    }
};

window.CONSTANTS = CONSTANTS;
