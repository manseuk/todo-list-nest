const todoList = document.getElementById('todos');
const refreshButton = document.getElementById('refresh');
const listMessage = document.getElementById('list-message');
const todoForm = document.getElementById('todo-form');
const formMessage = document.getElementById('form-message');
const overlay = document.getElementById('form-overlay');
const openFormButton = document.getElementById('open-form');
const closeFormButton = document.getElementById('close-form');
const submitButton = todoForm?.querySelector('button[type="submit"]');

const STATUSES = ['New', 'In Progress', 'Completed'];

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
    item.dataset.id = todo.id;

    const header = document.createElement('div');
    header.className = 'todo-item-header';

    const title = document.createElement('h3');
    title.className = 'todo-title';
    title.textContent = todo.title;

    const status = document.createElement('span');
    status.className = 'todo-status';
    status.dataset.status = todo.status;
    status.textContent = todo.status;
    status.title = 'Click to change status';

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

const fetchTodos = async (options = {}) => {
  const { silent = false } = options;
  if (!silent) {
    setMessage(listMessage, 'Loading todos…', 'success');
  }
  try {
    const response = await fetch('/todos');
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const todos = await response.json();
    renderTodos(todos);
    const message = todos.length
      ? `Showing ${todos.length} todo${todos.length === 1 ? '' : 's'}.`
      : 'No todos yet. Add one when you are ready!';
    setMessage(listMessage, message, 'success');
  } catch (error) {
    console.error(error);
    setMessage(listMessage, 'Unable to load todos. Please try again.');
  }
};

refreshButton?.addEventListener('click', () => {
  fetchTodos();
});

const closeForm = () => {
  if (!overlay) {
    return;
  }
  overlay.hidden = true;
  setMessage(formMessage, '');
  todoForm?.reset();
};

const openForm = () => {
  if (!overlay) {
    return;
  }
  overlay.hidden = false;
  window.setTimeout(() => {
    document.getElementById('title')?.focus();
  }, 50);
};

openFormButton?.addEventListener('click', openForm);
closeFormButton?.addEventListener('click', closeForm);

overlay?.addEventListener('click', (event) => {
  if (event.target === overlay) {
    closeForm();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && overlay && !overlay.hidden) {
    closeForm();
  }
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

    if (submitButton) {
      submitButton.disabled = true;
    }
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
      closeForm();
      await fetchTodos({ silent: true });
      setMessage(listMessage, 'Todo created successfully!', 'success');
    } catch (error) {
      console.error(error);
      setMessage(formMessage, 'Unable to create todo. Please try again.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

const getNextStatus = (current) => {
  const index = STATUSES.indexOf(current);
  if (index === -1) {
    return STATUSES[0];
  }

  return STATUSES[(index + 1) % STATUSES.length];
};

const updateTodoStatus = async (id, nextStatus, badge) => {
  if (!id) {
    return;
  }

  try {
    badge?.classList.add('loading');
    setMessage(listMessage, 'Updating status…', 'success');
    const response = await fetch(`/todos/${id}/status`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ status: nextStatus })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    await fetchTodos({ silent: true });
    setMessage(listMessage, `Status updated to ${nextStatus}.`, 'success');
  } catch (error) {
    console.error(error);
    setMessage(listMessage, 'Unable to update status. Please try again.');
  } finally {
    badge?.classList.remove('loading');
  }
};

todoList?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (!target.classList.contains('todo-status')) {
    return;
  }

  if (target.classList.contains('loading')) {
    return;
  }

  const item = target.closest('.todo-item');
  const todoId = item?.dataset.id;
  const currentStatus = target.dataset.status || target.textContent || STATUSES[0];
  const nextStatus = getNextStatus(currentStatus);

  updateTodoStatus(todoId, nextStatus, target);
});

fetchTodos();
