/**
 * Data File Abstraction
 */
class File {
    constructor(inode) {
        this.inode = inode;
    }

    async read() {
        this.inode.updateTimes(true, false, false);
        await window.VfsInstance.saveInode(this.inode);

        let content = '';
        for (const blockId of this.inode.blocks) {
            const block = await VFSDB.get(CONSTANTS.STORE_BLOCKS, blockId);
            if (block) content += block.data;
        }
        return content;
    }

    async write(content, append = false) {
        let newContent = content;
        if (append) {
            const existing = await this.read();
            newContent = existing + content;
        }

        // Clean up old blocks
        for (const blockId of this.inode.blocks) {
            await VFSDB.delete(CONSTANTS.STORE_BLOCKS, blockId);
        }

        // Single block strategy for simplicity for now, up to max IndexedDb value
        const newBlockId = Utils.generateUUID();
        await VFSDB.put(CONSTANTS.STORE_BLOCKS, { id: newBlockId, data: newContent });

        this.inode.blocks = [newBlockId];
        this.inode.size = new TextEncoder().encode(newContent).length;
        this.inode.updateTimes(true, true, true);
        await window.VfsInstance.saveInode(this.inode);
    }
}

window.File = File;
