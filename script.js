const Modal = {
  open() {
    document.querySelector('.modal-overlay')
      .classList.add('active')
  },
  close() {
    document.querySelector('.modal-overlay')
      .classList.remove('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
  }
}

// ANTES DO LOCALSTORAGE
// const transactions = [
//   {
//     description: 'Luz',
//     amount: -50000, // == -500,00
//     date: '23/01/2021',
//   },
//   {
//     description: 'Website',
//     amount: 500000, 
//     date: '23/01/2021',
//   },
//   {
//     description: 'Internet',
//     amount: -20000,
//     date: '23/01/2021',
//   },
//   {
//     description: 'App',
//     amount: 200000,
//     date: '23/01/2021',
//   }
// ]

const Transaction = {
  // all: transactions,
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;
    Transaction.all.forEach(transaction => {
      transaction.amount > 0 ? income += transaction.amount : null;
    })
    return income;
  },

  expenses() {
    let expense = 0;
    Transaction.all.forEach(transaction => {
      transaction.amount < 0 ? expense += transaction.amount : null;
    })
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img class="imgRemove" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `
    return html;
  },

  updateBallance() {
    document
      .getElementById('incomeDisplay') 
      .innerHTML = Utils.formatCurrency(Transaction.incomes());
    
    document
      .getElementById('expenseDisplay') 
      .innerHTML = Utils.formatCurrency(Transaction.expenses());
    
    document
      .getElementById('totalDisplay') 
      .innerHTML = Utils.formatCurrency(Transaction.total());
  },

  // para limpar as Transactions pq estava duplicando
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const Utils = {
  formatAmount(value) {
    // FORMATAÇÃO DE MOEDA PARA . E , 
    // value = Number(value.replace(/\,\./g, '')) * 100
    value = Number(value) * 100

    return value;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-': ''

    value = String(value).replace(/\D/g, '')

    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value;
  },

  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  }

}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if ( description.trim() === '' || amount.trim() === '' || date.trim() === '' ) {
      throw new Error('Por favor preencha todos os campos')
    } 
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date
    }
  },

  saveTransaction(transaction) {
    Transaction.add(transaction)
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },
  
  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      // salvar
      Form.saveTransaction(transaction);
      // apagar os dados do formulário
      Form.clearFields();
      // fechar modal
      Modal.close();
      // Atualizar a aplicação, mas já tem no saveTransaction
    } catch (error) {
      alert(error.message);
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })
    
    DOM.updateBallance();
    // Atualizando localStorage
    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
}

App.init();