// Русские описания команд. Ключ — имя команды (не алиас).
//   help    — HTML справки целиком (строка или функция от исходной справки)
//   returns — что возвращает команда
//   args    — описания аргументов: именованные по имени, безымянные как '#0', '#1'.
//             Значение — строка или { text, enums: { значение: описание } }.
// Описания аргументов, которых здесь нет, берутся из phrases.js или остаются английскими.
// Примеры команд не переводим: это код, его надо вводить как есть.

const EXAMPLE = '<strong>Пример:</strong>';
const EXAMPLES = '<strong>Примеры:</strong>';
const AWAIT = 'Если передать <code>await=true</code>, команда дождётся окончания, прежде чем выполнять следующую.';
const COMPACT = 'Если <code>compact=true</code>, сообщение показывается в компактном виде.';

const RULES = `
<div>
    <strong>Правила сравнения:</strong>
    <ul>
        <li><code>eq</code> => a == b <small>(строки и числа)</small></li>
        <li><code>neq</code> => a !== b <small>(строки и числа)</small></li>
        <li><code>in</code> => a содержит b <small>(строки, числа как строки)</small></li>
        <li><code>nin</code> => a не содержит b <small>(строки, числа как строки)</small></li>
        <li><code>gt</code> => a > b <small>(числа)</small></li>
        <li><code>gte</code> => a >= b <small>(числа)</small></li>
        <li><code>lt</code> => a < b <small>(числа)</small></li>
        <li><code>lte</code> => a <= b <small>(числа)</small></li>
        <li><code>not</code> => !a <small>(истинность)</small></li>
    </ul>
</div>`;

const LOOP_LIMIT = '<div>По умолчанию цикл ограничен 100 повторами, чтобы снять ограничение, передайте <code>guard=off</code>.</div>';

