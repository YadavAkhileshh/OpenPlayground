class Command {
    execute() { }
    undo() { }
}

class History {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxSize = 50;
    }

    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = []; // Clear redo on new action
        if (this.undoStack.length > this.maxSize) this.undoStack.shift();
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const cmd = this.undoStack.pop();
        cmd.undo();
        this.redoStack.push(cmd);
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const cmd = this.redoStack.pop();
        cmd.execute();
        this.undoStack.push(cmd);
    }
}

// Commands
class AddMeshCommand extends Command {
    constructor(scene, mesh) {
        super();
        this.scene = scene;
        this.mesh = mesh;
    }

    execute() {
        this.scene.meshes.push(this.mesh);
        this.scene.activeMesh = this.mesh;
    }

    undo() {
        const index = this.scene.meshes.indexOf(this.mesh);
        if (index > -1) {
            this.scene.meshes.splice(index, 1);
            this.scene.activeMesh = this.scene.meshes.length > 0 ? this.scene.meshes[this.scene.meshes.length - 1] : null;
        }
    }
}

class RemoveMeshCommand extends Command {
    constructor(scene, mesh) {
        super();
        this.scene = scene;
        this.mesh = mesh;
    }

    execute() {
        const index = this.scene.meshes.indexOf(this.mesh);
        if (index > -1) {
            this.scene.meshes.splice(index, 1);
            this.scene.activeMesh = null;
        }
    }

    undo() {
        this.scene.meshes.push(this.mesh);
        this.scene.activeMesh = this.mesh;
    }
}

class TransformCommand extends Command {
    constructor(mesh, oldPos, newPos, oldRot, newRot, oldScale, newScale) {
        super();
        this.mesh = mesh;
        this.oldPos = oldPos.clone();
        this.newPos = newPos.clone();
        this.oldRot = oldRot.clone();
        this.newRot = newRot.clone();
        this.oldScale = oldScale.clone();
        this.newScale = newScale.clone();
    }

    execute() {
        this.mesh.position = this.newPos.clone();
        this.mesh.rotation = this.newRot.clone();
        this.mesh.scale = this.newScale.clone();
        this.mesh.updateMatrix();
    }

    undo() {
        this.mesh.position = this.oldPos.clone();
        this.mesh.rotation = this.oldRot.clone();
        this.mesh.scale = this.oldScale.clone();
        this.mesh.updateMatrix();
    }
}
