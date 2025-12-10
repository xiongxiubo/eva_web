import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/login/index.vue"),
    },
    {
      path: "/",
      name: "layout",
      component: () => import("@/views/layout/index.vue"),
      children: [
        {
          path: "/",
          name: "home",
          component: () => import("@/views/home/index.vue"),
        },
        {
          path: "/chat/:id",
          name: "chat",
          component: () => import("@/views/chat/index.vue"),
        },

        {
          path: "/chathistory/:id",
          name: "chathistory",
          component: () => import("@/views/chathistory/index.vue"),
        },
        {
          path: "/memory",
          name: "memory",
          component: () => import("@/views/memory/index.vue"),
        },
        {
          path: "/speaker",
          name: "speaker",
          component: () => import("@/views/speaker/index.vue"),
        },
      ],
    },
    // 创作中心
    {
      path: "/create",
      name: "create",
      component: () => import("@/views/create/layout.vue"),
      children: [
        {
          path: "/create",
          name: "create-index",
          component: () => import("@/views/create/index.vue"),
        },
        {
          path: "/create/voice",
          name: "create-voice",
          component: () => import("@/views/create/voice/index.vue"),
        },
      ],
    },
    // 创作中心-编辑
    {
      path: "/create/edit",
      name: "create-edit",
      component: () => import("@/views/create/edit/index.vue"),
    },
  ],
});

export default router;