export const commands = {
    // ---------- Справка и чат ----------
    '?': {
        help: 'Справка по макросам, форматированию чата и командам.',
        args: {
            '#0': {
                text: 'раздел справки',
                enums: {
                    slash: 'слэш-команды (STscript)',
                    macros: '{{макросы}} (подстановка текста)',
                    format: 'форматирование чата и текста',
                    hotkeys: 'горячие клавиши',
                },
            },
        },
    },
    send: {
        help: `
<div>Добавляет в чат сообщение от пользователя, не запуская генерацию ответа.</div>
<div>${COMPACT}</div>
<div>Если задан <code>name</code>, он показывается как имя отправителя. Можно передать пустое значение, тогда имени не будет.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/send Hello there!</code></pre></li>
        <li><pre><code>/send compact=true Hi</code></pre></li>
    </ul>
</div>`,
        args: { compact: 'компактный вид', name: 'отображаемое имя', '#0': 'текст' },
    },
    sendas: {
        help: `
<div>Отправляет сообщение от имени указанного персонажа. Если такой персонаж есть в списке, используется его аватар.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/sendas name="Chloe" Hello, guys!</code></pre>
            отправит «Hello, guys!» от имени Chloe.</li>
        <li><pre><code>/sendas name="Chloe" avatar="BigBadBoss" Hehehe, I am the big bad evil, fear me.</code></pre>
            отправит сообщение от имени Chloe, но с аватаром персонажа BigBadBoss.</li>
    </ul>
</div>
<div>${COMPACT}</div>`,
        args: {
            avatar: 'аватар вместо обычного: ключ аватара или имя персонажа, у которого его взять',
            compact: 'компактный вид',
            '#0': 'текст',
        },
    },
    sys: {
        help: `
<div>Отправляет сообщение от лица системного рассказчика.</div>
<div>${COMPACT}</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/sys The sun sets in the west.</code></pre></li>
        <li><pre><code>/sys compact=true A brief note.</code></pre></li>
    </ul>
</div>`,
        args: { compact: 'компактный вид', name: 'своё отображаемое имя для этого сообщения рассказчика', '#0': 'текст' },
    },
    comment: {
        help: `
<div>Добавляет заметку-комментарий, которая не входит в чат (модель её не видит).</div>
<div>${COMPACT}</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/comment This is a comment</code></pre></li>
        <li><pre><code>/comment compact=true This is a compact comment</code></pre></li>
    </ul>
</div>`,
        args: { compact: 'компактный вид', '#0': 'текст' },
    },
    echo: {
        help: `
<div>Показывает текст во всплывающем уведомлении. Удобно для информационных сообщений и отладки конвейера команд.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/echo title="My Message" severity=warning This is a warning message</code></pre></li>
        <li><pre><code>/echo color=purple This message is purple</code></pre></li>
        <li><pre><code>/echo onClick={: /echo escapeHtml=false color=transparent cssClass=wider_dialogue_popup &lt;img src="/img/five.png" /&gt; :} timeout=5000 Clicking on this message within 5 seconds will open the image.</code></pre></li>
    </ul>
</div>`,
        returns: 'тот же текст',
        args: {
            title: 'заголовок уведомления',
            severity: 'уровень важности уведомления',
            timeout: 'сколько миллисекунд показывать уведомление. Если задать 0 и здесь, и в extendedTimeout, оно будет висеть, пока его не закроют.',
            extendedTimeout: 'сколько миллисекунд показывать уведомление после наведения мыши. Если задать 0 и здесь, и в timeout, оно будет висеть, пока его не закроют.',
            preventDuplicates: 'не показывать повторно уведомление с тем же текстом',
            awaitDismissal: 'ждать, пока уведомление закроют, прежде чем идти дальше',
            cssClass: 'дополнительный CSS-класс для уведомления (например, для своего оформления)',
            color: 'свой CSS-цвет уведомления. Подходят любые значения CSS (например, \'red\', \'#FF0000\', \'rgb(255, 0, 0)\').<br />Тоньше настраивается через аргумент cssClass и свои классы.',
            escapeHtml: 'экранировать ли HTML в тексте уведомления',
            onClick: 'замыкание, которое выполнится при щелчке по уведомлению. Получает ту же область видимости, что и скрипт, так что осторожнее с изменением переменных.',
            '#0': 'текст',
        },
    },
    impersonate: {
        help: `
<div>Генерирует ответ от лица пользователя (персоны), можно с дополнительным промптом.</div>
<div>${AWAIT}</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/impersonate What is the meaning of life?</code></pre></li>
    </ul>
</div>`,
        args: { '#0': 'промпт' },
    },
    continue: {
        help: `
<div>Продолжает последнее сообщение в чате, можно с дополнительным промптом.</div>
<div>${AWAIT}</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/continue</code></pre>
            продолжает без дополнительного промпта и сразу переходит к следующей команде.</li>
        <li><pre><code>/continue await=true Let's explore this further...</code></pre>
            продолжает с указанным промптом и ждёт окончания генерации.</li>
    </ul>
</div>`,
        args: { await: 'ждать ли окончания генерации, прежде чем идти дальше', '#0': 'промпт' },
    },
    regenerate: {
        help: `
<div>Перегенерирует последний ответ в чате.</div>
<div>${AWAIT}</div>`,
        args: { await: 'ждать ли окончания перегенерации, прежде чем идти дальше' },
    },
    swipe: {
        help: `
<div>Листает (свайпает) последний ответ. По умолчанию <code>direction=right</code>; <code>direction=left</code> возвращает к предыдущему варианту. Если следующего варианта нет, поведение зависит от сообщения.</div>
<div>${AWAIT}</div>`,
        args: { direction: 'направление свайпа', await: 'ждать ли окончания свайпа, прежде чем идти дальше' },
    },
    trigger: {
        help: `
<div>Запускает генерацию сообщения. В групповом чате можно указать номер или имя участника, за которого генерировать.</div>
<div>${AWAIT}</div>`,
        args: { '#0': 'номер участника группы (с 0) или имя' },
    },
    gen: {
        help: `
<div>Генерирует текст по указанному промпту и передаёт его следующей команде по конвейеру. Может блокировать ввод на время генерации и задавать имя в промпте для instruct-режима (по умолчанию «System»).</div>
<div>Аргумент <code>as</code> задаёт роль выходного промпта: system (по умолчанию) или char. Если в <code>length</code> указать число токенов, длина ответа API временно будет такой.</div>`,
        args: {
            trim: 'обрезать вывод по границе последнего предложения',
            name: 'имя в промпте для instruct-режима (или ключ аватара персонажа, тогда берётся его имя)',
            '#0': 'промпт',
        },
    },
    genraw: {
        help: `
<div>Генерирует текст по указанному промпту и передаёт его следующей команде по конвейеру, может блокировать ввод на время генерации. Не добавляет историю чата и карточку персонажа.</div>
<div><code>instruct=off</code> отключает instruct-форматирование, например <pre><code>/genraw instruct=off Why is the sky blue?</code></pre></div>
<div><code>stop=...</code> с JSON-массивом добавляет разовые стоп-строки, например <pre><code>/genraw stop=["\\n"] Say hi</code></pre></div>
<div>Аргумент <code>as</code> задаёт роль выходного промпта: system (по умолчанию) или char. Аргумент <code>system</code> добавляет в начало (необязательный) системный промпт.</div>
<div>Если в <code>length</code> указать число токенов, длина ответа API временно будет такой.</div>`,
        args: {
            instruct: 'использовать instruct-режим',
            stop: 'разовые стоп-строки',
            system: 'системный промпт в начале',
            prefill: 'заготовка ответа в конце промпта',
            trim: 'убрать из вывода префиксы {{user}} и {{char}}',
            '#0': 'промпт',
        },
    },
    ask: {
        help: 'Задаёт вопрос указанному персонажу. Имя персонажа обязательно передать в именованном аргументе <code>name</code>.',
        args: { '#0': 'промпт' },
    },
    hide: {
        help: 'Скрывает сообщение чата из промпта (модель его не увидит).',
        args: { name: 'скрывать только сообщения указанного персонажа или персоны' },
    },
    unhide: {
        help: 'Возвращает скрытое сообщение в промпт.',
        args: { name: 'показывать только сообщения указанного персонажа или персоны' },
    },
    messages: {
        help: `
<div>Возвращает указанное сообщение или диапазон сообщений одной строкой.</div>
<div><code>hidden=off</code> исключает скрытые сообщения.</div>
<div>Аргумент <code>role</code> отбирает сообщения по роли: system, assistant, user.</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code>/messages 10</code></pre> вернёт 10-е сообщение.</li>
        <li><pre><code>/messages names=on 5-10</code></pre> вернёт сообщения с 5-го по 10-е с именами авторов.</li>
    </ul>
</div>`,
        returns: 'указанное сообщение или диапазон сообщений строкой',
        args: { names: 'показывать имена авторов', hidden: 'включать скрытые сообщения', role: 'отобрать сообщения по роли' },
    },
    del: {
        help: 'Включает режим удаления сообщений. Если передать число N, сразу удаляет N последних сообщений.',
        returns: 'текст удалённых сообщений',
    },
    cut: {
        help: `
<div>Вырезает из чата указанное сообщение или непрерывный кусок сообщений.</div>
<div>Границы диапазона включаются!</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/cut 0-10</code></pre></li>
    </ul>
</div>`,
        returns: 'текст вырезанных сообщений, по одному на строку',
        args: { '#0': 'номер или диапазон' },
    },
    delswipe: {
        help: `
<div>Удаляет вариант (свайп) у последнего сообщения чата. Если номер не указан, удаляет текущий.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/delswipe</code></pre> удалит текущий свайп.</li>
        <li><pre><code>/delswipe 2</code></pre> удалит второй свайп последнего сообщения.</li>
    </ul>
</div>`,
        returns: 'номер нового текущего свайпа',
        args: { '#0': 'номер свайпа (с 1)' },
    },
    addswipe: {
        help: `
<div>Добавляет вариант (свайп) к последнему сообщению чата.</div>
<div><code>switch=true</code> сразу переключает на новый свайп.</div>`,
        returns: 'номер нового свайпа',
        args: { switch: 'переключиться на новый свайп', '#0': 'текст' },
    },
    newchat: {
        help: 'Начинает новый чат с текущим персонажем.',
        args: { delete: 'удалить текущий чат' },
    },
    closechat: { help: 'Закрывает текущий чат.' },
    go: {
        help: 'Открывает чат с персонажем или группой по имени.',
        returns: 'имя персонажа или группы',
    },
    random: {
        help: 'Начинает новый чат со случайным персонажем. Если указан тег, выбирает только среди персонажей с этим тегом.',
        args: { '#0': 'необязательное имя тега' },
    },

    // ---------- Подключение и оформление ----------
    api: {
        help: (orig) => {
            const list = orig.match(/<pre><code>[\s\S]*?<\/code><\/pre>/)?.[0] ?? '';
            return `
<div>Подключается к указанному API. Без аргумента возвращает текущий API.</div>
<div><strong>Доступные API:</strong>${list}</div>`;
        },
        returns: 'текущий API',
        args: { quiet: 'не показывать уведомление о подключении', '#0': 'API, к которому подключиться' },
    },
    model: {
        help: 'Задаёт модель для текущего API. Без аргумента возвращает название текущей модели.',
        returns: 'текущая модель',
        args: { quiet: 'не показывать уведомление о смене модели' },
    },
    bg: {
        help: `
<div>Ставит фон по имени файла. Можно указать часть имени.</div>
<div>Без аргумента возвращает текущий фон.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/bg beach.jpg</code></pre></li>
        <li><pre><code>/bg</code></pre></li>
    </ul>
</div>`,
        returns: 'текущий фон',
        args: { '#0': 'имя файла фона' },
    },

    // ---------- Вставки в промпт ----------
    inject: {
        help: 'Вставляет текст в промпт модели для текущего чата. Нужен уникальный ID вставки (если не указать, создаётся автоматически). Позиции (position): before — перед основным промптом, after — после основного промпта, chat — внутрь чата, none — скрыто (по умолчанию after). depth — глубина вставки в чат (по умолчанию 4). role — роль для вставок в чат (по умолчанию system). scan — учитывать текст вставки при поиске записей World Info (по умолчанию false). Скрытые вставки с позицией none в промпт не попадают, но могут срабатывать как триггеры записей WI. Возвращает ID вставки.',
        args: {
            position: 'позиция вставки',
            depth: 'глубина вставки',
            role: 'роль для вставок в чат',
            scan: 'учитывать текст вставки при поиске World Info',
            ephemeral: 'удалить вставку после генерации',
            filter: 'если задан фильтр, вставка выполняется, только когда замыкание возвращает true',
        },
    },
    listinjects: {
        help: 'Показывает все скриптовые вставки текущего чата. По умолчанию во всплывающем окне; аргумент <code>return</code> меняет способ вывода.',
        returns: 'при необходимости JSON-объект со вставками',
    },
    flushinject: {
        help: 'Удаляет скриптовую вставку текущего чата. Если ID не указан, удаляет все вставки.',
        args: { '#0': 'ID вставки или имя переменной, в которой лежит ID' },
    },

    // ---------- Ввод и окна ----------
    input: {
        help: `
<div>Показывает окно с текстом и полем ввода. Аргумент <code>default</code> задаёт начальное значение поля, а безымянный аргумент — показываемый текст.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/input default="John" placeholder="Enter your name" tooltip="Your display name" What is your name?</code></pre></li>
    </ul>
</div>`,
        returns: 'введённый текст',
        args: {
            default: 'начальное значение поля ввода',
            large: 'окно выше обычного, с местом для содержимого (высоту поля задаёт аргумент rows)',
            wide: 'окно шире обычного, с широким полем ввода',
            okButton: 'текст кнопки OK',
            rows: 'число строк в поле ввода',
            placeholder: 'подсказка в пустом поле ввода',
            tooltip: 'всплывающая подсказка при наведении на поле',
            onSuccess: 'замыкание, которое выполнится при нажатии OK или успешном закрытии (Enter и т. п.)',
            onCancel: 'замыкание, которое выполнится при отмене (кнопка отмены, Escape и т. п.)',
        },
    },
    popup: {
        help: `
<div>Показывает блокирующее окно с текстом и кнопками. Возвращает текст окна.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/popup large=on wide=on okButton="Confirm" Please confirm this action.</code></pre></li>
        <li><pre><code>/popup okButton="Left" cancelButton="Right" result=true Do you want to go left or right? | /echo 0 means right, 1 means left. Choice: {{pipe}}</code></pre></li>
    </ul>
</div>`,
        returns: 'текст окна',
        args: {
            scroll: 'разрешить вертикальную прокрутку содержимого',
            large: 'большое окно',
            wide: 'широкое окно',
            wider: 'ещё более широкое окно',
            transparent: 'прозрачное окно',
            okButton: 'текст кнопки OK',
            cancelButton: 'текст кнопки отмены',
            result: 'вернуть результат окна числом вместо текста: 1 для OK, 0 для отмены, пустая строка, если окно просто закрыли',
            tooltip: 'всплывающая подсказка при наведении на содержимое окна',
        },
    },
    buttons: {
        help: `
<div>Показывает блокирующее окно с текстом и кнопками. Возвращает в конвейер надпись нажатой кнопки или пустую строку при отмене.</div>
<div>Кнопки задаются простыми строками или объектами со свойствами <code>text</code>, <code>tooltip</code> и <code>icon</code> (класс Font Awesome).</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/buttons labels=["Yes","No"] Do you want to continue?</code></pre></li>
        <li><pre><code>/buttons labels=[{"text":"Save","icon":"fa-floppy-disk","tooltip":"Save changes"},{"text":"Cancel"}] Choose an action</code></pre></li>
    </ul>
</div>`,
        returns: 'надпись нажатой кнопки (или массив надписей, если включён multiple)',
        args: {
            labels: 'надписи кнопок: массив строк или объектов со свойствами text, tooltip и icon',
            multiple: 'можно нажать (переключить) несколько кнопок, все нажатые вернутся массивом',
        },
    },
    setinput: {
        help: `
<div>Вставляет указанный текст в поле ввода и передаёт его следующей команде по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/setinput Hello world</code></pre></li>
    </ul>
</div>`,
    },

    // ---------- Управление скриптом ----------
    pass: {
        help: `
<div><pre><span class="monospace">/pass (text)</span> – передаёт текст следующей команде по конвейеру.</pre></div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/pass Hello world</code></pre></li>
    </ul>
</div>`,
        returns: 'переданное значение',
    },
    abort: {
        help: 'Прерывает выполнение пакета слэш-команд.',
        args: {
            quiet: 'не показывать уведомление о вызове /abort',
            '#0': 'причина прерывания (показывается, если quiet=false)',
        },
    },
    run: {
        help: `
<div>Выполняет замыкание из переменной области видимости или быстрый ответ (Quick Reply) с указанным именем из активного или другого набора.
В быстром ответе к именованным аргументам можно обращаться через <code>{{arg::key}}</code>.</div>`,
        returns: 'результат выполненного замыкания или быстрого ответа',
        args: { args: 'именованные аргументы', '#0': 'переменная области видимости или название быстрого ответа' },
    },
    if: {
        help: `
<div>Сравнивает левый операнд <code>a</code> с правым <code>b</code> и, если условие истинно, выполняет команду в кавычках (или замыкание) и передаёт её результат дальше по конвейеру.</div>
<div>Операндами могут быть числа и строки.</div>
<div>Если правило не указано, используется <code>eq</code>.</div>
<div>Если правого операнда нет, проверяется истинность <code>left</code>. Истинными считаются непустая строка, ненулевое число, а также значения <code>true</code> и <code>on</code>.<br />
Без правого операнда допустимо только правило <code>not</code> или отсутствие правила: тогда проверяется ложность или истинность значения.</div>
${RULES}
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/if left=score right=10 rule=gte "/speak You win"</code></pre>
            выполнит /speak, если значение «score» больше или равно 10.</li>
        <li><pre><code class="language-stscript">/if left={{lastMessage}} rule=in right=surprise {: /echo SURPISE! :}</code></pre>
            выполнит замыкание, если значение содержит указанное слово.</li>
        <li><pre><code class="language-stscript">/if left=myContent {: /echo My content had some content. :}</code></pre>
            выполнит замыкание, если значение left истинно (не пустое и не false).</li>
        <li><pre><code class="language-stscript">/if left=tree right={{getvar::object}} {: /echo The object is a tree! :}</code></pre>
            выполнит замыкание, если левое и правое значения равны.</li>
    </ul>
</div>`,
        returns: 'результат выполненной команды (ветки «то» или «иначе»)',
        args: { else: 'команда, которая выполнится, если условие ложно', '#0': 'команда, которая выполнится, если условие истинно' },
    },
    while: {
        help: `
<div>Сравнивает левый операнд <code>a</code> с правым <code>b</code> и, пока условие истинно, выполняет команду в кавычках (или замыкание).</div>
<div>Операндами могут быть числа и строки.</div>
${RULES}
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/setvar key=i 0 | /while left=i right=10 rule=lte "/addvar key=i 1"</code></pre>
            прибавляет 1 к «i», пока значение не дойдёт до 10.</li>
        <li><pre><code class="language-stscript">/while left={{getvar::currentword}} {: /setvar key=currentword {: /do-something-and-return :}() | /echo The current work is "{{getvar::currentword}}" :}</code></pre>
            выполняет замыкание, пока переменная «currentword» истинна (не пустая и не false).</li>
    </ul>
</div>
${LOOP_LIMIT}`,
        returns: 'результат последней выполненной команды',
        args: { '#0': 'команда, которая выполняется, пока условие истинно' },
    },
    times: {
        help: `
<div>Выполняет команду в кавычках (или замыкание) <code>repeats</code> раз.</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/setvar key=i 1 | /times 5 "/addvar key=i 1"</code></pre>
            5 раз прибавит 1 к значению «i».</li>
        <li><pre><code class="language-stscript">/times 4 "/echo {{timesIndex}}"</code></pre>
            выведет числа от 0 до 3. <code>{{timesIndex}}</code> заменяется номером повтора (с нуля).</li>
    </ul>
</div>
${LOOP_LIMIT}`,
        returns: 'результат последней выполненной команды',
        args: { '#0': 'сколько раз повторить', '#1': 'команда' },
    },

    // ---------- Переменные ----------
    setvar: {
        help: `
<div>Задаёт значение локальной переменной (переменной чата) и передаёт его дальше по конвейеру. Аргумент <code>index</code> необязателен.
Чтобы при использовании <code>index</code> привести значение к нужному JSON-типу, укажите аргумент <code>as</code>.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/setvar key=color green</code></pre></li>
        <li><pre><code class="language-stscript">/setvar key=ages index=John as=number 21</code></pre></li>
    </ul>
</div>`,
        returns: 'заданное значение переменной',
    },
    getvar: {
        help: `
<div>Берёт значение локальной переменной (переменной чата) и передаёт его дальше по конвейеру. Аргумент <code>index</code> необязателен.</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/getvar height</code></pre></li>
        <li><pre><code class="language-stscript">/getvar key=height</code></pre></li>
        <li><pre><code class="language-stscript">/getvar index=3 costumes</code></pre></li>
    </ul>
</div>`,
    },
    addvar: {
        help: `
<div>Прибавляет значение к локальной переменной и передаёт результат дальше по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/addvar key=score 10</code></pre></li>
    </ul>
</div>`,
        args: { '#0': 'что прибавить к переменной' },
    },
    incvar: {
        help: `
<div>Увеличивает локальную переменную на 1 и передаёт результат дальше по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/incvar score</code></pre></li>
    </ul>
</div>`,
    },
    decvar: {
        help: `
<div>Уменьшает локальную переменную на 1 и передаёт результат дальше по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/decvar score</code></pre></li>
    </ul>
</div>`,
    },
    flushvar: {
        help: `
<div>Удаляет локальную переменную.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/flushvar score</code></pre></li>
    </ul>
</div>`,
        args: { key: 'имя переменной или замыкание, которое возвращает имя' },
    },
    listvar: {
        help: 'Показывает переменные чата. По умолчанию во всплывающем окне; аргумент <code>return</code> меняет способ вывода.',
        returns: 'JSON-список локальных переменных',
        args: { scope: 'отобрать переменные по области видимости' },
    },
    setglobalvar: {
        help: `
<div>Задаёт значение глобальной переменной (общей для всех чатов) и передаёт его дальше по конвейеру. Аргумент <code>index</code> необязателен.
Чтобы при использовании <code>index</code> привести значение к нужному JSON-типу, укажите аргумент <code>as</code>.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/setglobalvar key=color green</code></pre></li>
        <li><pre><code class="language-stscript">/setglobalvar key=ages index=John as=number 21</code></pre></li>
    </ul>
</div>`,
        returns: 'заданное значение глобальной переменной',
    },
    getglobalvar: {
        help: `
<div>Берёт значение глобальной переменной и передаёт его дальше по конвейеру. Аргумент <code>index</code> необязателен.</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/getglobalvar height</code></pre></li>
        <li><pre><code class="language-stscript">/getglobalvar key=height</code></pre></li>
        <li><pre><code class="language-stscript">/getglobalvar index=3 costumes</code></pre></li>
    </ul>
</div>`,
        returns: 'значение глобальной переменной',
    },
    let: {
        help: `
<div>Объявляет новую переменную в текущей области видимости (в скрипте или замыкании).</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/let x foo bar | /echo {{var::x}}</code></pre></li>
        <li><pre><code class="language-stscript">/let key=x foo bar | /echo {{var::x}}</code></pre></li>
        <li><pre><code class="language-stscript">/let y</code></pre></li>
    </ul>
</div>`,
        args: { '#1': 'значение переменной' },
    },
    var: {
        help: `
<div>Читает или задаёт переменную области видимости. <code>index</code> даёт доступ к элементам списка или словаря в JSON.
Чтобы при использовании <code>index</code> привести значение к нужному JSON-типу, укажите аргумент <code>as</code>.</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/let x foo | /var x foo bar | /var x | /echo</code></pre></li>
        <li><pre><code class="language-stscript">/let x foo | /var key=x foo bar | /var x | /echo</code></pre></li>
        <li><pre><code class="language-stscript">/let x {} | /var index=cool as=number x 1337 | /echo {{var::x}}</code></pre></li>
    </ul>
</div>`,
        args: {
            key: 'имя переменной; значение задаётся, даже если оно не передано',
            index: 'необязательный индекс в списке или словаре',
            '#1': 'значение переменной',
        },
    },
    len: {
        help: `
<div>Считает длину значения и передаёт результат дальше по конвейеру.
    <ul>
        <li>Для строк — число символов.</li>
        <li>Для списков и словарей — число элементов.</li>
        <li>Для чисел — число знаков (включая знак и десятичную точку).</li>
    </ul>
</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/len Lorem ipsum | /echo</code></pre></li>
    </ul>
</div>`,
        returns: 'длина переданного значения',
    },
};
