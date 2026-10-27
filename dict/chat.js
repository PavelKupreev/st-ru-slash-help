// Партия 2: чаты, персонажи, группы, оформление, работа с текстом.
// Формат записей тот же, что в commands.js.

const EXAMPLE = '<strong>Пример:</strong>';
const EXAMPLES = '<strong>Примеры:</strong>';

const CHAR = 'имя персонажа или ключ аватара. Если не указано, берётся текущий персонаж.';

const AT_MESSAGE = 'номер изменяемого сообщения (как ID сообщения). Если не указан, берётся последнее сообщение.\nМожно указывать отрицательные значения, они работают как глубина: например, -1 изменит сообщение прямо перед последним. Значение не может быть нулём.';

// Поля карточки, общие для /char-create и /char-update.
const CHAR_FIELDS = {
    name: 'имя персонажа',
    description: 'описание персонажа (его внешность, характер и т. п.)',
    firstMessage: 'первое сообщение (приветствие) персонажа',
    personality: 'краткое описание характера',
    scenario: 'сценарий или обстоятельства разговора',
    messageExamples: 'примеры сообщений персонажа',
    creatorNotes: 'заметки автора карточки',
    systemPrompt: 'системный промпт персонажа',
    postHistoryInstructions: 'инструкции после истории (jailbreak)',
    creator: 'автор карточки',
    characterVersion: 'версия карточки',
    tags: 'теги карточки через запятую (хранятся в самой карточке, это не теги-папки и фильтры ST). Для тегов ST есть /tag-add, а /tag-import превращает теги карточки в теги ST.',
    favorite: 'отметить персонажа как избранного',
    avatar: 'картинка аватара. prompt открывает выбор файла; можно указать локальный путь в ST (например, characters/Name.png, backgrounds/image.png) или результат команды /imagine. Внешние ссылки не поддерживаются.',
    avatarPromptResize: 'показывать окно обрезки аватара при загрузке (по умолчанию true). Не действует, если в настройках включено «Never resize avatars».',
    talkativeness: 'как часто персонаж говорит в групповых чатах (от 0.0 до 1.0)',
    world: 'название лорбука, который привязать к персонажу',
    depthPrompt: 'текст промпта на глубине, своего для персонажа',
    depthPromptDepth: 'глубина этого промпта',
    depthPromptRole: 'роль этого промпта',
};

const AVATAR_NOTE = `<div><strong>Об аватаре:</strong> аргумент <code>avatar</code> принимает <code>prompt</code> (откроется выбор файла) или локальный путь в ST. Подходят пути вида <code>characters/Name.png</code>, <code>backgrounds/image.png</code>, <code>User Avatars/avatar.png</code>, <code>assets/category/file.png</code>. Можно передать и результат команды /imagine. Внешние ссылки не поддерживаются.</div>`;

