import { INJECT_PASSWORD } from './messages';
import { Server } from './Messenger';

const s = new Server();
s.on(INJECT_PASSWORD, async (req) => {
    const active = document.activeElement as HTMLIFrameElement | HTMLInputElement;
    if (active != null) {
        if ('value' in active && active.value != null) {
            active.value = req.password;
        }
    }
});
s.listen();
