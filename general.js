
let todoList = document.querySelector('UL');
let hiddenLi = document.querySelectorAll('LI')[0];
let newTodo = document.querySelector('INPUT');
let btnClear = document.querySelector('.clear-completed');
let hideFooter = document.querySelector('.footer');
let mainHidden = document.querySelector('.main');
let checkedAll = document.querySelector('.select-all');
hideFooter.hidden = true;
mainHidden.hidden = true;
btnClear.hidden = true;
var arrayTodo = [];
let countGlobal; 
let filter = localStorage.getItem('filter');

document.addEventListener('DOMContentLoaded', ready);
function ready (){
	arrayTodo = JSON.parse(localStorage.getItem('todo'));
		hiddenLi.hidden = true;
	if (arrayTodo != null && arrayTodo.length > 0) {
		hiddenLi.hidden = false;

		for (let i = 0; i < arrayTodo.length; i++){
			let newLi = hiddenLi.cloneNode(true);
			let checked = arrayTodo[i].isComplete ? true: false;
			checked == true ? newLi.children[0].children[0].checked = true : false;
			newLi.setAttribute('id', arrayTodo[i].id );
			newLi.querySelector('label').innerHTML = arrayTodo[i].text.trim();
			todoList.appendChild(newLi);

		}
		mainHidden.hidden = false;
		hideFooter.hidden = false;
		filter != null ? setFilter(filter): setFilter('all');
		hiddenLi.hidden = true;
		countGlobal = initCounter();
		
		} else  {
			arrayTodo = [];
			countGlobal = {total:0,active:0,completed:0};
			setFilter('all');
			mainHidden.hidden = true;
			hideFooter.hidden = true;
			}
		return;
};

newTodo.addEventListener('blur', createNewItem); 
newTodo.addEventListener('keydown', createNewItem);
	function createNewItem (event){
	if ((event.keyCode == 13 || event.keyCode === undefined) && newTodo.value !== ''){
			hiddenLi.hidden = false;
			let newLi = hiddenLi.cloneNode(true);
			let obj = saveTodoItem(newTodo);
			newLi.setAttribute('id', obj.id);
			newLi.querySelectorAll('label')[0].innerHTML = newTodo.value.trim();
			todoList.appendChild(newLi);
			hideFooter.hidden = false;
			mainHidden.hidden = false;
			updateCounter(newLi, false, true);
			showHideLi(newLi);
			hiddenLi.hidden = true;
			newTodo.value = '';
		} else return ;
	}; 
todoList.addEventListener('dblclick', changeTodoItem = event => {
	if (event.target.localName == 'label') {
		let labelValue = event.target.innerHTML;
		let parentLi = event.target.parentNode.parentNode;
		let newInput = document.createElement('INPUT');
		parentLi.classList.add('editing');
		newInput.className = 'edit';
		newInput.value = labelValue;
		parentLi.appendChild(newInput);
		newInput.focus();
		newInput.addEventListener('keydown', changeItem);
		newInput.addEventListener('blur', changeItemBlur);
		function changeItemBlur (event){
		if ( newInput.value !== ''){	
				parentLi.classList.remove('editing');
				let changeLabel = this.previousElementSibling.children[1];
				changeLabel.innerHTML = newInput.value;
				parentLi.removeChild(newInput);
				let currentID = +parentLi.getAttribute('id');
				for (let i = 0; i < arrayTodo.length; i++){
					if (currentID === arrayTodo[i].id){
						arrayTodo[i].text = changeLabel.innerHTML;
						break;
					}
				}
				saveToStorage();

			} else {removeTodoItem(parentLi); saveToStorage();}	
		}
		function changeItem (event) {
			if (event.keyCode === 13 || event.keyCode === undefined){
				if ( newInput.value !== ''){	
				parentLi.classList.remove('editing');
				event.type == 'keydown'? newInput.removeEventListener('blur', changeItemBlur): console.log('no');
				var changeLabel = this.previousElementSibling.children[1];
				changeLabel.innerHTML = newInput.value;
				parentLi.removeChild(newInput);
				let currentID = +parentLi.getAttribute('id');
				for (let i = 0; i < arrayTodo.length; i++){
					if (currentID === arrayTodo[i].id){
						arrayTodo[i].text = changeLabel.innerHTML;
						break;
					}
				}
				saveToStorage();

			} else {removeTodoItem(parentLi); saveToStorage();}  
			}
				return; 
		}


	}
});


