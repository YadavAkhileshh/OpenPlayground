/**
 * File System Superblock
 * Tracks global FS state and next inode assignments.
 */
class Superblock {
    constructor() {
        this.nextInode = CONSTANTS.ROOT_INODE + 1;
        this.totalInodes = 0;
        this.created_at = Date.now();
        this.dirty = false;
    }

    async load() {
        const data = await VFSDB.get(CONSTANTS.STORE_SUPER, 'main');
        if (data) {
            this.nextInode = data.nextInode;
            this.totalInodes = data.totalInodes;
            this.created_at = data.created_at;
        } else {
            this.dirty = true;
            await this.save();
        }
    }

    async save() {
        if (!this.dirty) return;
        await VFSDB.put(CONSTANTS.STORE_SUPER, {
            id: 'main',
            nextInode: this.nextInode,
            totalInodes: this.totalInodes,
            created_at: this.created_at
        });
        this.dirty = false;
    }

    async allocateInode() {
        const ino = this.nextInode++;
        this.totalInodes++;
        this.dirty = true;
        await this.save();
        return ino;
    }

    async deallocateInode() {
        this.totalInodes--;
        this.dirty = true;
        await this.save();
    }
}

window.Superblock = Superblock;
