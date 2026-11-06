const API_URL = 'https://jsonplaceholder.typicode.com/postsz';

const loadBtn = document.getElementById('loadBtn');
const postsList = document.getElementById('postsList');
const createForm = document.getElementById('createForm');
const submitBtn = document.getElementById('submitBtn');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const messages = document.getElementById('messages');

let lastSubmitted = null;

function clearMessages() {
    messages.replaceChildren();
}

function showMessage(text, type = 'info') {
    const el = document.createElement('div');
    el.className = `message ${type}`;
    el.textContent = text;
    messages.appendChild(el);
    return el;
}

function clearPosts() {
    postsList.replaceChildren();
}

function renderPosts(posts) {
    clearPosts();
    posts.forEach((post) => {
        const card = document.createElement('article');
        card.className = 'post';

        const title = document.createElement('h3');
        title.textContent = post.title;

        const body = document.createElement('p');
        body.textContent = post.body;

        card.append(title, body);
        postsList.appendChild(card);
    });
}


async function loadPosts() {
    loadBtn.disabled = true;
    clearMessages();
    showMessage('Загрузка публикаций…', 'info');
    let response;

    try {
        response = await fetch(`${API_URL}?_limit=5`);

        if (!response.ok) {
            throw new Error(`Не удалось загрузить публикации (HTTP ${response.status})`);
        }

        const posts = await response.json();
        renderPosts(posts);

        clearMessages();
        showMessage(`Загружено публикаций: ${posts.length}, HTTP: ${response.status}`, 'success');
    } catch (error) {
        clearMessages();
        showMessage(`Ошибка загрузки: ${error.message}`, 'error');
    } finally {
        loadBtn.disabled = false;
    }
}


async function sendPost(data) {
    submitBtn.disabled = true;
    loadBtn.disabled = true;
    clearMessages();
    showMessage('Отправка публикации…', 'info');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Не удалось создать публикацию (HTTP ${response.status})`);
        }

        const created = await response.json();


        clearMessages();
        showMessage(`Публикация создана. ID: ${created.id}, HTTP: ${response.status}`, 'success');
        showMessage(`Заголовок: ${created.title}`, 'success');
        showMessage(`Текст: ${created.body}`, 'success');

        renderPosts([...Array.from(postsList.children).map((card) => ({
            title: card.querySelector('h3').textContent,
            body: card.querySelector('p').textContent,
        })), { title: created.title, body: created.body }]);

        createForm.reset();
        lastSubmitted = null;
    } catch (error) {
        clearMessages();
        showMessage(`Ошибка отправки: ${error.message}`, 'error');

        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.textContent = 'Повторить отправку';
        retryBtn.addEventListener('click', () => {
            retryBtn.disabled = true;
            if (lastSubmitted) sendPost(lastSubmitted);
        });
        messages.appendChild(retryBtn);

        submitBtn.disabled = false;
    } finally {
        submitBtn.disabled = false;
        loadBtn.disabled = false;
    }
}


loadBtn.addEventListener('click', loadPosts);

createForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    clearMessages();

    if (!title || !body) {
        showMessage('Заполните оба поля: заголовок и текст.', 'error');
        return;
    }

    const data = { title, body, userId: 1 };
    lastSubmitted = data;
    sendPost(data);
});