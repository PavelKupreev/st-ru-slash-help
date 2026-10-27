// Партия 4а: остальные команды ядра — интерфейс и темы, пресеты, ключи API,
// индикаторы загрузки, управление расширениями, инструменты (function calling).

const EXAMPLE = '<strong>Пример:</strong>';
const EXAMPLES = '<strong>Примеры:</strong>';

// Берёт из исходной справки первый блок <pre>…</pre>: многострочные примеры
// так переносятся без изменений.
const firstPre = (orig) => orig.match(/<pre>[\s\S]*?<\/pre>/)?.[0] ?? '';

const QUIET = 'не показывать уведомления';
const SECRET_KEY = 'для какого ключа API; если не указан, берутся ключи текущего API';

const TOAST_MODES = `
<div><strong>Режимы уведомления (toast):</strong>
    <ul>
        <li><code>stoppable</code> — уведомление с кнопкой остановки (по умолчанию)</li>
        <li><code>static</code> — уведомление без кнопки остановки</li>
        <li><code>none</code> — без уведомления, только затемнение экрана</li>
    </ul>
</div>
<div><code>blocking=false</code> показывает только уведомление, не блокируя интерфейс. Удобно для фоновых операций вроде описания картинок или генерации.</div>
<div>По умолчанию кнопка остановки вызывает <code>stopGeneration()</code>. Если обёрнутое действие — не генерация, можно передать своё замыкание остановки.</div>`;

const LOADER_ARGS = {
    blocking: 'затемнять ли экран, блокируя интерфейс. false — только уведомление, без блокировки.',
    toast: 'вид уведомления: stoppable (с кнопкой остановки), static (без неё) или none',
    message: 'текст уведомления',
    title: 'необязательный заголовок уведомления',
    slug: 'уникальная метка индикатора (чтобы легко найти его из кода или CSS)',
    stopTooltip: 'подсказка на кнопке остановки (только при toast=stoppable)',
};

const EXT_RELOAD = 'По умолчанию страница сразу перезагружается, и следующие команды не выполняются.<br />Если передать <code>reload=false</code>, страница не перезагрузится и расширение останется в прежнем состоянии до обновления: нужно обновить страницу самому или вызвать <code>/reload-page</code>.';