export const commands = {
    // ---------- Чаты ----------
    delchat: { help: 'Удаляет текущий чат.' },
    renamechat: {
        help: 'Переименовывает текущий чат.',
        args: { '#0': 'новое название чата' },
    },
    getchatname: {
        help: 'Возвращает в конвейер имя файла текущего чата.',
        returns: 'имя файла чата',
    },
    tempchat: { help: 'Открывает временный чат с Ассистентом.' },
    'chat-manager': { help: 'Открывает менеджер чатов текущего персонажа или группы.' },
    'chat-render': {
        help: 'Выводит в окно чата указанное число сообщений. Без аргумента выводит все.',
        args: { scroll: 'прокрутить к началу после вывода', '#0': 'число сообщений' },
    },
    'chat-reload': { help: 'Перезагружает текущий чат.' },
    'chat-jump': {
        help: `
<div>Прокручивает чат к сообщению с указанным номером. Номера начинаются с 0.</div>
<div>${EXAMPLE} <pre><code>/chat-jump 10</code></pre> прокрутит к 11-му сообщению (id=10).</div>`,
        args: { '#0': 'номер сообщения (с 0), к которому прокрутить' },
    },
    forcesave: { help: 'Принудительно сохраняет текущий чат и настройки.' },
    stop: {
        help: `
<div>Останавливает генерацию и потоковый вывод, если они идут.</div>
<div>Из поля ввода чата эту команду не выполнить: во время генерации оттуда ничего не отправляется. Но её можно вызывать из автоматизаций и скриптов или кнопок Quick Reply.</div>`,
        returns: 'true/false — шла ли генерация и была ли она остановлена',
    },

    // ---------- Сообщения ----------
    'message-role': {
        help: `
<div>Меняет роль отправителя сообщения на указанную. Без роли просто возвращает текущую роль отправителя. Без номера берётся последнее сообщение.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/message-role | /echo</code></pre> выведет роль отправителя последнего сообщения.</li>
        <li><pre><code>/message-role at=-2 assistant</code></pre> сделает третье снизу сообщение сообщением ассистента.</li>
    </ul>
</div>`,
        returns: 'роль отправителя сообщения',
        args: { at: AT_MESSAGE, '#0': 'роль отправителя (user, assistant, system)' },
    },
    'message-name': {
        help: `
<div>Меняет имя отправителя сообщения на указанное. Без имени просто возвращает текущее имя отправителя. Без номера берётся последнее сообщение.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/message-name | /echo</code></pre> выведет имя отправителя последнего сообщения.</li>
        <li><pre><code>/message-name at=-2 "Chloe"</code></pre> сделает отправителем третьего снизу сообщения «Chloe».</li>
    </ul>
</div>`,
        returns: 'имя отправителя сообщения',
        args: { at: AT_MESSAGE, '#0': 'имя персоны, имя персонажа или ключ аватара' },
    },
    sysname: {
        help: 'Задаёт имя для следующих сообщений системного рассказчика в этом чате (только для отображения). По умолчанию System. Пустое значение возвращает имя по умолчанию.',
        args: { '#0': 'имя' },
    },
    sysgen: {
        help: 'Генерирует системное сообщение по указанному промпту.',
        args: {
            trim: 'обрезать вывод по границе последнего предложения',
            compact: 'компактный вид сообщения',
            at: 'куда вставить сообщение (номер сообщения в чате, с 0). Если не указано, сообщение добавляется в конец чата.\nМожно указывать отрицательные значения (в том числе -0), они работают как глубина: например, -1 вставит сообщение прямо перед последним.',
            name: 'своё отображаемое имя для этого сообщения рассказчика',
        },
    },
    delname: {
        help: `
<div>Удаляет все сообщения от указанного имени.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/delname John</code></pre></li>
    </ul>
</div>`,
    },
    'reroll-pick': {
        help: `
<div>Перебрасывает все выборы макроса <code>{{pick}}</code> в текущем чате.</div>
<div>Обычно <code>{{pick}}</code> выбирает один и тот же вариант в пределах чата. Команда меняет зерно случайности для всех выборов, и они (возможно) дадут другие значения.</div>
<div>Если указано число, зерно становится равным ему. Иначе текущее зерно увеличивается на 1.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/reroll-pick</code></pre> увеличит зерно на 1.</li>
        <li><pre><code>/reroll-pick 5</code></pre> сделает зерно равным 5.</li>
    </ul>
</div>`,
        returns: 'новое значение зерна',
        args: { '#0': 'необязательное значение зерна. Если не указано, текущее увеличивается на 1.' },
    },

    // ---------- Персонажи ----------
    'char-find': {
        help: `
<div>Ищет персонажа и возвращает его ключ аватара.</div>
<div>Помогает выбрать нужного персонажа для <code>/sendas</code> и других команд, которым нужно имя, если у вас несколько персонажей с одинаковым именем.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/char-find name="Chloe"</code></pre> вернёт ключ аватара персонажа «Chloe».</li>
        <li><pre><code>/search name="Chloe" tag="friend"</code></pre> вернёт ключ аватара той «Chloe», у которой есть тег «friend». Удобно, если персонажей с именем «Chloe» несколько, а у остальных теги «foe», «goddess» и т. п.</li>
    </ul>
</div>`,
        returns: 'ключ аватара (уникальный идентификатор) персонажа',
        args: {
            tag: 'один или несколько тегов, чтобы найти нужного персонажа среди тёзок',
            preferCurrent: 'если подходят несколько, предпочесть текущего персонажа или персонажей группы',
            quiet: 'не предупреждать, если найдено несколько персонажей',
            name: 'имя персонажа',
        },
    },
    'char-create': {
        help: `
<div>Создаёт нового персонажа с указанными полями и возвращает ключ его аватара.</div>
<div><strong>Обязательные аргументы:</strong>
    <ul><li><code>name</code> — имя персонажа</li></ul>
</div>
<div><strong>О тегах:</strong> аргумент <code>tags</code> задаёт теги карточки (хранятся в файле персонажа), а не теги-папки и фильтры SillyTavern. Чтобы добавить теги ST после создания, используйте <code>/tag-add</code>. Чтобы превратить теги карточки в теги ST, используйте <code>/tag-import</code>.</div>
${AVATAR_NOTE}
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/char-create name="Alice" description="A friendly AI assistant" firstMessage="Hello! How can I help you today?"</code></pre></li>
        <li><pre><code>/char-create name="Bob" description="A wise wizard" firstMessage="Greetings, traveler." personality="Wise, patient" scenario="A magical library" favorite=true</code></pre></li>
        <li><pre><code>/char-create name="Clone" description="A clone" firstMessage="Hi!" avatar=prompt</code></pre> <span>(откроет выбор файла для аватара)</span></li>
    </ul>
</div>`,
        returns: 'ключ аватара (уникальный идентификатор) созданного персонажа',
        args: { ...CHAR_FIELDS, select: 'выбрать (открыть) персонажа после создания (по умолчанию true)' },
    },
    'char-update': {
        help: `
<div>Меняет поля существующего персонажа. Персонаж не обязательно должен быть выбран.</div>
<div>Если аргумент <code>char</code> не указан, меняется текущий персонаж.</div>
<div><strong>О тегах:</strong> аргумент <code>tags</code> задаёт теги карточки (хранятся в PNG), а не теги-папки и фильтры SillyTavern. Для тегов ST используйте <code>/tag-add</code>, а чтобы превратить теги карточки в теги ST — <code>/tag-import</code>.</div>
${AVATAR_NOTE}
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/char-update description="An updated description for this character"</code></pre> поменяет описание текущего персонажа.</li>
        <li><pre><code>/char-update char="Alice" personality="Cheerful and energetic" favorite=true</code></pre> поменяет характер Alice и добавит её в избранное.</li>
        <li><pre><code>/imagine you | /char-update avatar="{{pipe}}"</code></pre> сгенерирует картинку и поставит её аватаром текущего персонажа.</li>
    </ul>
</div>`,
        returns: 'ключ аватара изменённого персонажа',
        args: { ...CHAR_FIELDS, char: CHAR },
    },
    'char-duplicate': {
        help: `
<div>Создаёт копию персонажа и возвращает ключ аватара копии.</div>
<div>Поля копии потом можно поменять через <code>/char-update</code>.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/char-duplicate</code></pre> скопирует текущего персонажа.</li>
        <li><pre><code>/char-duplicate char="Alice" select=true</code></pre> скопирует Alice и выберет копию.</li>
        <li><pre><code>/char-duplicate | /setvar key=newChar | /char-update char="{{getvar::newChar}}" name="Clone"</code></pre> скопирует текущего персонажа и переименует копию.</li>
    </ul>
</div>`,
        returns: 'ключ аватара (уникальный идентификатор) копии',
        args: {
            char: 'имя или ключ аватара персонажа, которого копировать. Если не указано, берётся текущий.',
            select: 'выбрать (открыть) копию после создания (по умолчанию false)',
        },
    },
    'char-get': {
        help: `
<div>Возвращает данные персонажа: все сразу или одно поле.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/char-get field=description | /echo</code></pre> выведет описание текущего персонажа.</li>
        <li><pre><code>/char-get char="Alice" field=personality</code></pre> вернёт поле «характер» Alice.</li>
        <li><pre><code>/char-get char="Bob" return=object</code></pre> вернёт все данные Bob объектом.</li>
    </ul>
</div>`,
        returns: 'данные персонажа в JSON или значение одного поля',
        args: {
            char: CHAR,
            field: 'какое поле вернуть. Если не указано, возвращаются все данные.',
            return: 'в каком виде вернуть результат',
        },
    },
    'char-delete': {
        help: `
<div>Удаляет персонажа.</div>
<div>Если аргумент <code>char</code> не указан, удаляется текущий персонаж.</div>
<div><strong>Внимание:</strong> отменить удаление нельзя!</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/char-delete</code></pre> удалит текущего персонажа (спросит подтверждение).</li>
        <li><pre><code>/char-delete char="Bob" deleteChats=true silent=true</code></pre> удалит Bob и все чаты с ним без подтверждения.</li>
    </ul>
</div>`,
        returns: 'true, если персонаж удалён, иначе false',
        args: { char: CHAR, deleteChats: 'удалить заодно все чаты с этим персонажем', silent: 'не спрашивать подтверждение' },
    },
    'rename-char': {
        help: 'Переименовывает текущего персонажа.',
        returns: 'true/false — удалось ли переименовать',
        args: {
            silent: 'не показывать блокирующих окон (если false, имя можно не указывать: его спросят в окне)',
            chats: 'переименовать персонажа и во всех прошлых чатах',
            '#0': 'новое имя персонажа',
        },
    },

    // ---------- Группы ----------
    'member-get': {
        help: 'Возвращает имя, номер, id или аватар участника группы.',
        args: { field: 'что вернуть: имя, номер, id или аватар', '#0': 'номер участника (с 0), имя или аватар' },
    },
    'member-disable': {
        help: 'Отключает участника группы: он перестаёт выбираться для ответов.',
        args: { '#0': 'номер участника (с 0) или имя' },
    },
    'member-enable': {
        help: 'Включает участника группы: он снова может выбираться для ответов.',
        args: { '#0': 'номер участника (с 0) или имя' },
    },
    'member-add': {
        help: `
<div>Добавляет нового участника в групповой чат.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/member-add John Doe</code></pre></li>
    </ul>
</div>`,
    },
    'member-remove': {
        help: `
<div>Убирает участника из группового чата.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/member-remove 2</code></pre> <pre><code>/member-remove John Doe</code></pre></li>
    </ul>
</div>`,
        args: { '#0': 'номер участника (с 0) или имя' },
    },
    'member-up': {
        help: 'Поднимает участника выше в списке группы.',
        args: { '#0': 'номер участника (с 0) или имя' },
    },
    'member-down': {
        help: 'Опускает участника ниже в списке группы.',
        args: { '#0': 'номер участника (с 0) или имя' },
    },
    'member-peek': {
        help: `
<div>Показывает карточку участника группы, не переключая чат.</div>
<div>${EXAMPLES}
    <ul>
        <li><pre><code>/peek Gloria</code></pre> покажет карточку персонажа «Gloria».</li>
    </ul>
</div>`,
        args: { '#0': 'номер участника (с 0) или имя' },
    },
    'member-count': { help: 'Возвращает число участников в групповом чате.' },

    // ---------- Подключение, шаблоны, промпт ----------
    'api-url': {
        help: `
<div>Задаёт адрес API (сервера, эндпоинта) для текущего API вместе с портом. Без аргумента возвращает текущий адрес.</div>
<div>Если адрес <b>задаётся</b> для API, указанного вручную, поставьте <code>connect=false</code>: автоподключение работает только для текущего API. Или сначала переключитесь на него через <code>/api</code>.</div>
<div>Команда работает с большинством источников Text Completion, с KoboldAI Classic, а среди источников Chat Completion — с Custom (совместимым с OpenAI), Z.AI, SiliconFlow, MiniMax, Pollinations и Google Vertex AI. Список поддерживаемых API виден в автодополнении аргумента <code>api</code>.</div>`,
        returns: 'текущий адрес API',
        args: {
            api: 'для какого API задать или получить адрес; если не указан, берётся текущий',
            connect: 'подключиться к API после смены адреса',
            quiet: 'не показывать уведомление о смене API',
            '#0': 'адрес API для подключения',
        },
    },
    instruct: {
        help: `
<div>Выбирает шаблон instruct-режима по имени и включает instruct-режим, если он выключен. Без имени возвращает текущий шаблон, если instruct-режим включён или передано <code>forceGet=true</code>.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/instruct creative</code></pre></li>
    </ul>
</div>`,
        returns: 'текущий шаблон',
        args: {
            quiet: 'не показывать уведомление о смене шаблона',
            forceGet: 'вернуть имя, даже если instruct-режим выключен',
            '#0': 'название шаблона instruct',
        },
    },
    'instruct-on': { help: 'Включает instruct-режим.' },
    'instruct-off': { help: 'Выключает instruct-режим.' },
    'instruct-state': {
        help: 'Возвращает состояние instruct-режима. Если передать аргумент, задаёт его.',
        args: { '#0': 'состояние instruct-режима' },
    },
    context: {
        help: 'Выбирает шаблон контекста по имени. Без имени возвращает текущий шаблон.',
        returns: 'название шаблона',
        args: { quiet: 'не показывать уведомление о смене шаблона', '#0': 'название шаблона контекста' },
    },
    tokenizer: {
        help: (orig) => {
            const list = orig.match(/<pre><code>[\s\S]*?<\/code><\/pre>/)?.[0] ?? '';
            return `
<div>Выбирает токенизатор по имени. Без имени возвращает текущий.</div>
<div><strong>Доступные токенизаторы:</strong>${list}</div>`;
        },
        returns: 'текущий токенизатор',
        args: { '#0': 'название токенизатора' },
    },
    getpromptentry: {
        help: `
<div>Возвращает состояние указанных записей промпта (в менеджере промптов).</div>
<div>Если <code>return</code> равен <code>simple</code> (по умолчанию), то для одной записи вернётся одно значение, а для нескольких — словарь (если использован identifier) или список.</div>`,
        returns: 'true/false — включены ли записи',
        args: {
            identifier: 'идентификатор(ы) записей промпта',
            name: 'название(я) записей промпта',
            return: 'вид результата: simple, list или dict',
        },
    },
    setpromptentry: {
        help: 'Включает или выключает указанные записи менеджера промптов.',
        args: {
            identifier: 'идентификатор(ы) записей промпта',
            name: 'название(я) записей промпта',
            '#0': 'включить или выключить записи',
        },
    },
    'pm-render': {
        help: 'Перерисовывает менеджер промптов. Нужна, если вы поменяли записи промпта слэш-командами и хотите увидеть это в интерфейсе.',
        args: { refresh: 'перед отрисовкой сделать пробный прогон генерации, чтобы обновить счётчики токенов' },
    },
    'prompt-post-processing': {
        help: `
<div>Задаёт тип постобработки промпта («Prompt Post-Processing»). Без значения возвращает текущий.</div>
<div>${EXAMPLES}</div>
<ul>
    <li><pre><code class="language-stscript">/prompt-post-processing | /echo</code></pre></li>
    <li><pre><code class="language-stscript">/prompt-post-processing single</code></pre></li>
</ul>`,
    },

    // ---------- Интерфейс ----------
    panels: { help: 'Показывает или скрывает панели интерфейса.' },
    single: { help: 'Переключает стиль сообщений на режим одного документа, без имён и аватаров.' },
    bubble: { help: 'Переключает стиль сообщений на «пузыри».' },
    flat: { help: 'Переключает стиль сообщений на плоский чат.' },
    'pick-icon': {
        help: `
<div>Открывает окно со всеми иконками Font Awesome и возвращает название выбранной.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/pick-icon |\n/if left={{pipe}} rule=eq right=false\n\telse={: /echo chosen icon: "{{pipe}}" :}\n\t{: /echo cancelled icon selection :}\n|</code></pre></li>
    </ul>
</div>`,
        returns: 'название выбранной иконки или false при отмене',
    },
    'is-mobile': {
        help: 'Возвращает true, если устройство мобильное, иначе false. То же, что макрос <code>{{isMobile}}</code>.',
        returns: 'true на мобильном устройстве, иначе false',
    },
    beep: {
        help: 'Проигрывает звук получения сообщения.',
        returns: 'пустая строка',
    },
    'clipboard-get': {
        help: 'Возвращает текст из буфера обмена. Работает только в защищённом контексте (HTTPS или localhost). Браузер может спросить разрешение.',
        returns: 'текст из буфера обмена',
    },
    'clipboard-set': {
        help: 'Копирует текст в буфер обмена. Возвращает пустую строку.',
        args: { '#0': 'текст для копирования' },
    },

    // ---------- Текст ----------
    fuzzy: {
        help: `
<div>Нечётко сравнивает каждый элемент списка <code>list</code> с искомым текстом. Если какой-то элемент подходит, возвращается он. Если не подходит ни один, ничего не возвращается.</div>
<div>Необязательный <code>threshold</code> (по умолчанию 0.4) задаёт строгость. Маленькое значение (минимум 0.0) — очень строгое сравнение. При 1.0 (максимум) подходит что угодно.</div>
<div>Необязательный <code>mode</code> задаёт, что делать, если подходят несколько элементов:
    <ul>
        <li><code>first</code> (по умолчанию) — первый подходящий.</li>
        <li><code>best</code> — самый подходящий.</li>
    </ul>
</div>
<div>Результат передаётся следующей команде по конвейеру.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/fuzzy list=["a","b","c"] threshold=0.4 abc</code></pre></li>
    </ul>
</div>`,
        returns: 'подходящий элемент',
        args: {
            list: 'список элементов для сравнения',
            threshold: 'порог нечёткого сравнения (от 0.0 до 1.0)',
            mode: 'режим сравнения',
            '#0': 'искомый текст',
        },
    },
    delay: {
        help: `
<div>Задерживает следующую команду конвейера на указанное число миллисекунд.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/delay 1000</code></pre></li>
    </ul>
</div>`,
        args: { '#0': 'миллисекунды' },
    },
    tokens: {
        help: 'Считает число токенов в тексте.',
        returns: 'число токенов',
    },
    trimtokens: {
        help: `
<div>Обрезает начало или конец текста до указанного числа токенов.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/trimtokens limit=5 direction=start This is a long sentence with many words</code></pre></li>
    </ul>
</div>`,
        returns: 'обрезанный текст',
        args: { limit: 'сколько токенов оставить', direction: 'с какой стороны обрезать' },
    },
    trimstart: {
        help: `
<div>Обрезает текст до начала первого полного предложения.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/trimstart This is a sentence. And here is another sentence.</code></pre></li>
    </ul>
</div>`,
        returns: 'обрезанный текст',
    },
    trimend: {
        help: 'Обрезает текст до конца последнего полного предложения.',
        returns: 'обрезанный текст',
    },
    upper: {
        help: 'Переводит строку в верхний регистр.',
        returns: 'строка в верхнем регистре',
        args: { '#0': 'текст' },
    },
    lower: {
        help: 'Переводит строку в нижний регистр.',
        returns: 'строка в нижнем регистре',
        args: { '#0': 'текст' },
    },
    substr: {
        help: `
<div>Вырезает часть строки.</div>
<div>Если <code>start</code> не указан, он равен 0.<br />
Если <code>start</code> < 0, позиция отсчитывается от конца строки.<br />
Если <code>start</code> >= длины строки, возвращается пустая строка.<br />
Если <code>end</code> не указан или <code>end</code> >= длины строки, берётся всё до конца строки.<br />
Если <code>end</code> < 0, позиция отсчитывается от конца строки.<br />
Если после пересчёта отрицательных значений <code>end</code> <= <code>start</code>, возвращается пустая строка.</div>
<div>${EXAMPLE}
    <pre>/let x The morning is upon us. || </pre>
    <pre>/substr start=-3 {{var::x}} | /echo |/# us. ||</pre>
    <pre>/substr start=-3 end=-1 {{var::x}} | /echo |/# us ||</pre>
    <pre>/substr end=-1 {{var::x}} | /echo |/# The morning is upon us ||</pre>
    <pre>/substr start=4 end=-1 {{var::x}} | /echo |/# morning is upon us ||</pre>
</div>`,
        returns: 'подстрока',
        args: { start: 'начальная позиция', end: 'конечная позиция', '#0': 'текст' },
    },
    replace: {
        help: `
<div>Заменяет в строке текст по образцу.</div>
<div>Если <code>mode</code> равен <code>literal</code> (или не указан), <code>pattern</code> — обычная строка поиска (с учётом регистра).<br />
Если <code>mode</code> равен <code>regex</code>, <code>pattern</code> разбирается как регулярное выражение JavaScript.<br />
Найденное по <code>pattern</code> заменяется на <code>replacer</code>.<br />
Если <code>replacer</code> не указан, найденное заменяется пустой строкой.</div>
<div>${EXAMPLE}
    <pre><code class="language-stscript">/let x Blue house and blue car || </code></pre>
    <pre><code class="language-stscript">/replace pattern="blue" {{var::x}} | /echo |/# Blue house and car ||</code></pre>
    <pre><code class="language-stscript">/replace pattern="blue" replacer="red" {{var::x}} | /echo |/# Blue house and red car ||</code></pre>
    <pre><code class="language-stscript">/replace mode=regex pattern="/blue/i" replacer="red" {{var::x}} | /echo |/# red house and blue car ||</code></pre>
    <pre><code class="language-stscript">/replace mode=regex pattern="/blue/gi" replacer="red" {{var::x}} | /echo |/# red house and red car ||</code></pre>
</div>`,
        returns: 'текст после замены',
        args: {
            mode: 'режим поиска: обычная строка или регулярное выражение',
            pattern: 'что искать',
            replacer: 'на что заменить найденное',
            '#0': 'текст',
        },
    },
    test: {
        help: `
<div>Проверяет, есть ли в тексте совпадение с регулярным выражением.</div>
<div>Возвращает <code>true</code>, если совпадение найдено, иначе <code>false</code>.</div>
<div>${EXAMPLE}
    <pre><code class="language-stscript">/let x Blue house and green car ||</code></pre>
    <pre><code class="language-stscript">/test pattern="green" {{var::x}} | /echo |/# true ||</code></pre>
    <pre><code class="language-stscript">/test pattern="blue" {{var::x}} | /echo |/# false ||</code></pre>
    <pre><code class="language-stscript">/test pattern="/blue/i" {{var::x}} | /echo |/# true ||</code></pre>
</div>`,
        args: { pattern: 'что искать', '#0': 'проверяемый текст' },
    },
    match: {
        help: `
<div>Возвращает совпадения регулярного выражения в тексте.</div>
<div>Возвращает массив групп (первая группа — совпадение целиком). Если у выражения есть флаг <code>/g</code>, возвращается массив таких массивов, по одному на каждое совпадение. Если совпадений нет, для выражения с <code>/g</code> вернётся <code>[]</code>, а без него — пустая строка.</div>
<div>${EXAMPLE}
    <pre><code class="language-stscript">/let x color_green green lamp color_blue ||</code></pre>
    <pre><code class="language-stscript">/match pattern="green" {{var::x}} | /echo |/# [ "green" ] ||</code></pre>
    <pre><code class="language-stscript">/match pattern="color_(\\w+)" {{var::x}} | /echo |/# [ "color_green", "green" ] ||</code></pre>
    <pre><code class="language-stscript">/match pattern="/color_(\\w+)/g" {{var::x}} | /echo |/# [ [ "color_green", "green" ], [ "color_blue", "blue" ] ] ||</code></pre>
    <pre><code class="language-stscript">/match pattern="orange" {{var::x}} | /echo |/# ||</code></pre>
    <pre><code class="language-stscript">/match pattern="/orange/g" {{var::x}} | /echo |/# [] ||</code></pre>
</div>`,
        returns: 'массив групп для каждого совпадения',
        args: { pattern: 'что искать', '#0': 'текст для поиска' },
    },
    'array-wrap': {
        help: 'Оборачивает безымянный аргумент в массив, если это ещё не массив. Пустая строка превращается в пустой массив.',
        returns: 'значение аргумента, обёрнутое в массив',
        args: { stringify: 'считать ли простые значения JSON (числа, логические, null) строками: ["null"] при stringify=true и [null] при stringify=false' },
    },
    'array-unwrap': {
        help: 'Достаёт первый элемент массива из безымянного аргумента. Если это не массив, возвращает значение как есть. Пустой массив даёт пустую строку.',
        returns: 'значение, извлечённое из массива',
    },

    // ---------- Синтаксис скриптов ----------
    'parser-flag': {
        help: 'Задаёт флаг разбора скрипта.',
        args: { '#0': 'какой флаг поменять', '#1': 'какое состояние флагу задать' },
    },
    '/': {
        help: 'Комментарий в скрипте.',
        args: { '#0': 'текст комментария' },
    },
    breakpoint: { help: 'Ставит точку останова для отладки в редакторе Quick Reply.' },
    break: {
        help: 'Выходит из цикла или из замыкания, запущенного через /run или /:',
        args: { '#0': 'значение, которое передать по конвейеру вместо текущего' },
    },
};
