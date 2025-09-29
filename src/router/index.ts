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
          path: "/search",
          name: "search",
          component: () => import("@/views/search/index.vue"),
        },
        {
          path: "/test",
          name: "test",
          component: () => import("@/views/test/index.vue"),
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
  ],
});

export default router;
