const newTodo = document.querySelector('.js-header__new-item');
const todoList = document.querySelector('.js-todo-list');
const firstLi = document.querySelectorAll('.js-todo-list__item')[0];
const mainBlock = document.querySelector('.js-main');
const footer = document.querySelector('.js-footer');
const filters = document.querySelector('.js-filters');
const btnClearCompleted = document.querySelector('.js-clear-completed');
const btnToggleAll = document.querySelector('.js-select-all');
footer.hidden = true;
mainBlock.hidden = true;
btnClearCompleted.hidden = true;
let arrayTodo = [];
let count; 
const filter = localStorage.getItem('filter');

document.addEventListener('DOMContentLoaded', handleDomContentLoaded);
function handleDomContentLoaded() {
	ready();
	addEventListeners();
}

function ready() {
	arrayTodo = JSON.parse(localStorage.getItem('todo'));
		firstLi.hidden = true;
	if (arrayTodo && arrayTodo.length > 0) {
		firstLi.hidden = false;
		for (let i = 0; i < arrayTodo.length; i++) {
			const newLi = firstLi.cloneNode(true);
			const isComplete = arrayTodo[i].isComplete;
			if (isComplete) newLi.children[0].children[0].checked = true;
				newLi.setAttribute('id', arrayTodo[i].id );
				newLi.querySelector('label').innerHTML = arrayTodo[i].text.trim();
				todoList.appendChild(newLi);
		}

		mainBlock.hidden = false;
		footer.hidden = false;
		setFilter(filter);
		firstLi.hidden = true;
		count = initCounter();
		
		} else {
			arrayTodo = [];
			count = {	
					total: 0,
					active: 0,
					completed: 0
					};
			setFilter('all');
			mainBlock.hidden = true;
			footer.hidden = true;
			}
		return;
};

function addEventListeners() {
	newTodo.addEventListener('blur', handleBlur); 
	newTodo.addEventListener('keydown', handleKeyDown);
	todoList.addEventListener('dblclick', handleTodoListDblClick);
	todoList.addEventListener('click', handleTodoListClick);
	btnToggleAll.addEventListener('click', handleToggleAllClick);
	btnClearCompleted.addEventListener('click', handleClearCompletedClick);
	filters.addEventListener('click', handleFiltersClick);
};

function handleBlur(event) {
	createNewItem(event);
};

function handleKeyDown(event) {
	createNewItem(event);
};

function createNewItem() {
	if ((event.keyCode === 13 || !event.keyCode) && newTodo.value !== '') {
		firstLi.hidden = false;
		const newLi = firstLi.cloneNode(true);
		const obj = saveTodoItem(newTodo);
		newLi.setAttribute('id', obj.id);
		newLi.querySelectorAll('label')[0].innerHTML = newTodo.value.trim();
		todoList.appendChild(newLi);
		footer.hidden = false;
		mainBlock.hidden = false;
		updateCounter(newLi, false, true);
		showHideLi(newLi);
		firstLi.hidden = true;
		newTodo.value = '';
		} else return ;
	}; 

