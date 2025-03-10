// Globals
const API_URL = '/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Toggle sidebar on mobile
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      document.querySelector('.sidebar').classList.toggle('active');
    });
  }

  // Verificar se o usuário está autenticado
  checkAuth();

  // Listeners para formulários
  setupFormListeners();
});

// Funções de Autenticação
function checkAuth() {
  // Se estamos em uma página que requer autenticação (não login ou register)
  const publicPages = ['/login', '/register', '/forgot-password'];
  const currentPath = window.location.pathname;
  
  if (!publicPages.includes(currentPath) && currentPath !== '/') {
    if (!authToken) {
      window.location.href = '/login';
      return;
    }

    // Verificar token
    fetch(`${API_URL}/auth/verify-token`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Token inválido');
      }
      return response.json();
    })
    .then(data => {
      console.log('Token válido');
      updateUI();
    })
    .catch(error => {
      console.error('Erro de autenticação:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    });
  } else if (authToken && publicPages.includes(currentPath)) {
    // Se o usuário já está autenticado e tenta acessar páginas públicas
    window.location.href = '/dashboard';
  }
}

function login(email, password) {
  return fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Credenciais inválidas');
    }
    return response.json();
  })
  .then(data => {
    authToken = data.token;
    currentUser = {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar
    };
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    return data;
  });
}

function register(userData) {
  return fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao registrar');
    }
    return response.json();
  })
  .then(data => {
    authToken = data.token;
    currentUser = {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar
    };
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    return data;
  });
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  window.location.href = '/login';
}

// Funções de manipulação da UI
function updateUI() {
  // Se temos dados do usuário, atualizar a UI
  if (currentUser && currentUser.name) {
    // Atualizar foto do perfil e nome do usuário
    const userProfileName = document.querySelector('.user-profile-name');
    const userProfileImg = document.querySelector('.user-profile img');
    
    if (userProfileName) {
      userProfileName.textContent = currentUser.name;
    }
    
    if (userProfileImg && currentUser.avatar) {
      userProfileImg.src = currentUser.avatar;
    }
  }
}

function setupFormListeners() {
  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorMsg = document.getElementById('loginError');
      
      if (errorMsg) errorMsg.textContent = '';
      
      login(email, password)
        .then(() => {
          window.location.href = '/dashboard';
        })
        .catch(error => {
          if (errorMsg) errorMsg.textContent = error.message;
          console.error('Erro de login:', error);
        });
    });
  }

  // Register Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const errorMsg = document.getElementById('registerError');
      
      if (errorMsg) errorMsg.textContent = '';
      
      if (password !== confirmPassword) {
        if (errorMsg) errorMsg.textContent = 'As senhas não coincidem';
        return;
      }
      
      register({ name, email, password })
        .then(() => {
          window.location.href = '/dashboard';
        })
        .catch(error => {
          if (errorMsg) errorMsg.textContent = error.message;
          console.error('Erro de registro:', error);
        });
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

// Funções de API genéricas
function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  return fetch(`${API_URL}/${endpoint}`, fetchOptions)
    .then(response => {
      if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      
      return response.json();
    });
}

// API específicas por entidade

// Customers
function getCustomers(page = 1, limit = 10, filters = {}) {
  let queryParams = `page=${page}&limit=${limit}`;
  
  // Adicionar filtros à query string
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
    }
  });
  
  return fetchAPI(`customers?${queryParams}`);
}

function getCustomerById(id) {
  return fetchAPI(`customers/${id}`);
}

function createCustomer(customerData) {
  return fetchAPI('customers', {
    method: 'POST',
    body: JSON.stringify(customerData)
  });
}

function updateCustomer(id, customerData) {
  return fetchAPI(`customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customerData)
  });
}

function deleteCustomer(id) {
  return fetchAPI(`customers/${id}`, {
    method: 'DELETE'
  });
}

// Leads
function getLeads(page = 1, limit = 10, filters = {}) {
  let queryParams = `page=${page}&limit=${limit}`;
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
    }
  });
  
  return fetchAPI(`leads?${queryParams}`);
}

// Opportunities
function getOpportunities(page = 1, limit = 10, filters = {}) {
  let queryParams = `page=${page}&limit=${limit}`;
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
    }
  });
  
  return fetchAPI(`opportunities?${queryParams}`);
}

// Products
function getProducts(page = 1, limit = 10, filters = {}) {
  let queryParams = `page=${page}&limit=${limit}`;
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
    }
  });
  
  return fetchAPI(`products?${queryParams}`);
}

// Tasks
function getTasks(page = 1, limit = 10, filters = {}) {
  let queryParams = `page=${page}&limit=${limit}`;
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
    }
  });
  
  return fetchAPI(`tasks?${queryParams}`);
}

// Dashboard data
function getDashboardData() {
  return fetchAPI('reports/dashboard');
}

// Utilitários
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Notificações
function showNotification(message, type = 'success') {
  const notificationContainer = document.getElementById('notificationContainer');
  
  if (!notificationContainer) {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.getElementById('notificationContainer').appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}