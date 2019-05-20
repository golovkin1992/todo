let newTodo = document.querySelector('INPUT');
let todoList = document.querySelector('UL');
let firstLi = document.querySelectorAll('LI')[0];
let mainBlock = document.querySelector('.main');
let footer = document.querySelector('.footer');
let filters = document.querySelector('.filters');
let btnClearCompleted = document.querySelector('.clear-completed');
let btnToggleAll = document.querySelector('.select-all');
footer.hidden = true;
mainBlock.hidden = true;
btnClearCompleted.hidden = true;
let arrayTodo = [];
let count; 
let filter = localStorage.getItem('filter');

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
			let newLi = firstLi.cloneNode(true);
			let isComplete = arrayTodo[i].isComplete ? true: false;
			if (isComplete) newLi.children[0].children[0].checked = true;
				newLi.setAttribute('id', arrayTodo[i].id );
				newLi.querySelector('label').innerHTML = arrayTodo[i].text.trim();
				todoList.appendChild(newLi);
		}

		mainBlock.hidden = false;
		footer.hidden = false;
		filter !== null ? setFilter(filter) : setFilter('all');
		firstLi.hidden = true;
		count = initCounter();
		
		} else {
			arrayTodo = [];
			count = {total:0,active:0,completed:0};
			setFilter('all');
			mainBlock.hidden = true;
			footer.hidden = true;
			}
		return;
};

function addEventListeners() {
	newTodo.addEventListener('blur', handleBlurKeyDownNewTodo); 
	newTodo.addEventListener('keydown', handleBlurKeyDownNewTodo);
	todoList.addEventListener('dblclick', handleOnDblClickTodoList);
	todoList.addEventListener('click', handleOnClickTodoList);
	btnToggleAll.addEventListener('click', handleOnClickToggleAll);
	btnClearCompleted.addEventListener('click', handleOnClickClearCompleted);
	filters.addEventListener('click', handleOnClickFilters);
};