checkedAll.addEventListener('click', toggleAllItems);
	function toggleAllItems (event) {
		let complete = document.querySelectorAll('.complete');
		if (event.target.checked == true){
			for (let i = 1; i < arrayTodo.length+1; i++){
			let parentLi = complete[i].parentNode.parentNode;
				if (complete[i].checked != true){
				complete[i].checked = true;
				arrayTodo[i-1].isComplete = true;
				updateCounter(parentLi, false);
				}				
			}
		btnClear.hidden = false;
		saveToStorage();
		let filter = checkInstalledFilter();
		setFilter(filter);
		

		} else if (event.target.checked == false) {
			for (let i = 1; i < arrayTodo.length+1; i++){
			let parentLi = complete[i].parentNode.parentNode;
				if (complete[i].checked != false){
				complete[i].checked = false;
				arrayTodo[i-1].isComplete = false;
				updateCounter(parentLi, false);
				showHideLi(parentLi);
				}			
			}
		btnClear.hidden = true;
		saveToStorage();
		let filter = checkInstalledFilter();
		setFilter(filter);
			}
}

todoList.addEventListener('click', toggleComplete);
function toggleComplete (event) {
	if (event.target.classList.contains('complete')){
		let parentLi = event.target.parentNode.parentNode;
		let currentID = +parentLi.getAttribute('id');
			for (let i = 0; i < arrayTodo.length; i++){
				if (currentID === arrayTodo[i].id){
					if (event.target.checked){
						arrayTodo[i].isComplete = true;
						}
					else {
						arrayTodo[i].isComplete = false;
						checkedAll.checked = false;
						}
						break;
				}
			}	
				showHideLi(parentLi, true);
				updateCounter(parentLi, false);
				countGlobal.completed > 0 ? btnClear.hidden = false: btnClear.hidden = true;
				countGlobal.active == 0 ? checkedAll.checked = true: false;
				saveToStorage(); 
	}
	if (event.target.classList.contains('destroy')) {
		let parentLi = event.target.parentNode.parentNode;
		removeTodoItem(parentLi);
	}
}

btnClear.addEventListener('click', clearCompleted);
	function clearCompleted (event){
		let totalCount = arrayTodo.length;
		let complete = document.querySelectorAll('.complete');
			for (let i = 0; i <= totalCount; i++){
				if (complete[i].checked == true){
				let parentLi = complete[i].parentNode.parentNode;
				removeTodoItem(parentLi);
				}
			}
		checkedAll.checked = false;
		countGlobal.completed > 0 ? btnClear.hidden = false: btnClear.hidden = true;
	}
function removeTodoItem (parentElement){
	let currentID = +parentElement.getAttribute('id');
		for (let i = 0; i < arrayTodo.length; i++){
			if (currentID === arrayTodo[i].id){
			arrayTodo.splice(i, 1);
			break;
			}
		}
		arrayTodo.length == 0 ? hideFooter.hidden = true: false;
		arrayTodo.length == 0 ? mainHidden.hidden = true: false;
		saveToStorage();
		updateCounter(parentElement, true);
		todoList.removeChild(parentElement);
}

let getID = () => (new Date()).getTime();
const saveToStorage = () => localStorage.setItem('todo', JSON.stringify(arrayTodo));
const saveTodoItem = (newTodo) => {

	const data = {
		id: getID(),
		text: newTodo.value,
		isComplete: false 
		};
	arrayTodo.push(data);
	saveToStorage();
	return data;
}

