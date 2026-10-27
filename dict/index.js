// Сборка словаря из партий. Новую партию добавлять сюда.
import { commands as base } from './commands.js';
import { commands as chat } from './chat.js';
import { commands as data } from './data.js';
import { commands as system } from './system.js';
import { commands as extensions } from './extensions.js';

const batches = [base, chat, data, system, extensions];

export const commands = Object.assign({}, ...batches);
export { phrases } from './phrases.js';

/** Имена команд, переведённые сразу в нескольких партиях (для теста). */
export function duplicateNames() {
    const seen = new Set();
    const dup = [];
    for (const batch of batches) {
        for (const name of Object.keys(batch)) {
            if (seen.has(name)) dup.push(name);
            seen.add(name);
        }
    }
    return dup;
}
