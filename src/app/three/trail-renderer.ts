import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Mesh,
  Object3D,
  Quaternion,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Vector3,
  Vector4
} from 'three';

const MaxHeadVertices = 128;
const LocalOrientationTangent = new Vector3(1, 0, 0);
const LocalHeadOrigin = new Vector3(0, 0, 0);
const PositionComponentCount = 3;
const UVComponentCount = 2;
const IndicesPerFace = 3;
const FacesPerQuad = 2;

// language=GLSL
const BaseVertexShader = ShaderChunk.common + '\n' + ShaderChunk.logdepthbuf_pars_vertex + `
  attribute float nodeID;
  attribute float nodeVertexID;
  attribute vec3 nodeCenter;

  uniform float minID;
  uniform float maxID;
  uniform float trailLength;
  uniform float maxTrailLength;
  uniform float verticesPerNode;

  uniform vec4 headColor;
  uniform vec4 tailColor;

  varying vec4 vColor;

  void main() {
    float fraction = (maxID - nodeID) / (maxID - minID);
    vColor = (1.0 - fraction) * headColor + fraction * tailColor;
    vec4 realPosition = vec4((1.0 - fraction) * position.xyz + fraction * nodeCenter.xyz, 1.0);
    gl_Position = projectionMatrix * viewMatrix * realPosition;
    ` + ShaderChunk.logdepthbuf_vertex + `
  }
`;

// language=GLSL
const BaseFragmentShader = ShaderChunk.logdepthbuf_pars_fragment + `
  varying vec4 vColor;
  uniform sampler2D texture;
  void main() {
    gl_FragColor = vColor;
    ` + ShaderChunk.logdepthbuf_fragment + `
  }
`;

/**
 * Based on https://github.com/mkkellogg/TrailRendererJS .
 */
export class Trail {

  active = false;

  targetObject: Object3D;

  geometry: BufferGeometry = null;
  mesh: Mesh = null;
  material: ShaderMaterial;
  private nodeCenters: Vector3[] = null;

  private lastNodeCenter: Vector3 = null;
  private currentNodeCenter: Vector3 = null;
  private lastOrientationDir: Vector3 = null;
  private currentLength = 0;
  private currentEnd = 0;
  private currentNodeID = 0;

  private length = 0;
  private vertexCount = 0;
  private faceCount = 0;
  private VerticesPerNode = 0;
  private FacesPerNode = 0;
  private FaceIndicesPerNode = 0;

  private localHeadGeometry: Vector3[];

  private previousPos: Vector3 = new Vector3();
  private tangent: Vector3 = new Vector3();

  private tempVector = new Vector3();
  private tempQuaternion = new Quaternion();
  private tempOffset = new Vector3();
  private tempLocalHeadGeometry: Vector3[] = [];

  constructor(public readonly scene: Scene) {
    for (let i = 0; i < MaxHeadVertices; i++) {
      const vertex = new Vector3();
      this.tempLocalHeadGeometry.push(vertex);
    }
  }

  createMaterial(customUniforms: any = {}): ShaderMaterial {
    customUniforms.trailLength = {type: 'f', value: null};
    customUniforms.verticesPerNode = {type: 'f', value: null};
    customUniforms.minID = {type: 'f', value: null};
    customUniforms.maxID = {type: 'f', value: null};
    customUniforms.maxTrailLength = {type: 'f', value: null};

    customUniforms.headColor = {type: 'v4', value: new Vector4()};
    customUniforms.tailColor = {type: 'v4', value: new Vector4()};

    return new ShaderMaterial({
      uniforms: customUniforms,
      vertexShader: BaseVertexShader,
      fragmentShader: BaseFragmentShader,

      transparent: true,
      alphaTest: 0.5,

      blending: AdditiveBlending,

      depthTest: true,
      depthWrite: false,

      side: DoubleSide
    });
  }

