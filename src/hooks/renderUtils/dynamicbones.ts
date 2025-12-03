import * as THREE from "three";
let tmp: any, tmp2: any, tmp3: any;
const arr = [0, 0, 0, 0];
const v = new THREE.Vector3();
const v2 = new THREE.Vector3();
const w = new THREE.Vector3();
const w2 = new THREE.Vector3();
const q = new THREE.Quaternion();
const q2 = new THREE.Quaternion();
const m = new THREE.Matrix4();
const minv = new THREE.Matrix4();
const forward = new THREE.Vector3(0, 0, 1);
const axisx = new THREE.Vector3(1, 0, 0);
const axisy = new THREE.Vector3(0, 1, 0);
const axisz = new THREE.Vector3(0, 0, 1);
export class DynamicBones {
  opt: any = {};
  scene: THREE.Scene | null = null;
  armature: THREE.Bone | null = null;
  config: any[] = [];
  data: any[] = []; // Dynamic bones data
  dict: any = {}; // Dictionary from bone name to data object
  objectsUpdate: any[] = []; // Matrices to be update in order
  helpers: any = {}; // Helpers
  running: boolean = false;
  timerMs: number = 0; // Warm-up timer
  constructor() {
    this.opt = {
      warmupMs: 2000,
      sensitivityFactor: 1,
      movementFactor: 1,
      isExcludes: true,
      isPivots: true,
      isLimits: true,
      helperBoneColor1: 0xff0000,
      helperBoneColor2: 0xf7c5cc,
      helperLinkColor1: 0xff0000,
      helperLinkColor2: 0x0000ff,
      helperExcludesColor: 0xaaaaff,
    };
    this.helpers = {
      isActive: false,
      isShowAll: false,
      points: { bones: [], pivots: [], object: null },
      lines: { bones: [], object: null },
      excludes: { bones: [], deltaLocals: [], radii: [], objects: [] },
    };
  }
  getOptionValue(key: string) {
    return this.opt[key];
  }
  setOptionValue(key: string, val: any) {
    this.opt[key] = val;
    if (this.helpers.isActive) this.showHelpers();
  }
  getBoneNames() {
    return this.data.map(x => x.name);
  }
  getValue(name: string, key: string) {
    if (this.scene === null) throw new Error("Dynamic bones has not been setup yet.");
    if (!this.dict.hasOwnProperty(name)) throw new Error("Dynamic bone '" + name + "' not found.");
    const d = this.dict[name];
    switch (key) {
      case "type":
        return d.type;
      case "stiffness":
        return d.k.every((x: any) => x === d.k[0]) ? d.k[0] : [...d.k];
      case "damping":
        return d.c.every((x: any) => x === d.c[0]) ? d.c[0] : [...d.c];
      case "external":
        return d.ext < 1.0 ? d.ext : null;
      case "limits":
        return d.limits?.map((x: null) => (x === null ? null : [...x]));
      case "deltaLocal":
        return d.dl ? [...d.dl] : null;
      case "excludes":
        return d.excludes
          ? [
              ...d.excludes.map((x: any) => {
                const o: any = { bone: x.bone.name.slice(), radius: x.radius };
                if (x.deltaLocal) {
                  o.deltaLocal = [...x.deltaLocal];
                }
                return o;
              }),
            ]
          : null;
      case "deltaWorld":
        return d.dw ? [...d.dw] : null;
      case "pivot":
        return d.pivot;
      case "helper":
        return d.helper;
      default:
        throw new Error("Unsupported property '" + key + "'.");
    }
  }
  setValue(name: string, key: string, val: any) {
    if (this.scene === null) throw new Error("Dynamic bones has not been setup yet.");
    if (!this.dict.hasOwnProperty(name)) throw new Error("Dynamic bone '" + name + "' not found.");
    const d = this.dict[name];
    if (key === "type") {
      if (!val) throw new Error("Parameter 'type' not set.");
      if (typeof val !== "string") throw new Error("Type must be a string.");
      switch (val) {
        case "point":
          d.isPoint = true;
          d.isX = true;
          d.isY = true;
          d.isZ = true;
          d.isT = false;
          break;
        case "link":
          d.isPoint = false;
          d.isX = true;
          d.isY = false;
          d.isZ = true;
          d.isT = false;
          break;
        case "mix1":
          d.isPoint = false;
          d.isX = true;
          d.isY = true;
          d.isZ = true;
          d.isT = false;
          break;
        case "mix2":
          d.isPoint = false;
          d.isX = true;
          d.isY = false;
          d.isZ = true;
          d.isT = true;
          break;
        case "full":
          d.isPoint = false;
          d.isX = true;
          d.isY = true;
          d.isZ = true;
          d.isT = true;
          break;
        default:
          throw new Error("Unknown type'" + val + "'.");
      }
      d.type = val.slice();
    } else if (key === "stiffness") {
      if (!val) throw new Error("Parameter 'stiffness' not set.");
      if (!Number.isNaN(val) && val >= 0) {
        d.k = Array(4).fill(val);
      } else if (Array.isArray(val) && val.length === 4 && val.every(x => x >= 0)) {
        d.k = [...val];
      } else {
        throw new Error("Stiffness must be a non-negative number or an array of four non-negative numbers.");
      }
    } else if (key === "damping") {
      if (!val) throw new Error("Parameter 'damping' not set.");
      if (!Number.isNaN(val) && val >= 0) {
        d.c = Array(4).fill(val);
      } else if (Array.isArray(val) && val.length === 4 && val.every(x => x >= 0)) {
        d.c = [...val];
      } else {
        throw new Error("Damping must be a non-negative number or an array of four non-negative numbers.");
      }
    } else if (key === "external") {
      if (val === null || val === undefined) {
        d.ext = 1.0;
      } else if (!Number.isNaN(val) && val >= 0 && val <= 1) {
        d.ext = val;
      } else {
        throw new Error("External (if set) must be a number between [0,1].");
      }
    } else if (key === "limits") {
      if (val === null || val === undefined) {
        d.limits = null;
      } else {
        if (!Array.isArray(val) || val.length !== 4) throw new Error("Limits (if set) must null, or an array of four arrays.");
        if (!val.every(x => x === null || (Array.isArray(x) && x.length === 2 && (x[0] === null || !Number.isNaN(x[0])) && (x[1] === null || !Number.isNaN(x))))) throw new Error("Limit values must be null or numbers.");
        d.limits = [val[0] ? [...val[0]] : null, val[1] ? [...val[1]] : null, val[2] ? [...val[2]] : null, val[3] ? [...val[3]] : null];
      }
    } else if (key === "excludes") {
      if (val === null || val === undefined) {
        d.excludes = null;
      } else {
        if (!Array.isArray(val)) throw new Error("Excludes (if set) must null, or an array.");
        d.excludes = [];
        val.forEach((x, i) => {
          if (!x.bone) throw new Error("Bone not specified in #" + i + " exclude.");
          if (typeof x.bone !== "string" || x.bone.length === 0) throw new Error("Bone name must be a non-empty string in #" + i + " exclude.");
          const bone = this.armature?.getObjectByName(x.bone);
          if (!bone) throw new Error("Bone '" + x.bone + "' not found in #" + i + " exclude.");
          if (Number.isNaN(x.radius) && x.radius >= 0) throw new Error("Radius must be a non-negative number in #" + i + " exclude.");
          const o: any = {
            bone: bone, // Bone object
            radius: x.radius, // Radius
            radiusSq: x.radius * x.radius, // Radius squared
            deltaLocal: null,
          };
          if (x.deltaLocal) {
            if (!Array.isArray(x.deltaLocal) || x.deltaLocal.length !== 3 || x.deltaLocal.some((y: number) => Number.isNaN(y))) throw new Error("deltaLocal must be an array of three numbers in #" + i + " exclude.");
            o.deltaLocal = [...x.deltaLocal];
          }
          d.excludes.push(o);
        });
      }
      this.showHelpers();
    } else if (key === "helper") {
      if (val === null || val === undefined) {
        d.helper = null;
      } else {
        if (val !== false && val !== true) throw new Error("Helper, if set, must be false or true.");
        d.helper = val;
      }
      this.showHelpers();
    } else if (key === "pivot") {
      if (val === null || val === undefined) {
        d.pivot = null;
      } else {
        if (val !== false && val !== true) throw new Error("Pivot, if set, must be false or true.");
        if (val === true && d.type === 0) throw new Error("Point type bone can't be a pivot.");
        d.pivot = val;
      }
    } else if (key === "deltaLocal") {
      if (val === null || val === undefined) {
        d.dl = null;
      } else {
        if (!Array.isArray(val) || val.length !== 3) throw new Error("deltaLocal, is set, must be an array of three numbers.");
        if (!val.every(x => !Number.isNaN(x))) throw new Error("deltaLocal values must be numbers.");
        d.dl = [...val];
      }
    } else if (key === "deltaWorld") {
      if (val === null || val === undefined) {
        d.dw = null;
      } else {
        if (!Array.isArray(val) || val.length !== 3) throw new Error("deltaWorld, is set, must be an array of three values.");
        if (!val.every(x => !Number.isNaN(x))) throw new Error("deltaWorld values must be numbers.");
        d.dw = [...val];
      }
    } else {
      throw new Error("Unsupported property " + key);
    }
  }
  getConfig() {
    return this.data.map(d => {
      const o: any = { bone: d.name.slice() };
      ["type", "stiffness", "damping", "external", "deltaLocal", "deltaWorld", "limits", "excludes", "pivot", "helper"].forEach(x => {
        tmp = this.getValue(d.name, x);
        if (tmp) o[x] = tmp;
      });
      return o;
    });
  }
  sortBones() {
    if (this.scene === null) throw new Error("Dynamic bones has not been setup yet.");
    let i = 0;
    const objectsOrder = new WeakMap();
    this.armature?.traverse(x => {
      if (!objectsOrder.has(x)) {
        objectsOrder.set(x, i);
        i++;
      }
    });
    this.data.sort((a, b) => objectsOrder.get(a.bone) - objectsOrder.get(b.bone));
    this.data.forEach(x => {
      tmp = this.dict[x.boneParent.name];
      if (tmp) {
        if (!tmp.children) tmp.children = [];
        tmp.children.push(x);
      }
    });
    this.objectsUpdate = [];
    const objectsSet = new WeakSet();
    const getParents: any = (x: any) => (x.parent?.isBone ? [x, ...getParents(x.parent)] : [x]);
    const addObject = (x: any) => {
      const o: any = getParents(x);
      o.forEach((y: any) => {
        if (!objectsSet.has(y)) {
          this.objectsUpdate.push(y);
          objectsSet.add(y);
        }
      });
    };
    this.data.forEach(x => {
      addObject(x.bone);
      if (x.excludes) {
        x.excludes.forEach((y: any) => {
          addObject(y.bone);
        });
      }
    });
    this.objectsUpdate.sort((a, b) => objectsOrder.get(a) - objectsOrder.get(b));
  }
  setup(scene: any, armature: any, config: any) {
    this.dispose();
    const check: any = (test: any, error: any) => {
      if (!test) {
        this.dispose();
        throw new Error(error);
      }
    };
    check(scene?.isScene, "First parameter must be Scene.");
    this.scene = scene;
    check(armature?.isObject3D, "Second parameter must be the armature Object3D.");
    this.armature = armature;
    check(Array.isArray(config), "Third parameter must be an array of bone configs.");
    this.config = config;
    this.config.forEach((item, i) => {
      const id = "Config item #" + i + ": ";
      check(item.bone, id + "Bone not specified.");
      const name = item.bone;
      check(typeof name === "string" && name.length > 0, id + "Bone name must be a non-empty string.");
      const bone: any = this.armature?.getObjectByName(name);
      check(bone, id + "Bone '" + name + "' not found.");
      check(bone?.parent?.isBone, id + "Bone must have a parent bone.");
      check(
        this.data.every(x => x.bone !== bone),
        id + "Bone '" + name + "' already exists.",
      );
      bone.updateMatrixWorld(true);
      const o: any = {
        name: name,
        bone: bone,
        boneParent: bone.parent,
        vBasis: bone.position.clone(),
        vWorld: bone.parent.getWorldPosition(v).clone(),
        qBasis: bone.parent.quaternion.clone(),
        l: bone.position.length(),
        p: [0, 0, 0, 0],
        v: [0, 0, 0, 0],
        a: [0, 0, 0, 0],
        ev: [0, 0, 0, 0],
        ea: [0, 0, 0, 0],
      };

      o.boneParent.matrixWorld.decompose(v, q, w); // World quaternion q
      v.copy(forward).applyQuaternion(q).setY(0).normalize(); // Project to XZ-plane
      q.premultiply(q2.setFromUnitVectors(forward, v).invert()).normalize();
      o.qWorldInverseYaw = q.clone().normalize(); // Only the yaw rotation
      this.data.push(o);
      this.dict[name] = o;
      try {
        this.setValue(name, "type", item.type);
        this.setValue(name, "stiffness", item.stiffness);
        this.setValue(name, "damping", item.damping);
        this.setValue(name, "external", item.external);
        this.setValue(name, "limits", item.limits);
        this.setValue(name, "excludes", item.excludes);
        this.setValue(name, "deltaLocal", item.deltaLocal);
        this.setValue(name, "deltaWorld", item.deltaWorld);
        this.setValue(name, "pivot", item.pivot);
        this.setValue(name, "helper", item.helper);
      } catch (error) {
        check(false, id + error);
      }
    });
    this.sortBones();
    this.start();
  }
  update(dt: number) {
    if (!this.running) return;
    let i, j, l, k, d;
    this.timerMs += dt;
    if (dt > 1000) this.timerMs = 0;
    dt /= 1000;
    for (i = 0, l = this.objectsUpdate.length; i < l; i++) {
      d = this.objectsUpdate[i];
      d.updateMatrix();
      if (d.parent === null) {
        d.matrixWorld.copy(d.matrix);
      } else {
        d.matrixWorld.multiplyMatrices(d.parent.matrixWorld, d.matrix);
      }
      d.matrixWorldNeedsUpdate = false;
    }
    for (i = 0, l = this.data.length; i < l; i++) {
      d = this.data[i];
      v.copy(d.vWorld); // Previous position
      m.copy(d.boneParent.matrixWorld);
      minv.copy(m).invert();
      d.vWorld.setFromMatrixPosition(m); // Update position
      v.applyMatrix4(minv); // World to local
      if (v.length() > 0.5) {
        console.info("Info: Unrealistic jump of " + v.length().toFixed(2) + " meters.");
        v.setLength(0.5);
      }
      v.applyQuaternion(d.bone.quaternion);
      arr[0] = v.x;
      arr[1] = v.y;
      arr[2] = -v.z;
      arr[3] = v.length() / 3; // TODO: Hack, fix this in later versions
      if (d.children) {
        for (j = 0, k = d.children.length; j < k; j++) {
          tmp = d.children[j];
          arr[0] -= (tmp.v[0] * dt) / 3;
          arr[1] -= (tmp.v[1] * dt) / 3;
          arr[2] += (tmp.v[2] * dt) / 3;
          arr[3] -= (tmp.v[3] * dt) / 3;
        }
      }
      tmp = this.opt.sensitivityFactor;
      arr[0] *= d.ext * tmp;
      arr[1] *= d.ext * tmp;
      arr[2] *= d.ext * tmp;
      arr[3] *= d.ext * tmp;
      if (d.isX) {
        tmp = arr[0] / dt;
        d.ea[0] = (tmp - d.ev[0]) / dt;
        d.ev[0] = tmp;
        d.a[0] = -d.k[0] * d.p[0] - d.c[0] * d.v[0] - d.ea[0];
        d.p[0] += d.v[0] * dt + (d.a[0] * dt * dt) / 2 + arr[0];
        tmp = d.v[0] + (d.a[0] * dt) / 2;
        tmp = -d.k[0] * d.p[0] - d.c[0] * tmp - d.ea[0];
        d.v[0] = d.v[0] + ((tmp + d.a[0]) * dt) / 2;
      }
      if (d.isY) {
        tmp = arr[1] / dt;
        d.ea[1] = (tmp - d.ev[1]) / dt;
        d.ev[1] = tmp;
        d.a[1] = -d.k[1] * d.p[1] - d.c[1] * d.v[1] - d.ea[1];
        d.p[1] += d.v[1] * dt + (d.a[1] * dt * dt) / 2 + arr[1];
        tmp = d.v[1] + (d.a[1] * dt) / 2;
        tmp = -d.k[1] * d.p[1] - d.c[1] * tmp - d.ea[1];
        d.v[1] = d.v[1] + ((tmp + d.a[1]) * dt) / 2;
      }
      if (d.isZ) {
        tmp = arr[2] / dt;
        d.ea[2] = (tmp - d.ev[2]) / dt;
        d.ev[2] = tmp;
        d.a[2] = -d.k[2] * d.p[2] - d.c[2] * d.v[2] - d.ea[2];
        d.p[2] += d.v[2] * dt + (d.a[2] * dt * dt) / 2 + arr[2];
        tmp = d.v[2] + (d.a[2] * dt) / 2;
        tmp = -d.k[2] * d.p[2] - d.c[2] * tmp - d.ea[2];
        d.v[2] = d.v[2] + ((tmp + d.a[2]) * dt) / 2; // Iterated velocity
      }
      if (d.isT) {
        tmp = arr[3] / dt;
        d.ea[3] = (tmp - d.ev[3]) / dt;
        d.ev[3] = tmp;
        d.a[3] = -d.k[3] * d.p[3] - d.c[3] * d.v[3] - d.ea[3];
        d.p[3] += d.v[3] * dt + (d.a[3] * dt * dt) / 2 + arr[3];
        tmp = d.v[3] + (d.a[3] * dt) / 2;
        tmp = -d.k[3] * d.p[3] - d.c[3] * tmp - d.ea[3];
        d.v[3] = d.v[3] + ((tmp + d.a[3]) * dt) / 2; // Iterated velocity
      }
      if (this.timerMs < this.opt.warmupMs) {
        d.v[0] *= 0.0001;
        d.p[0] *= 0.0001;
        d.v[1] *= 0.0001;
        d.p[1] *= 0.0001;
        d.v[2] *= 0.0001;
        d.p[2] *= 0.0001;
        d.v[3] *= 0.0001;
        d.p[3] *= 0.0001;
      }
      arr[0] = d.p[0];
      arr[1] = d.p[1];
      arr[2] = d.p[2];
      arr[3] = d.p[3];
      tmp = this.opt.movementFactor;
      arr[0] *= tmp;
      arr[1] *= tmp;
      arr[2] *= tmp;
      arr[3] *= tmp;
      if (d.dl) {
        tmp = d.dl;
        arr[0] += tmp[0];
        arr[1] += tmp[1];
        arr[2] += tmp[2];
      }
      if (d.dw) {
        tmp = d.dw;
        v.set(d.vBasis.x + arr[0], d.vBasis.y + arr[1], d.vBasis.z + arr[2]);
        v.applyMatrix4(m);
        v.x += tmp[0];
        v.y += tmp[1];
        v.z += tmp[2];
        v.applyMatrix4(minv);
        arr[0] += v.x - d.vBasis.x;
        arr[1] += v.y - d.vBasis.y;
        arr[2] += v.z - d.vBasis.z;
      }
      if (d.limits && this.opt.isLimits) {
        tmp = d.limits;
        if (tmp[0]) {
          if (tmp[0][0] !== null && arr[0] < tmp[0][0]) arr[0] = tmp[0][0];
          if (tmp[0][1] !== null && arr[0] > tmp[0][1]) arr[0] = tmp[0][1];
        }
        if (tmp[1]) {
          if (tmp[1][0] !== null && arr[1] < tmp[1][0]) arr[1] = tmp[1][0];
          if (tmp[1][1] !== null && arr[1] > tmp[1][1]) arr[1] = tmp[1][1];
        }
        if (tmp[2]) {
          if (tmp[2][0] !== null && arr[2] < tmp[2][0]) arr[2] = tmp[2][0];
          if (tmp[2][1] !== null && arr[2] > tmp[2][1]) arr[2] = tmp[2][1];
        }
        if (tmp[3]) {
          if (tmp[3][0] !== null && arr[3] < tmp[3][0]) arr[3] = tmp[3][0];
          if (tmp[3][1] !== null && arr[3] > tmp[3][1]) arr[3] = tmp[3][1];
        }
      }
      if (d.isPoint) {
        d.bone.position.set(d.vBasis.x + arr[0], d.vBasis.y + arr[1], d.vBasis.z - arr[2]);
      } else {
        d.boneParent.quaternion.copy(d.qBasis);
        if (d.pivot && this.opt.isPivots) {
          d.boneParent.updateWorldMatrix(false, false);
          d.boneParent.matrixWorld.decompose(v, q, w);
          v.copy(forward).applyQuaternion(q).setY(0).normalize();
          q.premultiply(q2.setFromUnitVectors(forward, v).invert()).normalize();
          d.boneParent.quaternion.multiply(q.invert());
          d.boneParent.quaternion.multiply(d.qWorldInverseYaw);
        }
        if (d.isZ) {
          tmp = Math.atan(arr[0] / d.l);
          q.setFromAxisAngle(axisz, -tmp);
          d.boneParent.quaternion.multiply(q);
        }
        if (d.isY) {
          tmp = d.l / 3;
          tmp = tmp * Math.tanh(arr[1] / tmp);
          d.bone.position.setLength(d.l + tmp);
        }
        if (d.isX) {
          tmp = Math.atan(arr[2] / d.l);
          q.setFromAxisAngle(axisx, -tmp);
          d.boneParent.quaternion.multiply(q);
        }
        if (d.isT) {
          tmp = 1.5 * Math.tanh(arr[3] * 1.5);
          q.setFromAxisAngle(axisy, -tmp);
          d.boneParent.quaternion.multiply(q);
        }
        d.boneParent.updateWorldMatrix(false, true);
        if (d.excludes && this.opt.isExcludes) {
          for (j = 0, k = d.excludes.length; j < k; j++) {
            tmp = d.excludes[j];
            w.set(0, 0, 0);
            if (tmp.deltaLocal) {
              w.x += tmp.deltaLocal[0];
              w.y += tmp.deltaLocal[1];
              w.z += tmp.deltaLocal[2];
            }
            w.applyMatrix4(tmp.bone.matrixWorld);
            minv.copy(d.boneParent.matrixWorld).invert();
            w.applyMatrix4(minv);
            v.copy(d.bone.position);
            if (v.distanceToSquared(w) >= tmp.radiusSq) continue;
            tmp3 = v.length();
            tmp2 = w.length();
            if (tmp2 > tmp.radius + tmp3) continue;
            if (tmp2 < Math.abs(tmp.radius - tmp3)) continue;
            tmp2 = (tmp2 * tmp2 + tmp3 * tmp3 - tmp.radiusSq) / (2 * tmp2);
            w.normalize();
            w2.copy(w).multiplyScalar(tmp2);
            tmp2 = Math.sqrt(tmp3 * tmp3 - tmp2 * tmp2);
            v.subVectors(v, w2).projectOnPlane(w).normalize().multiplyScalar(tmp2);
            v2.subVectors(d.vBasis, w2).projectOnPlane(w).normalize();
            tmp3 = v2.dot(v);
            if (tmp3 < 0) {
              tmp3 = Math.sqrt(tmp2 * tmp2 - tmp3 * tmp3);
              v2.multiplyScalar(tmp3);
              v.add(v2);
            }
            v.add(w2).normalize();
            w.copy(d.bone.position).normalize();
            q.setFromUnitVectors(w, v);
            d.boneParent.quaternion.premultiply(q);
            d.boneParent.updateWorldMatrix(false, true);
          }
        }
      }
    }
    if (this.helpers.isActive) this.updateHelpers();
  }
  showHelpers(all?: boolean) {
    this.hideHelpers();
    this.helpers.isShowAll = all === undefined ? this.helpers.isShowAll : all === true;
    tmp = this.helpers;
    this.data.forEach(d => {
      if (this.helpers.isShowAll || d.helper === true) {
        tmp.points.bones.push(d.bone);
        tmp.points.pivots.push(d.pivot);
        if (d.type !== 0) tmp.lines.bones.push(d.bone);
        if (d.excludes) {
          d.excludes.forEach((x: any) => {
            let found = false;
            for (let i = 0; i < tmp.excludes.bones.length; i++) {
              if (tmp.excludes.bones[i] !== x.bone) continue;
              if (tmp.excludes.radii[i] !== x.radius) continue;
              if (tmp.excludes.deltaLocals[i] === null && x.deltaLocal !== null) continue;
              if (tmp.excludes.deltaLocals[i] !== null && x.deltaLocal === null) continue;
              if (tmp.excludes.deltaLocals[i] !== null && tmp.excludes.deltaLocals[i].some((y: number, j: number) => y !== x.deltaLocal[j])) continue;
              found = true;
              break;
            }
            if (!found) {
              tmp.excludes.bones.push(x.bone);
              tmp.excludes.radii.push(x.radius);
              tmp.excludes.deltaLocals.push(x.deltaLocal ? [...x.deltaLocal] : null);
              tmp.excludes.objects.push(null);
            }
          });
        }
      }
    });
    tmp = this.helpers.excludes;
    if (this.opt.isExcludes && tmp.bones.length) {
      tmp.bones.forEach((x: any, i: number) => {
        const geom = new THREE.SphereGeometry(tmp.radii[i], 6, 6);
        const material = new THREE.MeshBasicMaterial({
          depthTest: false,
          depthWrite: false,
          toneMapped: false,
          transparent: true,
          wireframe: true,
          color: this.opt.helperExcludesColor,
        });
        tmp.objects[i] = new THREE.Mesh(geom, material);
        tmp.objects[i].renderOrder = 997;
        x.add(tmp.objects[i]);
        if (tmp.deltaLocals[i]) {
          tmp.objects[i].position.set(tmp.deltaLocals[i][0], tmp.deltaLocals[i][1], tmp.deltaLocals[i][2]);
        }
      });
    }
    tmp = this.helpers.points;
    if (tmp.bones.length) {
      this.helpers.isActive = true;
      const geom = new THREE.BufferGeometry();
      const vertices = tmp.bones.map(() => [0, 0, 0]).flat();
      geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      const c1 = new THREE.Color(this.opt.helperBoneColor1);
      const c2 = new THREE.Color(this.opt.helperBoneColor2);
      const colors = tmp.pivots.map((x: any) => (x && this.opt.isPivots ? [c2.r, c2.g, c2.b] : [c1.r, c1.g, c1.b])).flat();
      geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        transparent: true,
        size: 0.2,
        vertexColors: true,
      });
      tmp.object = new THREE.Points(geom, material);
      tmp.object.renderOrder = 998;
      tmp.object.matrix = this.armature?.matrixWorld;
      tmp.object.matrixAutoUpdate = false;
      this.scene?.add(tmp.object);
    }
    tmp = this.helpers.lines;
    if (tmp.bones.length) {
      const geom = new THREE.BufferGeometry();
      const vertices = tmp.bones.map(() => [0, 0, 0, 0, 0, 0]).flat();
      geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      const c1 = new THREE.Color(this.opt.helperLinkColor1);
      const c2 = new THREE.Color(this.opt.helperLinkColor2);
      const colors = tmp.bones.map(() => [c1.r, c1.g, c1.b, c2.r, c2.g, c2.b]).flat();
      geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        transparent: true,
      });
      tmp.object = new THREE.LineSegments(geom, material);
      tmp.object.renderOrder = 999;
      tmp.object.matrix = this.armature?.matrixWorld;
      tmp.object.matrixAutoUpdate = false;
      this.scene?.add(tmp.object);
    }
  }
  updateHelpers() {
    tmp = this.helpers.points;
    if (tmp.bones.length) {
      minv.copy(this.armature?.matrixWorld!).invert();
      const pos = tmp.object.geometry.getAttribute("position");
      for (let i = 0, l = tmp.bones.length; i < l; i++) {
        m.multiplyMatrices(minv, tmp.bones[i].matrixWorld);
        v.setFromMatrixPosition(m);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      pos.needsUpdate = true;
      tmp.object.updateMatrixWorld();
    }
    tmp = this.helpers.lines;
    if (tmp.bones.length) {
      minv.copy(this.armature?.matrixWorld!).invert();
      const pos = tmp.object.geometry.getAttribute("position");
      for (let i = 0, j = 0, l = tmp.bones.length; i < l; i++, j += 2) {
        m.multiplyMatrices(minv, tmp.bones[i].matrixWorld);
        v.setFromMatrixPosition(m);
        pos.setXYZ(j, v.x, v.y, v.z);
        m.multiplyMatrices(minv, tmp.bones[i].parent.matrixWorld);
        v.setFromMatrixPosition(m);
        pos.setXYZ(j + 1, v.x, v.y, v.z);
      }
      pos.needsUpdate = true;
      tmp.object.updateMatrixWorld();
    }
  }
  hideHelpers() {
    [this.helpers.points, this.helpers.lines].forEach(x => {
      x.bones = [];
      if (x.object) {
        this.scene?.remove(x.object);
        x.object.geometry.dispose();
        x.object.material.dispose();
        x.object = null;
      }
    });
    tmp = this.helpers.excludes;
    tmp.objects.forEach((y: any, i: number) => {
      if (y) {
        tmp.bones[i].remove(y);
        y.geometry.dispose();
        y.material.dispose();
      }
    });
    tmp.bones = [];
    tmp.deltaLocals = [];
    tmp.radii = [];
    tmp.objects = [];
    this.helpers.isActive = false;
  }
  start() {
    if (this.data.length) {
      this.running = true;
      this.timerMs = 0;
      this.showHelpers();
    }
  }
  stop() {
    this.running = false;
    this.hideHelpers();
    for (let i = 0, l = this.data.length; i < l; i++) {
      const d = this.data[i];
      d.bone.position.copy(d.vBasis);
      d.boneParent.quaternion.copy(d.qBasis);
    }
  }
  dispose() {
    this.stop();
    this.scene = null;
    this.armature = null;
    this.config = [];
    this.data = [];
    this.dict = {};
    this.objectsUpdate = [];
    this.timerMs = 0;
  }
}