export const commands = {
    // ---------- Интерфейс и темы ----------
    vn: { help: 'Включает или выключает режим визуальной новеллы.' },
    resetpanels: { help: 'Возвращает панели интерфейса в исходное положение.' },
    movingui: {
        help: 'Включает пресет MovingUI по имени.',
        args: { '#0': 'название' },
    },
    bgcol: {
        help: 'Создаёт новую тему по основному цвету указанной картинки фона. Сохраняет её как «bgcol - имя фона».',
        args: {
            force: 'создать, даже если тема с таким именем уже есть',
            name: 'своё название темы вместо автоматического',
            bg: 'файл картинки фона вместо текущего',
        },
    },
    theme: {
        help: `
<div>Включает тему интерфейса по имени.</div>
<div>Без имени возвращает текущую тему.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/theme Cappuccino</code></pre></li>
        <li><pre><code>/theme</code></pre></li>
    </ul>
</div>`,
        args: { '#0': 'название темы' },
    },
    'css-var': {
        help: `
<div>Задаёт CSS-переменной значение на указанном элементе.<br />
Можно задавать только переменные: их имена начинаются с двух дефисов («--exampleVar»). Обычные свойства CSS так не задаются, для них есть Custom CSS в настройках темы.<br /><br />
<b>После перезагрузки страницы значение пропадёт!</b></div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/css-var varname="--SmartThemeBodyColor" #ff0000</code></pre> сделает текст чата красным</li>
        <li><pre><code>/css-var to=zoomedAvatar varname="--SmartThemeBlurStrength" 0</code></pre> уберёт размытие у увеличенного аватара</li>
    </ul>
</div>`,
        args: {
            varname: 'имя CSS-переменной (начинается с двух дефисов)',
            to: 'элемент, к которому применить переменную',
            '#0': 'значение CSS-переменной',
        },
    },
    'reload-page': { help: 'Перезагружает страницу. Следующие команды не выполняются.' },

    // ---------- Пресеты и генерация ----------
    preset: {
        help: `
<div>Выбирает пресет текущего API по имени. Без имени возвращает текущий пресет.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code>/preset myPreset</code></pre></li>
        <li><pre><code>/preset</code></pre></li>
    </ul>
</div>`,
        returns: 'текущий пресет',
        args: { '#0': 'название' },
    },
    proxy: {
        help: 'Выбирает пресет прокси по имени.',
        returns: 'текущий прокси',
        args: { '#0': 'название' },
    },
    'stop-strings': {
        help: `
<div>Задаёт список своих стоп-строк. Без значения возвращает текущий список. Чтобы задать пустое значение, используйте аргумент <code>force</code>.</div>
<div>${EXAMPLES}</div>
<ul>
    <li>Задать пустое значение: <pre><code class="language-stscript">/stop-strings force="true" {{noop}}</code></pre></li>
    <li>Значение должно быть массивом JSON: <pre><code class="language-stscript">/stop-strings ["goodbye", "farewell"]</code></pre></li>
    <li>Вертикальную черту нужно экранировать обратной косой: <pre><code class="language-stscript">/stop-strings ["left\\|right"]</code></pre></li>
</ul>`,
        args: { force: 'задать значение, даже если оно пустое', '#0': 'список строк' },
    },
    'start-reply-with': {
        help: `
<div>Задаёт поле «Start Reply With» (начало ответа). Без значения возвращает текущее. Чтобы задать пустое значение, используйте аргумент <code>force</code>.</div>
<div>${EXAMPLES}</div>
<ul>
    <li>Задать значение: <pre><code class="language-stscript">/start-reply-with Sure!</code></pre></li>
    <li>Задать пустое значение: <pre><code class="language-stscript">/start-reply-with force="true" {{noop}}</code></pre></li>
</ul>`,
        args: { force: 'задать значение, даже если оно пустое' },
    },

    // ---------- Ключи API ----------
    'secret-id': {
        help: 'Делает активным ключ API с указанным ID. Без значения возвращает ID активного ключа.',
        returns: 'ID ставшего активным ключа',
        args: {
            quiet: QUIET,
            key: SECRET_KEY,
            '#0': 'ID или подпись ключа, который сделать активным. Если не указан, возвращается ID активного.',
        },
    },
    'secret-delete': {
        help: 'Удаляет ключ API по ID.',
        args: {
            quiet: QUIET,
            key: SECRET_KEY,
            '#0': 'ID или подпись удаляемого ключа. Если не указан, удаляется активный.',
        },
    },
    'secret-write': {
        help: 'Записывает ключ API со значением и необязательной подписью.',
        returns: 'ID нового ключа',
        args: {
            quiet: QUIET,
            key: SECRET_KEY,
            label: 'подпись ключа. Если не указана, ставятся текущие дата и время.',
            empty: 'разрешить пустое значение',
            '#0': 'значение ключа',
        },
    },
    'secret-rename': {
        help: 'Меняет подпись ключа API по ID.',
        args: {
            quiet: QUIET,
            key: SECRET_KEY,
            id: 'ID ключа, который переименовать. Если не указан, переименовывается активный.',
            '#0': 'новая подпись ключа',
        },
    },
    'secret-read': {
        help: 'Читает значение ключа API по ID. Если показ ключей выключен, команда не работает!',
        returns: 'значение ключа',
        args: {
            quiet: QUIET,
            key: SECRET_KEY,
            '#0': 'ID или подпись ключа. Если не указан, возвращается значение активного.',
        },
    },

    // ---------- Индикаторы загрузки ----------
    'loader-wrap': {
        help: `
<div>Выполняет замыкание, показывая поверх экрана индикатор загрузки и (по желанию) уведомление. По умолчанию интерфейс заблокирован, пока замыкание не закончится. Индикаторы можно накладывать друг на друга: у каждого своё уведомление, а затемнение одно.</div>
${TOAST_MODES}
<div>${EXAMPLES}
    <ul>
        <li><pre><code class="language-stscript">/loader-wrap message="Generating summary..." {: /gen Summary of the last message | /echo Done :}</code></pre></li>
        <li><pre><code class="language-stscript">/loader-wrap blocking=false message="Captioning..." {: /caption :}</code></pre></li>
        <li><pre><code class="language-stscript">/loader-wrap toast=stoppable onStop={: /echo "Stopped by user" :} {: /delay 10000 :}</code></pre></li>
    </ul>
</div>`,
        returns: 'результат выполнения замыкания',
        args: {
            ...LOADER_ARGS,
            onStop: 'замыкание, которое выполнится при нажатии кнопки остановки. Если не указано, остановка работает как обычно.',
            '#0': 'замыкание, которое выполнять под индикатором',
        },
    },
    'loader-show': {
        help: (orig) => `
<div>Показывает индикатор загрузки вручную. Возвращает ID, по которому его можно скрыть через <code>/loader-hide</code>. Нужен, когда индикатор надо показать и скрыть в определённых местах скрипта. Индикаторы можно накладывать друг на друга: у каждого своё уведомление, а затемнение одно.</div>
${TOAST_MODES}
<div>${EXAMPLE}
${firstPre(orig)}
</div>`,
        returns: 'ID индикатора (для /loader-hide)',
        args: {
            ...LOADER_ARGS,
            onStop: 'замыкание, которое выполнится при нажатии кнопки остановки',
            onHide: 'замыкание, которое выполнится, когда индикатор скроют (а не остановят)',
        },
    },
    'loader-hide': {
        help: `
<div>Скрывает индикатор загрузки, показанный через <code>/loader-show</code>. Если ID не указан, скрывает <strong>все</strong> индикаторы.</div>
<div>${EXAMPLE} <pre><code class="language-stscript">/loader-hide handle={{getvar::myLoader}}</code></pre></div>`,
        returns: 'true, если какой-то индикатор был скрыт, иначе false',
        args: { handle: 'ID индикатора, который вернула /loader-show. Если не указан, скрываются все.' },
    },
    'loader-stop': {
        help: `
<div>Нажимает кнопку остановки у указанного индикатора загрузки, как будто это сделал пользователь. В отличие от <code>/loader-hide</code>, ID обязателен: нужно указать, какой индикатор остановить.</div>
<div>${EXAMPLE} <pre><code class="language-stscript">/loader-stop handle={{getvar::myLoader}}</code></pre></div>`,
        returns: 'true, если какой-то индикатор был остановлен, иначе false',
        args: { handle: 'ID индикатора, который вернула /loader-show' },
    },

    // ---------- Расширения ----------
    'extension-enable': {
        help: `
<div>Включает указанное расширение.</div>
<div>${EXT_RELOAD}</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/extension-enable Summarize</code></pre></li>
    </ul>
</div>`,
        returns: 'внутреннее название расширения',
        args: { reload: 'перезагрузить страницу после включения', '#0': 'название расширения' },
    },
    'extension-disable': {
        help: `
<div>Выключает указанное расширение.</div>
<div>${EXT_RELOAD}</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/extension-disable Summarize</code></pre></li>
    </ul>
</div>`,
        returns: 'внутреннее название расширения',
        args: { reload: 'перезагрузить страницу после выключения', '#0': 'название расширения' },
    },
    'extension-toggle': {
        help: `
<div>Переключает указанное расширение: включённое выключает, выключенное включает.</div>
<div>${EXT_RELOAD}</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/extension-toggle Summarize</code></pre></li>
        <li><pre><code class="language-stscript">/extension-toggle Summarize state=true</code></pre></li>
    </ul>
</div>`,
        returns: 'внутреннее название расширения',
        args: {
            reload: 'перезагрузить страницу после переключения',
            state: 'задать состояние явно (true — включить, false — выключить). Если не указано, состояние меняется на противоположное.',
            '#0': 'название расширения',
        },
    },
    'extension-state': {
        help: `
<div>Возвращает состояние указанного расширения (true — включено, false — выключено).</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/extension-state Summarize</code></pre></li>
    </ul>
</div>`,
        returns: 'включено ли расширение',
        args: { '#0': 'название расширения' },
    },
    'extension-exists': {
        help: `
<div>Проверяет, установлено ли указанное расширение.</div>
<div>${EXAMPLE}
    <ul>
        <li><pre><code class="language-stscript">/extension-exists SillyTavern-LALib</code></pre></li>
    </ul>
</div>`,
        returns: 'есть ли такое расширение',
        args: { '#0': 'название расширения' },
    },

    // ---------- Инструменты (function calling) ----------
    'tools-list': {
        help: 'Возвращает список всех зарегистрированных инструментов в формате функций OpenAI (JSON). Аргумент <code>return</code> задаёт вид результата.',
        returns: 'список всех зарегистрированных инструментов',
    },
    'tools-invoke': {
        help: 'Вызывает зарегистрированный инструмент по имени. Аргумент <code>parameters</code> ОБЯЗАТЕЛЬНО должен быть объектом JSON.',
        args: { parameters: 'параметры для инструмента', '#0': 'имя вызываемого инструмента' },
    },
    'tools-register': {
        help: (orig) => `
<div>Регистрирует новый инструмент.</div>
<ul>
    <li>Аргумент <code>parameters</code> ОБЯЗАТЕЛЬНО должен быть объектом JSON с правильной JSON-схемой.</li>
    <li>Безымянный аргумент ОБЯЗАТЕЛЬНО должен быть замыканием, которое получает параметры функции как локальные переменные скрипта.</li>
</ul>
<div>Подробнее: <a target="_blank" href="https://json-schema.org/learn/">json-schema.org</a> и <a target="_blank" href="https://platform.openai.com/docs/guides/function-calling">OpenAI Function Calling</a>.</div>
<div>Пример:</div>
${firstPre(orig)}`,
        args: {
            name: 'имя инструмента',
            description: 'описание того, что делает инструмент',
            parameters: 'параметры инструмента',
            displayName: 'отображаемое имя инструмента',
            formatMessage: 'замыкание, которое оформляет сообщение о вызове инструмента. Должно вернуть строку.',
            shouldRegister: 'замыкание, которое решает, регистрировать ли инструмент. Должно вернуть true или false.',
            stealth: 'если true, результат вызова не показывается в чате и ответная генерация не запускается',
            '#0': 'замыкание, которое выполняется при вызове инструмента',
        },
    },
    'tools-unregister': {
        help: 'Убирает инструмент из списка зарегистрированных.',
        args: { '#0': 'имя инструмента' },
    },

    // ---------- Прочее ----------
    'yt-script': {
        help: 'Скачивает субтитры (расшифровку) видео YouTube по ID или ссылке.',
        args: {
            lang: 'код языка субтитров по ISO 639-1, например «en»',
            '#0': 'ссылка или ID видео YouTube',
        },
    },
};
