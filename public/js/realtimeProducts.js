document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const productList = document.getElementById('product-list');
  const addForm = document.getElementById('add-product-form');
  const deleteForm = document.getElementById('delete-product-form');

  socket.on('products', (products) => {
    productList.innerHTML = '';
    products.forEach(prod => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div style="padding:14px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:600;color:#667eea;font-size:1.1rem;">${prod.title}</div>
          <div style="color:#333;font-size:0.98rem;margin-bottom:4px;">${prod.description || ''}</div>
          <div style="color:#764ba2;font-weight:500;">$${prod.price}</div>
        </div>
      `;
      productList.appendChild(li);
    });
  });

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    if (title && !isNaN(price)) {
      socket.emit('addProduct', { title, price });
      addForm.reset();
    }
  });

  deleteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('delete-title').value.trim();
    if (title) {
      socket.emit('deleteProduct', title);
      deleteForm.reset();
    }
  });
});
