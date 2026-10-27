# Русская справка слэш-команд

Расширение для SillyTavern 1.19. Подменяет английские описания слэш-команд русскими:
в списке `/help slash` (он же `/? slash`) и в подсказках при наборе команды.

## Как подключить

Папку нужно сделать видимой для ST как стороннее расширение. Проще всего ссылкой (junction),
тогда правки словаря сразу видны после F5. В командной строке Windows (cmd):

```
mklink /J "D:\SillyTavern\SillyTavern-Launcher\SillyTavern\data\default-user\extensions\st-ru-slash-help" "D:\Git on D\st-ru-slash-help"
```

Потом перезагрузить страницу ST и проверить, что в «Расширения → Управление расширениями»
включено «Русская справка слэш-команд». В консоли браузера появится строка
`[ru-slash-help] переведено команд: N`.

## Как устроено

- `dict/commands.js`, `dict/chat.js` — переводы по командам, по файлу на партию: справка целиком,
  возвращаемое значение, аргументы. `dict/index.js` собирает партии вместе.
- `dict/phrases.js` — общие фразы (точное совпадение английского текста). Работают и для
  команд, которых нет в `commands.js`, например одинаковые описания аргументов `return`, `at`, `raw`.
- `src/apply.js` — подмена, без зависимостей от ST.
- `index.js` — запускает подмену после загрузки ST и всех расширений.

Сам ST не меняется, поэтому обновления ST перевод не затирают. Если в новой версии ST
поменяется текст команды, у нас останется старый перевод, пока его не обновить.

Примеры команд в справке не переводятся: это код, его надо вводить как есть.

## Покрытие

Партия 1 — 53 самые ходовые команды: чат и сообщения (`/send`, `/sendas`, `/sys`, `/comment`,
`/echo`, `/impersonate`, `/continue`, `/regenerate`, `/swipe`, `/trigger`, `/gen`, `/genraw`,
`/ask`, `/hide`, `/unhide`, `/messages`, `/del`, `/cut`, `/delswipe`, `/addswipe`, `/newchat`,
`/closechat`, `/go`, `/random`), подключение и фон (`/api`, `/model`, `/bg`), вставки
(`/inject`, `/listinjects`, `/flushinject`), окна (`/input`, `/popup`, `/buttons`, `/setinput`),
управление скриптом (`/pass`, `/abort`, `/run`, `/if`, `/while`, `/times`) и переменные
(`/setvar`, `/getvar`, `/addvar`, `/incvar`, `/decvar`, `/flushvar`, `/listvar`,
`/setglobalvar`, `/getglobalvar`, `/let`, `/var`, `/len`) плюс сама `/?`.

Партия 2 — ещё 70 команд: чаты (`/delchat`, `/renamechat`, `/tempchat`, `/chat-jump`, `/stop`…),
сообщения (`/message-role`, `/message-name`, `/sysgen`, `/delname`, `/reroll-pick`), персонажи
(`/char-find`, `/char-create`, `/char-update`, `/char-get`, `/char-delete`…), группы (`/member-*`),
шаблоны и промпт (`/instruct`, `/context`, `/api-url`, `/tokenizer`, `/getpromptentry`…),
интерфейс (`/panels`, `/bubble`, `/flat`, `/pick-icon`, буфер обмена), работа с текстом
(`/fuzzy`, `/replace`, `/match`, `/test`, `/substr`, `/upper`, `/lower`, `/trimtokens`…) и синтаксис
скриптов (`/break`, `/breakpoint`, `/parser-flag`, комментарий `//`).

Остальные команды (около 170) пока на английском.

## Тесты

```
node --test "tests/*.test.mjs"
```