function showHideLi (parentLi, check){
	let filters = document.querySelectorAll('.filter')
	document.querySelectorAll('.filter').forEach( (item) => {
		if (item.checked) {
			if (item.id == 'completed'){
				parentLi.hidden = true;
			};
			if (item.id == 'active'){

			check != true || check == undefined ? parentLi.hidden = false: parentLi.hidden = true
			};

		}} )
}

let filters = document.querySelector('.filters');
filters.addEventListener('click', clickFilter);
function clickFilter (event){
	if (event.target.classList.contains('filter')){
		setFilter(String(event.target.id));
	}
}

function checkInstalledFilter (){
	let filter = document.querySelectorAll('.filter');
	let filterName = '';
	for (let i = 0; i < filter.length; i++){
		if (filter[i].checked ==  true){
			filterName = String(filter[i].id);
		}
	}
	return filterName;
}

function setFilter (filterName){
	let filterAll = document.getElementById('all');
	let filterActive = document.getElementById('active');
	let filterCompleted = document.getElementById('completed');
	if (filterName == 'active') {
		for (let i = 0; i < todoList.childElementCount-1; i++){
			let checked = arrayTodo[i].isComplete ? true: false;
			if (!checked){
				todoList.children[i+1].hidden = false;
			} else {todoList.children[i+1].hidden = true;}

		} 
		
	
	} else if (filterName == 'completed'){
		for (let i = 0; i < todoList.childElementCount-1; i++){
			let checked = arrayTodo[i].isComplete ? true: false;
			if (checked){
			todoList.children[i+1].hidden = false;
			} else {todoList.children[i+1].hidden = true;}

		}
	
		
	} else if (filterName == 'all'){
		for (let i = 0; i < todoList.childElementCount-1; i++){
		todoList.children[i+1].hidden = false;	
		}
	
		
	}
	document.getElementById(filterName).checked = true;
	localStorage.setItem('filter', filterName);
}

function filterByActive(item){
	if (!item.isComplete){
		return true;
	} else return false;
}
function filterByCompleted(item){
	if (item.isComplete){
		return true;
	} else return false;
}

function initCounter () {  
	let count = {
		total: arrayTodo.length,
		active: arrayTodo.filter(filterByActive).length ,
		completed: arrayTodo.filter(filterByCompleted).length 
		};
	let labelCounter = document.querySelector('strong');
	let itemsTextContent = '';
	count.completed > 0 ? btnClear.hidden = false: btnClear.hidden = true;
	count.active > 1 ? itemsTextContent = ' items left':itemsTextContent =' item left';
	labelCounter.innerHTML = count.active + itemsTextContent;
	return count;
}


function updateCounter(parentLi, remove, add){
	let currentCount = countGlobal;
	let labelCounter = document.querySelector('strong');
	let itemsTextContent = '';
	if (remove){
		if (parentLi.querySelector('.complete').checked){
			currentCount.completed--;
			currentCount.total--;
		} else {
				currentCount.active--;
				currentCount.total--;
				}
		currentCount.active > 1 ? itemsTextContent = ' items left':itemsTextContent =' item left';
		return labelCounter.innerHTML = currentCount.active + itemsTextContent;
	}

	if (parentLi.querySelector('.complete').checked){
			currentCount.completed++;
			currentCount.active--
	} else if (!add || add === undefined){
				currentCount.completed--;
				currentCount.active++;
			} else {
					currentCount.active++;
					currentCount.total++;
					}
	currentCount.active > 1 ? itemsTextContent =  ' items left':itemsTextContent =' item left';
	labelCounter.innerHTML = currentCount.active + itemsTextContent;
	countGlobal.completed > 0 ? btnClear.hidden = false: btnClear.hidden = true;
}


  





	


