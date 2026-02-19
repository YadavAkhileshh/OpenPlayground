class Exporter {
    static toSTL(meshes) {
        let output = "solid CSGModeler\n";

        for (const mesh of meshes) {
            const polys = mesh.getTransformedPolygons();
            for (const poly of polys) {
                // Triangulate carefully (Fan method)
                const v0 = poly.vertices[0];
                for (let i = 1; i < poly.vertices.length - 1; i++) {
                    const v1 = poly.vertices[i];
                    const v2 = poly.vertices[i + 1];

                    // Compute face normal
                    const e1 = v1.pos.sub(v0.pos);
                    const e2 = v2.pos.sub(v0.pos);
                    const n = e1.cross(e2).normalize();

                    output += `facet normal ${n.x} ${n.y} ${n.z}\n`;
                    output += `  outer loop\n`;
                    output += `    vertex ${v0.pos.x} ${v0.pos.y} ${v0.pos.z}\n`;
                    output += `    vertex ${v1.pos.x} ${v1.pos.y} ${v1.pos.z}\n`;
                    output += `    vertex ${v2.pos.x} ${v2.pos.y} ${v2.pos.z}\n`;
                    output += `  endloop\n`;
                    output += `endfacet\n`;
                }
            }
        }

        output += "endsolid CSGModeler\n";
        return output;
    }

    static download(filename, content) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // Scene Serialization
    // Saving actual Constructive solid geometry history is hard without a graph.
    // Saving final meshes is easier but loses editing capability (unless we kept the trees).
    // For now, we save "Current State" as list of polys + materials.
    // To restore "Objectness", we save primitive type if available, otherwise just "Imported Mesh".
    static serialize(scene) {
        const data = scene.meshes.map(m => {
            return {
                type: 'Mesh', // Future: 'Cube', 'Sphere' etc if we kept params
                transform: {
                    pos: m.position,
                    rot: m.rotation,
                    scale: m.scale
                },
                material: m.material,
                // We must save polygons because CSG ops destructively modified them
                polygons: m.csg.polygons.map(p => {
                    return {
                        vertices: p.vertices.map(v => ({ x: v.pos.x, y: v.pos.y, z: v.pos.z, nx: v.normal.x, ny: v.normal.y, nz: v.normal.z }))
                    };
                })
            };
        });
        return JSON.stringify(data, null, 2);
    }

    static deserialize(json) {
        const data = JSON.parse(json);
        return data.map(obj => {
            const polygons = obj.polygons.map(pData => {
                const verts = pData.vertices.map(v => new Vertex(new Vector3(v.x, v.y, v.z), new Vector3(v.nx, v.ny, v.nz)));
                return new Polygon(verts);
            });
            const mesh = Mesh.fromCSG(CSG.fromPolygons(polygons));

            if (obj.transform) {
                mesh.position = new Vector3(obj.transform.pos.x, obj.transform.pos.y, obj.transform.pos.z);
                mesh.rotation = new Vector3(obj.transform.rot.x, obj.transform.rot.y, obj.transform.rot.z);
                mesh.scale = new Vector3(obj.transform.scale.x, obj.transform.scale.y, obj.transform.scale.z);
                mesh.updateMatrix();
            }

            if (obj.material) {
                mesh.material = new Material(obj.material.color, obj.material);
            }
            return mesh;
        });
    }
}