  initialize(material: ShaderMaterial, length: number, localHeadWidth: number,
             localHeadGeometry: Vector3[], targetObject: Object3D) {
    this.deactivate();
    this.destroyMesh();

    this.length = (length > 0) ? length + 1 : 0;
    this.targetObject = targetObject;
    this.previousPos.set(0, 0, 0);
    this.targetObject.localToWorld(this.previousPos);

    this.initializeLocalHeadGeometry(localHeadWidth, localHeadGeometry);

    this.nodeCenters = [];

    for (let i = 0; i < this.length; i++) {
      this.nodeCenters[i] = new Vector3();
    }

    this.material = material;

    this.initializeGeometry();
    this.initializeMesh();

    this.material.uniforms.trailLength.value = 0;
    this.material.uniforms.minID.value = 0;
    this.material.uniforms.maxID.value = 0;
    this.material.uniforms.maxTrailLength.value = this.length;
    this.material.uniforms.verticesPerNode.value = this.VerticesPerNode;

    this.reset();
  }

  private initializeLocalHeadGeometry(localHeadWidth: number = 1.0, localHeadGeometry: Vector3[]) {
    this.localHeadGeometry = [];

    if (!localHeadGeometry) {
      const halfWidth = localHeadWidth / 2.0;

      this.localHeadGeometry.push(new Vector3(-halfWidth, 0, 0));
      this.localHeadGeometry.push(new Vector3(halfWidth, 0, 0));

      this.VerticesPerNode = 2;
    } else {
      this.VerticesPerNode = 0;
      for (let i = 0; i < localHeadGeometry.length && i < MaxHeadVertices; i++) {
        const vertex = localHeadGeometry[i];

        if (vertex && vertex instanceof Vector3) {
          const vertexCopy = new Vector3();

          vertexCopy.copy(vertex);

          this.localHeadGeometry.push(vertexCopy);
          this.VerticesPerNode++;
        }
      }
    }

    this.FacesPerNode = (this.VerticesPerNode - 1) * 2;
    this.FaceIndicesPerNode = this.FacesPerNode * 3;
  }

  private initializeGeometry() {
    this.vertexCount = this.length * this.VerticesPerNode;
    this.faceCount = this.length * this.FacesPerNode;

    const geometry = new BufferGeometry();

    const nodeIDs = new Float32Array(this.vertexCount);
    const nodeVertexIDs = new Float32Array(this.vertexCount * this.VerticesPerNode);
    const positions = new Float32Array(this.vertexCount * PositionComponentCount);
    const nodeCenters = new Float32Array(this.vertexCount * PositionComponentCount);
    const uvs = new Float32Array(this.vertexCount * UVComponentCount);
    const indices = new Uint32Array(this.faceCount * IndicesPerFace);

    const nodeIDAttribute = new BufferAttribute(nodeIDs, 1);
    nodeIDAttribute.setUsage(DynamicDrawUsage);
    geometry.setAttribute('nodeID', nodeIDAttribute);

    const nodeVertexIDAttribute = new BufferAttribute(nodeVertexIDs, 1);
    nodeVertexIDAttribute.setUsage(DynamicDrawUsage);
    geometry.setAttribute('nodeVertexID', nodeVertexIDAttribute);

    const nodeCenterAttribute = new BufferAttribute(nodeCenters, PositionComponentCount);
    nodeCenterAttribute.setUsage(DynamicDrawUsage);
    geometry.setAttribute('nodeCenter', nodeCenterAttribute);

    const positionAttribute = new BufferAttribute(positions, PositionComponentCount);
    positionAttribute.setUsage(DynamicDrawUsage);
    geometry.setAttribute('position', positionAttribute);

    const uvAttribute = new BufferAttribute(uvs, UVComponentCount);
    uvAttribute.setUsage(DynamicDrawUsage);
    geometry.setAttribute('uv', uvAttribute);

    const indexAttribute = new BufferAttribute(indices, 1);
    indexAttribute.setUsage(DynamicDrawUsage);
    geometry.setIndex(indexAttribute);

    this.geometry = geometry;
  }

  private zeroVertices() {
    const positions = this.geometry.getAttribute('position') as BufferAttribute;

    for (let i = 0; i < this.vertexCount; i++) {
      const index = i * 3;
      const array = positions.array as Float32Array;

      array[index] = 0;
      array[index + 1] = 0;
      array[index + 2] = 0;
    }

    positions.needsUpdate = true;
    positions.updateRange.count = -1;
  }

