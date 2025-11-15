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
      ],
    },
  ],
});

export default router;
