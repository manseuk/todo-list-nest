const todoList = document.getElementById('todos');
const refreshButton = document.getElementById('refresh');
const listMessage = document.getElementById('list-message');
const todoForm = document.getElementById('todo-form');
const formMessage = document.getElementById('form-message');
const submitButton = todoForm.querySelector('button[type="submit"]');

const jsonHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' };

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const setMessage = (element, text, type = 'error') => {
  if (!element) {
    return;
  }

  if (!text) {
    element.hidden = true;
    element.textContent = '';
    element.classList.remove('success');
    return;
  }

  element.hidden = false;
  element.textContent = text;
  if (type === 'success') {
    element.classList.add('success');
  } else {
    element.classList.remove('success');
  }
};

const renderTodos = (items) => {
  todoList.replaceChildren();

  if (!items?.length) {
    const empty = document.createElement('li');
    empty.className = 'todo-item';
    empty.textContent = 'No todos yet. Add one above!';
    todoList.appendChild(empty);
    return;
  }

  items.forEach((todo) => {
    const item = document.createElement('li');
    item.className = 'todo-item';

    const header = document.createElement('div');
    header.className = 'todo-item-header';

    const title = document.createElement('h3');
    title.className = 'todo-title';
    title.textContent = todo.title;

    const status = document.createElement('span');
    status.className = 'todo-status';
    status.dataset.status = todo.status;
    status.textContent = todo.status;

    header.append(title, status);
    item.appendChild(header);

    if (todo.description) {
      const description = document.createElement('p');
      description.className = 'todo-description';
      description.textContent = todo.description;
      item.appendChild(description);
    }

    const meta = document.createElement('p');
    meta.className = 'todo-meta';
    meta.textContent = `Added ${formatDate(todo.createdAt)}`;
    item.appendChild(meta);

    todoList.appendChild(item);
  });
};

const fetchTodos = async () => {
  setMessage(listMessage, 'Loading todos…', 'success');
  try {
    const response = await fetch('/todos');
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const todos = await response.json();
    renderTodos(todos);
    setMessage(listMessage, `Showing ${todos.length} todo${todos.length === 1 ? '' : 's'}.`, 'success');
  } catch (error) {
    console.error(error);
    setMessage(listMessage, 'Unable to load todos. Please try again.');
  }
};

refreshButton?.addEventListener('click', () => {
  fetchTodos();
});

if (todoForm) {
  todoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(todoForm);
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const status = String(formData.get('status') ?? 'New');

    if (!title) {
      setMessage(formMessage, 'Title is required.');
      return;
    }

    submitButton.disabled = true;
    setMessage(formMessage, 'Creating todo…', 'success');

    const payload = { title, status };
    if (description) {
      payload.description = description;
    }

    try {
      const response = await fetch('/todos', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
      }

      todoForm.reset();
      setMessage(formMessage, 'Todo created successfully!', 'success');
      await fetchTodos();
    } catch (error) {
      console.error(error);
      setMessage(formMessage, 'Unable to create todo. Please try again.');
    } finally {
      submitButton.disabled = false;
    }
  });
}

fetchTodos();