  private zeroIndices() {
    const indices = this.geometry.getIndex();

    for (let i = 0; i < this.faceCount; i++) {
      const index = i * 3;
      const array = indices.array as Uint32Array;

      array[index] = 0;
      array[index + 1] = 0;
      array[index + 2] = 0;
    }

    indices.needsUpdate = true;
    indices.updateRange.count = -1;
  }

  private formInitialFaces() {
    this.zeroIndices();

    const indices = this.geometry.getIndex();

    for (let i = 0; i < this.length - 1; i++) {
      this.connectNodes(i, i + 1);
    }

    indices.needsUpdate = true;
    indices.updateRange.count = -1;
  }

  private initializeMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.frustumCulled = false;
  }

  private destroyMesh() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh = null;
    }
  }

  reset() {
    this.currentLength = 0;
    this.currentEnd = -1;

    this.lastNodeCenter = null;
    this.currentNodeCenter = null;
    this.lastOrientationDir = null;

    this.currentNodeID = 0;

    this.formInitialFaces();
    this.zeroVertices();

    this.geometry.setDrawRange(0, 0);
  }

  private updateUniforms() {
    if (this.currentLength < this.length) {
      this.material.uniforms.minID.value = 0;
    } else {
      this.material.uniforms.minID.value = this.currentNodeID - this.length;
    }
    this.material.uniforms.maxID.value = this.currentNodeID;
    this.material.uniforms.trailLength.value = this.currentLength;
    this.material.uniforms.maxTrailLength.value = this.length;
    this.material.uniforms.verticesPerNode.value = this.VerticesPerNode;
  }

  advance() {
    this.tempVector.set(0, 0, 0);
    this.targetObject.localToWorld(this.tempVector);
    this.tangent.subVectors(this.tempVector, this.previousPos).normalize();
    this.advanceGeometry(this.tempVector, this.tangent);

    this.updateUniforms();
    this.previousPos.copy(this.tempVector);
  }

  private advanceGeometry(position: Vector3, tangent: Vector3) {
    const nextIndex = this.currentEnd + 1 >= this.length ? 0 : this.currentEnd + 1;

    this.updateNodePositionsFromOrientationTangent(nextIndex, position, tangent);

    if (this.currentLength >= 1) {
      this.connectNodes(this.currentEnd, nextIndex);

      if (this.currentLength >= this.length) {
        const disconnectIndex = this.currentEnd + 1 >= this.length ? 0 : this.currentEnd + 1;
        this.disconnectNodes(disconnectIndex);
      }
    }

    if (this.currentLength < this.length) {
      this.currentLength++;
    }

    this.currentEnd++;
    if (this.currentEnd >= this.length) {
      this.currentEnd = 0;
    }

    if (this.currentLength >= 1) {
      if (this.currentLength < this.length) {
        this.geometry.setDrawRange(0, (this.currentLength - 1) * this.FaceIndicesPerNode);
      } else {
        this.geometry.setDrawRange(0, this.currentLength * this.FaceIndicesPerNode);
      }
    }

    this.updateNodeID(this.currentEnd, this.currentNodeID);
    this.currentNodeID++;
  }

  private updateNodeID(nodeIndex, id) {
    const nodeIDs = this.geometry.getAttribute('nodeID') as BufferAttribute;
    const nodeVertexIDs = this.geometry.getAttribute('nodeVertexID') as BufferAttribute;

    for (let i = 0; i < this.VerticesPerNode; i++) {
      const baseIndex = nodeIndex * this.VerticesPerNode + i;
      (nodeIDs.array as Float32Array)[baseIndex] = id;
      (nodeVertexIDs.array as Float32Array)[baseIndex] = i;
    }

    nodeIDs.needsUpdate = true;
    nodeVertexIDs.needsUpdate = true;

    nodeIDs.updateRange.offset = nodeIndex * this.VerticesPerNode;
    nodeIDs.updateRange.count = this.VerticesPerNode;

    nodeVertexIDs.updateRange.offset = nodeIndex * this.VerticesPerNode;
    nodeVertexIDs.updateRange.count = this.VerticesPerNode;
  }

  private updateNodeCenter(nodeIndex: number, nodeCenter: Vector3) {
    this.lastNodeCenter = this.currentNodeCenter;

    this.currentNodeCenter = this.nodeCenters[nodeIndex];
    this.currentNodeCenter.copy(nodeCenter);

    const nodeCenters = this.geometry.getAttribute('nodeCenter') as BufferAttribute;

    for (let i = 0; i < this.VerticesPerNode; i++) {
      const baseIndex = (nodeIndex * this.VerticesPerNode + i) * 3;
      const array = nodeCenters.array as Float32Array;

      array[baseIndex] = nodeCenter.x;
      array[baseIndex + 1] = nodeCenter.y;
      array[baseIndex + 2] = nodeCenter.z;
    }

    nodeCenters.needsUpdate = true;

    nodeCenters.updateRange.offset = nodeIndex * this.VerticesPerNode * PositionComponentCount;
    nodeCenters.updateRange.count = this.VerticesPerNode * PositionComponentCount;
  }

  private updateNodePositionsFromOrientationTangent(nodeIndex: number, nodeCenter: Vector3, orientationTangent: Vector3) {
    const positions = this.geometry.getAttribute('position') as BufferAttribute;

    this.updateNodeCenter(nodeIndex, nodeCenter);

    this.tempOffset.copy(nodeCenter);
    this.tempOffset.sub(LocalHeadOrigin);
    this.tempQuaternion.setFromUnitVectors(LocalOrientationTangent, orientationTangent);

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      const vertex = this.tempLocalHeadGeometry[i];
      vertex.copy(this.localHeadGeometry[i]);
      vertex.applyQuaternion(this.tempQuaternion);
      vertex.add(this.tempOffset);
    }

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      const positionIndex = ((this.VerticesPerNode * nodeIndex) + i) * PositionComponentCount;
      const transformedHeadVertex = this.tempLocalHeadGeometry[i];
      const array = positions.array as Float32Array;

      array[positionIndex] = transformedHeadVertex.x;
      array[positionIndex + 1] = transformedHeadVertex.y;
      array[positionIndex + 2] = transformedHeadVertex.z;
    }

    positions.needsUpdate = true;
  }

  private connectNodes(srcNodeIndex: number, destNodeIndex: number) {
    const indices = this.geometry.getIndex();

    for (let i = 0; i < this.localHeadGeometry.length - 1; i++) {
      const srcVertexIndex = (this.VerticesPerNode * srcNodeIndex) + i;
      const destVertexIndex = (this.VerticesPerNode * destNodeIndex) + i;

      const faceIndex = ((srcNodeIndex * this.FacesPerNode) + (i * FacesPerQuad)) * IndicesPerFace;

      const array = indices.array as Uint32Array;

      array[faceIndex] = srcVertexIndex;
      array[faceIndex + 1] = destVertexIndex;
      array[faceIndex + 2] = srcVertexIndex + 1;

      array[faceIndex + 3] = destVertexIndex;
      array[faceIndex + 4] = destVertexIndex + 1;
      array[faceIndex + 5] = srcVertexIndex + 1;
    }

    indices.needsUpdate = true;
    indices.updateRange.count = -1;
  }

  private disconnectNodes(srcNodeIndex: number) {
    const indices = this.geometry.getIndex();

    for (let i = 0; i < this.localHeadGeometry.length - 1; i++) {
      const faceIndex = ((srcNodeIndex * this.FacesPerNode) + (i * FacesPerQuad)) * IndicesPerFace;

      const array = indices.array as Uint32Array;

      array[faceIndex] = 0;
      array[faceIndex + 1] = 0;
      array[faceIndex + 2] = 0;

      array[faceIndex + 3] = 0;
      array[faceIndex + 4] = 0;
      array[faceIndex + 5] = 0;
    }

    indices.needsUpdate = true;
    indices.updateRange.count = -1;
  }

  deactivate() {
    if (this.active) {
      this.scene.remove(this.mesh);
      this.active = false;
    }
  }

  activate() {
    if (!this.active) {
      this.scene.add(this.mesh);
      this.active = true;
    }
  }

  dispose() {
    this.active = false;
    this.targetObject = undefined;
    this.mesh = undefined;
    this.geometry.dispose();
    this.geometry = undefined;
    this.material.dispose();
    this.material = undefined;
  }
}
