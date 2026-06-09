import 'dotenv/config.js';
import App from '@/app.js';
import AuthRoute from '@/module/auth/auth.route.js';
import TaskRoute from '@/module/tasks/task.route.js';
import UserRoute from '@/module/users/user.route.js';

const routes = [new AuthRoute(), new TaskRoute(), new UserRoute()];
const app = new App(routes);

app.listen();
