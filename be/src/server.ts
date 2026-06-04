import 'dotenv/config.js';
import App from '@/app.js';
import AuthRoute from '@/module/auth/auth.route.js';
import TaskRoute from '@/module/tasks/task.route.js';

const routes = [new AuthRoute(), new TaskRoute()];
const app = new App(routes);

app.listen();
