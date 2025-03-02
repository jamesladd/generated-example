import { authjsHandler, authjsSessionMiddleware } from "./server/authjs-handler";

import { createTodoHandler } from "./server/create-todo-handler";
import { vikeHandler } from "./server/vike-handler";
import { Hono } from "hono";
import { createHandler, createMiddleware } from "@universal-middleware/hono";

const app = new Hono();

app.use(createMiddleware(authjsSessionMiddleware)());

/**
 * Auth.js route
 * @link {@see https://authjs.dev/getting-started/installation}
 **/
app.use("/api/auth/**", createHandler(authjsHandler)());

app.post("/api/todo/create", createHandler(createTodoHandler)());

/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
app.get('/lib/*', (c) => c.notFound())
app.all("*", createHandler(vikeHandler)());

export default app;
