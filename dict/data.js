// Партия 3: переменные и математика, World Info, персоны, теги, заметка автора,
// системный промпт, reasoning, ветки и чекпоинты, фоны.

const EXAMPLE = '<strong>Пример:</strong>';
const EXAMPLES = '<strong>Примеры:</strong>';

const VAR_NAMES = '<div>Можно указывать имена переменных или JSON-массив из чисел и переменных (имена в кавычках).</div>';
const PIPE_VARS = 'и передаёт результат дальше по конвейеру. Можно указывать имена переменных.';

// Простая математическая команда с одним примером.
function math(text, example, returns, args) {
    return {
        help: `
<div>${text}</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">${example}</code></pre></li>
    </ul>
</div>`,
        returns,
        args,
    };
}

// Математика над набором значений.
function mathSet(text, examples, returns, what) {
    return {
        help: `
<div>${text}</div>
${VAR_NAMES}
<div>${EXAMPLES}
    <ul>
${examples.map(e => `        <li><pre><code class="language-stscript">${e}</code></pre></li>`).join('\n')}
    </ul>
</div>`,
        returns,
        args: { '#0': what },
    };
}

const PERSONA = 'имя персоны или ключ аватара. Если не указано, берётся активная персона.';

// Поля персоны, общие для /persona-create и /persona-update.
const PERSONA_FIELDS = {
    name: 'имя персоны',
    description: 'описание персоны (отправляется модели вместе с сообщениями)',
    title: 'подпись персоны (только для отображения, модели не отправляется)',
    avatar: 'картинка аватара. prompt открывает выбор файла; можно указать локальный путь в ST, data URL в base64 или результат /imagine.',
    avatarPromptResize: 'показывать окно обрезки аватара при загрузке. Не действует, если в настройках включено «Never resize avatars».',
    descriptionPosition: 'куда в промпте вставлять описание персоны',
    descriptionDepth: 'глубина вставки описания (если позиция atDepth)',
    descriptionRole: 'роль для описания (если позиция atDepth)',
    lorebook: 'название лорбука (World Info), который привязать к персоне',
    persona: PERSONA,
};

const BOOK = 'название лорбука';
const UID = 'UID записи';
const NEW_BOOK = 'название нового лорбука, если его надо создать; иначе придумывается автоматически';
const CREATE_BOOK = 'создать новый лорбук, если его ещё нет';

const TAG_CHAR = 'имя персонажа или его уникальный идентификатор (ключ аватара)';

const MES_ID = 'ID сообщения. Если не указан, берётся последнее сообщение.';
const MES_RANGE = 'ID сообщения или диапазон (например, 0-10). Если не указан, берётся последнее сообщение.';

