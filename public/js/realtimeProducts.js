document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const productList = document.getElementById('product-list');
  const addForm = document.getElementById('add-product-form');
  const deleteForm = document.getElementById('delete-product-form');

  function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      max-width: 300px;
      word-wrap: break-word;
      ${type === 'error' ? 'background-color: #e74c3c;' : 
        type === 'success' ? 'background-color: #2ecc71;' : 
        'background-color: #3498db;'}
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 5000);
  }

  socket.on('products', (products) => {
    productList.innerHTML = '';
    products.forEach(prod => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div style="padding:14px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:600;color:#667eea;font-size:1.1rem;">${prod.title}</div>
          <div style="color:#333;font-size:0.98rem;margin-bottom:4px;">${prod.description || ''}</div>
          <div style="color:#764ba2;font-weight:500;">$${prod.price}</div>
          <div style="color:#666;font-size:0.85rem;">Stock: ${prod.stock}</div>
        </div>
      `;
      productList.appendChild(li);
    });
  });

  socket.on('error', (error) => {
    showMessage(error.message || 'Error desconocido', 'error');
  });

  socket.on('productAdded', (response) => {
    showMessage(response.message, 'success');
  });

  socket.on('productDeleted', (response) => {
    showMessage(response.message, 'success');
  });

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const stock = parseInt(document.getElementById('stock') ? document.getElementById('stock').value : '1');
    const category = document.getElementById('category') ? document.getElementById('category').value.trim() : 'General';
    const code = document.getElementById('code') ? document.getElementById('code').value.trim() : '';

    if (!title) {
      showMessage('El título es obligatorio', 'error');
      return;
    }
    if (!description) {
      showMessage('La descripción es obligatoria', 'error');
      return;
    }
    if (isNaN(price) || price < 0) {
      showMessage('El precio debe ser un número válido mayor o igual a 0', 'error');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      showMessage('El stock debe ser un número válido mayor o igual a 0', 'error');
      return;
    }

    socket.emit('addProduct', { 
      title, 
      description, 
      price, 
      stock,
      category,
      code
    });
    addForm.reset();
  });

  deleteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('delete-title').value.trim();
    
    socket.emit('deleteProduct', title);
    deleteForm.reset();
    
  });
});