function handleTodoListDblClick(event) {
	if (event.target.localName === 'label') {
		const labelValue = event.target.innerHTML;
		const parentLi = event.target.parentNode.parentNode;
		let newInput = document.createElement('INPUT');
		parentLi.classList.add('js-editing');
		newInput.className = 'js-edit';
		newInput.value = labelValue;
		parentLi.appendChild(newInput);
		newInput.focus();
		newInput.addEventListener('keydown', handleNewInputKeyDown);
		newInput.addEventListener('blur',  handleNewInputBlur);
		
		function handleNewInputBlur(event) {
			if (newInput.value !== '') {	
				parentLi.classList.remove('js-editing');
				const changeLabel = this.previousElementSibling.children[1];
				changeLabel.innerHTML = newInput.value;
				parentLi.removeChild(newInput);
				const currentID = +parentLi.getAttribute('id');
				for (let i = 0; i < arrayTodo.length; i++) {
					if (currentID === arrayTodo[i].id) {
						arrayTodo[i].text = changeLabel.innerHTML;
						break;
					}
				}
				saveToStorage();
			} else {
				removeTodoItem(parentLi); 
				saveToStorage();
				}	
		}

		function handleNewInputKeyDown(event) {
			if (event.keyCode === 13 || !event.keyCode) {
				if (newInput.value !== '') {	
					parentLi.classList.remove('js-editing');
					if (event.type === 'keydown') newInput.removeEventListener('blur', handleNewInputBlur);
					const changeLabel = this.previousElementSibling.children[1];
					changeLabel.innerHTML = newInput.value;
					parentLi.removeChild(newInput);
					const currentID = +parentLi.getAttribute('id');
					for (let i = 0; i < arrayTodo.length; i++) {
						if (currentID === arrayTodo[i].id) {
							arrayTodo[i].text = changeLabel.innerHTML;
							break;
					}
				}
				saveToStorage();
			} else {
				if (event.type === 'keydown') newInput.removeEventListener('blur', handleNewInputBlur);
					removeTodoItem(parentLi); 
					saveToStorage();
				}  
			}
				return; 
		}
	}
};

function handleToggleAllClick(event) {
	let complete = document.querySelectorAll('.complete');
	if (event.target.checked) {
		for (let i = 1; i < arrayTodo.length+1; i++) {
		const parentLi = complete[i].parentNode.parentNode;
			if (!complete[i].checked) {
				complete[i].checked = true;
				arrayTodo[i-1].isComplete = true;
				updateCounter(parentLi, false);
			}				
		}
	btnClearCompleted.hidden = false;
	
	} else  {
		for (let i = 1; i < arrayTodo.length + 1; i++) {
		 const parentLi = complete[i].parentNode.parentNode;
			if (complete[i].checked) {
				complete[i].checked = false;
				arrayTodo[i-1].isComplete = false;
				updateCounter(parentLi, false);
				showHideLi(parentLi);
			}			
		}
	btnClearCompleted.hidden = true;
	}
	saveToStorage();
	let filter = getInstalledFilterName();
	setFilter(filter);
}

function handleTodoListClick(event) {
	if (event.target.classList.contains('complete')) {
		const parentLi = event.target.parentNode.parentNode;
		const currentID = +parentLi.getAttribute('id');
			for (let i = 0; i < arrayTodo.length; i++) {
				if (currentID === arrayTodo[i].id) {
					if (event.target.checked) {
						arrayTodo[i].isComplete = true;
						}
					else {
						arrayTodo[i].isComplete = false;
						btnToggleAll.checked = false;
						}
						break;
				}
			}	
		showHideLi(parentLi, true);
		updateCounter(parentLi, false);
		btnClearCompleted.hidden = count.completed <= 0;
		btnToggleAll.checked = count.active === 0;
		saveToStorage(); 
	}
	if (event.target.classList.contains('destroy')) {
		const parentLi = event.target.parentNode.parentNode;
		removeTodoItem(parentLi);
	}
}

function handleClearCompletedClick(event) {
	const totalCount = arrayTodo.length;
	let complete = document.querySelectorAll('.complete');
		for (let i = 0; i <= totalCount; i++) {
			if (complete[i].checked) {
				const parentLi = complete[i].parentNode.parentNode;
				removeTodoItem(parentLi);
			}
		}
	btnToggleAll.checked = false;
	btnClearCompleted.hidden = count.completed <= 0;
}

function handleFiltersClick(event) {
	if (event.target.classList.contains('filter')) {
		setFilter(String(event.target.id));
	}
};