export const commands = {
    // ---------- Глобальные переменные ----------
    addglobalvar: {
        help: `
<div>Прибавляет значение к глобальной переменной и передаёт результат дальше по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/addglobalvar key=score 10</code></pre></li>
    </ul>
</div>`,
        args: { '#0': 'что прибавить к переменной' },
    },
    incglobalvar: {
        help: `
<div>Увеличивает глобальную переменную на 1 и передаёт результат дальше по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/incglobalvar score</code></pre></li>
    </ul>
</div>`,
    },
    decglobalvar: {
        help: `
<div>Уменьшает глобальную переменную на 1 и передаёт результат дальше по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/decglobalvar score</code></pre></li>
    </ul>
</div>`,
    },
    flushglobalvar: {
        help: `
<div>Удаляет указанную глобальную переменную.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/flushglobalvar score</code></pre> удалит глобальную переменную <code>score</code>.</li>
    </ul>
</div>`,
        args: { key: 'имя переменной или замыкание, которое возвращает имя' },
    },

    // ---------- Математика ----------
    add: mathSet('Складывает набор значений и передаёт сумму дальше по конвейеру.',
        ['/add 10 i 30 j', '/add ["count", 15, 2, "i"]'], 'сумма значений', 'слагаемые'),
    mul: mathSet('Перемножает набор значений и передаёт произведение дальше по конвейеру.',
        ['/mul 10 i 30 j', '/mul ["count", 15, 2, "i"]'], 'произведение значений', 'множители'),
    max: mathSet('Находит наибольшее из набора значений и передаёт его дальше по конвейеру.',
        ['/max 10 i 30 j', '/max ["count", 15, 2, "i"]'], 'наибольшее значение', 'значения, среди которых искать наибольшее'),
    min: mathSet('Находит наименьшее из набора значений и передаёт его дальше по конвейеру.',
        ['/min 10 i 30 j', '/min ["count", 15, 2, "i"]'], 'наименьшее значение', 'значения, среди которых искать наименьшее'),
    sub: mathSet('Вычитает из первого значения остальные и передаёт разность дальше по конвейеру.',
        ['/sub i 5', '/sub ["count", 4, "i"]'], 'разность значений', 'значения для вычитания, начиная с уменьшаемого'),
    div: math(`Делит одно значение на другое ${PIPE_VARS}`, '/div 10 i', 'результат деления', { '#0': 'делимое', '#1': 'делитель' }),
    mod: math(`Находит остаток от деления одного значения на другое ${PIPE_VARS}`, '/mod i 2', 'остаток от деления', { '#0': 'делимое', '#1': 'делитель' }),
    pow: math(`Возводит значение в степень ${PIPE_VARS}`, '/pow i 2', 'результат возведения в степень', { '#0': 'основание', '#1': 'показатель степени' }),
    sin: math(`Вычисляет синус значения ${PIPE_VARS}`, '/sin i', 'синус значения'),
    cos: math(`Вычисляет косинус значения ${PIPE_VARS}`, '/cos i', 'косинус значения'),
    log: math(`Вычисляет логарифм значения ${PIPE_VARS}`, '/log i', 'логарифм значения'),
    abs: math(`Берёт модуль значения ${PIPE_VARS}`, '/abs i', 'модуль значения'),
    sqrt: math(`Извлекает квадратный корень ${PIPE_VARS}`, '/sqrt i', 'квадратный корень значения'),
    round: math(`Округляет значение ${PIPE_VARS}`, '/round i', 'округлённое значение'),
    sort: {
        help: `
<div>Сортирует список или словарь по возрастанию и передаёт результат дальше по конвейеру.
    <ul>
        <li>Для списка возвращает список, отсортированный по значениям.</li>
        <li>Для словаря возвращает упорядоченный список ключей. При <code>keysort=false</code> ключи упорядочиваются по их значениям.</li>
    </ul>
</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/sort [5,3,4,1,2] | /echo</code></pre></li>
        <li><pre><code class="language-stscript">/sort keysort=false {"a": 1, "d": 3, "c": 2, "b": 5} | /echo</code></pre></li>
    </ul>
</div>`,
        returns: 'отсортированный список или ключи словаря',
        args: { keysort: 'сортировать по ключам или по значениям; для списков не действует' },
    },
    rand: {
        help: `
<div>Возвращает случайное число от <code>from</code> до <code>to</code> (включительно).</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/rand</code></pre> случайное число от 0 до 1.</li>
        <li><pre><code class="language-stscript">/rand 10</code></pre> случайное число от 0 до 10.</li>
        <li><pre><code class="language-stscript">/rand from=5 to=10</code></pre> случайное число от 5 до 10.</li>
    </ul>
</div>`,
        returns: 'случайное число',
        args: {
            from: 'начало диапазона (включительно)',
            to: 'конец диапазона (включительно)',
            round: 'способ округления результата',
        },
    },
    'closure-serialize': {
        help: `
<div>Превращает замыкание в текст, который можно хранить в глобальных переменных и переменных чата.</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/closure-serialize {: x=1 /echo x is {{var::x}} and y is {{var::y}} :} |\n/setvar key=myClosure</code></pre></li>
    </ul>
</div>`,
        returns: 'замыкание в виде строки',
        args: { '#0': 'замыкание, которое превратить в текст' },
    },
    'closure-deserialize': {
        help: `
<div>Восстанавливает замыкание из текста.</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/closure-deserialize {{getvar::myClosure}} |\n/let myClosure {{pipe}} |\n/let y bar |\n/:myClosure x=foo</code></pre></li>
    </ul>
</div>`,
        returns: 'восстановленное замыкание',
        args: { '#0': 'замыкание в виде текста' },
    },

    // ---------- World Info (лорбуки) ----------
    world: {
        help: 'Включает указанный мир (лорбук), а без аргументов выключает выбранные. <code>state=off</code> выключает мир, <code>state=toggle</code> переключает его, <code>silent=true</code> убирает уведомления.',
        args: { state: 'состояние мира', silent: 'не показывать уведомления', '#0': 'название мира' },
    },
    getchatbook: {
        help: 'Возвращает название лорбука, привязанного к чату (если его нет, создаёт новый), и передаёт его дальше по конвейеру.',
        returns: BOOK,
        args: { name: NEW_BOOK, create: CREATE_BOOK },
    },
    getglobalbooks: {
        help: 'Возвращает список выбранных глобальных лорбуков и передаёт его дальше по конвейеру.',
        returns: 'список названий выбранных лорбуков',
    },
    getpersonabook: {
        help: 'Возвращает название лорбука, привязанного к текущей персоне, и передаёт его дальше по конвейеру. Если лорбук не задан, возвращает пустую строку.',
        returns: BOOK,
        args: { name: NEW_BOOK, create: CREATE_BOOK },
    },
    getcharbook: {
        help: 'Возвращает название лорбука, привязанного к персонажу, и передаёт его дальше по конвейеру. Если лорбук не задан, возвращает пустую строку. В групповых чатах работает, только если указать ключ аватара персонажа.',
        returns: 'название лорбука или список названий',
        args: {
            type: 'какой лорбук вернуть; для all и additional возвращается список',
            name: NEW_BOOK,
            create: CREATE_BOOK,
            '#0': 'имя персонажа или ключ аватара. Если не указано, берётся текущий персонаж.',
        },
    },
    findentry: {
        help: `
<div>Ищет в указанном лорбуке запись по нечёткому совпадению значения поля (по умолчанию key) и передаёт её UID дальше по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/findentry file=chatLore field=key Shadowfang</code></pre></li>
    </ul>
</div>`,
        returns: 'UID',
        args: { file: BOOK, field: 'поле для нечёткого поиска (по умолчанию key)', '#0': 'искомый текст' },
    },
    getentryfield: {
        help: `
<div>Возвращает значение поля (по умолчанию content) записи с указанным UID из лорбука и передаёт его дальше по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/getentryfield file=chatLore field=content 123</code></pre></li>
    </ul>
</div>`,
        returns: 'значение поля',
        args: { file: BOOK, field: 'какое поле вернуть (по умолчанию content)', '#0': UID },
    },
    createentry: {
        help: `
<div>Создаёт в указанном лорбуке новую запись с ключом и содержимым (оба необязательны) и передаёт её UID дальше по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/createentry file=chatLore key=Shadowfang The sword of the king</code></pre></li>
    </ul>
</div>`,
        returns: 'UID новой записи',
        args: { file: BOOK, key: 'ключ записи', '#0': 'содержимое' },
    },
    setentryfield: {
        help: `
<div>Задаёт значение поля (по умолчанию content) записи с указанным UID в лорбуке. Чтобы задать несколько ключей, передайте их через запятую.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/setentryfield file=chatLore uid=123 field=key Shadowfang,sword,weapon</code></pre></li>
    </ul>
</div>`,
        args: { file: BOOK, uid: UID, field: 'название поля (по умолчанию content)' },
    },
    'wi-set-timed-effect': {
        help: `
<div>Включает или выключает временный эффект для записи с указанным UID в лорбуке. Длительность задаётся в самой записи. Действует только в текущем чате. Повторное включение активного эффекта продлевает его. Если последнее сообщение чата свайпнуть или удалить, эффект снимается.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/wi-set-timed-effect file=chatLore uid=123 effect=sticky on</code></pre></li>
    </ul>
</div>`,
        args: { file: BOOK, uid: UID, effect: 'название эффекта', '#0': 'новое состояние эффекта' },
    },
    'wi-get-timed-effect': {
        help: `
<div>Возвращает текущее состояние временного эффекта для записи с указанным UID в лорбуке.</div>
<div>${EXAMPLE}
    <ul>
        <li><code>/wi-get-timed-effect file=chatLore format=bool effect=sticky 123</code> — вернёт true или false: активен ли эффект</li>
        <li><code>/wi-get-timed-effect file=chatLore format=number effect=sticky 123</code> — вернёт, сколько эффекту осталось действовать, или 0, если он не активен</li>
    </ul>
</div>`,
        returns: 'состояние эффекта',
        args: { file: BOOK, effect: 'название эффекта', format: 'формат вывода', '#0': UID },
    },

    // ---------- Персоны ----------
    'persona-create': {
        help: `
<div>Создаёт новую персону с указанными полями и возвращает ключ её аватара.</div>
<div><strong>Обязательные аргументы:</strong>
    <ul><li><code>name</code> — отображаемое имя персоны.</li></ul>
</div>
<div><strong>Об аватаре:</strong> аргумент <code>avatar</code> принимает <code>prompt</code> (откроется выбор файла), локальный путь в ST или data URL в base64. Можно передать и результат <code>/imagine</code>. Если не указан, ставится аватар по умолчанию.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/persona-create name="Alice" description="A curious adventurer"</code></pre></li>
        <li><pre><code>/persona-create name="Bob" avatar=prompt lorebook="detective_lore" select=false</code></pre></li>
        <li><pre><code>/imagine portrait of an elf | /persona-create name="Elf" avatar="{{pipe}}"</code></pre></li>
    </ul>
</div>`,
        returns: 'ключ аватара (уникальный идентификатор) созданной персоны',
        args: { ...PERSONA_FIELDS, select: 'выбрать (включить) персону после создания' },
    },
    'persona-update': {
        help: `
<div>Меняет поля существующей персоны. Меняются только переданные поля, остальные остаются как были.</div>
<div>Если аргумент <code>persona</code> не указан, меняется активная персона.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/persona-update description="An updated description"</code></pre> поменяет описание текущей персоны.</li>
        <li><pre><code>/persona-update persona="Alice" name="Alice 2.0" descriptionPosition=atDepth descriptionDepth=3</code></pre> переименует Alice и будет вставлять её описание на глубину 3.</li>
        <li><pre><code>/imagine portrait | /persona-update avatar="{{pipe}}"</code></pre> сгенерирует картинку и поставит её аватаром текущей персоны.</li>
    </ul>
</div>`,
        returns: 'ключ аватара изменённой персоны',
        args: PERSONA_FIELDS,
    },
    'persona-get': {
        help: `
<div>Возвращает данные персоны: все сразу в JSON или значение одного поля.</div>
<div>Если аргумент <code>persona</code> не указан, берётся активная персона.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/persona-get field=description | /echo</code></pre> выведет описание текущей персоны.</li>
        <li><pre><code>/persona-get persona="Alice" field=name</code></pre> вернёт имя персоны Alice.</li>
        <li><pre><code>/persona-get return=object | /json-get key=avatar</code></pre> вернёт все данные текущей персоны объектом и достанет из них ключ аватара.</li>
    </ul>
</div>`,
        returns: 'данные персоны в JSON или значение одного поля',
        args: {
            persona: PERSONA,
            field: 'какое поле вернуть. Если не указано, возвращаются все данные в JSON.',
            return: 'в каком виде вернуть результат',
        },
    },
    'persona-delete': {
        help: `
<div>Удаляет персону вместе с её аватаром.</div>
<div>Если аргумент <code>persona</code> не указан, удаляется активная персона.</div>
<div><strong>⚠️ Внимание:</strong> отменить удаление нельзя, все данные персоны пропадут.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/persona-delete</code></pre> удалит текущую персону (спросит подтверждение).</li>
        <li><pre><code>/persona-delete persona="Bob" silent=true</code></pre> удалит Bob без подтверждения.</li>
    </ul>
</div>`,
        returns: 'true, если персона удалена, иначе false',
        args: { persona: PERSONA, silent: 'не спрашивать подтверждение' },
    },
    'persona-duplicate': {
        help: `
<div>Создаёт копию персоны со всеми данными и аватаром и возвращает ключ аватара копии.</div>
<div>Переименовать копию или поменять её поля можно потом через <code>/persona-update</code>.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/persona-duplicate</code></pre> скопирует активную персону.</li>
        <li><pre><code>/persona-duplicate persona="Alice" select=true</code></pre> скопирует Alice и выберет копию.</li>
        <li><pre><code>/persona-duplicate | /persona-update persona="{{pipe}}" name="Clone"</code></pre> скопирует текущую персону и переименует копию.</li>
    </ul>
</div>`,
        returns: 'ключ аватара (уникальный идентификатор) копии',
        args: { persona: PERSONA, select: 'выбрать (включить) копию после создания' },
    },
    'persona-lock': {
        help: `
<div>Закрепляет текущую персону за чатом или персонажем, делает её персоной по умолчанию или снимает закрепление. Без значения возвращает состояние закрепления.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/persona-lock on</code></pre> закрепит персону за этим чатом.</li>
        <li><pre><code>/persona-lock type=character on</code></pre> закрепит персону за текущим персонажем.</li>
        <li><pre><code>/persona-lock type=default on</code></pre> сделает персону персоной по умолчанию для новых чатов.</li>
        <li><pre><code>/persona-lock</code></pre> вернёт, закреплена ли персона за этим чатом.</li>
    </ul>
</div>`,
        returns: 'текущее состояние закрепления указанного типа',
        args: { type: 'тип закрепления: к чему оно относится', '#0': 'состояние' },
    },
    'persona-set': {
        help: `
<div>Выбирает существующую персону по имени или ключу аватара либо задаёт временное имя пользователя.</div>
<div>Если подходящая персона есть, она выбирается со своим именем и аватаром. Иначе (в режимах all и temp) временно меняется только отображаемое имя.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/persona-set Alice</code></pre> выберет персону «Alice», а если её нет, поставит имя «Alice».</li>
        <li><pre><code>/persona-set mode=lookup Alice</code></pre> выберет «Alice», только если такая персона есть.</li>
    </ul>
</div>`,
        args: { mode: 'режим выбора персоны', '#0': 'имя персоны' },
    },
    'persona-sync': {
        help: `
<div>Обновляет имя и аватар персоны в сообщениях пользователя в текущем чате.</div>
<div>Если задан <code>from</code>, обновляются только сообщения с этим именем персоны. Удобно, если в одном чате использовались разные персоны.</div>
<div>Если <code>quiet=false</code>, перед обновлением спросит подтверждение.</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code>/persona-sync</code></pre> — обновить все сообщения пользователя</li>
        <li><pre><code>/persona-sync 5</code></pre> — обновить только сообщение 5</li>
        <li><pre><code>/persona-sync 0-10</code></pre> — обновить сообщения с 0 по 10</li>
        <li><pre><code>/persona-sync from=OldPersona 0-20</code></pre> — обновить только сообщения с именем «OldPersona» среди 0–20</li>
        <li><pre><code>/persona-sync quiet=false</code></pre> — обновить все с подтверждением</li>
        <li><pre><code>/persona-sync from=TempName quiet=false 5-15</code></pre> — обновить сообщения с именем «TempName» среди 5–15 с подтверждением</li>
    </ul>
</div>`,
        args: {
            from: 'обновлять только сообщения с этим именем персоны',
            quiet: 'не спрашивать подтверждение',
            '#0': 'номер сообщения (с 0) или диапазон; если не указан, обновляются все сообщения пользователя',
        },
    },

    // ---------- Теги ----------
    'tag-add': {
        help: `
<div>Добавляет персонажу тег. Если персонаж не указан, тег добавляется текущему (<code>{{char}}</code>). Если такого тега нет, он создаётся.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/tag-add name="Chloe" scenario</code></pre> добавит персонажу Chloe тег «scenario».</li>
    </ul>
</div>`,
        returns: 'true/false — добавлен ли тег (false, если он уже был)',
        args: { name: TAG_CHAR, '#0': 'название тега' },
    },
    'tag-remove': {
        help: `
<div>Убирает тег у персонажа. Если персонаж не указан, тег убирается у текущего (<code>{{char}}</code>).</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/tag-remove name="Chloe" scenario</code></pre> уберёт у персонажа Chloe тег «scenario».</li>
    </ul>
</div>`,
        returns: 'true/false — убран ли тег (false, если его и не было)',
        args: { name: TAG_CHAR, '#0': 'название тега' },
    },
    'tag-exists': {
        help: `
<div>Проверяет, есть ли у персонажа указанный тег. Если персонаж не указан, проверяется текущий (<code>{{char}}</code>).</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/tag-exists name="Chloe" scenario</code></pre> вернёт true, если у персонажа Chloe есть тег «scenario».</li>
    </ul>
</div>`,
        returns: 'true/false — есть ли у персонажа этот тег',
        args: { name: TAG_CHAR, '#0': 'название тега' },
    },
    'tag-list': {
        help: `
<div>Перечисляет все теги персонажа. Если персонаж не указан, берётся текущий (<code>{{char}}</code>).<br />
Теги с запятыми внутри никак особо не обрабатываются и выводятся как есть.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/tag-list name="Chloe"</code></pre> может вернуть что-то вроде <code>OC, scenario, edited, funny</code></li>
    </ul>
</div>`,
        returns: 'все теги персонажа через запятую',
        args: { name: TAG_CHAR },
    },
    'tag-import': {
        help: `
<div>Превращает теги карточки персонажа в теги SillyTavern, которые используются для папок и фильтров.</div>
<div>У карточки могут быть встроенные теги (задаются аргументом <code>tags</code> в <code>/char-create</code> или <code>/char-update</code>). Команда переносит их в теги ST, по которым можно фильтровать и упорядочивать персонажей.</div>
<div>Если режим не указан, берётся ваша сохранённая настройка импорта тегов.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/tag-import</code></pre> импортирует теги текущего персонажа с настройкой по умолчанию.</li>
        <li><pre><code>/tag-import name="Alice" mode=all</code></pre> импортирует все теги карточки Alice и при необходимости создаст новые теги ST.</li>
    </ul>
</div>`,
        returns: 'true, если что-то импортировано, иначе false',
        args: {
            name: TAG_CHAR,
            mode: 'режим импорта: all — все теги, existing — только уже существующие в ST, none — ничего, ask — показать окно импорта (по умолчанию ваша сохранённая настройка)',
        },
    },

    // ---------- Заметка автора ----------
    note: {
        help: 'Задаёт заметку автора (Author\'s Note) для текущего чата, если передан текст, и возвращает текущую заметку.',
        returns: 'текущая заметка автора',
    },
    'note-depth': {
        help: 'Задаёт глубину вставки заметки автора в чат, если передано число, и возвращает текущую глубину.',
        returns: 'текущая глубина заметки автора',
        args: { '#0': 'число' },
    },
    'note-frequency': {
        help: 'Задаёт частоту вставки заметки автора, если передано число, и возвращает текущую частоту.',
        returns: 'текущая частота вставки заметки автора',
        args: { '#0': 'число' },
    },
    'note-position': {
        help: 'Задаёт позицию заметки автора, если она передана, и возвращает текущую позицию.',
        returns: 'текущая позиция вставки заметки автора',
        args: { '#0': 'позиция' },
    },
    'note-role': {
        help: 'Задаёт роль, с которой заметка автора вставляется в чат, если она передана, и возвращает текущую роль.',
        returns: 'текущая роль вставки заметки автора',
        args: { '#0': 'роль' },
    },

    // ---------- Системный промпт ----------
    sysprompt: {
        help: `
<div>Выбирает системный промпт по имени, находя ближайшее совпадение нечётким поиском. Без имени возвращает текущий системный промпт, если он включён или передано <code>forceGet=true</code>.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/sysprompt </code></pre></li>
    </ul>
</div>`,
        returns: 'название текущего промпта',
        args: {
            quiet: 'не показывать уведомление о смене промпта',
            forceGet: 'вернуть имя, даже если системный промпт выключен',
            '#0': 'название системного промпта',
        },
    },
    'sysprompt-on': { help: 'Включает системный промпт.' },
    'sysprompt-off': { help: 'Выключает системный промпт.' },
    'sysprompt-state': {
        help: 'Возвращает состояние системного промпта. Если передать аргумент, задаёт его.',
        args: { '#0': 'состояние системного промпта' },
    },

    // ---------- Reasoning (рассуждения модели) ----------
    'reasoning-get': {
        help: 'Возвращает содержимое блока рассуждений сообщения. Если блока нет, возвращает пустую строку.',
        returns: 'содержимое блока рассуждений или пустая строка',
        args: { '#0': MES_ID },
    },
    'reasoning-set': {
        help: 'Задаёт блок рассуждений сообщения. Возвращает содержимое блока.',
        returns: 'содержимое блока рассуждений',
        args: {
            at: MES_ID,
            collapse: 'свернуть блок рассуждений (если не указано, берётся настройка разворачивания по умолчанию)',
            '#0': 'содержимое блока рассуждений',
        },
    },
    'reasoning-parse': {
        help: 'Извлекает блок рассуждений из строки по настройкам Reasoning Formatting.',
        returns: 'текст рассуждений',
        args: {
            regex: 'применять ли к рассуждениям скрипты regex',
            return: 'что вернуть: рассуждения или текст без них',
            strict: 'требовать, чтобы блок рассуждений стоял в самом начале строки (не считая пробелов)',
            '#0': 'исходная строка',
        },
    },
    'reasoning-format': {
        help: 'Собирает рассуждения и основной текст в одну строку по настройкам Reasoning Formatting. Удобно, чтобы потом разобрать её через /reasoning-parse.',
        returns: 'собранная строка',
        args: { reasoning: 'текст рассуждений', '#0': 'основной текст' },
    },
    'reasoning-template': {
        help: `
<div>Выбирает шаблон рассуждений по имени, находя ближайшее совпадение нечётким поиском. Без имени возвращает текущий шаблон.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/reasoning-template DeepSeek</code></pre></li>
    </ul>
</div>`,
        returns: 'название шаблона',
        args: { quiet: 'не показывать уведомление о смене шаблона', '#0': 'название шаблона рассуждений' },
    },
    'reasoning-collapse': {
        help: 'Сворачивает блок рассуждений у сообщения или диапазона сообщений.',
        args: { '#0': MES_RANGE },
    },
    'reasoning-expand': {
        help: 'Разворачивает блок рассуждений у сообщения или диапазона сообщений.',
        args: { '#0': MES_RANGE },
    },
    'reasoning-toggle': {
        help: 'Переключает блок рассуждений у сообщения или диапазона сообщений: развёрнутые сворачивает, свёрнутые разворачивает.',
        args: { '#0': MES_RANGE },
    },

    // ---------- Ветки и чекпоинты ----------
    'branch-create': {
        help: `
<div>Создаёт новую ветку чата от выбранного сообщения. Если ID сообщения не указан, берётся последнее.</div>
<div>Название ветки придумывается автоматически.<br />
После создания чат-ветка сразу открывается.</div>
<div>Если переходить в новый чат не нужно, используйте чекпоинты и <code>/checkpoint-create</code>.</div>`,
        returns: 'название новой ветки',
        args: { '#0': 'ID сообщения' },
    },
    'checkpoint-create': {
        help: `
<div>Создаёт новый чекпоинт с указанным названием для выбранного сообщения. Если ID сообщения не указан, берётся последнее.<br />
Чтобы название придумалось автоматически, оставьте его пустым.</div>
<div>Чекпоинт навсегда привязывается к сообщению.<br />
Если у сообщения уже есть чекпоинт, ссылка на него заменяется.<br />
Открыть чат-чекпоинт можно значком чекпоинта, командой <code>/go</code> с его названием или командой <code>/checkpoint-go</code> на этом сообщении.</div>
<div>Если в новый чат нужно сразу перейти, используйте ветки и <code>/branch-create</code>.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/checkpoint-create mes={{lastCharMessage}} Checkpoint for char reply | /setvar key=rememberCheckpoint {{pipe}}</code></pre> создаст чекпоинт у последнего сообщения текущего персонажа и запомнит его в локальной переменной.</li>
    </ul>
</div>`,
        returns: 'название нового чекпоинта',
        args: { mesId: 'ID сообщения', '#0': 'название чекпоинта' },
    },
    'checkpoint-go': {
        help: `
<div>Открывает чекпоинт, привязанный к выбранному сообщению. Если ID сообщения не указан, берётся последнее.</div>
<div>Проверить, есть ли у сообщения чекпоинт, можно через <code>/checkpoint-get</code>.</div>`,
        returns: 'название чекпоинта',
        args: { '#0': 'ID сообщения' },
    },
    'checkpoint-exit': {
        help: 'Выходит из чата-чекпоинта.<br />Если вы не в чекпоинте, возвращает пустую строку.',
        returns: 'название чата, в который произошёл выход, или пустая строка, если вы не в чекпоинте',
    },
    'checkpoint-parent': {
        help: 'Возвращает название родительского чата для этого чекпоинта.<br />Если вы не в чекпоинте, возвращает пустую строку.',
        returns: 'название родительского чата',
    },
    'checkpoint-get': {
        help: 'Возвращает название чекпоинта, привязанного к выбранному сообщению. Если ID сообщения не указан, берётся последнее.<br />Если чекпоинта нет, результат пустой.',
        returns: 'название чата',
        args: { '#0': 'ID сообщения' },
    },
    'checkpoint-list': {
        help: `
<div>Перечисляет все чекпоинты этого чата.</div>
<div>Возвращает список ID сообщений с чекпоинтами, а при <code>links=true</code> — список ссылок на чекпоинты.<br />
Результат — массив JSON.</div>`,
        returns: 'массив JSON со всеми чекпоинтами этого чата',
        args: { links: 'вернуть ссылки (названия чатов) чекпоинтов вместо ID сообщений' },
    },

    // ---------- Фоны ----------
    lockbg: { help: 'Закрепляет фон за текущим чатом.' },
    unlockbg: { help: 'Снимает закрепление фона за текущим чатом.' },
    autobg: { help: 'Автоматически меняет фон по содержанию чата, спрашивая модель.' },
};