function handleBlurKeyDownNewTodo(event) {
	if ((event.keyCode === 13 || !event.keyCode) && newTodo.value !== '') {
		firstLi.hidden = false;
		let newLi = firstLi.cloneNode(true);
		let obj = saveTodoItem(newTodo);
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

function handleOnDblClickTodoList(event) {
	if (event.target.localName === 'label') {
		let labelValue = event.target.innerHTML;
		let parentLi = event.target.parentNode.parentNode;
		let newInput = document.createElement('INPUT');
		parentLi.classList.add('js-editing');
		newInput.className = 'edit';
		newInput.value = labelValue;
		parentLi.appendChild(newInput);
		newInput.focus();
		newInput.addEventListener('keydown', handleOnKeyDownNewInput);
		newInput.addEventListener('blur',  handleOnBlurNewInput);
		
		function handleOnBlurNewInput(event) {
			if (newInput.value !== '') {	
				parentLi.classList.remove('js-editing');
				let changeLabel = this.previousElementSibling.children[1];
				changeLabel.innerHTML = newInput.value;
				parentLi.removeChild(newInput);
				let currentID = +parentLi.getAttribute('id');
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

		function handleOnKeyDownNewInput(event) {
			if (event.keyCode === 13 || !event.keyCode) {
				if (newInput.value !== '') {	
					parentLi.classList.remove('js-editing');
					if (event.type === 'keydown') newInput.removeEventListener('blur', changeItemBlur);
					let changeLabel = this.previousElementSibling.children[1];
					changeLabel.innerHTML = newInput.value;
					parentLi.removeChild(newInput);
					let currentID = +parentLi.getAttribute('id');
					for (let i = 0; i < arrayTodo.length; i++) {
						if (currentID === arrayTodo[i].id) {
							arrayTodo[i].text = changeLabel.innerHTML;
							break;
					}
				}
				saveToStorage();
			} else {
				if (event.type === 'keydown') newInput.removeEventListener('blur', changeItemBlur);
					removeTodoItem(parentLi); 
					saveToStorage();
				}  
			}
				return; 
		}
	}
};

function handleOnClickToggleAll(event) {
	let complete = document.querySelectorAll('.complete');
	if (event.target.checked) {
		for (let i = 1; i < arrayTodo.length+1; i++) {
		let parentLi = complete[i].parentNode.parentNode;
			if (!complete[i].checked) {
				complete[i].checked = true;
				arrayTodo[i-1].isComplete = true;
				updateCounter(parentLi, false);
			}				
		}
	btnClearCompleted.hidden = false;
	
	} else  {
		for (let i = 1; i < arrayTodo.length + 1; i++) {
		let parentLi = complete[i].parentNode.parentNode;
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

function handleOnClickTodoList(event) {
	if (event.target.classList.contains('complete')) {
		let parentLi = event.target.parentNode.parentNode;
		let currentID = +parentLi.getAttribute('id');
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
		count.completed > 0 ? btnClearCompleted.hidden = false : btnClearCompleted.hidden = true;
		count.active == 0 ? btnToggleAll.checked = true : false;
		saveToStorage(); 
	}
	if (event.target.classList.contains('destroy')) {
		let parentLi = event.target.parentNode.parentNode;
		removeTodoItem(parentLi);
	}
}

function handleOnClickClearCompleted(event) {
	let totalCount = arrayTodo.length;
	let complete = document.querySelectorAll('.complete');
		for (let i = 0; i <= totalCount; i++) {
			if (complete[i].checked) {
				let parentLi = complete[i].parentNode.parentNode;
				removeTodoItem(parentLi);
			}
		}
	btnToggleAll.checked = false;
	count.completed > 0 ? btnClearCompleted.hidden = false : btnClearCompleted.hidden = true;
}

function handleOnClickFilters(event) {
	if (event.target.classList.contains('filter')) {
		setFilter(String(event.target.id));
	}
};
function removeTodoItem(removeLi) {
	let currentID = +removeLi.getAttribute('id');
		for (let i = 0; i < arrayTodo.length; i++) {
			if (currentID === arrayTodo[i].id) {
				arrayTodo.splice(i, 1);
				break;
			}
		}
		arrayTodo.length === 0 ? footer.hidden = true : false;
		arrayTodo.length === 0 ? mainBlock.hidden = true : false;
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
	let filtersNodeList = document.querySelectorAll('.filter');
	for (let i = 0; i < filtersNodeList.length; i++) {
		if (filtersNodeList[i].checked) {
			if (filtersNodeList[i].id === 'completed') {
				currentLi.hidden = true;
			};
			if (filtersNodeList[i].id === 'active') {
				!check ? currentLi.hidden = false : currentLi.hidden = true;
			};
		}
	}
};

function getInstalledFilterName() {
	let filtersNodeList = document.querySelectorAll('.filter');
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
			let checked = arrayTodo[i].isComplete;
			if (!checked) {
				todoList.children[i+1].hidden = false;
			} else todoList.children[i+1].hidden = true;
		} 
	} 

	else if (filterName === 'completed') {
		for (let i = 0; i < todoList.childElementCount-1; i++) {
			let checked = arrayTodo[i].isComplete;
			if (checked) {
				todoList.children[i+1].hidden = false;
			} else todoList.children[i+1].hidden = true;
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
	let count = {
		total: arrayTodo.length,
		active: arrayTodo.filter((i) => !i.isComplete).length,
		completed: arrayTodo.filter((i) => i.isComplete ).length 
		};
	let labelCounter = document.querySelector('strong');
	let itemsTextContent = '';
	count.completed > 0 ? btnClearCompleted.hidden = false  : btnClearCompleted.hidden = true;
	count.active > 1 ? itemsTextContent = ' items left' : itemsTextContent =' item left';
	labelCounter.innerHTML = count.active + itemsTextContent;
	return count;
}


function updateCounter(parentLi, remove, add) {
	let currentCount = count;
	let labelCounter = document.querySelector('strong');
	let itemsTextContent = '';
	let isComplete = parentLi.querySelector('.complete').checked ? true: false;
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
	count.completed > 0 ? btnClearCompleted.hidden = false : btnClearCompleted.hidden = true;
}


  





	


