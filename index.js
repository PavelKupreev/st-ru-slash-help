// Русская справка слэш-команд: подменяет описания команд в /help slash
// и в подсказках автодополнения.
import { translateAll } from './src/apply.js';
import { commands, phrases } from './dict/index.js';

const dict = { commands, phrases };
const LOG = '[ru-slash-help]';

const { eventSource, event_types, SlashCommandParser } = SillyTavern.getContext();

// addCommandObject не оборачиваем: ST определяет источник команды по стеку вызова,
// и обёртка приписала бы нам чужие команды. Вместо этого проходим по списку
// после загрузки всех расширений и ещё раз чуть позже для запоздавших.
function run() {
    try {
        const count = translateAll(SlashCommandParser.commands, dict);
        if (count) console.log(LOG, `переведено команд: ${count}`);
    } catch (err) {
        console.error(LOG, err);
    }
}

run();
eventSource.on(event_types.APP_READY, () => {
    run();
    setTimeout(run, 5000);
});
