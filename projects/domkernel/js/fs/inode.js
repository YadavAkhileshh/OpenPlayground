/**
 * INode Implementation
 * Represents metadata for files/directories.
 */
class INode {
    constructor(ino, type, mode, uid = 0, gid = 0) {
        this.ino = ino;
        this.type = type; // FILE_TYPES enum
        this.mode = mode; // permissions octal
        this.uid = uid;
        this.gid = gid;
        this.size = 0;
        this.atime = Date.now(); // Access time
        this.mtime = Date.now(); // Mod time
        this.ctime = Date.now(); // Change time
        this.blocks = []; // Array of block IDs mapping to indexedDB blocks store
    }

    static fromData(data) {
        const inode = new INode(data.ino, data.type, data.mode, data.uid, data.gid);
        inode.size = data.size;
        inode.atime = data.atime;
        inode.mtime = data.mtime;
        inode.ctime = data.ctime;
        inode.blocks = data.blocks || [];
        return inode;
    }

    toData() {
        return {
            ino: this.ino,
            type: this.type,
            mode: this.mode,
            uid: this.uid,
            gid: this.gid,
            size: this.size,
            atime: this.atime,
            mtime: this.mtime,
            ctime: this.ctime,
            blocks: this.blocks
        };
    }

    isDirectory() {
        return this.type === CONSTANTS.FILE_TYPES.DIRECTORY;
    }

    isFile() {
        return this.type === CONSTANTS.FILE_TYPES.REGULAR || this.type === CONSTANTS.FILE_TYPES.EXECUTABLE;
    }

    isExecutable() {
        return this.type === CONSTANTS.FILE_TYPES.EXECUTABLE;
    }

    updateTimes(access = true, modify = true, change = true) {
        const now = Date.now();
        if (access) this.atime = now;
        if (modify) this.mtime = now;
        if (change) this.ctime = now;
    }
}

window.INode = INode;
