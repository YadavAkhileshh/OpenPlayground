/**
 * Virtual File System Manager
 * Wraps IndexedDB and provides POSIX-like API calls.
 */
class VFS {
    constructor() {
        this.superblock = new Superblock();
        this.mountPoint = '/';
        this.ready = false;
    }

    async init() {
        await VFSDB.init();
        await this.superblock.load();

        // Check if root exists
        const rootInodeData = await VFSDB.get(CONSTANTS.STORE_INODES, CONSTANTS.ROOT_INODE);
        if (!rootInodeData) {
            Logger.info('VFS', 'Formatting new filesystem...');
            await this.format();
        }

        this.ready = true;
        EventBus.emit(CONSTANTS.EVENTS.FS_READY);
        Logger.info('VFS', 'File system mounted.');
    }

    async format() {
        await VFSDB.clear(CONSTANTS.STORE_INODES);
        await VFSDB.clear(CONSTANTS.STORE_BLOCKS);

        // Re-init superblock
        this.superblock.nextInode = CONSTANTS.ROOT_INODE;
        this.superblock.totalInodes = 0;

        // Create root dir
        const rootIno = await this.superblock.allocateInode();
        const rootInode = new INode(rootIno, CONSTANTS.FILE_TYPES.DIRECTORY, 0o755);
        await this.saveInode(rootInode);

        // Create initial hierarchy
        await this.mkdir('/bin');
        await this.mkdir('/home');
        await this.mkdir('/home/user');
        await this.mkdir('/var');
        await this.mkdir('/var/log');

        const welcome = "Welcome to DOMKernel.\nType 'help' for a list of commands.\n";
        await this.writeFile('/home/user/readme.txt', welcome);
    }

    async saveInode(inode) {
        await VFSDB.put(CONSTANTS.STORE_INODES, inode.toData());
    }

    async getInode(ino) {
        const data = await VFSDB.get(CONSTANTS.STORE_INODES, ino);
        if (!data) return null;
        return INode.fromData(data);
    }

    async resolvePath(path) {
        if (path === '/') return await this.getInode(CONSTANTS.ROOT_INODE);

        const parts = PathUtils.normalize(path).split('/').filter(p => p !== '');
        let currentIno = await this.getInode(CONSTANTS.ROOT_INODE);

        for (const part of parts) {
            if (!currentIno.isDirectory()) throw Errors.ENOTDIR(path);
            const dir = new Directory(currentIno);
            const ino = await dir.getEntry(part);
            if (!ino) throw Errors.ENOENT(path);
            currentIno = await this.getInode(ino);
        }

        return currentIno;
    }

    async stat(path) {
        const inode = await this.resolvePath(path);
        return inode.toData();
    }

    async readdir(path) {
        const inode = await this.resolvePath(path);
        if (!inode.isDirectory()) throw Errors.ENOTDIR(path);
        const dir = new Directory(inode);
        const entries = await dir.getEntries();
        return Object.keys(entries);
    }

    async mkdir(path) {
        const parentPath = PathUtils.dirname(path);
        const name = PathUtils.basename(path);

        if (!name) throw new Errors.FileSystemError('Invalid directory name');

        const parentInode = await this.resolvePath(parentPath);
        if (!parentInode.isDirectory()) throw Errors.ENOTDIR(parentPath);

        const dir = new Directory(parentInode);
        const existing = await dir.getEntry(name);
        if (existing) throw Errors.EEXIST(path);

        const newIno = await this.superblock.allocateInode();
        const newInode = new INode(newIno, CONSTANTS.FILE_TYPES.DIRECTORY, 0o755);
        await this.saveInode(newInode);

        await dir.addEntry(name, newIno);
        EventBus.emit(CONSTANTS.EVENTS.FS_CREATED, { path, type: 'directory' });
    }

    async rmdir(path) {
        const inode = await this.resolvePath(path);
        if (!inode.isDirectory()) throw Errors.ENOTDIR(path);

        const dir = new Directory(inode);
        const entries = await dir.getEntries();
        if (Object.keys(entries).length > 0) throw new Errors.FileSystemError('Directory not empty: ' + path);

        // Remove from parent
        const parentPath = PathUtils.dirname(path);
        const name = PathUtils.basename(path);
        const parentInode = await this.resolvePath(parentPath);
        const parentDir = new Directory(parentInode);
        await parentDir.removeEntry(name);

        // Clean blocks
        for (const blockId of inode.blocks) {
            await VFSDB.delete(CONSTANTS.STORE_BLOCKS, blockId);
        }
        await VFSDB.delete(CONSTANTS.STORE_INODES, inode.ino);
        await this.superblock.deallocateInode();
        EventBus.emit(CONSTANTS.EVENTS.FS_DELETED, { path, type: 'directory' });
    }

    async readFile(path) {
        const inode = await this.resolvePath(path);
        if (inode.isDirectory()) throw Errors.EISDIR(path);
        const file = new File(inode);
        return await file.read();
    }

    async writeFile(path, content, append = false) {
        const parentPath = PathUtils.dirname(path);
        const name = PathUtils.basename(path);

        const parentInode = await this.resolvePath(parentPath);
        if (!parentInode.isDirectory()) throw Errors.ENOTDIR(parentPath);

        const dir = new Directory(parentInode);
        let ino = await dir.getEntry(name);
        let inode;

        if (!ino) {
            // Create new file
            ino = await this.superblock.allocateInode();
            inode = new INode(ino, CONSTANTS.FILE_TYPES.REGULAR, 0o644);
            await this.saveInode(inode);
            await dir.addEntry(name, ino);
            EventBus.emit(CONSTANTS.EVENTS.FS_CREATED, { path, type: 'file' });
        } else {
            inode = await this.getInode(ino);
            if (inode.isDirectory()) throw Errors.EISDIR(path);
        }

        const file = new File(inode);
        await file.write(content, append);
        EventBus.emit(CONSTANTS.EVENTS.FS_MODIFIED, { path });
    }

    async unlink(path) {
        const inode = await this.resolvePath(path);
        if (inode.isDirectory()) throw Errors.EISDIR(path); // Use rmdir for directories

        const parentPath = PathUtils.dirname(path);
        const name = PathUtils.basename(path);
        const parentInode = await this.resolvePath(parentPath);
        const parentDir = new Directory(parentInode);
        await parentDir.removeEntry(name);

        for (const blockId of inode.blocks) {
            await VFSDB.delete(CONSTANTS.STORE_BLOCKS, blockId);
        }
        await VFSDB.delete(CONSTANTS.STORE_INODES, inode.ino);
        await this.superblock.deallocateInode();
        EventBus.emit(CONSTANTS.EVENTS.FS_DELETED, { path, type: 'file' });
    }
}

window.VfsInstance = new VFS();
