const btnNewProduct = document.querySelector('.newProduct');
const cartOverlay = document.querySelector('.cart-overlay');
const form = document.querySelector('.form');
const closeForm = document.querySelector('.close-form');
const idForm = document.querySelector('#id');
const titleForm = document.querySelector('#title');
const descriptionForm = document.querySelector('#description');
const priceForm = document.querySelector('#price');
const imageForm = document.querySelector('#image');
const btnSave = document.querySelector('.btn-save');
const message = document.querySelector('.message-product');
const naveBar = document.querySelector('.fa-bars');
const userOverlay = document.querySelector('.user-overlay');
const userForm = document.querySelector('.form-user');
const closeFormUser = document.querySelector('.close-form-user');
const tableProducts = document.querySelector('#table-products');
const url = 'https://api-culysoft-ecommerce.herokuapp.com/produtos';

class Product {
    
    async getProducts() {
        try {
            let result = await fetch(url);
            
            let data = await result.json();

            return data;
        } catch (error) {
            console.log('Error: ' + error);
        }
    }

    getProductFromForm() {
        let idTemp = 0;
        if(id.value != null) {
           idTemp = idForm.value;
        }
        
        let title = titleForm.value;
        let description = descriptionForm.value;
        let price = priceForm.value;
        let image = imageForm.value;

        const validators = new ValidationContract();

        validators.isRequired(title, 'Deves preencher o titulo.');
        validators.isRequired(description, 'Deves preencher a descricao.');
        validators.isRequired(price, 'Deves preencher o preco.');
        validators.isRequired(image, 'Deves preencher a image.');

        if(!validators.isValid()) {
            message.innerHTML = `<span class='btn btn-danger' >Todos os campos devem ser preenchido.</span>`
            return null;
        }
        return {id, title, description, price, image};
    }

    async saveProduct() {
        const productTemp = this.getProductFromForm();
        console.log(JSON.stringify(productTemp));
        if(productTemp != null) {
            try {
                const result = await fetch(url, {
                    headers:[
                        ['Content-Type', 'text/plain']
                    ],
                    method: 'POST', 
                    body: {
                        title: productTemp.title,
                        slug:productTemp.title,
                        description: productTemp.description,
                        price: productTemp.price,
                        image: productTemp.image
                    }
                });
                const data = await result.json();
                console.log(data);
                return data;
            } catch (error) {
                console.log(error);
            }
        }
    }
}


class UI {

    displayProductsInTable(products) {
        var result = '';

        products.forEach(item => {
            result += `
                <tr>
                    <td>${item._id}</td>
                    <td>${item.titulo}</td>
                    <td>${item.descricao}</td>
                    <td>${item.preco}</td>
                    <td>${item.activo}</td>
                    <td><a href='#products' class='btn btn-warning btn-sm btn-block btn-edit' id='btn-edit'><i class="fas fa-edit"></i>Edit</a></td>
                    <td><a href='http://localhost:3000/products/${item._id}' class='btn btn-danger btn-sm btn-block'><i class="fas fa-times-circle"></i>Delete</a></td>
                </tr>
            `;
        });

        tableProducts.innerHTML = result;
    }

    showFormProduct() {
        cartOverlay.classList.add('transparent-form');
        form.classList.add('show-form');
    }

    showFormUser() {
        userOverlay.classList.add('transparent-form-user');
        userForm.classList.add('show-user');
    }

    hideFormProduct() {
        cartOverlay.classList.remove('transparent-form');
        form.classList.remove('show-form');
        this.clearForm();
    }

    hideFormUser() {
        userOverlay.classList.remove('transparent-form-user');
        userForm.classList.remove('show-user');
    }

    clearForm() {
        id.value = null;
        title.value = null;
        description.value = null;
        price.value = null;
        image.value = null;
        message.innerText = null;
    }

    
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const product = new Product();

     // get all products
     product.getProducts().then(products => {
        ui.displayProductsInTable(products);
    });

    btnNewProduct.addEventListener('click', (event) => {
        ui.showFormProduct();
    });

    closeForm.addEventListener('click', (event) => {
        ui.hideFormProduct();
    });

    btnSave.addEventListener('click', (event) => {
        product.saveProduct();  
    });

    naveBar.addEventListener('click', (event) => {
        ui.showFormUser();
    });

    closeFormUser.addEventListener('click', (event) => {
        ui.hideFormUser();
    });

});

// validator
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