function removeTodoItem(removeLi) {
	const currentID = +removeLi.getAttribute('id');
		for (let i = 0; i < arrayTodo.length; i++) {
			if (currentID === arrayTodo[i].id) {
				arrayTodo.splice(i, 1);
				break;
			}
		}
		footer.hidden =	arrayTodo.length === 0;
		mainBlock.hidden = arrayTodo.length === 0;
		saveToStorage();
		updateCounter(removeLi, true);
		todoList.removeChild(removeLi);
}

function saveTodoItem(newTodo) {
	const data = {
		id: getID(),
		text: newTodo.value,
		isComplete: false 
		};
	arrayTodo.push(data);
	saveToStorage();
	return data;
};

function getID() {
	return (new Date).getTime();
};

function saveToStorage() {
	return localStorage.setItem('todo', JSON.stringify(arrayTodo));
};

function showHideLi(currentLi, check) {
	const filtersNodeList = document.querySelectorAll('.filter');
	for (let i = 0; i < filtersNodeList.length; i++) {
		if (filtersNodeList[i].checked) {
			if (filtersNodeList[i].id === 'completed') {
				currentLi.hidden = true;
			};
			if (filtersNodeList[i].id === 'active') {
				currentLi.hidden = check;
			}
		}
	}
};

function getInstalledFilterName() {
	const filtersNodeList = document.querySelectorAll('.filter');
	let filterName = '';
	for (let i = 0; i < filtersNodeList.length; i++) {
		if (filtersNodeList[i].checked) {
			filterName = String(filtersNodeList[i].id);
		}
	}
	return filterName;
}

function setFilter(filterName) {
	
	if (filterName === 'active') {
		for (let i = 0; i < todoList.childElementCount-1; i++) {
			const checked = arrayTodo[i].isComplete;
			if (!checked) {
				todoList.children[i+1].hidden = checked;
			} else todoList.children[i+1].hidden = checked;
		} 
	} 

	else if (filterName === 'completed') {
		for (let i = 0; i < todoList.childElementCount-1; i++) {
			const checked = arrayTodo[i].isComplete;
			if (checked) {
				todoList.children[i+1].hidden = !checked;
			} else todoList.children[i+1].hidden = !checked;
		}
	} 

	else if (filterName === 'all') {
		for (let i = 0; i < todoList.childElementCount-1; i++) {
			todoList.children[i+1].hidden = false;	
		}
	}
	document.getElementById(filterName).checked = true;
	localStorage.setItem('filter', filterName);
}

function initCounter () {  
	const count = {
		total: arrayTodo.length,
		active: arrayTodo.filter((i) => !i.isComplete).length,
		completed: arrayTodo.filter((i) => i.isComplete ).length 
		};
	const labelCounter = document.querySelector('strong');
	let itemsTextContent = '';
	btnClearCompleted.hidden = count.completed <= 0;
	count.active > 1 ? itemsTextContent = ' items left' : itemsTextContent =' item left';
	labelCounter.innerHTML = count.active + itemsTextContent;
	return count;
}


function updateCounter(parentLi, remove, add) {
	let currentCount = count;
	const labelCounter = document.querySelector('strong');
	let itemsTextContent = '';
	const isComplete = parentLi.querySelector('.complete').checked;
	if (remove) {
		if (isComplete) {
			currentCount.completed--;
			currentCount.total--;
		} else {
				currentCount.active--;
				currentCount.total--;
				}
		currentCount.active > 1 ? itemsTextContent = ' items left': itemsTextContent =' item left';
		return labelCounter.innerHTML = currentCount.active + itemsTextContent;
	}

	if (isComplete) {
			currentCount.completed++;
			currentCount.active--
	} else if (!add) {
				currentCount.completed--;
				currentCount.active++;
			} else {
					currentCount.active++;
					currentCount.total++;
					}
	currentCount.active > 1 ? itemsTextContent =  ' items left' : itemsTextContent =' item left';
	labelCounter.innerHTML = currentCount.active + itemsTextContent;
	btnClearCompleted.hidden = count.completed <= 0;
}


  





	


