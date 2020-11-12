//variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const naveBar = document.querySelector('.fa-bars');
const userOverlay = document.querySelector('.user-overlay');
const userForm = document.querySelector('.form-user');
const closeFormUser = document.querySelector('.close-form-user');
const emailLogin =document.querySelector('#email');
const passwordLogin =document.querySelector('#password');
const message = document.querySelector('.message-login');
const btnSaveLogin = document.querySelector('.btn-save-login');

//cart and get information
let cart = [];

//button
let buttonDOM = [];

// getting the products - first in local and after in api
class Products {
     async getProducts() {
        try {
            //let result = await fetch('http://localhost:3000/produtos');
            let result = await fetch('https://api-culysoft-ecommerce.herokuapp.com/produtos');

            let data = await result.json();
            
            return data;
        } catch (error) {
            console.log('Error: ' + error);
        }
     }
}

class User {
    getUserFromLogin() {
        
        let email = emailLogin.value;
        let password = passwordLogin.value;

        const validators = new ValidationContract();

        validators.isRequired(email, 'Deves preencher o titulo.');
        validators.isRequired(password, 'Deves preencher a descricao.');

        if(!validators.isValid()) {
            message.innerHTML = `<span class='btn btn-danger' >Todos os campos devem ser preenchido.</span>`
            return null;
        }
        return {email, password};
    }
}

// ui - display products
class UI {
    displayProducts(products) {
        let result = '';

        products.forEach(product => {
            result += `
            <!-- single product-->
            <article class="product">
                <div class="img-container">
                    <img src=${product.imagem} alt="product" class="product-img"/>
                    <button class="bag-btn" data-id=${product._id}>
                        <i class="fas fa-shopping-cart"></i>
                        adicionar no carinho
                    </button>
                </div>
                <h3>${product.titulo}</h3>
                <h4>$${product.preco}</h4>
            </article>
            <!-- end of single product-->
            `
        });
        productsDOM.innerHTML = result;
    }

    getBagButtons() {
            const buttons = [...document.querySelectorAll('.bag-btn')];

            buttonDOM = buttons;

            buttons.forEach( button => {
                let id = button.dataset.id;
                let inCart = cart.find(item => item._id === id);
                
                if(inCart) {
                    button.innerText = 'Já está no carinho';
                    button.disabled = true;
                }else{
                    button.addEventListener('click', (event) => {
                        event.target.innerText = 'Já está no carinho';
                        event.target.disabled = true;

                        // get product from products
                        let cartItem = {...Storage.getProduct(id), amount:1};                     
                        // add product to the cart
                        cart = [...cart, cartItem];
                        // save cart in local storege
                        Storage.saveCart(cart);
                        // set cart values
                        this.setCartValues(cart);
                        // display cart item 
                        this.addCartItem(cartItem);
                        // show the cart
                        this.showCart();
                    });
                }
            });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.preco * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.imagem} alt="product">
        <div>
            <h4>${item.titulo}</h4>
            <h5>$${item.preco}</h5>
            <span class="remove-item" data-id=${item._id}>remover</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item._id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item._id}></i>
        </div>
        `;

        cartContent.appendChild(div);
    }    

    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    cartLogic() {
        // clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        // cart functionality

        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if(event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item._id === id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }else if(event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item._id === id);
                tempItem.amount -= 1;
                if(tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    
                }else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
                lowerAmount.previousElementSibling.innerText = tempItem.amount;
            }
        });
    }

    clearCart() {
        let cartItems = cart.map(item => item._id);
        // console.log(cartItems);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
        //Call api to save item in database and before it, you need to login
    }

    removeItem(id) {
        cart = cart.filter(item => item._id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSinleButton(id);
        button.disabled = false;
        button.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        adicionar no carinho`
    }

    getSinleButton(id) {
        return buttonDOM.find(button => button.dataset.id === id);
    }

    showFormUser() {
        userOverlay.classList.add('transparent-form-user');
        userForm.classList.add('show-user');
    }

    hideFormUser() {
        userOverlay.classList.remove('transparent-form-user');
        userForm.classList.remove('show-user');
    }
}

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product._id === id);
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const product = new Products();
    const user = new User();

    //setup app
    ui.setupAPP();

    naveBar.addEventListener('click', (event) => {
        ui.showFormUser();
    });

    closeFormUser.addEventListener('click', (event) => {
        ui.hideFormUser();
    })

    // get all products
    product.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });

    btnSaveLogin.addEventListener('click', (event) => {
        const login = user.getUserFromLogin();

        if(user = null) {
            message.innerHTML = `<span class='btn btn-warning' >Servico indisponivel, ainda estou a trabalhar.</span>`
        }
    });
});

let errors = [];

function ValidationContract() {
    errors = [];
}

ValidationContract.prototype.isRequired = (value, message) => {
    if(!value || value.length <= 0) 
        errors.push({message: message});
}

ValidationContract.prototype.errors = () => {
    return errors;
}

ValidationContract.prototype.isValid = () => {
    return errors.length == 0;
}