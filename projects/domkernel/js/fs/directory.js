/**
 * Directory Abstraction
 */
class Directory {
    constructor(inode) {
        this.inode = inode;
    }

    async getEntries() {
        // Entries are stored in the block data as JSON mapping name -> ino
        if (this.inode.blocks.length === 0) return {};
        const block = await VFSDB.get(CONSTANTS.STORE_BLOCKS, this.inode.blocks[0]);
        if (!block) return {};
        try {
            return JSON.parse(block.data);
        } catch (e) {
            return {};
        }
    }

    async setEntries(entries) {
        const content = JSON.stringify(entries);
        const newBlockId = this.inode.blocks.length > 0 ? this.inode.blocks[0] : Utils.generateUUID();

        await VFSDB.put(CONSTANTS.STORE_BLOCKS, { id: newBlockId, data: content });
        this.inode.blocks = [newBlockId];
        this.inode.size = new TextEncoder().encode(content).length;
        this.inode.updateTimes(true, true, true);
        await window.VfsInstance.saveInode(this.inode);
    }

    async addEntry(name, ino) {
        const entries = await this.getEntries();
        if (entries[name]) throw Errors.EEXIST(name);
        entries[name] = ino;
        await this.setEntries(entries);
    }

    async removeEntry(name) {
        const entries = await this.getEntries();
        if (!entries[name]) throw Errors.ENOENT(name);
        delete entries[name];
        await this.setEntries(entries);
    }

    async getEntry(name) {
        const entries = await this.getEntries();
        return entries[name] || null;
    }
}

window.Directory = Directory;
