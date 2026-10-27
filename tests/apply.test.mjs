import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translateAll, translateCommand } from '../src/apply.js';
import { commands } from '../dict/commands.js';
import { phrases } from '../dict/phrases.js';

const dict = { commands, phrases };

function makeCmd(name, extra = {}) {
    return {
        name,
        helpString: 'English help',
        returns: null,
        namedArgumentList: [],
        unnamedArgumentList: [],
        helpCache: { x: 1 },
        helpDetailsCache: { x: 1 },
        ...extra,
    };
}

test('заменяет справку, аргументы и возвращаемое значение', () => {
    const cmd = makeCmd('cut', {
        returns: 'the text of cut messages separated by a newline',
        namedArgumentList: [{ name: 'toolcalls', description: 'also delete associated tool-call messages', enumList: [] }],
        unnamedArgumentList: [{ description: 'number or range', enumList: [] }],
    });
    assert.equal(translateCommand(cmd, dict), true);
    assert.match(cmd.helpString, /Вырезает/);
    assert.match(cmd.returns, /вырезанных/);
    assert.match(cmd.namedArgumentList[0].description, /удалить заодно/);
    assert.equal(cmd.unnamedArgumentList[0].description, 'номер или диапазон');
    assert.deepEqual(cmd.helpCache, {});
    assert.deepEqual(cmd.helpDetailsCache, {});
});

test('алиасы не переводятся дважды', () => {
    const cmd = makeCmd('closechat');
    const n = translateAll({ closechat: cmd, alias: cmd }, dict);
    assert.equal(n, 1);
    assert.equal(cmd.helpString, 'Закрывает текущий чат.');
});

test('неизвестная команда получает перевод общих фраз аргументов, справка остаётся', () => {
    const cmd = makeCmd('some-ext-command', {
        namedArgumentList: [{ name: 'return', description: 'The way how you want the return value to be provided', enumList: [] }],
    });
    assert.equal(translateCommand(cmd, dict), true);
    assert.equal(cmd.helpString, 'English help');
    assert.equal(cmd.namedArgumentList[0].description, 'в каком виде вернуть результат');
});

test('незнакомая команда без общих фраз не трогается', () => {
    const cmd = makeCmd('unknown');
    assert.equal(translateCommand(cmd, dict), false);
    assert.deepEqual(cmd.helpCache, { x: 1 });
});

test('описания значений перечисления переводятся', () => {
    const cmd = makeCmd('?', {
        unnamedArgumentList: [{
            description: 'help topic',
            enumList: [{ value: 'slash', description: 'slash commands (STscript)' }],
        }],
    });
    translateCommand(cmd, dict);
    assert.equal(cmd.unnamedArgumentList[0].description, 'раздел справки');
    assert.equal(cmd.unnamedArgumentList[0].enumList[0].description, 'слэш-команды (STscript)');
});

test('справка /api сохраняет список API из оригинала', () => {
    const cmd = makeCmd('api', { helpString: '<div>Connect</div><pre><code>claude, openai</code></pre>' });
    translateCommand(cmd, dict);
    assert.match(cmd.helpString, /Подключается/);
    assert.match(cmd.helpString, /claude, openai/);
});

test('у каждой записи словаря есть справка', () => {
    for (const [name, entry] of Object.entries(commands)) {
        assert.ok(entry.help, `нет help у ${name}`);
    }
});
