const TODO_KEY = "todos";

const DEFAULT_TODOS = [
  { id: "t1", text: "购买关西周游券（建议3日非连续版）" },
  { id: "t2", text: "预约空庭温泉贷切露天风吕（10/16晚，提前在官网订）" },
  { id: "t3", text: "购买京都→东京新干线车票（10/18）" },
  { id: "t4", text: "查10/20深夜前往羽田机场的末班电车时刻" },
  { id: "t5", text: "10/19一早兑换启用东京地铁48小时票" },
  { id: "t6", text: "准备上网eSIM或Wi-Fi蛋" },
  { id: "t7", text: "换一些日元现金备用" },
  { id: "t8", text: "确认アイプリモ梅田取戒指所需材料" },
];

async function getTodos(env) {
  const raw = await env.TODO_KV.get(TODO_KEY);
  if (!raw) {
    await env.TODO_KV.put(TODO_KEY, JSON.stringify(DEFAULT_TODOS));
    return DEFAULT_TODOS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TODOS;
  } catch (e) {
    return DEFAULT_TODOS;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/todos" && request.method === "GET") {
      const todos = await getTodos(env);
      return Response.json(todos);
    }

    if (url.pathname.startsWith("/api/todos/") && request.method === "DELETE") {
      const id = decodeURIComponent(url.pathname.split("/").pop());
      const todos = await getTodos(env);
      const next = todos.filter((t) => t.id !== id);
      await env.TODO_KV.put(TODO_KEY, JSON.stringify(next));
      return Response.json(next);
    }

    // 重置待办清单为初始版本（需要时手动访问一次即可，不对外暴露入口）
    if (url.pathname === "/api/todos/reset" && request.method === "POST") {
      await env.TODO_KV.put(TODO_KEY, JSON.stringify(DEFAULT_TODOS));
      return Response.json(DEFAULT_TODOS);
    }

    // 其余请求交给静态资源（public/ 目录下的 index.html 等）
    return env.ASSETS.fetch(request);
  },
};
