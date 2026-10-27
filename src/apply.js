// Подмена описаний слэш-команд русскими. Чистый модуль без зависимостей от ST,
// чтобы его можно было проверить в Node.

/**
 * Переводит одну команду. Повторный вызов для той же команды ничего не делает
 * (алиасы указывают на тот же объект).
 * @param {object} cmd SlashCommand из SlashCommandParser.commands
 * @param {{commands: object, phrases: object}} dict
 * @returns {boolean} true, если что-то заменено
 */
export function translateCommand(cmd, dict) {
    if (!cmd || cmd.__ruHelp) return false;
    cmd.__ruHelp = true;

    const entry = dict.commands[cmd.name] ?? {};
    let changed = false;

    if (entry.help !== undefined) {
        const help = typeof entry.help === 'function' ? entry.help(cmd.helpString ?? '') : entry.help;
        if (help) {
            cmd.helpString = help;
            changed = true;
        }
    } else if (cmd.helpString && dict.phrases[cmd.helpString]) {
        cmd.helpString = dict.phrases[cmd.helpString];
        changed = true;
    }

    const returns = entry.returns ?? dict.phrases[cmd.returns];
    if (cmd.returns && returns) {
        cmd.returns = returns;
        changed = true;
    }

    const args = entry.args ?? {};
    for (const arg of cmd.namedArgumentList ?? []) {
        changed = translateArg(arg, args[arg.name], dict.phrases) || changed;
    }
    (cmd.unnamedArgumentList ?? []).forEach((arg, i) => {
        changed = translateArg(arg, args[`#${i}`], dict.phrases) || changed;
    });

    if (changed) {
        // ST кэширует отрисованную справку, сбрасываем кэш.
        cmd.helpCache = {};
        cmd.helpDetailsCache = {};
    }
    return changed;
}

function translateArg(arg, override, phrases) {
    if (!arg) return false;
    let changed = false;
    const ru = typeof override === 'string' ? override : override?.text;
    const description = ru ?? phrases[arg.description];
    if (description) {
        arg.description = description;
        changed = true;
    }
    const enums = typeof override === 'object' ? override?.enums : null;
    for (const item of arg.enumList ?? []) {
        const text = enums?.[item.value] ?? phrases[item.description];
        if (text) {
            item.description = text;
            changed = true;
        }
    }
    return changed;
}

/**
 * Переводит все зарегистрированные команды.
 * @param {Object.<string, object>} commands SlashCommandParser.commands
 * @returns {number} сколько команд изменено
 */
export function translateAll(commands, dict) {
    let count = 0;
    for (const cmd of new Set(Object.values(commands ?? {}))) {
        if (translateCommand(cmd, dict)) count++;
    }
    return count;
}
