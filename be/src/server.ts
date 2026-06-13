import 'dotenv/config.js';
import App from '@/app.js';
import AuthRoute from '@/modules/auth/auth.route.js';
import TaskRoute from '@/modules/tasks/task.route.js';
import UserRoute from '@/modules/users/user.route.js';

const routes = [new AuthRoute(), new TaskRoute(), new UserRoute()];
const app = new App(routes);

app.listen();
