/**
 * Path Utilities
 * Handling absolute and relative paths in the VFS.
 */
class PathUtils {
    static isAbsolute(path) {
        return path.startsWith('/');
    }

    static normalize(path) {
        if (!path) return '/';
        const isAbs = this.isAbsolute(path);
        const parts = path.split('/').filter(p => p !== '');

        const stack = [];
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                if (stack.length > 0) stack.pop();
            } else {
                stack.push(part);
            }
        }

        let normalized = stack.join('/');
        if (isAbs) normalized = '/' + normalized;
        return normalized === '' ? '/' : normalized;
    }

    static join(...paths) {
        return this.normalize(paths.join('/'));
    }

    static resolve(cwd, path) {
        if (this.isAbsolute(path)) return this.normalize(path);
        return this.join(cwd, path);
    }

    static dirname(path) {
        const norm = this.normalize(path);
        if (norm === '/') return '/';
        const lastSlash = norm.lastIndexOf('/');
        if (lastSlash === 0) return '/';
        return norm.substring(0, lastSlash);
    }

    static basename(path) {
        const norm = this.normalize(path);
        if (norm === '/') return '';
        const lastSlash = norm.lastIndexOf('/');
        return norm.substring(lastSlash + 1);
    }
}

window.PathUtils = PathUtils;
