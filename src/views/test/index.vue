<template>
    <div ref="container" class="container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const container = ref<any>(null);

onMounted(() => {
    // 基础场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60,
        container.value.clientWidth / container.value.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    container.value.appendChild(renderer.domElement);

    // 光源
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);
    // 环境光，整体提亮
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 主方向光
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    // 补光（从反方向打，避免背面全黑）
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, -2, -5);
    scene.add(fillLight);

    // 可选：点光源，营造高光效果
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);
    // 聚光灯
    const spotLight = new THREE.SpotLight(0xffffff, 0, 0, 0.01);
    spotLight.position.set(0, 5, 0);
    scene.add(spotLight);

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement);

    // 加载 glb 模型
    const loader = new GLTFLoader();
    loader.load("/ani-07-01.glb", (gltf) => {
        const model = gltf.scene;
        // 可给每个子mesh添加自定义数据
        model.traverse((child: any) => {
            if (child.isMesh) {
                child.userData = { partInfo: `这是部位: ${child.name}` };
            }
        });

        scene.add(model);
    });

    // 射线拾取
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(event: any) {
        // 转换鼠标坐标到 [-1,1] 范围
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            const hit = intersects[0].object;
            console.log("点击到的部位：", hit.name, hit.userData.partInfo);
        }
    }

    renderer.domElement.addEventListener("click", onClick);

    // 渲染循环
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
});
</script>

<style>
.container {
    width: 100%;
    height: 100%;
}
</style>
